"""
Import Bible VI1934 into PostgreSQL database.
Populates:
- bible_translations
- bible_books
- bible_verses
"""

import json
import os
import psycopg2
from psycopg2.extras import execute_values
from app.core.config import settings


def import_bible():
    print("=== IMPORTING CANONICAL BIBLE VI1934 INTO POSTGRESQL ===")
    conn = psycopg2.connect(settings.DATABASE_URL)
    cur = conn.cursor()

    catalog_path = "/app/data/bible/vi1934/catalog.json"
    verses_path = "/app/data/bible/vi1934/verses_flat.json"

    if not os.path.exists(catalog_path) or not os.path.exists(verses_path):
        print(f"Error: Missing Bible files at {catalog_path} or {verses_path}")
        return

    # 1. Insert translation
    print("1. Inserting translation metadata...")
    cur.execute("""
        INSERT INTO bible_translations (id, name, language, license_info)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
    """, (
        'vi_1934',
        'Kinh Thánh Tiếng Việt Bản dịch 1925',
        'vi',
        'Bản dịch truyền thống 1925 / 1934 (Public Domain)'
    ))

    # 2. Insert books
    print("2. Inserting 66 Bible books...")
    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    book_id_map = {}
    for b in catalog.get('books', []):
        cur.execute("""
            INSERT INTO bible_books (testament, book_order, code, osis, name_vi, name_en, total_chapters)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (code) DO UPDATE SET
                osis = EXCLUDED.osis,
                name_vi = EXCLUDED.name_vi,
                name_en = EXCLUDED.name_en,
                total_chapters = EXCLUDED.total_chapters
            RETURNING id, code;
        """, (
            b['testament'],
            b['order'],
            b['code'],
            b['osis'],
            b['name_vi'],
            b['name_en'],
            b['chapter_count']
        ))
        row = cur.fetchone()
        book_id_map[b['code']] = row[0]

    conn.commit()
    print(f"Inserted {len(book_id_map)} books into bible_books.")

    # 3. Insert verses in batches
    print("3. Inserting 31,081 verses...")
    with open(verses_path, 'r', encoding='utf-8') as f:
        verses = json.load(f)

    # Check if verses already inserted
    cur.execute("SELECT COUNT(*) FROM bible_verses WHERE translation_id = 'vi_1934';")
    existing_count = cur.fetchone()[0]
    if existing_count >= len(verses):
        print(f"Verses already imported ({existing_count} rows). Skipping.")
        cur.close()
        conn.close()
        return

    verse_records = []
    for v in verses:
        b_id = book_id_map.get(v['book_code'])
        verse_records.append((
            v['global_id'],
            v['verse_code'],
            'vi_1934',
            b_id,
            v['chapter'],
            v['verse'],
            v.get('section_title', ''),
            v['text'],
            json.dumps(v.get('cross_references', []))
        ))

    insert_query = """
        INSERT INTO bible_verses (
            global_id, verse_code, translation_id, book_id, chapter, verse, section_title, text, cross_references
        )
        VALUES %s
        ON CONFLICT (translation_id, book_id, chapter, verse) DO NOTHING;
    """

    execute_values(cur, insert_query, verse_records, page_size=2000)
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM bible_verses WHERE translation_id = 'vi_1934';")
    total_db_verses = cur.fetchone()[0]
    print(f"Successfully inserted {total_db_verses} verses into bible_verses.")

    cur.close()
    conn.close()
    print("=== BIBLE IMPORT COMPLETE! ===")


if __name__ == "__main__":
    import_bible()
