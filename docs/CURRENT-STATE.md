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
| `/` (Home) | Dashboard Tổng Quan | Số liệu thống kê thời gian thực (31.081 câu, 275 sách, 4.673 chunks), câu gốc trong ngày. **Trình phát âm thanh Suy ngẫm Lời Chúa hằng ngày (Daily Devotional Audio Player & Reflection Feed §53)** tích hợp thuyết minh giọng đọc tiếng Việt, bài suy ngẫm thần học và lời cầu nguyện cho từng ngày; phím tắt điều hướng nhanh. |
| `/bible` | Đọc & Tra Cứu Kinh Thánh | Đọc 66 sách theo chương, điều hướng Tân/Cựu Ước, tìm kiếm toàn văn không dấu tiếng Việt, hiển thị tiêu đề và tham chiếu chéo. **Mạng Lưới Tham Chiếu Chéo Trực Quan & Mạch Cứu Chuộc (§18)**: Đồ thị SVG tương tác với 2 quỹ đạo Cựu Ước / Tân Ước, bộ thanh tra Node Inspector, 8 chuỗi thần học cứu chuộc liên tục; **Ngăn Kéo Giải Kinh Phân Đoạn Nhanh (Inline Passage Exegesis Quick Drawer)** hiển thị trực tiếp dàn ý La Mã, bối cảnh lịch sử, từ khóa Strong, trích dẫn chú giải 275 cuốn sách và câu hỏi suy ngẫm ngay trong phiên đọc; **Đối Chiếu Đa Bản Dịch & Căn Chỉnh Ngữ Nghĩa (Multi-Translation Alignment §2.1)**: Cho phép chuyển đổi linh hoạt giữa các bản dịch quy chuẩn kinh điển (BTT 1925, KJV 1611, WEB, ASV 1901), so sánh 4 bản dịch song song trong ngăn kéo câu gốc và modal so sánh chuyên sâu với thống kê số từ và căn chỉnh nguyên ngữ; Hỗ trợ lưu trữ ngoại tuyến tức thì (Offline-First Cache Hydration) cho Bookmark và Ghi chú cá nhân. |
| `/research` | Nghiên Cứu Thần Học & Giải Kinh | 1. **Giải Kinh Phân Đoạn 11 Chiều (§13)**: Phân tích bối cảnh, tác giả, thể loại, thực thể, dàn ý La Mã, Strong's Lexicon, câu hỏi suy ngẫm, trích dẫn chú giải.<br>2. **Bối Cảnh Đa Chiều 6 Chiều (§15)**: Lịch sử, Văn hóa, Chính trị, Tôn giáo, Địa lý, Văn chương.<br>3. **Nguyên Ngữ & Strong's Morphology (§37, §49)**: Phân tích hình thái học nguyên ngữ (Greek/Hebrew Paradigms, Binyanim, Stems, Cases, Tenses), ngữ pháp, phát âm và đối chiếu Concordance toàn văn 31.081 câu; **Mở rộng bộ phân tích hình thái học tiếng Hê-bơ-rơ cho các sách Thi Ca & Khôn Ngoan (Thi Thiên, Gióp, Châm Ngôn)**: `H1984` (*Halal* - Ca ngợi), `H2451` (*Chokmah* - Sự khôn ngoan), `H3374` (*Yirah* - Kính sợ Chúa), `H0835` (*Ashrei* - Phước thay), `H7462` (*Ra'ah/Rohi* - Đấng Chăn Giữ), `H1350` (*Go'el* - Đấng Cứu Chuộc), `H0982` (*Batach* - Tin cậy), `H6666` (*Tzedakah* - Công bình).<br>4. **Hỏi Đáp Thần Học RAG**: Hỏi đáp có trích dẫn nguồn.<br>5. **Nhân Vật Kinh Thánh**: Nghiên cứu tiểu sử & hình bóng.<br>6. **Tác Nhân Nghiên Cứu AI**: Nghiên cứu sâu đa góc nhìn, ma trận đối chiếu. |
| `/explore` | Khám Phá & Đối Chiếu Học Thuật | 1. **Đồ Thị Tri Thức (§17)**: Trực quan hóa Cytoscape.js mạng lưới giao ước, địa danh, nhân vật.<br>2. **Dòng Thời Gian Lịch Sử Cứu Chuộc Toàn Diện (§6, §44)**: 22 mốc biến cố then chốt từ Sáng tạo đến Khải Huyền, bộ lọc kỷ nguyên tương tác, tìm kiếm tức thì và bảng khảo sát ý nghĩa thần học/hình bóng Đấng Christ chuyên sâu.<br>3. **Bản Đồ Hành Trình Địa Lý (§9)**: 9 tuyến hành trình tương tác kèm mô phỏng tour tự động.<br>4. **Đối Chiếu Tin Lành Song Song**: 16 biến cố, 54 phân đoạn.<br>5. **Ma Trận Tiên Tri Mê-si (§18, §45)**: 14 lời tiên tri Cựu Ước & ứng nghiệm Tân Ước.<br>6. **Thư Viện 275 Tác Giả & Bộ Chú Giải**: Tra cứu danh mục và chuẩn trích dẫn. |
| `/study` | Soạn Bài Giảng & Phản Biện Cộng Đồng | 1. **Nhóm Học Kinh Thánh Đa Mục Vụ & Cộng Tác Giải Kinh (Horizon Item 5)**: Không gian làm việc nhóm cho các tổ mục sư, giáo viên và lãnh đạo ban ngành cùng thảo luận văn mạch, đóng góp khảo luận giải kinh, câu hỏi đào sâu, ứng dụng mục vụ, tán thành ý kiến, trao đổi đa tầng và xuất toàn văn biên bản nghiên cứu (.MD);<br>2. **Kho Bản Thảo Bài Giảng & Diễn Đàn Phản Biện Đồng Nghiệp (Horizon Item 4)** với hệ thống đánh giá 3 chiều (Độ Trung Thực Giải Kinh, Bố Cục Sư Phạm, Ứng Dụng Thực Tiễn), nút chia sẻ bản thảo tức thì từ bộ soạn bài giảng, và hồ sơ phản biện đầy đủ;<br>3. **Bộ Xuất Giáo Trình Nhóm Nhỏ & Hướng Dẫn Điều Phối (Small Group Leader Guide & Curriculum Generator §50)**: Tự động trích xuất mục tiêu huấn luyện 3H (Tri Thức - Head, Tấm Lòng - Heart, Hành Động - Hands), câu hỏi phá băng khởi động, giải kinh phân đoạn ghim, thực thể lịch sử, dàn ý 3 bước, câu hỏi thảo luận khám phá và trích dẫn chú giải 275 sách kinh điển ra định dạng Markdown chuẩn xuất bản và sao chép 1 chạm;<br>4. Mẫu đề cương bài giảng (§50), công cụ soạn thảo trực tiếp, quản lý ghi chú, xuất trọn gói tài liệu nghiên cứu (.MD / Dossier);<br>5. **Trình Chiếu Slide Bài Giảng Toàn Màn Hình (Homiletical Slide Deck Presentation Engine §50)** với điều hướng phím bấm mũi tên, thanh tiến trình slide, bố cục trình chiếu giải kinh chuyên nghiệp và xuất file slide Markdown Marp/Slidev;<br>6. **Ghim Thực Thể Hai Chiều Vào Dự Án Nghiên Cứu (Entity Pinning §50)** kết nối Nhân vật, Địa danh, Biến cố và Chủ đề từ Đồ thị tri thức trực tiếp vào không gian làm việc. |
| `/learn` | Học Tập & Rèn Luyện Đức Tin | 1. **Kế Hoạch Đọc Kinh Thánh (§3, §46, §53)**: 8 lộ trình theo dõi tiến độ thời gian thực (Toàn bộ 365 ngày, Tân Ước 90 ngày, Tuần Lễ Khổ Nạn 7 ngày, Mùa Vọng 25 ngày, Cải Chánh 30 ngày, v.v.).<br>2. **Trợ Lý Học Thuộc Lòng Câu Gốc (§3, §4)**: 12 câu gốc, che chữ tương tác (25%-100%), tính điểm, Text-to-Speech phát âm tiếng Việt.<br>3. **Trắc Nghiệm Thần Học Đa Cấp Độ**: 48 câu hỏi chuẩn viện thần học (đầy đủ Ngũ Kinh, Lịch Sử, Thi Ca, Tin Lành, Thư Tín Phao-lô, Khải Huyền) kèm giải thích chi tiết.<br>4. **Thẻ Ghi Nhớ Spaced Repetition (SM-2)**: Xuất Anki/CSV.<br>5. **Thử Thách Chuyên Đề & Mùa Lễ (§46)**: 8 gói thử thách giáo trình (5 nền tảng + 3 mùa lễ phụng vụ). |
| Mọi trang | Trải Nghiệm PWA Mobile & Ngoại Tuyến | Cấu hình Web App Manifest (`manifest.json`), Service Worker (`sw.js`), Vector Icons (192px/512px), và Banner phát hiện kết nối & nhắc cài đặt PWA (`OfflineBanner.tsx`). |

---

## 4. Công cụ kiểm định toàn diện (Automated Integration Test Suite)

* Script tự động: `scripts/test_platform.js` (`npm test` / `node scripts/test_platform.js`)
* **Tổng số bài kiểm tra**: **59/59 tests PASSED (100%)**
* Kiểm tra tức thì 5 bộ kiểm định chuyên sâu:
  1. **Suite 1 - Core API Surface & Endpoints**: 37 endpoints (`/health`, 66 books, chapter verses, search, reading plans, translations list, parallel chapter alignment, compare-verse multi-translation alignment, RAG presets, Morphology Greek/Hebrew, Graph, Quiz, Flashcards, 8 Challenge Packs, Memorization, Harmony, Prophecies, Journeys, Cross-Reference Network Visualizer, Community Sermons, Community Sermon Detail & 3D Reviews, Study Groups & Cohorts, Group Notes & Export, Study Projects, Small Group Leader Guide & Curriculum Generator §50, Library).
  2. **Suite 2 - Canonical Text Integrity & Database Validation**: 66 sách chính kinh, 31.081 câu BTT 1925, 0 câu rỗng, 275 sách thần học, 4.673 vector chunks với độ phủ nhúng 100%, hạt giống bài giảng cộng đồng, dữ liệu phản biện đồng nghiệp, và các tổ nghiên cứu mục vụ cộng tác.
  3. **Suite 3 - Knowledge Graph Topology & Integrity**: 30 nodes, 35 edges, 0 broken edges, 0 orphan nodes.
  4. **Suite 4 - Web Application Routes**: 8 tuyến URL chính (`/`, `/bible`, `/explore`, `/learn`, `/research`, `/study`, `/library`, `/manifest.json`) trả về HTTP 200 OK.
  5. **Suite 5 - Resource & Performance Guardrail**: Tổng RAM các container ứng dụng Non-Ollama duy trì nghiêm ngặt dưới 2.0 GB (~1022.1 MiB / 2048 MiB, tức < 50% ngân sách).

---

## 5. Các cải tiến đã hoàn thiện trong phiên này

1. [x] **Mạng Lưới Tham Chiếu Chéo Trực Quan & Mạch Cứu Chuộc (Interactive Cross-Reference Network Visualizer §18)**:
   - Endpoint `GET /api/bible/cross-references/network`: Tự động phân giải câu gốc, tham chiếu chính kinh, đối chiếu song song Phúc Âm và 8 mạch cứu chuộc thần học kinh điển.
   - Giao diện trực quan SVG đa chế độ trong `/bible`: Quỹ đạo hướng tâm phân biệt Cựu Ước / Tân Ước, bộ lọc tương tác, bảng soi Node Inspector với khả năng đặt làm tâm điểm và điều hướng tức thì.
2. [x] **Kho Bản Thảo Bài Giảng & Diễn Đàn Phản Biện Đồng Nghiệp (Community Sermon Sharing & 3D Peer Review Workflows, Horizon Item 4)**:
   - Cơ sở dữ liệu: Bảng `community_sermons` và `sermon_peer_reviews` trong PostgreSQL; kịch bản gieo mầm dữ liệu mẫu chuẩn giải kinh (`scripts/seed_community_sermons.js`).
   - Backend APIs (`services/api-ai/app/routers/study.py`): Đầy đủ 5 endpoint tra cứu, lấy chi tiết, xuất bản chia sẻ, tán thành (like) và gửi nhận xét phản biện 3 chiều.
   - Giao diện `/study`: Tab chuyên biệt "Cộng Đồng & Phản Biện", bộ lọc thể loại giảng luận, modal xem hồ sơ 2 cột và form phản biện chấm điểm sao thời gian thực.
3. [x] **Nhóm Học Kinh Thánh Đa Mục Vụ & Cộng Tác Giải Kinh (Collaborative Multi-Pastor Study Groups & Cohorts, Horizon Item 5)**:
   - Cơ sở dữ liệu: Bảng `study_groups` và `study_group_notes` với khóa ngoại, chỉ mục hiệu năng cao và kịch bản gieo mầm 4 tổ mục vụ mẫu (`scripts/seed_study_groups.js`).
   - Backend APIs: 7 endpoint tạo nhóm, tra cứu danh sách, chi tiết nhóm, đóng góp ghi chú theo 4 phân loại thần học, bình luận trao đổi đa tầng, tán thành (like) và xuất toàn bộ hồ sơ biên bản học dạng Markdown chuẩn mực.
   - Giao diện người dùng `/study`: Tab "Nhóm Cộng Tác", bố cục Master-Detail hai cột, lọc theo chủ đề và loại đóng góp, form phản hồi trực tiếp, modal thành lập nhóm và đóng góp ghi chú.
4. [x] **Bộ Xuất Giáo Trình Nhóm Nhỏ & Hướng Dẫn Điều Phối (Small Group Leader Guide & Study Curriculum Generator §50)**:
   - Backend API: `GET /api/study/projects/{project_id}/export-leader-guide` tổng hợp mục tiêu 3H (Head, Heart, Hands), câu hỏi phá băng, phân tích câu gốc BTT 1925, thực thể lịch sử, dàn ý bài học 3 bước, câu hỏi thảo luận mở, trích dẫn chú giải 275 sách và bài tập hành động tuần mới.
   - Giao diện `/study`: Nút "Giáo Trình Nhóm" trong Dự án Nghiên Cứu, Modal hiển thị thẻ tóm tắt 3H, câu hỏi phá băng, toàn văn Markdown giáo trình, sao chép 1-chạm và tải xuống file `.md`.
5. [x] **Đối Chiếu Đa Bản Dịch & Căn Chỉnh Ngữ Nghĩa (Multi-Translation Bible Alignment & Comparison Viewer §2.1, Horizon Item)**:
   - Cơ sở dữ liệu: Seeded `bible_translations` với 4 bản dịch quy chuẩn kinh điển (`vi_1934`, `kjv`, `web`, `asv`).
   - Backend APIs:
     - `GET /api/bible/translations`: Danh mục bản dịch và giấy phép công quyền.
     - `GET /api/bible/parallel-chapter`: Nâng cấp hỗ trợ chọn linh hoạt `target_translation` (KJV, WEB, ASV).
     - `GET /api/bible/compare-verse`: Đối chiếu đồng thời 4 bản dịch cho từng câu gốc với thống kê số từ, độ dài ký tự và gốc từ nguyên ngữ.
   - Giao diện người dùng `/bible`:
     - Thanh chọn bản dịch tức thì (KJV / WEB / ASV) ngay trên tiêu đề cột song song.
     - Nút "4 Bản" trên từng câu để đối chiếu nhanh.
     - Tab "Đối Chiếu 4 Bản Dịch" trong Ngăn kéo câu gốc (Verse Drawer).
     - Modal chuyên sâu "Đối Chiếu Đa Bản Dịch & Mạch Ngữ Nghĩa" hỗ trợ sao chép toàn bộ 4 bản và xem nguyên ngữ Hê-bơ-rơ / Hy Lạp.

---

## 6. Định hướng tiếp theo

1. **Advanced Semantic Audio Search**: Tìm kiếm ngữ nghĩa trong kho thuyết minh âm thanh bài học hằng ngày.
2. **Cross-Platform Study Notes Sync**: Đồng bộ ghi chú học tập ngoại tuyến lên đám mây khi có kết nối.
3. **Biblical Timeline Era Interactive Filter Expansion**: Bổ sung bộ lọc chi tiết cho từng giai đoạn vương quốc phân chia và thời kỳ lưu đày Ba-by-lôn.
