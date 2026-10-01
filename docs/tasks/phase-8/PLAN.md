# Phase 8 Implementation Plan — Systematic AI Research: Character & Theme Study Engines

> **Nhiệm vụ**: Triển khai Module **Nghiên Cứu Chuyên Sâu Theo Nhân Vật (Character Study) & Chuyên Đề Thần Học (Theme Study)** theo chuẩn `ROADMAP1.md` (Mục 15, 16, 17, 18, 19, 20) và `docs/ARCHITECTURE.md`.
> **Cơ sở dữ liệu**: Kết hợp linh hoạt giữa Cơ sở dữ liệu Thực thể (`people`, `places`, `events`, `verse_entities`), Từ điển Ngữ căn (`strong_lexicon`), Kho tài liệu 275 sách chú giải (`document_chunks`), và Mô hình cục bộ Ollama Qwen 2.5:3b.

---

## 1. Mục tiêu Cốt lõi (Objectives)

### 1.1 Endpoint Phân Tích Chuyên Sâu Nhân Vật (`POST /api/rag/character-study`)
- Nhận diện hoặc lựa chọn nhân vật (slug hoặc tên, VD: "Phi-e-rơ", "Phao-lô", "Đa-vít", "Môi-se", "Áp-ra-ham", "Giô-sép", "Ma-ri").
- Pipeline tổng hợp:
  1. Trích xuất hồ sơ thực thể từ bảng `people` (tên gốc Hy-lạp / Hê-bơ-rơ, vai trò, thời kỳ lịch sử).
  2. Truy vấn các biến cố bước ngoặt từ `events` và `knowledge_edges`.
  3. Truy vấn các quan hệ mạng lưới (Gia đình, Môn đồ, Đồng lao) từ `knowledge_edges`.
  4. Truy vấn các câu Kinh Thánh trọng tâm từ `verse_entities` & `bible_verses`.
  5. Tìm kiếm semantic RAG từ `document_chunks` đối với nhân vật này.
  6. Ollama Qwen tổng hợp bản phân tích nhân vật chuẩn mực:
     - Khái quát tiểu sử & Bối cảnh lịch sử
     - Các mốc bước ngoặt cuộc đời
     - Lời nói & Hành động mang tính định hình
     - Mạng lưới mối quan hệ thuộc linh
     - Bài học thuộc linh áp dụng & Câu hỏi tự vấn.

### 1.2 Endpoint Khảo Luận Chuyên Đề Thần Học (`POST /api/rag/theme-study`)
- Nghiên cứu các chủ đề cốt lõi của Kinh Thánh:
  - **Đức Tin (Faith / Pistis - Aman)**
  - **Ân Điển (Grace / Charis - Chesed)**
  - **Giao Ước (Covenant / Berith - Diathēkē)**
  - **Nước Trời (Kingdom of God / Basileia)**
  - **Thánh Linh (Holy Spirit / Pneuma - Ruach)**
  - **Tình Yêu Thương (Love / Agapē)**
  - **Sự Bình An (Peace / Shalom - Eirēnē)**
  - **Sự Cứu Rỗi (Salvation / Sōtēria - Yeshua)**
- Pipeline tổng hợp:
  1. Trích xuất ngữ căn từ điển `strong_lexicon` tương ứng (tiếng Hê-bơ-rơ & Hy-lạp).
  2. Tuyển chọn các câu neo đức tin (Anchor Verses) Cựu Ước & Tân Ước.
  3. Khảo cứu tài liệu chú giải RAG từ `document_chunks`.
  4. Ollama Qwen cấu trúc bài khảo luận:
     - Định nghĩa thần học theo nguyên ngữ
     - Tiến trình mạc khải từ Cựu Ước (Hình bóng & Giao ước)
     - Sự ứng nghiệm trọn vẹn nơi Đấng Christ trong Tân Ước
     - Ý nghĩa thực tiễn cho đời sống cơ đốc nhân hôm nay.

### 1.3 Nâng Cấp Giao Diện Không Gian Nghiên Cứu (`services/web/src/app/research/page.tsx`)
- Tích hợp 3 Chế độ Nghiên Cứu chuyên biệt:
  - **Chế độ 1**: 💡 Hỏi Đáp Thần Học Có Căn Cứ (Cited RAG Q&A)
  - **Chế độ 2**: 👤 Khảo Sát Nhân Vật Kinh Thánh (Character Study Engine)
  - **Chế độ 3**: 📖 Khảo Luận Chủ Đề Thần Học (Theological Themes Engine)
- Giao diện Dark parchment cao cấp, thẻ thực thể sắc sảo, hiển thị từ ngữ căn Strong và trích dẫn chuẩn mực.
