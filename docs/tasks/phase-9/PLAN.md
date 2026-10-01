# Phase 9 Implementation Plan — Advanced Study Projects & User Mastery Tracking

> **Nhiệm vụ**: Triển khai Module **Dự Án Nghiên Cứu Chuyên Đề (Study Projects Workspace)** và **Hệ Thống Theo Dõi Tiến Trình Năng Lực Học Tập (User Mastery & Streak System)** theo chuẩn `ROADMAP1.md` (Mục 5, 46, 50).
> **Nền tảng**: PostgreSQL 16 (`study_projects`, `project_notes`, `user_learning_profiles`), FastAPI AI Service, và Next.js 15 UI Workspace.

---

## 1. Mục tiêu Chi tiết (Detailed Objectives)

### 1.1 Cơ sở dữ liệu PostgreSQL (`db/init/05_study_projects_and_mastery.sql`)
1. **Bảng `study_projects`**:
   - `id` (UUID PK), `title`, `description`, `category` ('person', 'theology', 'book_study', 'passage', 'topic').
   - `pinned_verses` (JSONB): Danh sách các câu Kinh Thánh được ghim vào dự án kèm trích dẫn văn bản.
   - `pinned_entities` (JSONB): Các nhân vật, địa danh, biến cố liên kết.
   - `study_questions` (JSONB): Bộ câu hỏi nghiên cứu trọng tâm.
   - `ai_outline` (JSONB): Dàn ý phân tích thần học do Ollama Qwen tạo lập.
   - `created_at`, `updated_at`.
2. **Bảng `project_notes`**:
   - Ghi chú phân nhánh gắn trực tiếp theo từng dự án nghiên cứu.
3. **Bảng `user_learning_profiles`**:
   - `total_score` (Điểm tích lũy kiến thức).
   - `daily_streak` (Chuỗi ngày học liên tục).
   - `last_active_date` (Ngày hoạt động gần nhất).
   - `total_quizzes_completed`, `total_flashcards_reviewed`.
   - `mastery_by_topic` (JSONB: tỉ lệ % thành thạo theo từng chủ đề: Ngũ Kinh, Phúc Âm, Sứ đồ, Lịch sử, Thơ ca).

### 1.2 Backend Endpoints
- **Quản lý Dự án Nghiên cứu (`/api/study/projects`)**:
  - `GET /api/study/projects`: Danh sách các dự án.
  - `POST /api/study/projects`: Tạo dự án mới (hỗ trợ nhập chủ đề / nhân vật / phân đoạn).
  - `GET /api/study/projects/{id}`: Xem chi tiết dự án.
  - `PUT /api/study/projects/{id}`: Cập nhật câu ghim, thực thể, ghi chú.
  - `DELETE /api/study/projects/{id}`: Xóa dự án.
  - `POST /api/study/projects/{id}/generate-outline`: Dùng Ollama tạo dàn ý nghiên cứu (Study Outline) & câu hỏi khai phóng.
  - `POST /api/study/projects/{id}/export-flashcards`: Chuyển đổi các bài học trong dự án thành Flashcards SM-2 để học ngắt quãng.
- **Tiến trình & Hồ sơ Học tập (`/api/learn/profile`)**:
  - `GET /api/learn/profile`: Thống kê tổng điểm, chuỗi ngày, cấp độ môn đồ, và độ thành thạo các chủ đề.
  - `POST /api/learn/quiz/submit`: Ghi nhận kết quả làm quiz, cộng điểm thưởng, cập nhật chuỗi streak và cập nhật mastery.

### 1.3 Giao diện Người dùng (Frontend)
- **Khu Vực Học Tập `/learn`**:
  - Thanh trạng thái Học tập Cấp độ (User Mastery Level, Streak Badge 🔥, Điểm kinh nghiệm XP, Tiến độ thành thạo các chủ đề).
  - Tích hợp ghi nhận điểm số khi người dùng trả lời quiz hoặc lật flashcard.
- **Không Gian Dự Án `/study`**:
  - Tab 4: **"Dự Án Nghiên Cứu"**:
    - Danh sách các dự án đang tiến hành (VD: *Cuộc đời Sứ đồ Phi-e-rơ, Sự Xưng Công Bình Bởi Đức Tin, Mầu nhiệm Lễ Vượt Qua*).
    - Modal/Drawer không gian làm việc chi tiết:
      - Ghim câu Kinh Thánh, thực thể liên quan.
      - Dàn ý nghiên cứu do AI tạo.
      - Ghi chú dự án.
      - Nút 1-click: *Xuất thành Flashcards học tập*.
