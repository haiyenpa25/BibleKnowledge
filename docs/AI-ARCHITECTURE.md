# AI Architecture & RAG Pipeline Specification — BibleKnowledge

> **Mục tiêu**: Xây dựng AI Research Assistant phục vụ nghiên cứu Kinh Thánh chính xác, có căn cứ, trích dẫn minh bạch và loại bỏ hoàn toàn hiện tượng ảo giác (hallucination).  
> **Căn cứ**: `ROADMAP1.md` (Mục 12, 19, 20, 21, 24, 38, 39)

---

## 1. Triết lý Thiết kế: AI là "Trợ lý Nghiên cứu", Không Phải "Thẩm quyền Thần học"

```text
       Câu hỏi Người dùng
               │
               ▼
     ┌───────────────────┐
     │  Query Analyzer   │ (Phân loại: Đoạn văn / Nhân vật / Địa danh / Thần học / Từ vựng)
     └─────────┬─────────┘
               │
    ┌──────────┴──────────────────────────┐
    ▼                                     ▼
[1. Deterministic DB]             [2. Semantic RAG]
• Bible Text (BTT, KJV)           • 275 Sách chú giải (BGE-M3 1024-dim)
• Knowledge Graph (Cytoscape)     • Vector Similarity (pgvector Cosine)
• Lexicon / Concordance           • Full-Text Search (tsvector)
    └──────────┬──────────────────────────┘
               │
               ▼ (Top 6–10 Chunks + Bible Verses + Graph Connections)
     ┌───────────────────┐
     │  Context Builder  │
     └─────────┬─────────┘
               │
               ▼
     ┌───────────────────┐
     │ Local LLM (Ollama)│ (Qwen3 4B Q4_K_M / RTX 5050 8GB VRAM)
     └─────────┬─────────┘
               │
               ▼
Cấu trúc Câu trả lời Chuẩn (Cited Answer Object + Nguồn minh bạch)
```

---

## 2. Các Chế độ Nghiên cứu Chuyên sâu (Research Modes)

### 2.1 Passage Study (Nghiên cứu Đoạn Kinh Thánh)
* **Đầu vào**: `Ma-thi-ơ 14:22-33`
* **Quy trình**:
  1. Trích xuất chính xác văn bản câu từ PostgreSQL `bible_verses`.
  2. Tìm kiếm các đoạn chú giải tương ứng trong 275 cuốn sách (`document_chunks` có `scripture_ref ILIKE '%Matthew 14%'`).
  3. Mở rộng đồ thị: Tìm các nhân vật (Chúa Giê-xu, Phi-e-rơ), địa danh (Biển Ga-li-lê), chủ đề (Đức tin, Sóng gió).
  4. LLM tổng hợp: Bối cảnh lịch sử, cấu trúc đoạn, bài học ứng dụng và câu hỏi suy ngẫm.

### 2.2 Character Study (Nghiên cứu Nhân vật)
* **Đầu vào**: `Phân tích nhân vật Phi-e-rơ`
* **Quy trình**:
  1. Truy vấn bảng `people` ➔ Lấy tiểu sử, các tên gọi (Si-môn, Cephas), gia đình.
  2. Truy vấn `verse_entities` ➔ Lấy toàn bộ các sự kiện then chốt theo trình tự thời gian (Được kêu gọi ➔ Đi trên nước ➔ Chối Chúa ➔ Phục hồi ➔ Ngày Ngũ Tuần).
  3. Truy vấn chú giải phân tích tâm lý, đức tin của nhân vật.
  4. LLM cấu trúc hóa thành Timeline nhân vật và bài học biến đổi đời sống.

### 2.3 Word Study (Nghiên cứu Từ gốc Hy Lạp / Hê-bơ-rơ)
* **Nguyên tắc**: LLM **không bao giờ tự đoán từ điển**.
* **Quy trình**: Đọc dữ liệu từ Lexicon/Strong Numbers có sẵn (Lemma, Transliteration, Nghĩa nguyên bản, Số lần xuất hiện). LLM chỉ hỗ trợ diễn giải ngữ cảnh sử dụng qua các bản dịch.

---

## 3. Cấu trúc Đối tượng Câu trả lời (Cited Answer Schema)

Mọi phản hồi từ AI đều phải tuân thủ schema JSON nghiêm ngặt để frontend hiển thị nguồn có thể click xem:

```json
{
  "summary": "Tóm tắt súc tích câu trả lời...",
  "bible_evidence": [
    {
      "reference": "Ma-thi-ơ 14:29",
      "text": "Phi-e-rơ ở trên thuyền bước xuống, đi trên mặt nước mà lại gần Chúa Giê-xu.",
      "translation": "vi_btt"
    }
  ],
  "historical_context": "Bối cảnh Biển Ga-li-lê và tập tục đi đêm của ngư phủ thế kỷ I...",
  "study_insights": [
    {
      "heading": "Ý nghĩa thần học về đức tin",
      "content": "Theo Warren Wiersbe, đức tin của Phi-e-rơ không phải là liều lĩnh mà là vâng theo lời phán của Chúa..."
    }
  ],
  "citations": [
    {
      "source_title": "Wiersbe’s BE Series - 29. BE Diligent (Mark)",
      "chapter": "Chapter 4: The Master of the Sea",
      "quote": "Faith is not believing in spite of evidence; it is obeying in spite of consequence.",
      "chunk_id": "c1a2...uuid"
    }
  ],
  "confidence_level": "high",
  "further_study_questions": [
    "Tại sao Chúa Giê-xu quở trách Phi-e-rơ là 'kẻ ít đức tin' dù ông là người duy nhất dám bước ra khỏi thuyền?"
  ]
}
```

---

## 4. AI Guardrails (Hàng rào Bảo vệ Chống Ảo giác)

Hệ thống tiêm System Prompt nghiêm ngặt cho Ollama:

```text
[SYSTEM GUARDRAILS]
1. BẠN LÀ MỘT TRỢ LÝ NGHIÊN CỨU KINH THÁNH (Bible Research Assistant).
2. TUYỆT ĐỐI KHÔNG TỰ BỊA ĐẶT CÂU KINH THÁNH. Chỉ trích dẫn những câu có trong Context hoặc đã được xác nhận.
3. PHÂN BIỆT RÕ RÀNG:
   - "Văn bản Kinh Thánh" (Trích dẫn trực tiếp).
   - "Dữ kiện lịch sử" (Có nguồn khảo cổ / sử học).
   - "Lời giải nghĩa / Chú giải" (Ghi rõ quan điểm của tác giả như Warren Wiersbe, Zondervan...).
4. NẾU DỮ LIỆU KHÔNG ĐỦ CĂN CỨ: Phải thẳng thắn thông báo "Tài liệu hiện tại chưa đủ căn cứ để kết luận điều này" thay vì phỏng đoán.
```

---

## 5. Cấu hình Model & Runtime (Local Ollama)

* **Model Container**: `ollama/ollama:latest`
* **Mô hình triển khai**: `qwen2.5:3b` / `qwen3:4b` (Quantized Q4_K_M).
  * Tiêu thụ VRAM: ~2.5 GB.
  * Tốc độ suy luận: ~45–60 tokens/giây trên RTX 5050.
* **Embedding Service**: Chạy model `BAAI/bge-m3` trong container `api-ai` (Python `fastembed` hoặc `sentence-transformers`), chiều vector: 1024, hỗ trợ đa ngữ Việt - Anh vượt trội.
