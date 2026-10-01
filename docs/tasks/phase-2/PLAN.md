# Phase 2 Implementation Plan — Theological Ingestion, Vector Embeddings & Hybrid RAG

> **Nhiệm vụ**: Triển khai Module **Research Layer (Tầng 4: AI Research)** theo chuẩn `ROADMAP1.md` (Mục 11, 28, 35, 36) và `docs/AI-ARCHITECTURE.md`.  
> **Nền tảng**: 275 tài liệu thần học (`data/sources/`), mô hình `bge-m3` (1024 chiều), PostgreSQL 16 + `pgvector` HNSW index, và mô hình ngôn ngữ `qwen2.5:3b`.

---

## 1. Mục tiêu Cốt lõi (Objectives)

1. **Document Ingestion & Semantic Chunking**:
   - Nạp danh mục 275 sách từ `data/catalog.json` vào bảng `documents`.
   - Bóc tách nội dung chi tiết từ `data/sources/*.json` thành các semantic chunks (500–1.000 ký tự, có gối đầu 100 ký tự).
   - Bảo toàn ngữ cảnh: `chapter_title`, `section_heading`, `scripture_ref`.
2. **GPU Vector Embedding Generation (BGE-M3 1024D)**:
   - Sử dụng mô hình `bge-m3` đã tải trên Ollama (tăng tốc bằng GPU RTX 5050).
   - Tính toán vector 1024 chiều và lưu vào cột `embedding vector(1024)` trong bảng `document_chunks`.
3. **Hybrid Retrieval Engine (Semantic + Full-Text)**:
   - Truy vấn kết hợp: **Cosine Distance** (`<=>`) trên chỉ mục HNSW của `pgvector` + **Full-Text Search** (`tsvector`) của PostgreSQL.
   - Xếp hạng lại (Reciprocal Rank Fusion - RRF) lấy ra Top 5 đoạn văn đắt giá nhất.
4. **Trợ lý AI Nghiên cứu Có Căn cứ (Strict Grounded Citations RAG)**:
   - API `POST /api/ai/ask-rag`: Trả lời câu hỏi thần học dựa trên tài liệu đã truy xuất.
   - Đầu ra tuân thủ nghiêm ngặt **Cited Answer Schema** (Tóm tắt, Kinh văn liên quan, Phân tích học thuật, Trích dẫn nguồn cụ thể kèm `chunk_id`, Câu hỏi suy ngẫm).
5. **Giao diện Không Gian Nghiên cứu (Research Workspace UI)**:
   - Trang `/research` trên Next.js cho phép đặt câu hỏi thần học, xem các trích dẫn có thể nhấp mở đọc toàn đoạn nguồn, và khám phá kiến thức sâu sắc.
