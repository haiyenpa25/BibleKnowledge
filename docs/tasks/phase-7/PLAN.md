# Phase 7 Implementation Plan — Deep Interconnected Bible Reader & Word Study Engine

> **Nhiệm vụ**: Nâng cấp toàn diện **Bible Reader** theo chuẩn `ROADMAP1.md` (Mục 2.1, 7, 8, 9, 10, 13, 14) kết nối đa chiều với:
> 1. Thực thể Kinh Thánh (**People, Places, Events, Topics**).
> 2. Từ điển Ngữ căn Hy-lạp / Hê-bơ-rơ (**Strong's Lexicon & Word Study**).
> 3. Hệ thống Ghi chú Nghiên cứu cá nhân (**User Study Notes**) & Đánh dấu (**Bookmarks**) lưu trữ trực tiếp vào PostgreSQL.
> 4. Chế độ Phân tích Thần học & Bối cảnh Đoạn văn (**Passage Exegesis**) ngay trên từng câu đọc.

---

## 1. Mục tiêu Chi tiết (Detailed Objectives)

### 1.1 Backend: Entity & Lexicon Matching Engine (`services/api-ai/app/routers/bible.py`)
- Endpoint `GET /api/bible/verse-details`:
  - Nhận `verse_code` hoặc `ref` (sách + chương + câu).
  - Tự động quét và liên kết:
    - **Nhân vật (People)** liên quan (Chúa Giê-xu, Phi-e-rơ, Phao-lô, Đa-vít, Môi-se, v.v.).
    - **Địa danh (Places)** liên quan (Biển Ga-li-lê, Giê-ru-sa-lem, Bết-lê-hem, v.v.) kèm tọa độ và liên kết bản đồ.
    - **Biến cố / Sự kiện (Events)** liên quan (Đi bộ trên biển, Sáng tạo, Giáng sinh, v.v.).
    - **Từ nguyên Strong's Lexicon** tương thích (Hy-lạp cho Tân Ước, Hê-bơ-rơ cho Cựu Ước) dựa trên từ khóa cốt lõi của câu.
    - **Ghi chú cá nhân (Study Notes)** và **Bookmark** đã lưu trong database.
    - **Tham chiếu chéo (Cross references)** với nội dung trích xuất tự động.

### 1.2 Seed dữ liệu liên kết Thực thể - Câu Kinh Thánh (`verse_entities`)
- Gắn nhãn các phân đoạn then chốt:
  - Sáng-thế Ký 1:1-31 $\rightarrow$ Sự Sáng Tạo, Môi-se, H7225 (Bereshit), H1254 (Bara), H430 (Elohim), H7307 (Ruach).
  - Sáng-thế Ký 12:1-7 $\rightarrow$ Áp-ra-ham, Giao ước Áp-ra-ham, Ha-ran, Ca-na-an.
  - Xuất Ê-díp-tô Ký 14 $\rightarrow$ Môi-se, Xuất Ai Cập & Biển Đỏ, Ai Cập, Biển Đỏ.
  - Ma-thi-ơ 14:22-33 $\rightarrow$ Chúa Giê-xu, Phi-e-rơ, Đi bộ trên mặt biển, Biển Ga-li-lê, G4102 (Pistis / Đức tin).
  - Giăng 1:1-14 $\rightarrow$ Chúa Giê-xu, G3056 (Logos / Lời - Đạo), G5485 (Charis / Ân điển).
  - Giăng 3:16-17 $\rightarrow$ Chúa Giê-xu, G26 (Agape / Tình yêu thương), G4102 (Pistis).
  - Công vụ 2:1-4 $\rightarrow$ Lễ Ngũ Tuần, Giê-ru-sa-lem, G4151 (Pneuma / Thánh Linh), G2842 (Koinonia).
  - Công vụ 9:1-19 $\rightarrow$ Sứ đồ Phao-lô (Sau-lơ), Sự Biến Cải, Đa-mách.

### 1.3 Nâng cấp Giao diện Đọc Kinh Thánh (`services/web/src/app/bible/page.tsx`)
- **Action Panel Đa Năng**:
  - Tab 1: **Tổng quan & AI Giải Thích** (Ollama Qwen).
  - Tab 2: **Từ Điển Ngữ Căn Strong's Lexicon** (Xem Lemma, phiên âm, định nghĩa, ý nghĩa thần học ngay tại câu).
  - Tab 3: **Mạng Lưới Thực Thể (Connect Layer)**: Click trực tiếp vào Person $\rightarrow$ xem tiểu sử; Place $\rightarrow$ xem trên bản đồ; Event $\rightarrow$ xem trên Timeline.
  - Tab 4: **Ghi Chú & Đánh Dấu Cá Nhân**: Tạo / xem ghi chú lưu vào PostgreSQL, đổi màu highlight câu.
  - Nút **"Nghiên Cứu Chuyên Sâu"** chuyển tiếp mượt mà sang `/study?ref=...` với cấu trúc đoạn văn, bài tập suy ngẫm và câu hỏi thực hành.
