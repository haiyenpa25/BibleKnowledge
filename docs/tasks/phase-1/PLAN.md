# Phase 1 Implementation Plan — Interactive Bible Reader & Exploration

> **Nhiệm vụ**: Triển khai Module **Bible Reader (Tầng 2: Explore Layer)** theo chuẩn `ROADMAP1.md` (Mục 2.1, 61, 64).  
> **Nền tảng**: Sử dụng CSDL PostgreSQL 16 (31.081 câu `VI1934`), FastAPI backend, Next.js 15 frontend, và Local Ollama AI.

---

## 1. Mục tiêu Cốt lõi (Objectives)

Xây dựng trang đọc Kinh Thánh chuyên sâu tại `/bible` đạt chuẩn **Definition of Done**:

1. **Bộ chọn Sách & Đoạn (Book & Chapter Navigator)**:
   - Phân loại rõ ràng 66 sách: **Cựu Ước (39)** và **Tân Ước (27)** theo nhóm thể loại (Luật pháp, Lịch sử, Thi ca, Tiên tri, Phúc âm, Thư tín, Khải huyền).
   - Chọn nhanh chương dạng lưới (Grid 1..N) hoặc chuyển chương mượt mà (Next/Prev Chapter).
2. **Trình đọc Kinh Văn Thẩm mỹ cao (Serif Bible Reader)**:
   - Typography tối ưu cho đọc kinh văn (phông Serif, cỡ chữ linh hoạt, giãn dòng chuẩn).
   - Hiển thị rõ tiêu đề tiểu đoạn (`section_title`) phân tách các phần bản văn.
   - Số câu dạng superscript rõ ràng, hỗ trợ chọn từng câu hoặc dải câu.
   - Hiển thị huy hiệu tham chiếu chéo (`cross_references`) có thể click để tra cứu tức thì.
3. **Bảng tác vụ câu (Verse Action Drawer / Panel)**:
   - Khi click vào bất kỳ câu nào:
     - Sao chép câu với định dạng chuẩn trích dẫn.
     - Đánh dấu / Bookmark câu yêu thích.
     - **"Hỏi AI về câu này"**: Gửi câu kinh văn sang `FastAPI` -> `Ollama GPU` để giải thích bối cảnh lịch sử và ý nghĩa thần học.
4. **Công cụ Tìm kiếm Toàn văn Trực tiếp (Live Full-Text Search)**:
   - Tìm kiếm từ khóa trên toàn bộ 31.081 câu qua PostgreSQL GIN index, hiển thị kết quả xem trước tức thời kèm trích dẫn.

---

## 2. Các API Backend Cần Bổ Sung (`services/api-ai`)

1. `GET /api/bible/chapter`:
   - Tham số: `book` (code hoặc osis), `chapter` (int)
   - Trả về: Thông tin sách, chương, tổng số câu, danh sách câu kinh văn kèm tiêu đề tiểu đoạn và tham chiếu chéo.
2. `POST /api/ai/explain-verse`:
   - Tham số: `{ verse_ref, verse_text, question? }`
   - Gọi Ollama Qwen model với System Prompt chuyên trách giải nghĩa bối cảnh kinh văn, không bịa đặt, tôn trọng chính văn.

---

## 3. Các Thành phần Frontend Cần Xây Dựng (`services/web`)

```text
services/web/src/
├── app/
│   ├── bible/
│   │   └── page.tsx              # Trang chính Bible Reader
│   ├── page.tsx                  # Cập nhật liên kết điều hướng sang /bible
├── components/
│   ├── bible/
│   │   ├── BookSelectorModal.tsx # Hộp thoại chọn 66 sách phân nhóm
│   │   ├── ChapterGrid.tsx       # Lưới chọn chương nhanh
│   │   ├── VerseActionDrawer.tsx # Bảng phân tích câu & Hỏi AI
│   │   └── BibleSearchBar.tsx    # Thanh tìm kiếm nhanh toàn văn
```

---

## 4. Kế hoạch Kiểm thử (Verification & Quality Gate)

- Kiểm thử API: `GET /api/bible/chapter?book=sa&chapter=1` trả về đúng 31 câu Sáng-thế Ký 1.
- Kiểm thử API: `POST /api/ai/explain-verse` trả về lời giải nghĩa bối cảnh từ Ollama GPU.
- Kiểm thử UI: Chuyển đổi giữa các sách, các chương mượt mà không lỗi rendering.
- Kiểm thử Responsive: Hoạt động hoàn hảo trên cả desktop và mobile.
