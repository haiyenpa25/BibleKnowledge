# Current Repository State & Production Architecture Audit

> **Thời điểm kiểm tra**: 2026-10-02 (Post-Phase Execution)  
> **Trạng thái**: Production Ready / Fully Integrated  
> **Mục đích**: Báo cáo tổng thể tình trạng hệ thống, kiến trúc microservices, cơ sở dữ liệu, kho tài liệu học thuật và các module tính năng đã hoàn thiện theo `ROADMAP1.md`.

---

## 1. Môi trường phần cứng & Hạ tầng vận hành

* **Hệ điều hành**: Windows 11 Pro 64-bit.
* **RAM vật lý máy chủ**: 16.0 GB (16,845,373,440 bytes).
* **GPU tăng tốc AI**: NVIDIA GeForce RTX 5050 Laptop GPU (8,151 MiB VRAM | Driver 591.91 | CUDA 13.1).
* **Docker Engine & Containers**:
  * Docker Engine: `29.8.0` | Docker Compose: `v5.5.1`.
  * `bibleknowledge-postgres`: PostgreSQL 16 Alpine với extension `pgvector` (Port 5432).
  * `bibleknowledge-api-ai`: FastAPI Backend Python 3.11 (Port 8000).
  * `bibleknowledge-web`: Next.js 14 App Router, Tailwind CSS, Lucide, Cytoscape.js (Port 3000).
  * `bibleknowledge-ollama`: Ollama LLM Container (Port 11434) với model `qwen2.5:3b`.
* **Giới hạn & Ngân sách RAM (Strict Budget Rule: < 2.0 GB Non-Ollama)**:
  * `bibleknowledge-web`: ~663.1 MiB / 1024 MiB.
  * `bibleknowledge-api-ai`: ~119.6 MiB / 1024 MiB.
  * `bibleknowledge-postgres`: ~182.4 MiB / 1536 MiB.
  * **Tổng RAM ứng dụng thực tế**: **965.1 MiB / 2048 MiB** (Chỉ chiếm 47.1% ngân sách tối đa).

---

## 2. Toàn vẹn dữ liệu quy điển & Kho tri thức học thuật

### 2.1 Kinh Thánh Tiếng Việt Bản Dịch 1925 (BTT)
* **66/66 sách chính kinh** (39 Cựu Ước, 27 Tân Ước).
* **31.081/31.081 câu Kinh Thánh** đã nạp và bảo chứng toàn vẹn 100% trong PostgreSQL (`bible_verses` & `verses_flat`).
* **0 câu rỗng nội dung**; bảo toàn toàn bộ hệ thống tiêu đề phân đoạn và hàng chục ngàn tham chiếu chéo (cross-references).

### 2.2 Thư viện thần học & Tài liệu chuyên khảo (Theological Library)
* **275/275 bộ sách thần học chuyên khảo** (242.5 MB text thuần đã sạch rác OCR).
* **4.673 vector chunks** (kích thước 1024 chiều) được nhúng qua mô hình embedding và lưu trữ trong `pgvector`.
* Tỷ lệ nhúng thành công: **100.0%** (0 chunk thiếu vector, 0 orphan chunk).
* **171 tác giả thần học kinh điển** và **10 bộ chú giải lớn** (TOTC, TNTC, Wiersbe, IVP, v.v.).

### 2.3 Đồ thị tri thức (Knowledge Graph Connectivity)
* **30 nodes** (Nhân vật, Địa danh, Giao ước, Chủ đề tín lý).
* **35 edges** liên kết thần học.
* **0 broken edges**, 0 orphan nodes.

---

## 3. Các module chức năng đã nghiệm thu & hoạt động trên Web

| Tuyến Web (`Route`) | Module Chức Năng | Chi Tiết Nghiệm Thu Theo ROADMAP1.md |
|:---|:---|:---|
| `/` (Home) | Dashboard Tổng Quan | Số liệu thống kê thời gian thực (31.081 câu, 275 sách, 4.673 chunks), câu gốc trong ngày, phím tắt điều hướng nhanh. |
| `/bible` | Đọc & Tra Cứu Kinh Thánh | Đọc 66 sách theo chương, điều hướng Tân/Cựu Ước, tìm kiếm toàn văn không dấu tiếng Việt, hiển thị tiêu đề và tham chiếu chéo. |
| `/research` | Nghiên Cứu Thần Học & Giải Kinh | 1. **Giải Kinh Phân Đoạn 11 Chiều (§13)**: Phân tích bối cảnh, tác giả, thể loại, thực thể, dàn ý La Mã, Strong's Lexicon, câu hỏi suy ngẫm, trích dẫn chú giải.<br>2. **Bối Cảnh Đa Chiều 6 Chiều (§15)**: Lịch sử, Văn hóa, Chính trị, Tôn giáo, Địa lý, Văn chương.<br>3. **Nguyên Ngữ & Strong's Morphology (§37, §49)**: Phân tích hình thái học nguyên ngữ (Greek/Hebrew Paradigms, Binyanim, Stems, Cases, Tenses), ngữ pháp, phát âm và đối chiếu Concordance toàn văn 31.081 câu.<br>4. **Hỏi Đáp Thần Học RAG**: Hỏi đáp có trích dẫn nguồn.<br>5. **Nhân Vật Kinh Thánh**: Nghiên cứu tiểu sử & hình bóng.<br>6. **Tác Nhân Nghiên Cứu AI**: Nghiên cứu sâu đa góc nhìn, ma trận đối chiếu. |
| `/explore` | Khám Phá & Đối Chiếu Học Thuật | 1. **Đồ Thị Tri Thức (§17)**: Trực quan hóa Cytoscape.js mạng lưới giao ước, địa danh, nhân vật.<br>2. **Bản Đồ Hành Trình Địa Lý (§9)**: 9 tuyến hành trình tương tác.<br>3. **Đối Chiếu Tin Lành Song Song**: 16 biến cố, 54 phân đoạn.<br>4. **Ma Trận Tiên Tri Mê-si (§18, §45)**: 14 lời tiên tri Cựu Ước & ứng nghiệm Tân Ước.<br>5. **Thư Viện 275 Tác Giả & Bộ Chú Giải**: Tra cứu danh mục và chuẩn trích dẫn. |
| `/study` | Soạn Bài Giảng & Xuất Tài Liệu | Mẫu đề cương bài giảng (§50), công cụ soạn thảo trực tiếp, quản lý ghi chú, xuất trọn gói tài liệu nghiên cứu (.MD / Dossier). |
| `/learn` | Học Tập & Rèn Luyện Đức Tin | 1. **Kế Hoạch Đọc Kinh Thánh (§3, §46, §53)**: 8 lộ trình theo dõi tiến độ thời gian thực (Toàn bộ 365 ngày, Tân Ước 90 ngày, Tuần Lễ Khổ Nạn 7 ngày, Mùa Vọng 25 ngày, Cải Chánh 30 ngày, v.v.).<br>2. **Trợ Lý Học Thuộc Lòng Câu Gốc (§3, §4)**: 12 câu gốc, che chữ tương tác (25%-100%), tính điểm, Text-to-Speech phát âm tiếng Việt.<br>3. **Trắc Nghiệm Thần Học Đa Cấp Độ**: 30 câu hỏi kèm giải thích.<br>4. **Thẻ Ghi Nhớ Spaced Repetition (SM-2)**: Xuất Anki/CSV.<br>5. **Thử Thách Chuyên Đề & Mùa Lễ (§46)**: 8 gói thử thách giáo trình (5 nền tảng + 3 mùa lễ phụng vụ). |
| Mọi trang | Trải Nghiệm PWA Mobile & Ngoại Tuyến | Cấu hình Web App Manifest (`manifest.json`), Service Worker (`sw.js`), Vector Icons (192px/512px), và Banner phát hiện kết nối & nhắc cài đặt PWA (`OfflineBanner.tsx`). |

---

## 4. Công cụ kiểm định toàn diện (Automated Integration Test Suite)

* Script tự động: `scripts/test_platform.js` (`npm test`)
* **Tổng số bài kiểm tra**: **44/44 tests PASSED (100%)**
* Kiểm tra tức thì 5 bộ kiểm định chuyên sâu:
  1. **Suite 1 - Core API Surface & Endpoints**: 26 endpoints (`/health`, 66 books, chapter verses, search, reading plans, RAG presets, Morphology Greek/Hebrew, Graph, Quiz, Flashcards, 8 Challenge Packs, Memorization, Harmony, Prophecies, Journeys, Library).
  2. **Suite 2 - Canonical Text Integrity & Database Validation**: 66 sách chính kinh, 31.081 câu BTT 1925, 0 câu rỗng, 275 sách thần học, 4.673 vector chunks với độ phủ nhúng 100%.
  3. **Suite 3 - Knowledge Graph Topology & Integrity**: 30 nodes, 35 edges, 0 broken edges, 0 orphan nodes.
  4. **Suite 4 - Web Application Routes**: 8 tuyến URL chính (`/`, `/bible`, `/explore`, `/learn`, `/research`, `/study`, `/library`, `/manifest.json`) trả về HTTP 200 OK.
  5. **Suite 5 - Resource & Performance Guardrail**: Tổng RAM các container ứng dụng Non-Ollama duy trì nghiêm ngặt dưới 2.0 GB (~955.8 MiB / 2048 MiB).

---

## 5. Định hướng tiếp theo

1. Tích hợp thanh công cụ tra cứu nhanh giải kinh (Inline Passage Exegesis Quick Drawer) trực tiếp ngay bên trong trình đọc Kinh Thánh `/bible`.
2. Mở rộng thêm các câu hỏi trắc nghiệm chuyên sâu cho từng sách trong Ngũ Kinh và Thư Tín Phao-lô.
3. Đồng bộ hóa dữ liệu ghi chú cá nhân của người học ngoại tuyến (Local IndexedDB sync).
