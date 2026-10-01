# Phase 3 Implementation Plan — Interactive Learning & Spaced Repetition (Learn Layer)

> **Nhiệm vụ**: Triển khai Module **Learn Layer (Tầng 1: Học tập Tương tác)** theo chuẩn `ROADMAP1.md` (Mục 1, 3, 4, 5, 46) và `docs/ARCHITECTURE.md`.  
> **Nền tảng**: PostgreSQL 16 (`quiz_questions`, `flashcards`), thuật toán lặp lại ngắt quãng SM-2, mô hình Qwen local trên GPU để tự động sinh câu hỏi, và giao diện web Next.js 15 tương tác cao.

---

## 1. Mục tiêu Cốt lõi (Objectives)

1. **Bộ Dữ Liệu Học Tập Chuẩn (Seed Curated Questions & Flashcards)**:
   - Nạp bộ câu hỏi trắc nghiệm Kinh Thánh chuẩn xác (Đa dạng thể loại: Trắc nghiệm ABCD, Đúng/Sai, "Tôi là ai?" - Who Am I?, Đoán nhân vật & biến cố).
   - Nạp thẻ ghi nhớ (Flashcards) theo 4 nhóm: Nhân vật (Person Cards), Câu gốc (Verse Cards), Biến cố (Event Cards), và Khái niệm thần học (Word / Doctrine Cards).
   - Mọi câu hỏi và thẻ đều liên kết trực tiếp với địa chỉ Kinh Thánh (`scripture_reference`).

2. **Thuật toán Spaced Repetition (SM-2 Algorithm)**:
   - Theo dõi chu kỳ ôn tập của người học: `interval_days`, `repetition_count`, `next_review_at`.
   - Phân cấp phản hồi 4 mức độ: Again (1), Hard (2), Good (3), Easy (4).
   - Tối ưu hóa chu kỳ nhớ lại theo chuẩn đường cong lãng quên Ebbinghaus.

3. **Backend API (FastAPI `app/routers/learn.py`)**:
   - `GET /api/learn/quiz`: Lấy bộ câu hỏi ngẫu nhiên theo chủ đề / độ khó.
   - `POST /api/learn/quiz/submit`: Chấm điểm, phản hồi giải thích chi tiết và trích dẫn câu gốc.
   - `POST /api/learn/quiz/generate`: Sử dụng Qwen AI sinh bộ câu hỏi mới từ bất kỳ phân đoạn Kinh Thánh nào.
   - `GET /api/learn/flashcards`: Lấy danh sách thẻ cần ôn tập (`due_only` hoặc lọc theo danh mục).
   - `POST /api/learn/flashcards/{id}/review`: Cập nhật tiến độ học theo thuật toán SM-2.

4. **Giao Diện Học Tập Tương Tác Hiện Đại (Interactive Learn UI)**:
   - Trang `/learn` với 2 tab chính:
     - **Thử Thách Trắc Nghiệm (Biblical Quiz)**: Hiển thị giao diện câu hỏi trực quan, phản hồi màu sắc sinh động (xanh khi đúng, đỏ khi sai kèm giải thích ngay), streak counter, và nút xem câu Kinh Thánh gốc.
     - **Thẻ Ghi Nhớ (Spaced Flashcards)**: Hiệu ứng lật thẻ 3D mượt mà (3D Flip CSS), hiển thị gợi ý, các nút đánh giá độ khó (Again, Hard, Good, Easy), thống kê số thẻ đã thuộc và thẻ cần ôn.
     - **Sinh Câu Hỏi Tự Động Với AI**: Nhập câu gốc bất kỳ (ví dụ: `Sáng-thế Ký 1` hoặc `Rô-ma 8`) để AI tự tạo Quiz tức thì.
