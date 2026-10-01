# Phase 5 Implementation Plan — Word Study (Original Languages), Passage Study & Study Notes

> **Nhiệm vụ**: Triển khai Module **Word Study (Tra cứu Từ ngữ / Strong Lexicon Hy Lạp & Hê-bơ-rơ)**, **Passage Study Chuyên Sâu**, và **Hệ thống Lưu Trữ Ghi Chú / Dự án Nghiên cứu (Study Notes)** theo chuẩn `ROADMAP1.md` (Mục 13, 14, 37, 50).  
> **Nền tảng**: PostgreSQL 16 (`strong_lexicon`, `user_study_notes`, `user_bookmarks`), mô hình AI phân tích cấu trúc đoạn văn, và giao diện tra cứu từ ngữ nguyên ngữ.

---

## 1. Mục tiêu Cốt lõi (Objectives)

1. **Từ Điển Nguyên Ngữ Strong (Greek & Hebrew Strong Lexicon)**:
   - Tạo bảng `strong_lexicon` lưu trữ các từ ngữ thần học trọng điểm:
     - Hy Lạp: *Agapē* (G26 - Tình yêu), *Charis* (G5485 - Ân điển), *Pistis* (G4102 - Đức tin), *Logos* (G3056 - Đạo/Lời), *Pneuma* (G4151 - Thánh Linh), *Koinōnia* (G2842 - Sự thông công).
     - Hê-bơ-rơ: *Bara* (H1254 - Sáng tạo từ hư vô), *Reshit* (H7225 - Ban đầu), *Chesed* (H2617 - Tình yêu giao ước / Nhân từ), *Shalom* (H7965 - Bình an trọn vẹn), *Berith* (H1285 - Giao ước).
   - Chi tiết: Mã Strong, Lemma chữ cái gốc, phiên âm (transliteration), phát âm, định nghĩa, ý nghĩa thần học, số lần xuất hiện và các câu Kinh Thánh mẫu.

2. **Công Cụ Phân Tích Đoạn Văn Tự Động (Passage Study Engine)**:
   - API `POST /api/study/passage`: Tiếp nhận phân đoạn Kinh Thánh (ví dụ: `Giăng 3:16-21` hoặc `Rô-ma 8:28-39`).
   - Tự động bóc tách:
     1. Văn bản câu gốc.
     2. Bối cảnh lịch sử & văn học.
     3. Các nhân vật & địa danh xuất hiện trong đoạn.
     4. Các từ ngữ nguyên ngữ quan trọng (liên kết Strong).
     5. Luận điểm thần học chính & Cấu trúc đoạn.
     6. Câu hỏi suy ngẫm thực hành đời sống.

3. **Lưu Trữ Ghi Chú & Bookmark Cá Nhân (Study Notes & Bookmarks)**:
   - API `GET /api/study/notes`, `POST /api/study/notes`, `DELETE /api/study/notes/{id}`: Cho phép người dùng lưu lại ghi chú học tập, dàn ý nghiên cứu, và suy ngẫm cá nhân trực tiếp vào PostgreSQL.
   - API `GET /api/study/bookmarks`, `POST /api/study/bookmarks`: Lưu trữ và đánh dấu các câu Kinh Thánh tâm đắc.

4. **Giao Diện Không Gian Học Thuật Chuyên Sâu (Study Workspace UI)**:
   - Mở rộng `/research` hoặc trang `/study` với các tab chuyên biệt:
     - **Tra Cứu Từ Ngữ Strong (Word Study)**: Tìm kiếm từ khóa, xem chữ Hy Lạp/Hê-bơ-rơ, so sánh nghĩa và xem các câu xuất hiện.
     - **Phân Tích Đoạn Văn (Passage Study)**: Bóc tách cấu trúc đoạn văn, phân tích thần học toàn diện.
     - **Sổ Tay Nghiên Cứu (My Study Notes)**: Quản lý ghi chú cá nhân, dự án nghiên cứu.
