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
| `/study` | Soạn Bài Giảng & Phản Biện Cộng Đồng | 1. **Nhóm Học Kinh Thánh Đa Mục Vụ & Cộng Tác Giải Kinh (Horizon Item 5)**: Không gian làm việc nhóm cho các tổ mục sư, giáo viên và lãnh đạo ban ngành cùng thảo luận văn mạch, đóng góp khảo luận giải kinh, câu hỏi đào sâu, ứng dụng mục vụ, tán thành ý kiến, trao đổi đa tầng và xuất toàn văn biên bản nghiên cứu (.MD);<br>2. **Kho Bản Thảo Bài Giảng & Diễn Đàn Phản Biện Đồng Nghiệp (Horizon Item 4)** với hệ thống đánh giá 3 chiều (Độ Trung Thực Giải Kinh, Bố Cục Sư Phạm, Ứng Dụng Thực Tiễn), nút chia sẻ bản thảo tức thì từ bộ soạn bài giảng, và hồ sơ phản biện đầy đủ;<br>3. **Bộ Xuất Giáo Trình Nhóm Nhỏ & Hướng Dẫn Điều Phối (Small Group Leader Guide & Curriculum Generator §50)**: Tự động trích xuất mục tiêu huấn luyện 3H (Tri Thức - Head, Tấm Lòng - Heart, Hành Động - Hands), câu hỏi phá băng khởi động, giải kinh phân đoạn ghim, thực thể lịch sử, dàn ý 3 bước, câu hỏi thảo luận khám phá và trích dẫn chú giải 275 sách kinh điển ra định dạng Markdown chuẩn xuất bản và sao chép 1 chạm;<br>4. Mẫu đề cương bài giảng (§50), công cụ soạn thảo trực tiếp, quản lý ghi chú, xuất trọn gói tài liệu nghiên cứu (.MD / Dossier);<br>5. **Trình Chiếu Slide Bài Giảng Toàn Màn Hình (Homiletical Slide Deck Presentation Engine §50)** với điều hướng phím bấm mũi tên, thanh tiến trình slide, bố cục trình chiếu giải kinh chuyên nghiệp và xuất file slide Markdown Marp/Slidev;<br>6. **Ghim Thực Thể Hai Chiều Vào Dự Án Nghiên Cứu (Entity Pinning §50)** kết nối Nhân vật, Địa danh, Biến cố và Chủ đề từ Đồ thị tri thức trực tiếp vào không gian làm việc;<br>7. **Sổ Tay Khảo Luận Cá Nhân & Nhật Ký Tâm Linh Có Cấu Trúc với Đồng Bộ Ngoại Tuyến Hai Chiều (Personal Study Notes & Structured Offline Journaling Engine §2.1, §4, §50)**: Không gian ghi chép và nhật ký đức tin chuyên sâu tích hợp 5 mẫu cấu trúc: (a) *Tĩnh Nguyện S.O.A.P* (Scripture, Observation, Application, Prayer); (b) *Khảo Luận Giải Kinh* (Bối cảnh, Căn từ nguyên ngữ, Dàn ý thần học, Ứng dụng mục vụ); (c) *Ghi Chú Bài Giảng* (Diễn giả, Đại ý Big Idea, 3 Luận điểm triển khai, Cam kết hành động); (d) *Nhật Ký Cầu Nguyện* (Nhu cầu cầu thay, Lời hứa Kinh Thánh, Tạ ơn nhậm lời); (e) *Tự Do (Markdown)*. Trợ lý tra cứu câu gốc tức thời nạp nguyên văn bản dịch 1925 tự động, bộ phân tích thống kê 4 chiều (`/api/study/notes/stats`), công cụ đồng bộ hai chiều ngoại tuyến (`/api/study/notes/sync`) giải quyết xung đột Last-Write-Wins giữa `localStorage` và PostgreSQL, bộ lọc tìm kiếm toàn diện và xuất sổ tay ra Markdown/JSON trọn gói. |
| `/learn` | Học Tập & Rèn Luyện Đức Tin | 1. **Kế Hoạch Đọc Kinh Thánh (§3, §46, §53)**: 8 lộ trình theo dõi tiến độ thời gian thực.<br>2. **Trợ Lý Học Thuộc Lòng Câu Gốc (§3, §4)**: 12 câu gốc, che chữ tương tác (25%-100%), tính điểm, Text-to-Speech phát âm tiếng Việt.<br>3. **Trắc Nghiệm Thần Học Đa Cấp Độ**: 48 câu hỏi chuẩn viện thần học kèm giải thích chi tiết.<br>4. **Hệ Thống Thẻ Ghi Nhớ Toàn Diện 5 Thể Loại Quy Điển & Động Cơ Ôn Tập Thích Ứng SM-2 (Full 5-Type Flashcards Curriculum & Adaptive SM-2 Spaced Repetition Mastery Engine §4, §5, §46, §50)**: Bộ giáo trình 71 thẻ học chuyên sâu bao phủ trọn vẹn 5 thể loại quy điển: (a) *Thẻ Câu Gốc (Verse)*: 20 thẻ nòng cốt trích dẫn nguyên văn BTT 1925; (b) *Thẻ Nhân Vật (Person)*: 13 thẻ chân dung, danh xưng Hê-bơ-rơ/Hy Lạp, vai trò cứu chuộc, hình bóng Đấng Christ và bài học đức tin; (c) *Thẻ Biến Cố Cứu Chuộc (Event)*: 12 thẻ mốc lịch sử từ Sáng Tạo đến Khải Huyền, niên đại ước tính, địa danh, thực thể và ý nghĩa cứu chuộc; (d) *Thẻ So Sánh Niên Đại Kinh Thánh (Comparative Chronology Timeline §4)*: 10 thẻ đối chiếu thứ tự trước/sau giữa các biến cố, nhân vật đương thời, sách tiên tri và đế quốc thế giới đương đại; (e) *Thẻ Căn Từ Ngữ Gốc (Word/Lexicon)*: 12 thẻ nguyên văn Cựu Ước/Tân Ước kèm phiên âm, mã Strong, phân loại ngữ pháp và ý nghĩa thần học; Giao diện lật thẻ 3D trực quan, định dạng danh sách phân điểm rõ ràng, phát âm âm thanh Web Speech API, phím tắt toàn năng (Space để lật thẻ, 1-4 để chấm điểm SM-2, Mũi tên Trái/Phải để chuyển thẻ), bộ lọc động 6 danh mục, và xuất thẻ ra Anki Deck (.txt/.tsv), CSV và JSON chuẩn đồng bộ AnkiWeb.<br>5. **Thử Thách Chuyên Đề & Mùa Lễ (§46)**: 8 gói thử thách giáo trình.<br>6. **Thử Thách Địa Lý & Không Gian Kinh Thánh (Interactive Biblical Geography & Spatial Cartography Challenges §3, §9, §46)**: Bản đồ vector SVG $900 \times 600$ phong cách cổ xưa (với Biển Lớn, Hồ Ga-li-lê, Sông Giô-đanh, Biển Chết, Bán đảo Sinai, hoa tiêu hướng Bắc và lưới WGS84), 16 thử thách định vị địa lý trải dài 6 kỷ nguyên chính kinh, trích dẫn nguyên văn câu gốc 1925 tự động từ DB, thuyết minh âm thanh Web Speech API, 4 lựa chọn trắc nghiệm địa danh/tọa độ, hiệu ứng sonar beacon / target ping, xác minh tính điểm XP & chuỗi ngày streak, bối cảnh khảo cổ học, ý nghĩa giao ước thần học và liên kết tra cứu bản đồ 3D/2D.<br>7. **Thử Thách Sắp Xếp Dòng Thời Gian & Đại Niên Biểu Lịch Sử Cứu Chuộc (Interactive Biblical Chronology & Era Order Challenges §3, §6, §44, §46)**: Hệ thống 10 bộ thử thách niên biểu cứu chuộc toàn thư từ Sáng Thế đến Khải Huyền, kéo thả/sắp xếp vị trí biến cố `#1` đến `#N`, trích dẫn nguyên văn câu gốc 1925 từ DB, đối chiếu niên đại, vị trí sai/đúng theo thời gian thực, chấm điểm độ chính xác %, thưởng XP & streak vào hồ sơ học tập, thuyết minh âm thanh Web Speech API và nút liên kết trực tiếp sang Bản Đồ Atlas Địa Lý (`/explore?tab=map`).<br>8. **Thám Tử Nhân Vật Kinh Thánh: Tôi Là Ai? (Who Am I? Biblical Character Mystery & Clue Deduction Engine §3, §7, §46)**: 16 hồ sơ mật điều tra nhân vật bí ẩn bao quát Cựu Ước & Tân Ước (Phi-e-rơ, Phao-lô, Môi-se, Đa-vít, Áp-ra-ham, Ê-li, Đa-ni-ên, Giăng Báp-tít, Giăng Sứ đồ, Ma-ri, Giô-sép, Nô-ê, Giô-suê, Giô-na, Giu-đa Ích-ca-ri-ốt, Tê-phan). Hệ thống 4 tầng manh mối tăng tiến (Xuất thân 100đ, Tiếng gọi 75đ, Biến cố đỉnh cao 50đ, Dấu ấn quyết định 25đ), thuyết minh giọng đọc Audio Briefing qua Web Speech API, trích xuất nguyên văn câu gốc 1925 tự động từ PostgreSQL, xác thực thẩm định thời gian thực (`/api/learn/who-am-i/verify`), tích lũy điểm XP & streak chuỗi ngày, bài học hình bóng Đấng Christ (Christological Typology) và liên kết tra cứu bản đồ tri thức. |
| Mọi trang | Trải Nghiệm PWA Mobile & Ngoại Tuyến | Cấu hình Web App Manifest (`manifest.json`), Service Worker (`sw.js`), Vector Icons (192px/512px), và Banner phát hiện kết nối & nhắc cài đặt PWA (`OfflineBanner.tsx`). |

---

## 4. Công cụ kiểm định toàn diện (Automated Integration Test Suite)

* Script tự động: `scripts/test_platform.js` (`npm test` / `node scripts/test_platform.js`)
* **Tổng số bài kiểm tra**: **82/82 tests PASSED (100%)**
* Kiểm tra tức thì 5 bộ kiểm định chuyên sâu:
  1. **Suite 1 - Core API Surface & Endpoints**: 60 endpoints (`/health`, 66 books, chapter verses, search, reading plans, translations list, parallel chapter alignment, compare-verse multi-translation alignment, audio devotionals catalogue & accent-insensitive search, verse-interlinear NT Greek & OT Hebrew & fallback parser §2.1 & §49, RAG context presets, passage presets, comparative study presets & multi-passage comparative matrix §48, Morphology Greek/Hebrew, Graph data, Graph timeline, Graph entities, Graph themes catalogue & theme-map visualizer §17 & §18, Graph event-atlas & geo-routes §6 & §9, Quiz, Flashcards, 8 Challenge Packs, Memorization, Geo Challenges & Verification §3 & §9 & §46, 10 Timeline Challenges & Verification §3 & §6 & §44 & §46, 16 Who Am I Mystery Dossiers & Verification §3 & §7 & §46, Harmony, Prophecies, Journeys, Cross-Reference Network Visualizer, Community Sermons, Community Sermon Detail & 3D Reviews, Study Groups & Cohorts, Group Notes & Export, Study Projects, Small Group Leader Guide & Curriculum Generator §50, Personal Study Notes & Offline Sync §2.1 & §50, Library).
  2. **Suite 2 - Canonical Text Integrity & Database Validation**: 66 sách chính kinh, 31.081 câu BTT 1925, 0 câu rỗng, 275 sách thần học, 4.673 vector chunks với độ phủ nhúng 100%, hạt giống bài giảng cộng đồng, dữ liệu phản biện đồng nghiệp, và các tổ nghiên cứu mục vụ cộng tác.
  3. **Suite 3 - Knowledge Graph Topology & Integrity**: 30 nodes, 35 edges, 0 broken edges, 0 orphan nodes.
  4. **Suite 4 - Web Application Routes**: 8 tuyến URL chính (`/`, `/bible`, `/explore`, `/learn`, `/research`, `/study`, `/library`, `/manifest.json`) trả về HTTP 200 OK.
  5. **Suite 5 - Resource & Performance Guardrail**: Tổng RAM các container ứng dụng Non-Ollama duy trì nghiêm ngặt dưới 2.0 GB (~963.6 MiB / 2048 MiB, tức < 47.1% ngân sách).

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
    - Kiểm định tự động: 74/74 bài kiểm tra vượt qua 100% trong `scripts/test_platform.js`.
12. [x] **Thử Thách Địa Lý & Không Gian Kinh Thánh (Interactive Biblical Geography & Spatial Cartography Challenges §3, §9, §46)**:
    - Backend APIs (`services/api-ai/app/routers/learn.py`):
      - Endpoint `GET /api/learn/geo-challenges`: Cung cấp 16 thử thách định vị địa lý không gian Kinh Thánh trải dài 6 kỷ nguyên chính kinh (Tổ Phụ, Xuất Hành, Vương Quốc, Lưu Đày, Tin Lành, Các Sứ Đồ). Mỗi thử thách bao gồm dữ liệu câu hỏi, manh mối địa lý, trích xuất nguyên văn câu gốc tiếng Việt 1925 tự động từ PostgreSQL `bible_verses`, tọa độ đích (GPS & chiếu SVG vector $900 \times 600$), 4 phương án trắc nghiệm kèm tọa độ & định danh cổ vs. hiện đại, dữ kiện khảo cổ học đào sâu và ý nghĩa giao ước thần học.
      - Endpoint `POST /api/learn/geo-challenges/verify`: Thẩm định tính chính xác của tọa độ được chọn (hỗ trợ cả `selected_option` số nguyên và `selected_option_id` chuỗi định danh), tính điểm cộng dồn XP và chuỗi streak vào `user_profiles`, cung cấp phản hồi giải thích chi tiết, bối cảnh khảo cổ và ý nghĩa cứu rỗi.
    - Giao diện người dùng Learning (`/learn` tab `geo`):
      - Thanh điều hướng học tập với nút bấm mới `Địa Lý & Không Gian (§3, §9)` màu cyan nổi bật.
      - Bảng điều khiển trên: Bộ lọc 6 kỷ nguyên (Tất Cả, Tổ Phụ, Xuất Hành, Vương Quốc, Lưu Đày, Tin Lành, Các Sứ Đồ), bộ đếm điểm kinh nghiệm `+XP` và chuỗi ngày `Streak` hiệu ứng pulse, tiến độ câu hỏi `Câu X / Tổng`.
      - Cột trái: Khung vẽ bản đồ vector SVG $900 \times 600$ phong cách cartography cổ điển (với Biển Lớn Địa Trung Hải, Biển Hồ Ga-li-lê, Sông Giô-đanh, Biển Chết, Bán Đảo Sinai, Biển Đỏ, hoa tiêu hướng Bắc và các vùng địa lý cổ), 4 pin điểm ghim A, B, C, D có thể nhấp chọn trực tiếp trên bản đồ, hiệu ứng vòng sóng xung kích `animate-ping` khi chọn, hiệu ứng radar beacon sonar xoay vòng khi chấm điểm đúng, đường nét đứt vàng nối kết từ điểm chọn sai đến vị trí chính xác.
      - Cột phải: Thẻ bài toán suy luận địa lý, manh mối chiến lược, trích dẫn Kinh Thánh 1925 khung vàng hoàng kim kèm nút Text-to-Speech phát âm tiếng Việt chuẩn xác, 4 thẻ lựa chọn A, B, C, D đồng bộ hai chiều với pin trên bản đồ, nút "Xác Nhận Tọa Độ Này" tính điểm, bảng thông báo kết quả định vị chính xác/sai kèm điểm thưởng, hai thẻ thông tin chuyên sâu (Di Chỉ Khảo Cổ & Ý Nghĩa Thần Học Giao Ước), nút liên kết chuyển tiếp tức thì sang Bản đồ 3D (`/explore?tab=map`) và nút chuyển sang thử thách tiếp theo.
    - Kiểm định tự động: 74/74 bài kiểm tra vượt qua 100% trong `scripts/test_platform.js`.
13. [x] **Hệ Thống Thẻ Ghi Nhớ Toàn Diện 5 Thể Loại Quy Điển & Động Cơ Ôn Tập Thích Ứng SM-2 (Full 5-Type Flashcards Curriculum & Adaptive SM-2 Spaced Repetition Mastery Engine §4, §5, §46, §50)**:
    - Cơ sở dữ liệu (`flashcards` table trong PostgreSQL):
      - Bổ sung 52 thẻ chuyên sâu qua `scripts/seed_comprehensive_flashcards.js`, nâng tổng số thẻ lên 71 thẻ chất lượng cao, bao phủ trọn vẹn 5 thể loại quy điển:
        - `verse`: 20 thẻ câu gốc nòng cốt từ Sáng thế ký đến Khải huyền.
        - `person`: 13 thẻ nhân vật then chốt (A-bát-ram, Môi-se, Đa-vít, Phao-lô, Phê-rơ, Ê-li, Giăng Báp-tít, v.v.).
        - `event`: 12 thẻ biến cố lịch sử cứu chuộc (Lễ Vượt Qua, Giao ước Si-nai, Sự Giáng Sinh, Thập tự giá, Ngũ Tuần, v.v.).
        - `timeline`: 10 thẻ so sánh niên đại (Comparative Chronology §4) đối chiếu trật tự trước/sau giữa các nhân vật đương thời, sách tiên tri và biến cố lịch sử.
        - `word`: 12 thẻ căn từ ngữ gốc Hy Lạp/Hê-bơ-rơ (Logos, Agape, Shalom, Chesed, Pneuma, Pistis, v.v.).
        - `doctrine`: 4 thẻ tín lý căn bản.
    - Backend APIs (`services/api-ai/app/routers/learn.py`):
      - Endpoint `GET /api/learn/flashcards?limit=60&card_type=...`: Hỗ trợ lọc theo từng thể loại thẻ (`person`, `verse`, `event`, `timeline`, `word`) hoặc toàn bộ thẻ, sắp xếp theo thứ tự lặp lại ngắt quãng SM-2.
      - Endpoint `POST /api/learn/flashcards/{card_id}/review`: Tính toán lại chu kỳ ôn tập (interval) và độ khó (difficulty) theo thuật toán chuẩn SuperMemo SM-2 dựa trên 4 mức đánh giá: Lại (Again - 1 ngày), Khó (Hard - 2 ngày), Tốt (Good - 4 ngày), Dễ (Easy - 7 ngày).
      - Endpoint `GET /api/learn/flashcards/export`: Xuất bộ thẻ tùy chọn sang định dạng Anki TSV/Deck (.txt), CSV hoặc JSON, hỗ trợ import trực tiếp vào Anki Desktop và AnkiMobile.
    - Giao diện người dùng Learning (`/learn` tab `flashcards`):
      - Thanh lọc loại thẻ trực quan: Tất Cả Thể Loại, Nhân Vật (👤), Câu Gốc (📖), Biến Cố (⚡), Niên Đại (⏳ §4), Căn Từ Gốc (🔤).
      - Thẻ học lật 3D tương tác với hiệu ứng chiều sâu, badge nhận diện màu sắc riêng biệt cho từng thể loại thẻ.
      - Trình đọc thuyết minh âm thanh Web Speech API phát âm chuẩn xác nội dung thẻ tiếng Việt.
      - Phím tắt bàn phím toàn năng (Global Keyboard Shortcuts): `Space` để lật thẻ, `Phím 1-4` để đánh giá chất lượng SM-2 tức thì, `Mũi tên Trái (←) / Phải (→)` để chuyển thẻ.
      - Thanh đánh giá chất lượng nhớ SM-2 4 nút phân màu trực quan khi lật thẻ sang mặt sau.
      - Bộ xuất Anki / CSV / JSON nâng cấp hỗ trợ đầy đủ các thể loại thẻ mới.
    - Kiểm định tự động: 75/75 bài kiểm tra vượt qua 100% trong `scripts/test_platform.js`.

14. [x] **Sổ Tay Khảo Luận Cá Nhân & Nhật Ký Tâm Linh Có Cấu Trúc với Đồng Bộ Ngoại Tuyến Hai Chiều (Personal Study Notes & Structured Offline Journaling Engine §2.1, §4, §50)**:
    - Cơ sở dữ liệu (`user_study_notes` table trong PostgreSQL):
      - Cung cấp các bản ghi mẫu chất lượng cao bao quát đầy đủ 5 danh mục: Tĩnh Nguyện S.O.A.P, Khảo Luận Giải Kinh, Ghi Chú Bài Giảng, Nhật Ký Cầu Nguyện & Tạ Ơn, và Ghi Chú Tự Do.
    - Backend APIs (`services/api-ai/app/routers/study.py`):
      - Endpoint `GET /api/study/notes`: Hỗ trợ tìm kiếm từ khóa không dấu toàn diện (`search`), lọc theo thẻ (`tag`), lọc theo danh mục (`category`: `devotional`, `exegesis`, `sermon_notes`, `prayer_journal`, `general`), và giới hạn số lượng (`limit`).
      - Endpoint `GET /api/study/notes/stats`: Cung cấp số liệu phân tích 4 chiều: Tổng số ghi chép, số câu gốc được khảo luận, cơ cấu danh mục, top 10 thẻ phổ biến và lịch sử hoạt động gần đây.
      - Endpoint `GET /api/study/notes/export`: Xuất trọn gói toàn bộ sổ tay cá nhân ra định dạng Markdown bundle (.md) hoặc JSON backup (.json).
      - Endpoint `POST /api/study/notes`: Khởi tạo ghi chú mới với tiêu đề, phân đoạn Kinh Thánh, nội dung Markdown và thẻ phân loại.
      - Endpoint `PUT /api/study/notes/{note_id}`: Cập nhật chỉnh sửa ghi chú đã có.
      - Endpoint `DELETE /api/study/notes/{note_id}`: Xóa ghi chú cá nhân.
      - Endpoint `POST /api/study/notes/sync`: Động cơ đồng bộ hai chiều ngoại tuyến (Offline-First Sync Engine) giải quyết xung đột Last-Write-Wins giữa bộ nhớ thiết bị (`localStorage`) và PostgreSQL.
    - Giao diện người dùng Homiletical Workspace (`/study` tab `notes`):
      - Thanh điều khiển trên: Huy hiệu trạng thái đồng bộ đám mây, thời điểm đồng bộ gần nhất, nút "Đồng Bộ Ngay (§50)" với hiệu ứng xoay spin, và nút "Xuất Sổ Tay (.md / .json)".
      - 4 Thẻ chỉ số tổng quan (Analytics Metric Cards): Tổng Ghi Chép, Câu Gốc Khảo Luận, Tĩnh Nguyện & SOAP, Giải Kinh & Tín Lý.
      - Cột trái: Bộ chọn 5 mẫu cấu trúc hướng dẫn (🌟 Tĩnh Nguyện SOAP, 📖 Khảo Luận Giải Kinh, 🎙️ Ghi Chú Bài Giảng, 🙏 Nhật Ký Cầu Nguyện, 📝 Tự Do), trợ lý tra cứu câu gốc tức thời nạp nguyên văn bản dịch 1925 tự động từ DB kèm nút chèn 1-chạm vào nội dung, trình soạn thảo Markdown chuyên nghiệp.
      - Cột phải: Thanh tìm kiếm trực tiếp, bộ lọc 6 danh mục mượt mà, danh mục ghi chú với badge nhận diện màu sắc, liên kết phân đoạn Kinh Thánh (`/bible`), khung đọc Markdown cuộn linh hoạt, nút Sao chép, Sửa (Modal) và Xóa.
      - Modal Sửa ghi chú (Edit Modal) và Modal Xuất sổ tay (Export Modal) với tính năng tải xuống tệp hoặc sao chép 1-chạm.
    - Kiểm định tự động: 78/78 bài kiểm tra vượt qua 100% trong `scripts/test_platform.js`.

15. [x] **Thử Thách Sắp Xếp Dòng Thời Gian & Đại Niên Biểu Lịch Sử Cứu Chuộc (Interactive Biblical Chronology & Era Order Challenges §3, §6, §44, §46)**:
    - Backend APIs (`services/api-ai/app/routers/learn.py`):
      - Cấu hình mở rộng 10 bộ thử thách niên biểu bao quát trọn vẹn toàn bộ lịch sử cứu chuộc: (1) `tl-1`: Toàn cảnh 6 Kỷ nguyên cứu chuộc; (2) `tl-2`: Thời kỳ Tổ phụ đến Ca-na-an; (3) `tl-3`: Vương quốc thống nhất & Đền thờ thứ nhất; (4) `tl-4`: Vương quốc phân chia & Lưu đày Ba-by-lôn; (5) `tl-5`: Hồi hương tái thiết đến 400 năm im lặng; (6) `tl-6`: Cuộc đời & Chức vụ Đấng Christ; (7) `tl-7`: Cuộc khổ nạn, Phục sinh & Lễ Ngũ tuần; (8) `tl-8`: Kỷ nguyên Các Sứ đồ đến Khải huyền hoàn tất; (9) `tl-9`: Dòng niên biểu Đền thờ Giê-ru-sa-lem; (10) `tl-10`: Đại niên biểu toàn thư Sáng Thế đến Khải Huyền.
      - Endpoint `GET /api/learn/timeline-challenge`: Trích xuất danh mục thử thách, tự động phân giải và nạp nguyên văn câu gốc tiếng Việt 1925 chuẩn xác từ PostgreSQL `bible_verses`, niên đại ước tính, thẻ kỷ nguyên và nhân vật liên quan.
      - Endpoint `POST /api/learn/timeline-challenge/verify`: Thẩm định trật tự sắp xếp theo từng ô vị trí (`feedback_slots`), tính toán tỷ lệ phần trăm chính xác (`accuracy_percentage`), cộng dồn điểm thưởng XP và chuỗi ngày (`streak_days`) vào hồ sơ học tập `user_learning_profiles`, cung cấp luận đề khải huyền cứu chuộc tổng kết (`narrative_explanation`).
    - Giao diện người dùng Learning Portal (`/learn` tab `timeline`):
      - Thanh lọc danh mục 7 chủ đề: Tất Cả 10 Màn, Toàn Cảnh, Cựu Ước, Vương Quốc, Lưu Đày, Tin Lành, Hội Thánh.
      - Bảng điều khiển thử thách: Thẻ chọn màn chơi trực quan, chỉ số tiến trình, bộ đếm điểm XP và chuỗi streak động.
      - Khung sắp xếp trật tự tương tác: Đánh số thứ tự slot `#1`, `#2`, `#3`... với nút chuyển vị trí Lên/Xuống hoặc đặt vị trí tức thời, trích dẫn câu gốc 1925 mở rộng toggle, liên kết nhảy trực tiếp sang Bản Đồ Atlas Địa Lý (`/explore?tab=map`).
      - Xác minh kết quả thời gian thực: Hiển thị trạng thái đúng/sai từng vị trí (xanh lá cây nếu đúng, hồng/hổ phách kèm chỉ dẫn thứ tự chuẩn nếu chưa đúng), tỷ lệ hoàn thành %, hiệu ứng nhận thưởng XP, thuyết minh bài học cứu chuộc qua giọng đọc Web Speech API tự nhiên.
    - Kiểm định tự động: 80/80 bài kiểm tra vượt qua 100% trong `scripts/test_platform.js`.

16. [x] **Thám Tử Nhân Vật Kinh Thánh: Tôi Là Ai? (Who Am I? Biblical Character Mystery & Clue Deduction Engine §3, §7, §46)**:
    - Backend APIs (`services/api-ai/app/routers/learn.py`):
      - Cấu hình 16 hồ sơ mật toàn diện về các nhân vật lịch sử then chốt Cựu Ước & Tân Ước: (1) `wai-peter`: Si-môn Phi-e-rơ; (2) `wai-paul`: Sứ đồ Phao-lô; (3) `wai-moses`: Môi-se; (4) `wai-david`: Vua Đa-vít; (5) `wai-abraham`: Áp-ra-ham; (6) `wai-elijah`: Tiên tri Ê-li; (7) `wai-daniel`: Đa-ni-ên; (8) `wai-john-baptist`: Giăng Báp-tít; (9) `wai-john-apostle`: Sứ đồ Giăng; (10) `wai-mary`: Ma-ri; (11) `wai-joseph`: Giô-sép; (12) `wai-noah`: Nô-ê; (13) `wai-joshua`: Giô-suê; (14) `wai-jonah`: Tiên tri Giô-na; (15) `wai-judas`: Giu-đa Ích-ca-ri-ốt; (16) `wai-stephen`: Chấp sự Tê-phan.
      - Endpoint `GET /api/learn/who-am-i`: Tự động phân giải và trích xuất câu gốc hoàng kim BTT 1925 chuẩn xác từ PostgreSQL `bible_verses`, tích hợp 4 cấp độ manh mối tăng tiến (Xuất thân 100đ, Tiếng gọi 75đ, Thử thách lớn 50đ, Dấu ấn quyết định 25đ), 4 phương án nghi can trắc nghiệm, hình bóng Đấng Christ và bài học cứu rỗi.
      - Endpoint `POST /api/learn/who-am-i/verify`: Thẩm định lựa chọn của người dùng, phân cấp điểm thưởng theo số manh mối được mở (+100 XP, +75 XP, +50 XP, +25 XP), tích lũy XP & chuỗi ngày streak vào `user_learning_profiles`, trả về luận đề phá án, câu gốc 1925 và bài học thần học.
    - Giao diện người dùng Learning Portal (`/learn` tab `who_am_i`):
      - Bộ lọc 8 phân loại kỷ nguyên: Tất Cả (16 Hồ Sơ), Cựu Ước (8), Tân Ước (8), Tổ Phụ & Xuất Hành, Vương Quốc, Tiên Tri, Phúc Âm & Môn Đồ, Hội Thánh Đầu Tiên.
      - Thanh điều hướng danh mục 16 hồ sơ phá án với huy hiệu số hiệu `#01` đến `#16`, trạng thái đã phá án (dấu tick xanh lá) và hiệu ứng viền phát sáng active.
      - Thuyết minh Audio Briefing qua Web Speech API: Đọc to toàn văn hồ sơ vụ án và các manh mối đã mở theo phong cách điều tra trang nghiêm.
      - Bảng manh mối lũy tiến: Thẻ trích dẫn phong cách mật mã, hiệu ứng mở niêm phong từng tầng kèm cảnh báo giảm điểm thưởng.
      - Hàng ngũ 4 nghi can A, B, C, D trực quan, kết nối xác thực thời gian thực và âm thanh/hiệu ứng phá án thành công.
      - Bảng tổng kết phá án: Huy hiệu vinh danh, chân dung tước hiệu nhân vật, khung vàng câu gốc định mệnh BTT 1925, hai thẻ chuyên sâu Hình Bóng Đấng Christ (Christological Typology) & Ý Nghĩa Cứu Chuộc, liên kết đọc Kinh Thánh (`/bible`) và mở hồ sơ nhân vật trên bản đồ tri thức (`/explore`).
    - Kiểm định tự động: 82/82 bài kiểm tra vượt qua 100% trong `scripts/test_platform.js`.

---

## 6. Định hướng tiếp theo

1. **Trình Tổng Hợp Audio Bài Giảng Thần Học & Xuất Podcast Giảng Luận (Advanced Sermon Audio Synthesis & Podcast Exporter §50)**: Chuyển đổi bản thảo bài giảng thành tập podcast âm thanh chia sẻ, tích hợp bộ tổng hợp Web Speech / Audio Synthesis, điều khiển chương đoạn, nhạc đệm thanh tĩnh và xuất bản tệp âm thanh bài giảng.
2. **Bộ Xây Dựng Vốn Từ Vựng Căn Ngữ Hy Lạp & Hê-bơ-rơ Theo Tần Suất Xuất Hiện (Advanced Biblical Lexicon Vocabulary Builder §37, §49)**: Luyện nhớ từ vựng nguyên ngữ Kinh Thánh phân cấp theo tần suất (50+ lần, 20-50 lần, 10-20 lần) kết hợp ngữ cảnh câu gốc 1925 và flashcard.
3. **Phân Tích Cú Pháp Câu Phức Hợp & Sơ Đồ Cây Mệnh Đề Tân Ước (Advanced Syntactic Clause Tree Visualizer §49)**: Trực quan hóa cấu trúc mệnh đề phân cấp cho các phân đoạn thư tín sâu nhiệm (Rô-ma, Ê-phê-sô, Hê-bơ-rơ).

