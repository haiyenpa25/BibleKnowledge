"""
Ingestion & Semantic Chunking Pipeline for Theological Documents.
Reads: /app/data/catalog.json and /app/data/sources/*.json
Generates: 1024-dim BGE-M3 embeddings via Ollama GPU
Saves: PostgreSQL documents & document_chunks (pgvector)
"""

import os
import json
import re
import time
import psycopg2
from psycopg2.extras import execute_values
import httpx
from app.core.config import settings

OLLAMA_EMBED_URL = f"{settings.OLLAMA_BASE_URL}/api/embeddings"
EMBED_MODEL = "bge-m3"


def get_embedding(client: httpx.Client, text: str) -> list[float]:
    """Generate 1024D embedding using BGE-M3 in Ollama."""
    resp = client.post(
        OLLAMA_EMBED_URL,
        json={"model": EMBED_MODEL, "prompt": text[:1500]},
        timeout=30.0
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Ollama embedding error {resp.status_code}: {resp.text}")
    return resp.json().get("embedding", [])


def chunk_section(paragraphs: list[str], max_chars: int = 1000, overlap: int = 150) -> list[str]:
    """Split paragraphs into cohesive chunks respecting natural boundaries."""
    chunks = []
    current_chunk = []
    current_len = 0

    for p in paragraphs:
        p_clean = p.strip()
        if not p_clean:
            continue

        p_len = len(p_clean)

        # If adding paragraph exceeds max_chars and current chunk is not empty
        if current_len + p_len > max_chars and current_chunk:
            combined = "\n\n".join(current_chunk)
            chunks.append(combined)

            # Keep last paragraph for overlap if short enough
            if len(current_chunk[-1]) < overlap:
                current_chunk = [current_chunk[-1], p_clean]
                current_len = len(current_chunk[0]) + p_len
            else:
                current_chunk = [p_clean]
                current_len = p_len
        else:
            current_chunk.append(p_clean)
            current_len += p_len

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    return chunks


def ingest_batch(limit_books: int = 5):
    """
    Ingest priority books into documents and document_chunks.
    By default ingests the first N books to verify pipeline.
    """
    print(f"=== INGESTING THEOLOGICAL DOCUMENTS (Target: {limit_books} books) ===")
    conn = psycopg2.connect(settings.DATABASE_URL)
    cur = conn.cursor()

    catalog_path = "/app/data/catalog.json"
    sources_dir = "/app/data/sources"

    if not os.path.exists(catalog_path):
        print(f"Missing catalog at {catalog_path}")
        return

    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    books_to_process = catalog.get("sources", [])[:limit_books]
    print(f"Found {len(catalog.get('sources', []))} total books. Processing top {len(books_to_process)}.")

    http_client = httpx.Client(timeout=30.0)

    for b in books_to_process:
        source_key = b.get("filename", "").replace(".json", "")
        title = b.get("title", "Untitled")
        author = b.get("author", "Unknown")
        series = "Wiersbe BE Series" if "wiersbe" in title.lower() or " be " in title.lower() else "General Theological"

        print(f"\nProcessing Book: {title} ({author})")

        # 1. Insert into documents table
        cur.execute("""
            INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (source_key) DO UPDATE SET
                title = EXCLUDED.title,
                author = EXCLUDED.author,
                series = EXCLUDED.series,
                total_chapters = EXCLUDED.total_chapters
            RETURNING id;
        """, (
            source_key,
            title,
            author,
            series,
            b.get("total_chapters", 0),
            json.dumps({"notebook_id": b.get("notebook_id"), "char_count": b.get("chars")})
        ))
        doc_id = cur.fetchone()[0]
        conn.commit()

        # 2. Read full book JSON
        book_file = os.path.join(sources_dir, b.get("filename", ""))
        if not os.path.exists(book_file):
            print(f"File not found: {book_file}")
            continue

        with open(book_file, "r", encoding="utf-8") as f:
            book_data = json.load(f)

        # 3. Check existing chunks count
        cur.execute("SELECT COUNT(*) FROM document_chunks WHERE document_id = %s;", (doc_id,))
        if cur.fetchone()[0] > 0:
            print("Chunks already exist for this document. Skipping re-chunking.")
            continue

        chunks_to_insert = []
        chapters = book_data.get("chapters", [])
        print(f"Chunking {len(chapters)} chapters...")

        chunk_count = 0
        t0 = time.time()

        for ch in chapters:
            ch_idx = ch.get("index", 0)
            ch_title = ch.get("title", "")
            ch_scripture = ch.get("scripture", "")

            sections = ch.get("sections", [])
            for sec in sections:
                heading = sec.get("heading", "")
                paragraphs = sec.get("paragraphs", [])
                sec_chunks = chunk_section(paragraphs, max_chars=900, overlap=100)

                for chunk_text in sec_chunks:
                    if len(chunk_text.strip()) < 50:
                        continue

                    # Contextual text for embedding: prepend book and section
                    embed_context = f"{title} | {ch_title} | {heading}\n{chunk_text}"
                    try:
                        emb = get_embedding(http_client, embed_context)
                    except Exception as e:
                        print(f"Embedding error for chunk: {e}")
                        emb = None

                    chunks_to_insert.append((
                        doc_id,
                        ch_idx,
                        ch_title,
                        heading,
                        ch_scripture,
                        chunk_text,
                        len(chunk_text),
                        emb,
                        json.dumps({"source_key": source_key, "book_title": title, "author": author})
                    ))
                    chunk_count += 1

                    # Batch insert every 50 chunks
                    if len(chunks_to_insert) >= 50:
                        execute_values(
                            cur,
                            """
                            INSERT INTO document_chunks (
                                document_id, chapter_index, chapter_title, section_heading,
                                scripture_ref, content, char_length, embedding, metadata
                            )
                            VALUES %s;
                            """,
                            chunks_to_insert
                        )
                        conn.commit()
                        chunks_to_insert.clear()

        # Insert remaining chunks
        if chunks_to_insert:
            execute_values(
                cur,
                """
                INSERT INTO document_chunks (
                    document_id, chapter_index, chapter_title, section_heading,
                    scripture_ref, content, char_length, embedding, metadata
                )
                VALUES %s;
                """,
                chunks_to_insert
            )
            conn.commit()

        elapsed = time.time() - t0
        rate = (chunk_count / elapsed) if elapsed > 0 else 0
        print(f"Generated and saved {chunk_count} chunks in {elapsed:.1f}s ({rate:.1f} chunks/s).")

    cur.close()
    conn.close()
    http_client.close()
    print("\n=== INGESTION BATCH COMPLETED SUCCESSFULLY! ===")


if __name__ == "__main__":
    ingest_batch(limit_books=5)
