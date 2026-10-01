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
| `/` (Home) | Dashboard Tổng Quan | Số liệu thống kê thời gian thực (31.081 câu, 275 sách, 4.673 chunks), câu gốc trong ngày. **Trình phát âm thanh Suy ngẫm Lời Chúa hằng ngày & Thư Viện Audio Devotionals (§53)**: Tích hợp danh mục 16 bài suy ngẫm thần học chính thống, công cụ tìm kiếm ngữ nghĩa không dấu thời gian thực (`/api/bible/devotionals/search`), bộ lọc chủ đề linh động, bộ điều chỉnh tốc độ giọng đọc tự nhiên (0.8x, 1.0x, 1.2x), bài học thuộc linh, lời cầu nguyện mẫu, sao chép một chạm và liên kết đọc phân đoạn Kinh Thánh trực tiếp. |
| `/bible` | Đọc & Tra Cứu Kinh Thánh | Đọc 66 sách theo chương, điều hướng Tân/Cựu Ước, tìm kiếm toàn văn không dấu tiếng Việt, hiển thị tiêu đề và tham chiếu chéo. **Mạng Lưới Tham Chiếu Chéo Trực Quan & Mạch Cứu Chuộc (§18)**: Đồ thị SVG tương tác với 2 quỹ đạo Cựu Ước / Tân Ước, bộ thanh tra Node Inspector, 8 chuỗi thần học cứu chuộc liên tục; **Ngăn Kéo Giải Kinh Phân Đoạn Nhanh (Inline Passage Exegesis Quick Drawer §13)**; **Trình Đọc Liên Dòng Nguyên Ngữ Từng Từ & Phân Tích Cú Pháp (Hebrew & Greek Interlinear Reader §2.1, §49)**: Ngăn kéo liên dòng chuyên sâu, dòng từ nguyên văn theo hướng đọc RTL/LTR, phiên âm, mã Strong, hình thái học, nghĩa Việt/Anh, phát âm Web Speech API, phân tích cấu trúc cú pháp mệnh đề, và đối chiếu 4 cổ bản chép tay (Sinaiticus, Vaticanus, Alexandrinus, Leningrad Codex). |
| `/research` | Nghiên Cứu Thần Học & Giải Kinh | 1. **Giải Kinh Phân Đoạn 11 Chiều (§13)**: Phân tích bối cảnh, tác giả, thể loại, thực thể, dàn ý La Mã, Strong's Lexicon, câu hỏi suy ngẫm, trích dẫn chú giải.<br>2. **Bối Cảnh Đa Chiều 6 Chiều (§15)**: Lịch sử, Văn hóa, Chính trị, Tôn giáo, Địa lý, Văn chương.<br>3. **Nguyên Ngữ & Strong's Morphology (§37, §49)**: Phân tích hình thái học nguyên ngữ (Greek/Hebrew Paradigms, Binyanim, Stems, Cases, Tenses), ngữ pháp, phát âm và đối chiếu Concordance toàn văn 31.081 câu; **Mở rộng bộ phân tích hình thái học tiếng Hê-bơ-rơ cho các sách Thi Ca & Khôn Ngoan (Thi Thiên, Gióp, Châm Ngôn)**: `H1984` (*Halal* - Ca ngợi), `H2451` (*Chokmah* - Sự khôn ngoan), `H3374` (*Yirah* - Kính sợ Chúa), `H0835` (*Ashrei* - Phước thay), `H7462` (*Ra'ah/Rohi* - Đấng Chăn Giữ), `H1350` (*Go'el* - Đấng Cứu Chuộc), `H0982` (*Batach* - Tin cậy), `H6666` (*Tzedakah* - Công bình).<br>4. **Khảo Cứu Nguyên Ngữ Liên Dòng Từng Chữ & Cú Pháp (Word-by-word Interlinear Exegetical Parser §49)**: 8 phân đoạn kinh điển (Giăng 1:1, Sáng 1:1, Giăng 3:16, Thi 23:1, Rô-ma 8:28, Ê-phê-sô 2:8, Ma-thi-ơ 28:19, Xuất 3:14), tìm kiếm tự do trên 31.081 câu Kinh Thánh, ma trận từ nguyên ngữ theo hướng đọc RTL/LTR, liên kết ngược vào Strong's Concordance modal, luận điểm giải kinh thần học và trích xuất Markdown.<br>5. **Hỏi Đáp Thần Học RAG**: Hỏi đáp có trích dẫn nguồn.<br>6. **Nhân Vật Kinh Thánh**: Nghiên cứu tiểu sử & hình bóng.<br>7. **Tác Nhân Nghiên Cứu AI (§51)**: Nghiên cứu sâu đa góc nhìn, ma trận đối chiếu.<br>8. **So Sánh Đối Chiếu Đa Đoạn & Khảo Luận Đồng Quan (§48 `Compare`, §51)**: Giải kinh đối chiếu đồng thời 2 đến 4 phân đoạn Kinh Thánh qua 6 lăng kính học thuật với ma trận 5 chiều kích, căn ngữ Strong tương đồng, điểm đồng quy, khác biệt sắc thái, hòa hợp cứu rỗi, chú giải và dàn ý bài giảng 3 điểm mục vụ kèm sao chép một chạm. |
| `/explore` | Khám Phá & Đối Chiếu Học Thuật | 1. **Đồ Thị Tri Thức (§17)**: Trực quan hóa Cytoscape.js mạng lưới giao ước, địa danh, nhân vật.<br>2. **Dòng Thời Gian Lịch Sử Cứu Chuộc Toàn Diện & Bộ Lọc 9 Kỷ Nguyên (§6, §44)**: 22 mốc biến cố then chốt từ Sáng tạo đến Khải Huyền, mở rộng bộ lọc 9 kỷ nguyên chính xác (Sáng Tạo & Tổ Phụ, Xuất Hành & Quan Xét, Vương Quốc Thống Nhất, Vương Quốc Phân Chia, Lưu Đày Ba-by-lôn, Hồi Hương & Giữa Hai Ước, Cuộc Đời Chúa Giê-xu, Hội Thánh & Khải Huyền) kèm bảng thông tin kỷ nguyên (niên đại, nhân vật then chốt, sách quy điển, trọng tâm giao ước cứu chuộc), nút liên kết chuyển tiếp trực tiếp sang Bản Đồ Atlas Địa Lý (§9) trên từng biến cố và modal tra cứu.<br>3. **Bản Đồ Không Gian Địa Lý & Atlas Sự Kiện Lịch Sử Cứu Chuộc (Biblical Chronological Event Atlas & Spatial Journeys §6, §8, §9, §44)**: Bộ chuyển đổi 2 chế độ trực quan: (a) *Atlas 22 Biến Cố Lịch Sử Cứu Chuộc*: Ánh xạ 22 mốc biến cố lên tọa độ không gian chính xác, đường dẫn quang học nối kết dòng chảy niên biểu, 22 pin đánh số thứ tự `#1` đến `#22` theo màu kỷ nguyên, bảng kiểm tra Inspector đa chiều (địa danh cổ vs. hiện đại, tọa độ GPS, trích dẫn nguyên văn câu gốc 1925 tự động từ DB, bối cảnh khảo cổ học, vị thế địa lý chiến lược, ý nghĩa hình bóng Đấng Christ, hồ sơ nhân vật then chốt, thuyết minh âm thanh Web Speech API và nút xem dòng thời gian đối ứng), tour mô phỏng tự động theo thứ tự niên biểu với điều tốc; (b) *9 Tuyến Hành Trình Điển Hình*: Tích hợp tọa độ vector SVG chiếu Mercator điều chỉnh cho Cận Đông, chặng dừng chân, trích dẫn Kinh Thánh và mô phỏng tour tự động.<br>4. **Đối Chiếu Tin Lành Song Song**: 16 biến cố, 54 phân đoạn.<br>5. **Ma Trận Tiên Tri Mê-si (§18, §45)**: 14 lời tiên tri Cựu Ước & ứng nghiệm Tân Ước.<br>6. **Thư Viện 275 Tác Giả & Bộ Chú Giải**: Tra cứu danh mục và chuẩn trích dẫn.<br>7. **Bản Đồ Mạng Lưới Chủ Đề & Dòng Chảy Giao Ước Cứu Chuộc (§17, §18)**: Đồ thị SVG tương tác 3 tầng quỹ đạo (Tâm điểm Chủ đề, Quỹ đạo 1 Trụ Cột Tín Lý, Quỹ đạo 2 Bản Văn Chính Kinh Cựu/Tân Ước với đường nối Typology bóng mờ -> ứng nghiệm, Quỹ đạo 3 Nhân Vật & Biến Cố), bộ chọn 7 chủ đề nền tảng, trích xuất câu gốc 1925 tự động từ PostgreSQL, bảng soi chi tiết Exegetical Inspector, tiến trình 8 thời kỳ khải huyền tiệm tiến (Redemptive Trajectory Stepper), đề cương bài giảng 3 điểm mục vụ sao chép 1-chạm và trích dẫn chú giải 275 sách kinh điển. |
| `/study` | Soạn Bài Giảng & Phản Biện Cộng Đồng | 1. **Nhóm Học Kinh Thánh Đa Mục Vụ & Cộng Tác Giải Kinh (Horizon Item 5)**: Không gian làm việc nhóm cho các tổ mục sư, giáo viên và lãnh đạo ban ngành cùng thảo luận văn mạch, đóng góp khảo luận giải kinh, câu hỏi đào sâu, ứng dụng mục vụ, tán thành ý kiến, trao đổi đa tầng và xuất toàn văn biên bản nghiên cứu (.MD);<br>2. **Kho Bản Thảo Bài Giảng & Diễn Đàn Phản Biện Đồng Nghiệp (Horizon Item 4)** với hệ thống đánh giá 3 chiều (Độ Trung Thực Giải Kinh, Bố Cục Sư Phạm, Ứng Dụng Thực Tiễn), nút chia sẻ bản thảo tức thì từ bộ soạn bài giảng, và hồ sơ phản biện đầy đủ;<br>3. **Bộ Xuất Giáo Trình Nhóm Nhỏ & Hướng Dẫn Điều Phối (Small Group Leader Guide & Curriculum Generator §50)**: Tự động trích xuất mục tiêu huấn luyện 3H (Tri Thức - Head, Tấm Lòng - Heart, Hành Động - Hands), câu hỏi phá băng khởi động, giải kinh phân đoạn ghim, thực thể lịch sử, dàn ý 3 bước, câu hỏi thảo luận khám phá và trích dẫn chú giải 275 sách kinh điển ra định dạng Markdown chuẩn xuất bản và sao chép 1 chạm;<br>4. Mẫu đề cương bài giảng (§50), công cụ soạn thảo trực tiếp, quản lý ghi chú, xuất trọn gói tài liệu nghiên cứu (.MD / Dossier);<br>5. **Trình Chiếu Slide Bài Giảng Toàn Màn Hình (Homiletical Slide Deck Presentation Engine §50)** với điều hướng phím bấm mũi tên, thanh tiến trình slide, bố cục trình chiếu giải kinh chuyên nghiệp và xuất file slide Markdown Marp/Slidev;<br>6. **Ghim Thực Thể Hai Chiều Vào Dự Án Nghiên Cứu (Entity Pinning §50)** kết nối Nhân vật, Địa danh, Biến cố và Chủ đề từ Đồ thị tri thức trực tiếp vào không gian làm việc. |
| `/learn` | Học Tập & Rèn Luyện Đức Tin | 1. **Kế Hoạch Đọc Kinh Thánh (§3, §46, §53)**: 8 lộ trình theo dõi tiến độ thời gian thực (Toàn bộ 365 ngày, Tân Ước 90 ngày, Tuần Lễ Khổ Nạn 7 ngày, Mùa Vọng 25 ngày, Cải Chánh 30 ngày, v.v.).<br>2. **Trợ Lý Học Thuộc Lòng Câu Gốc (§3, §4)**: 12 câu gốc, che chữ tương tác (25%-100%), tính điểm, Text-to-Speech phát âm tiếng Việt.<br>3. **Trắc Nghiệm Thần Học Đa Cấp Độ**: 48 câu hỏi chuẩn viện thần học (đầy đủ Ngũ Kinh, Lịch Sử, Thi Ca, Tin Lành, Thư Tín Phao-lô, Khải Huyền) kèm giải thích chi tiết.<br>4. **Thẻ Ghi Nhớ Spaced Repetition (SM-2)**: Xuất Anki/CSV.<br>5. **Thử Thách Chuyên Đề & Mùa Lễ (§46)**: 8 gói thử thách giáo trình (5 nền tảng + 3 mùa lễ phụng vụ). |
| Mọi trang | Trải Nghiệm PWA Mobile & Ngoại Tuyến | Cấu hình Web App Manifest (`manifest.json`), Service Worker (`sw.js`), Vector Icons (192px/512px), và Banner phát hiện kết nối & nhắc cài đặt PWA (`OfflineBanner.tsx`). |

---

## 4. Công cụ kiểm định toàn diện (Automated Integration Test Suite)

* Script tự động: `scripts/test_platform.js` (`npm test` / `node scripts/test_platform.js`)
* **Tổng số bài kiểm tra**: **72/72 tests PASSED (100%)**
* Kiểm tra tức thì 5 bộ kiểm định chuyên sâu:
  1. **Suite 1 - Core API Surface & Endpoints**: 50 endpoints (`/health`, 66 books, chapter verses, search, reading plans, translations list, parallel chapter alignment, compare-verse multi-translation alignment, audio devotionals catalogue & accent-insensitive search, verse-interlinear NT Greek & OT Hebrew & fallback parser §2.1 & §49, RAG context presets, passage presets, comparative study presets & multi-passage comparative matrix §48, Morphology Greek/Hebrew, Graph data, Graph timeline, Graph entities, Graph themes catalogue & theme-map visualizer §17 & §18, Graph event-atlas & geo-routes §6 & §9, Quiz, Flashcards, 8 Challenge Packs, Memorization, Harmony, Prophecies, Journeys, Cross-Reference Network Visualizer, Community Sermons, Community Sermon Detail & 3D Reviews, Study Groups & Cohorts, Group Notes & Export, Study Projects, Small Group Leader Guide & Curriculum Generator §50, Library).
  2. **Suite 2 - Canonical Text Integrity & Database Validation**: 66 sách chính kinh, 31.081 câu BTT 1925, 0 câu rỗng, 275 sách thần học, 4.673 vector chunks với độ phủ nhúng 100%, hạt giống bài giảng cộng đồng, dữ liệu phản biện đồng nghiệp, và các tổ nghiên cứu mục vụ cộng tác.
  3. **Suite 3 - Knowledge Graph Topology & Integrity**: 30 nodes, 35 edges, 0 broken edges, 0 orphan nodes.
  4. **Suite 4 - Web Application Routes**: 8 tuyến URL chính (`/`, `/bible`, `/explore`, `/learn`, `/research`, `/study`, `/library`, `/manifest.json`) trả về HTTP 200 OK.
  5. **Suite 5 - Resource & Performance Guardrail**: Tổng RAM các container ứng dụng Non-Ollama duy trì nghiêm ngặt dưới 2.0 GB (~1054.5 MiB / 2048 MiB, tức < 52% ngân sách).

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
   - Backend APIs: `GET /api/bible/translations`, `GET /api/bible/parallel-chapter`, `GET /api/bible/compare-verse`.
   - Giao diện người dùng `/bible`: Thanh chọn bản dịch, nút 4 Bản, tab ngăn kéo câu gốc và modal so sánh chuyên sâu.
6. [x] **Thư Viện Audio Suy Ngẫm Lời Chúa & Khám Phá Ngữ Nghĩa Không Dấu (Semantic Audio Devotional Discovery §53)**:
   - Backend APIs: `GET /api/bible/devotionals`, `GET /api/bible/devotionals/search`, `GET /api/bible/devotionals/{id}` phục vụ 16 bài suy ngẫm thần học sâu nhiệm.
   - Giao diện Home (`/`): Modal Thư Viện Audio Suy Ngẫm với bộ tổng hợp giọng đọc Text-to-Speech tự nhiên, tùy chỉnh tốc độ đọc (0.8x, 1.0x, 1.2x), tìm kiếm tức thì, lọc chủ đề và liên kết đọc phân đoạn Kinh Thánh.
7. [x] **Bộ Lọc 9 Kỷ Nguyên Lịch Sử Kinh Thánh & Bảng Tóm Lược Niên Đại (Biblical Timeline Era Interactive Filter Expansion §6, §44)**:
   - Giao diện Explore (`/explore`): Phân loại chính xác 9 kỷ nguyên chính kinh (Sáng Tạo, Xuất Hành, Vương Quốc Thống Nhất, Vương Quốc Phân Chia, Lưu Đày Ba-by-lôn, Hồi Hương, Cuộc Đời Chúa Giê-xu, Hội Thánh & Khải Huyền) kèm thẻ thông tin tóm lược niên đại, nhân vật, sách quy điển và chủ đề giao ước.
8. [x] **Ma Trận Đối Chiếu Đa Đoạn & Khảo Luận Đồng Quan (Multi-Passage Comparative Exegesis Matrix & Synoptic Lens Engine §48, §51)**:
   - Backend APIs:
     - `GET /api/rag/comparative-presets`: 8 bộ đề mẫu nền tảng (Đại Mạng Lệnh, Giao Ước Mới, Đức Tin & Việc Làm, Chiên Con Lễ Vượt Qua, Ngôi Lời Sáng Thế & Nhập Thể, Đầy Tớ Chịu Khổ, Bài Giảng Trên Núi, Bông Trái Thánh Linh).
     - `POST /api/rag/comparative-study` & `GET /api/rag/comparative-study`: Giải kinh đồng bộ 2-4 phân đoạn, xuất bản văn 1925 nguyên thủy, ma trận 5 chiều kích, đối chiếu căn ngữ Strong's Hy Lạp / Hê-bơ-rơ, điểm đồng quy, điểm khác biệt, hòa hợp thần học cứu rỗi, trích dẫn chú giải 275 sách và dàn ý bài giảng 3 điểm mục vụ.
   - Giao diện người dùng Research (`/research` tab `compare`):
     - Bảng chọn 8 đề mục mẫu tức thì kèm thẻ nhãn kỷ nguyên.
     - Thanh quản lý phân đoạn tương tác: Thêm/bớt phân đoạn linh hoạt, nhập chủ đề trọng tâm và chọn lăng kính so sánh.
     - Bộ đọc câu gốc song song đa cột (2 đến 4 cột) với trích xuất câu gốc 1925, huy hiệu Cựu/Tân Ước, tác giả, niên đại và căn ngữ Strong cục bộ.
     - Ma trận đối chiếu chi tiết 5 chiều kích giải kinh kèm tổng hợp thần học.
     - Bảng căn ngữ nguyên văn đối chiếu (Strong's Concordance).
     - Hai cột đối chiếu: Điểm Đồng Quy Thần Học vs Sắc Thái Độc Đáo Của Từng Trước Giả.
     - Khảo luận hòa hợp trong lịch sử cứu rỗi (Redemptive Harmonization).
     - Dàn ý bài giảng mục vụ 3 điểm với nút sao chép Markdown 1 chạm.
     - Trích dẫn chuyên khảo từ 275 bộ sách và câu hỏi thảo luận nhóm nhỏ.
9. [x] **Trình Đọc & Khảo Cứu Nguyên Ngữ Liên Dòng Từng Chữ (Interactive Hebrew & Greek Interlinear Word-by-Word Reader & Exegetical Parser §2.1, §49)**:
   - Backend API (`services/api-ai/app/routers/bible.py`):
     - Endpoint `GET /api/bible/verse-interlinear` hỗ trợ trọn bộ 31.081 câu Kinh Thánh tiếng Việt 1925 với bộ nạp mẫu quy điển (John 1:1, Genesis 1:1, John 3:16, Psalm 23:1, Romans 8:28, Ephesians 2:8, Matthew 28:19, Exodus 3:14) và bộ phân tách từ vựng thuật toán tự động đối chiếu cơ sở dữ liệu `strong_lexicon`.
     - Cấu trúc dữ liệu phong phú: Hướng đọc RTL (Phải sang Trái cho tiếng Hê-bơ-rơ) và LTR (Trái sang Phải cho tiếng Hy Lạp), từ nguyên ngữ, phiên âm quốc tế, mã Strong, phân tích hình thái học (Morphology codes & expanded descriptions), từ loại, nghĩa tiếng Việt, nghĩa tiếng Anh, phát âm Web Speech API (`el-GR`, `he-IL`), cấu trúc cú pháp mệnh đề (Syntactic Structure), luận điểm giải kinh thần học, và đối chiếu 4 cổ bản chép tay sớm nhất (Codex Sinaiticus, Codex Vaticanus, Codex Alexandrinus, Leningrad Codex).
   - Giao diện người dùng Bible Reader (`/bible`):
     - Thêm tab chuyên biệt "Nguyên Ngữ Liên Dòng (§2.1, §49)" trong Verse Drawer, hỗ trợ đọc liên dòng câu đang chọn, sao chép định dạng Markdown.
     - Thêm nút mở phân tích nhanh từ chế độ đọc liên dòng toàn chương (`viewMode === "interlinear"`).
   - Giao diện người dùng Research (`/research` tab `lexicon`):
     - Thêm chế độ chuyển đổi phụ: "Khảo Cứu Nguyên Ngữ Liên Dòng Từng Chữ (§49)" với 8 thẻ phân đoạn kinh điển, thanh tìm kiếm tự do cho 31.081 câu.
     - Luồng thẻ từ nguyên ngữ tương tác theo hướng đọc RTL/LTR, liên kết ngược vào Strong's Concordance modal, phân tích mệnh đề cú pháp, bằng chứng cổ bản và nút sao chép toàn bộ phân tích.
   - Kiểm định tự động: 68/68 bài kiểm tra ban đầu vượt qua 100% trong `scripts/test_platform.js`.
10. [x] **Bản Đồ Mạng Lưới Chủ Đề & Dòng Chảy Giao Ước Cứu Chuộc (Topical Thematic Map Visualizer & Covenant Trajectories §17, §18)**:
    - Backend APIs (`services/api-ai/app/routers/graph.py`):
      - Endpoint `GET /api/graph/themes`: Danh mục 7 đại chủ đề thần học giao ước nền tảng xuyên suốt 66 sách chính kinh (`covenant_redemption`, `grace_faith`, `kingdom_god`, `paschal_atonement`, `holy_spirit`, `resurrection_hope`, `prayer_communion`) với phân loại, câu gốc nền tảng, luận đề cứu chuộc và số lượng thành phần.
      - Endpoint `GET /api/graph/theme-map?theme_id={theme_id}`: Tạo tọa độ trực quan SVG hình nan hoa/quỹ đạo hướng tâm (Tâm điểm Chủ đề Hub, Quỹ đạo 1 Trụ cột tín lý r=150, Quỹ đạo 2 Bản văn Kinh Thánh r=265 kèm đường liên kết Typology bóng mờ Cựu Ước -> ứng nghiệm Tân Ước, Quỹ đạo 3 Nhân vật & Biến cố r=370). Tự động truy xuất nguyên văn câu gốc tiếng Việt 1925 chuẩn xác từ PostgreSQL `bible_verses`, chuỗi 8 thời kỳ khải huyền tiệm tiến (Redemptive Trajectory Stepper), trích dẫn chú giải từ 275 sách kinh điển và đề cương bài giảng 3 điểm mục vụ kèm ứng dụng đời sống.
    - Giao diện người dùng Explore (`/explore` tab `themes`):
      - Nút chuyển tab "Bản Đồ Chủ Đề & Giao Ước (§17, §18)" với hiệu ứng gradient nổi bật.
      - Carousel 7 thẻ chủ đề trực quan, bấm chuyển tức thì mạng lưới.
      - Bộ lọc hiển thị nút mạng (Trụ cột tín lý, Bản văn chính kinh, Nhân vật, Biến cố) và bộ đếm thời gian thực.
      - SVG Canvas tương tác mượt mà với hiệu ứng hào quang pulsing glow, quỹ đạo đồng tâm, đường dẫn hồ quang Typology cong đứt đoạn màu cyan/emerald, vòng xoay lựa chọn node.
      - Bảng kiểm tra Thematic Node Inspector chi tiết: Luận đề thần học cứu chuộc, câu gốc hoàng kim, trích dẫn nguyên văn câu gốc 1925, liên kết mở trực tiếp trong Kinh Thánh và hồ sơ nhân vật.
      - Thanh tiến trình 8 thời kỳ lịch sử cứu chuộc (Creation, Patriarchs, Exodus, Kingdom, Prophets, Christ, Early Church, Consummation) với mốc câu gốc và giải thích tiệm tiến.
      - Đôi thẻ mục vụ: Đề cương bài giảng 3 điểm kèm nút sao chép Markdown 1-chạm & Dẫn chứng chú giải từ kho tàng 275 bộ sách.
    - Kiểm định tự động: 70/70 bài kiểm tra vượt qua 100% trong `scripts/test_platform.js`.
11. [x] **Bản Đồ Không Gian Địa Lý & Atlas Sự Kiện Lịch Sử Cứu Chuộc (Biblical Chronological Event Atlas & Geo-Temporal Historical Synthesis §6, §8, §9, §44)**:
    - Backend APIs (`services/api-ai/app/routers/graph.py`):
      - Endpoint `GET /api/graph/event-atlas`: Tích hợp toàn diện 22 mốc biến cố lịch sử cứu chuộc với tọa độ địa lý chính xác (vĩ độ, kinh độ), phép chiếu không gian vector SVG (khung vẽ 900x600 bao quát từ Rome, Hy Lạp đến Lưỡng Hà, Ba-by-lôn và Sinai), định danh địa lý cổ vs. hiện đại, câu gốc và phân đoạn Kinh Thánh chính xác, trích xuất nguyên văn câu gốc tiếng Việt 1925 tự động từ PostgreSQL `bible_verses`, bối cảnh khảo cổ học (Tell es-Sultan, Trụ đá Si-ru, Di chỉ Cenacle, Hang Khải Huyền, v.v.), vị thế địa lý chiến lược và luận điểm hình bóng Đấng Christ.
      - Endpoint `GET /api/graph/geo-routes`: Trích xuất 9 tuyến hành trình không gian điển hình với tọa độ vector SVG pre-computed trên từng trạm dừng chân.
    - Giao diện người dùng Explore (`/explore` tab `map`):
      - Bộ chuyển đổi 2 chế độ phụ (Sub-Mode Switcher): *Bản Đồ Sự Kiện Lịch Sử Cứu Chuộc (22 Mốc Biến Cố Atlas)* vs. *9 Tuyến Hành Trình Điển Hình (Spatial Journeys)*.
      - Chế độ Event Atlas: Bộ lọc 9 kỷ nguyên lịch sử cứu chuộc, thanh tìm kiếm tức thì, điều khiển mô phỏng tự động (Guided Tour 1.0x, 1.5x, 2.0x).
      - Bản đồ vector SVG tương tác: Đường dẫn quang học gradient nối kết 22 biến cố theo trình tự niên biểu, 22 pin đánh số thứ tự `#1` đến `#22` với màu sắc nhận diện kỷ nguyên, hiệu ứng pulsing ping khi chọn biến cố.
      - Bảng kiểm tra Event Atlas Inspector chi tiết: Tọa độ GPS, địa danh cổ vs. hiện đại, thẻ Lời Chúa trích dẫn nguyên văn bản dịch 1925, bối cảnh khảo cổ học, ý nghĩa vị thế địa lý, ý nghĩa cứu chuộc, nhân vật liên đới kèm mở Modal Hồ sơ nhân vật (§7), thuyết minh âm thanh Web Speech API, nút liên kết đọc Kinh Thánh (`/bible`) và nút chuyển tiếp sang Dòng thời gian (`/explore` tab `timeline`).
      - Tính năng hội tụ hai chiều: Nút "Bản Đồ Địa Lý (§9)" trên từng thẻ biến cố và modal của Dòng Thời Gian (Tab 2) cho phép nhảy tức thì sang điểm ghim tương ứng trên Bản Đồ Atlas (Tab 3).
    - Kiểm định tự động: 72/72 bài kiểm tra vượt qua 100% trong `scripts/test_platform.js`.

---

## 6. Định hướng tiếp theo

1. **Cross-Platform Study Notes Sync**: Đồng bộ ghi chú học tập ngoại tuyến lên đám mây khi có kết nối.
2. **Advanced Sermon Audio Synthesis**: Xuất bài giảng thành audio podcast tổng hợp bằng AI.
3. **Interactive Biblical Chronology Quiz & Spatial Challenges**: Bộ câu hỏi trắc nghiệm tương tác định vị không gian và niên đại cứu chuộc.

