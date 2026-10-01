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
| `/` (Home) | Dashboard Tổng Quan | Số liệu thống kê thời gian thực (31.081 câu, 275 sách, 4.673 chunks), câu gốc trong ngày. **Trình phát âm thanh Suy ngẫm Lời Chúa hằng ngày (Daily Devotional Audio Player & Reflection Feed §53)** tích hợp thuyết minh giọng đọc tiếng Việt, bài suy ngẫm thần học và lời cầu nguyện cho từng ngày; phím tắt điều hướng nhanh. |
| `/bible` | Đọc & Tra Cứu Kinh Thánh | Đọc 66 sách theo chương, điều hướng Tân/Cựu Ước, tìm kiếm toàn văn không dấu tiếng Việt, hiển thị tiêu đề và tham chiếu chéo. **Mạng Lưới Tham Chiếu Chéo Trực Quan & Mạch Cứu Chuộc (§18)**: Đồ thị SVG tương tác với 2 quỹ đạo Cựu Ước / Tân Ước, bộ thanh tra Node Inspector, 8 chuỗi thần học cứu chuộc liên tục; **Ngăn Kéo Giải Kinh Phân Đoạn Nhanh (Inline Passage Exegesis Quick Drawer)** hiển thị trực tiếp dàn ý La Mã, bối cảnh lịch sử, từ khóa Strong, trích dẫn chú giải 275 cuốn sách và câu hỏi suy ngẫm ngay trong phiên đọc; Hỗ trợ lưu trữ ngoại tuyến tức thì (Offline-First Cache Hydration) cho Bookmark và Ghi chú cá nhân. |
| `/research` | Nghiên Cứu Thần Học & Giải Kinh | 1. **Giải Kinh Phân Đoạn 11 Chiều (§13)**: Phân tích bối cảnh, tác giả, thể loại, thực thể, dàn ý La Mã, Strong's Lexicon, câu hỏi suy ngẫm, trích dẫn chú giải.<br>2. **Bối Cảnh Đa Chiều 6 Chiều (§15)**: Lịch sử, Văn hóa, Chính trị, Tôn giáo, Địa lý, Văn chương.<br>3. **Nguyên Ngữ & Strong's Morphology (§37, §49)**: Phân tích hình thái học nguyên ngữ (Greek/Hebrew Paradigms, Binyanim, Stems, Cases, Tenses), ngữ pháp, phát âm và đối chiếu Concordance toàn văn 31.081 câu; **Mở rộng bộ phân tích hình thái học tiếng Hê-bơ-rơ cho các sách Thi Ca & Khôn Ngoan (Thi Thiên, Gióp, Châm Ngôn)**: `H1984` (*Halal* - Ca ngợi), `H2451` (*Chokmah* - Sự khôn ngoan), `H3374` (*Yirah* - Kính sợ Chúa), `H0835` (*Ashrei* - Phước thay), `H7462` (*Ra'ah/Rohi* - Đấng Chăn Giữ), `H1350` (*Go'el* - Đấng Cứu Chuộc), `H0982` (*Batach* - Tin cậy), `H6666` (*Tzedakah* - Công bình).<br>4. **Hỏi Đáp Thần Học RAG**: Hỏi đáp có trích dẫn nguồn.<br>5. **Nhân Vật Kinh Thánh**: Nghiên cứu tiểu sử & hình bóng.<br>6. **Tác Nhân Nghiên Cứu AI**: Nghiên cứu sâu đa góc nhìn, ma trận đối chiếu. |
| `/explore` | Khám Phá & Đối Chiếu Học Thuật | 1. **Đồ Thị Tri Thức (§17)**: Trực quan hóa Cytoscape.js mạng lưới giao ước, địa danh, nhân vật.<br>2. **Dòng Thời Gian Lịch Sử Cứu Chuộc Toàn Diện (§6, §44)**: 22 mốc biến cố then chốt từ Sáng tạo đến Khải Huyền, bộ lọc kỷ nguyên tương tác, tìm kiếm tức thì và bảng khảo sát ý nghĩa thần học/hình bóng Đấng Christ chuyên sâu.<br>3. **Bản Đồ Hành Trình Địa Lý (§9)**: 9 tuyến hành trình tương tác kèm mô phỏng tour tự động.<br>4. **Đối Chiếu Tin Lành Song Song**: 16 biến cố, 54 phân đoạn.<br>5. **Ma Trận Tiên Tri Mê-si (§18, §45)**: 14 lời tiên tri Cựu Ước & ứng nghiệm Tân Ước.<br>6. **Thư Viện 275 Tác Giả & Bộ Chú Giải**: Tra cứu danh mục và chuẩn trích dẫn. |
| `/study` | Soạn Bài Giảng & Phản Biện Cộng Đồng | **Kho Bản Thảo Bài Giảng & Diễn Đàn Phản Biện Đồng Nghiệp (Horizon Item 4)** với hệ thống đánh giá 3 chiều (Độ Trung Thực Giải Kinh, Bố Cục Sư Phạm, Ứng Dụng Thực Tiễn), nút chia sẻ bản thảo tức thì từ bộ soạn bài giảng, và hồ sơ phản biện đầy đủ; Mẫu đề cương bài giảng (§50), công cụ soạn thảo trực tiếp, quản lý ghi chú, xuất trọn gói tài liệu nghiên cứu (.MD / Dossier). **Trình Chiếu Slide Bài Giảng Toàn Màn Hình (Homiletical Slide Deck Presentation Engine §50)** với điều hướng phím bấm mũi tên, thanh tiến trình slide, bố cục trình chiếu giải kinh chuyên nghiệp và xuất file slide Markdown Marp/Slidev; **Ghim Thực Thể Hai Chiều Vào Dự Án Nghiên Cứu (Entity Pinning §50)** kết nối Nhân vật, Địa danh, Biến cố và Chủ đề từ Đồ thị tri thức trực tiếp vào không gian làm việc. |
| `/learn` | Học Tập & Rèn Luyện Đức Tin | 1. **Kế Hoạch Đọc Kinh Thánh (§3, §46, §53)**: 8 lộ trình theo dõi tiến độ thời gian thực (Toàn bộ 365 ngày, Tân Ước 90 ngày, Tuần Lễ Khổ Nạn 7 ngày, Mùa Vọng 25 ngày, Cải Chánh 30 ngày, v.v.).<br>2. **Trợ Lý Học Thuộc Lòng Câu Gốc (§3, §4)**: 12 câu gốc, che chữ tương tác (25%-100%), tính điểm, Text-to-Speech phát âm tiếng Việt.<br>3. **Trắc Nghiệm Thần Học Đa Cấp Độ**: 48 câu hỏi chuẩn viện thần học (đầy đủ Ngũ Kinh, Lịch Sử, Thi Ca, Tin Lành, Thư Tín Phao-lô, Khải Huyền) kèm giải thích chi tiết.<br>4. **Thẻ Ghi Nhớ Spaced Repetition (SM-2)**: Xuất Anki/CSV.<br>5. **Thử Thách Chuyên Đề & Mùa Lễ (§46)**: 8 gói thử thách giáo trình (5 nền tảng + 3 mùa lễ phụng vụ). |
| Mọi trang | Trải Nghiệm PWA Mobile & Ngoại Tuyến | Cấu hình Web App Manifest (`manifest.json`), Service Worker (`sw.js`), Vector Icons (192px/512px), và Banner phát hiện kết nối & nhắc cài đặt PWA (`OfflineBanner.tsx`). |

---

## 4. Công cụ kiểm định toàn diện (Automated Integration Test Suite)

* Script tự động: `scripts/test_platform.js` (`npm test` / `node scripts/test_platform.js`)
* **Tổng số bài kiểm tra**: **49/49 tests PASSED (100%)**
* Kiểm tra tức thì 5 bộ kiểm định chuyên sâu:
  1. **Suite 1 - Core API Surface & Endpoints**: 29 endpoints (`/health`, 66 books, chapter verses, search, reading plans, RAG presets, Morphology Greek/Hebrew, Graph, Quiz, Flashcards, 8 Challenge Packs, Memorization, Harmony, Prophecies, Journeys, Cross-Reference Network Visualizer, Community Sermons, Community Sermon Detail & 3D Reviews, Library).
  2. **Suite 2 - Canonical Text Integrity & Database Validation**: 66 sách chính kinh, 31.081 câu BTT 1925, 0 câu rỗng, 275 sách thần học, 4.673 vector chunks với độ phủ nhúng 100%, hạt giống bài giảng cộng đồng và dữ liệu phản biện đồng nghiệp.
  3. **Suite 3 - Knowledge Graph Topology & Integrity**: 30 nodes, 35 edges, 0 broken edges, 0 orphan nodes.
  4. **Suite 4 - Web Application Routes**: 8 tuyến URL chính (`/`, `/bible`, `/explore`, `/learn`, `/research`, `/study`, `/library`, `/manifest.json`) trả về HTTP 200 OK.
  5. **Suite 5 - Resource & Performance Guardrail**: Tổng RAM các container ứng dụng Non-Ollama duy trì nghiêm ngặt dưới 2.0 GB (~1102.9 MiB / 2048 MiB).

---

## 5. Các cải tiến đã hoàn thiện trong phiên này

1. [x] **Mạng Lưới Tham Chiếu Chéo Trực Quan & Mạch Cứu Chuộc (Interactive Cross-Reference Network Visualizer §18)**:
   - Endpoint `GET /api/bible/cross-references/network`: Tự động phân giải câu gốc, tham chiếu chính kinh, đối chiếu song song Phúc Âm và 8 mạch cứu chuộc thần học kinh điển (Chiên Con Lễ Vượt Qua, Xưng Công Bình Bởi Đức Tin, Đấng Chăn Chiên Lành, Đầy Tớ Chịu Khổ, Giao Ước Mới, Sự Cứu Rỗi Bởi Ân Điển, Vua Thuộc Dòng Đa-vít, Thầy Tế Lễ Thượng Phẩm Mên-chi-xê-đéc).
   - Giao diện trực quan SVG đa chế độ trong `/bible`: Quỹ đạo hướng tâm phân biệt Cựu Ước / Tân Ước, bộ lọc tương tác, bảng soi Node Inspector với khả năng đặt làm tâm điểm và điều hướng tức thì.
2. [x] **Kho Bản Thảo Bài Giảng & Diễn Đàn Phản Biện Đồng Nghiệp (Community Sermon Sharing & 3D Peer Review Workflows, Horizon Item 4)**:
   - Cơ sở dữ liệu: Tạo bảng `community_sermons` và `sermon_peer_reviews` trong PostgreSQL; kịch bản gieo mầm dữ liệu mẫu chuẩn giải kinh (`scripts/seed_community_sermons.js`).
   - Backend APIs (`services/api-ai/app/routers/study.py`): Đầy đủ 5 endpoint tra cứu, lấy chi tiết, xuất bản chia sẻ, tán thành (like) và gửi nhận xét phản biện 3 chiều.
   - Giao diện `/study`: Tab chuyên biệt "Cộng Đồng & Phản Biện", bộ lọc thể loại giảng luận (Giải Kinh, Chủ Đề, Văn Bản, Tự Sự), sắp xếp phổ biến / đánh giá / mới nhất, modal xem hồ sơ 2 cột và form phản biện chấm điểm sao thời gian thực.
3. [x] **Nút Chia Sẻ Trực Tiếp Trong Bộ Soạn Bài Giảng**: Cho phép Mục sư / Giảng viên sau khi tạo đề cương bài giảng có thể bấm "Chia Sẻ Cộng Đồng" để đẩy trực tiếp bản thảo kèm dàn ý phân đoạn và trích dẫn lên kho chung.

---

## 6. Định hướng tiếp theo

1. **Collaborative Study Notes**: Mở rộng ghi chú nhóm nhỏ cộng tác thời gian thực giữa các học viên và mục sư.
2. **Multi-Version Bible Alignment**: Chuẩn bị cấu trúc dữ liệu để mở rộng thêm các bản dịch tiếng Việt công cộng khác (như Bản Dịch Mới, KJV tiếng Anh) khi được cấp phép.
3. **Automated Theological Study Deck Exporter**: Xuất trọn bộ chuyên đề thành tập slide bài giảng hoặc tài liệu hướng dẫn nhóm nhỏ.
