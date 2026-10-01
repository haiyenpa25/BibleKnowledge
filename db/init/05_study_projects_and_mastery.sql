-- ============================================================================
-- 05_study_projects_and_mastery.sql: Study Projects Workspace & User Mastery
-- Reference: ROADMAP1.md Sections 5, 46, 50
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'theology',
    pinned_verses JSONB DEFAULT '[]'::jsonb,
    pinned_entities JSONB DEFAULT '[]'::jsonb,
    study_questions JSONB DEFAULT '[]'::jsonb,
    ai_outline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES study_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_learning_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_identifier VARCHAR(100) UNIQUE NOT NULL DEFAULT 'local_user',
    total_score INTEGER DEFAULT 0,
    daily_streak INTEGER DEFAULT 1,
    last_active_date DATE DEFAULT CURRENT_DATE,
    total_quizzes_completed INTEGER DEFAULT 0,
    total_flashcards_reviewed INTEGER DEFAULT 0,
    mastery_by_topic JSONB DEFAULT '{"Gospels": 65, "Pentateuch": 45, "Pauline": 70, "Wisdom": 50, "Prophecy": 40}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed default user profile
INSERT INTO user_learning_profiles (user_identifier, total_score, daily_streak, last_active_date, total_quizzes_completed, total_flashcards_reviewed, mastery_by_topic)
VALUES ('local_user', 350, 4, CURRENT_DATE, 6, 14, '{"Gospels": 75, "Pentateuch": 50, "Pauline": 80, "Wisdom": 60, "Prophecy": 45}'::jsonb)
ON CONFLICT (user_identifier) DO NOTHING;

-- Seed 2 sample study projects
INSERT INTO study_projects (id, title, description, category, pinned_verses, pinned_entities, study_questions, ai_outline)
VALUES 
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Cuộc Đời & Chức Vụ Sứ Đồ Phi-e-rơ',
    'Hành trình biến đổi từ ngư phủ bộc trực xứ Ga-li-lê thành trụ cột kiên định của Hội Thánh ban đầu sau sự phục hồi của Đấng Christ.',
    'person',
    '[{"reference": "Ma-thi-ơ 14:28-31", "text": "Phi-e-rơ ở trên thuyền bước xuống, đi bộ trên mặt nước mà đến cùng Đức Chúa Jêsus."}, {"reference": "Ma-thi-ơ 16:16", "text": "Si-môn Phi-e-rơ thưa rằng: Thầy là Đấng Christ, Con Đức Chúa Trời hằng sống."}, {"reference": "Giăng 21:15", "text": "Đức Chúa Jêsus phán cùng Si-môn Phi-e-rơ rằng: Hỡi Si-môn, con Giô-na, ngươi yêu ta hơn những kẻ này chăng?"}]'::jsonb,
    '[{"type": "person", "slug": "si-mon-phi-e-ro", "name": "Si-môn Phi-e-rơ"}, {"type": "person", "slug": "chua-gie-xu", "name": "Chúa Giê-xu"}, {"type": "place", "slug": "bien-ga-li-le", "name": "Biển Ga-li-lê"}, {"type": "event", "slug": "di-bo-tren-mat-bien", "name": "Đi bộ trên mặt biển"}]'::jsonb,
    '["Động cơ nào khiến Phi-e-rơ dám bước xuống biển trong Ma-thi-ơ 14?", "Sự chối Chúa 3 lần và sự phục hồi trong Giăng 21 bày tỏ bài học gì về ân điển?"]'::jsonb,
    '[{"section": "I. Sự Kêu Gọi Bên Bờ Biển Ga-li-lê", "content": "Rời bỏ lưới chài để theo Chúa Giê-xu trở nên tay đánh lưới người."}, {"section": "II. Lời Tuyên Xưng Đức Tin Tại Sê-sa-rê Phi-líp", "content": "Nhận biết Thần tính của Đấng Mê-si-a không bởi thịt và huyết mà bởi Cha trên trời."}, {"section": "III. Sự Vấp Ngã & Phục Hồi Thuộc Linh", "content": "Chối Chúa ba lần tại sân Thầy Tế Lễ và cuộc đối thoại phục hồi ba lần bên bờ hồ."}, {"section": "IV. Người Lãnh Đạo Hội Thánh Ban Đầu", "content": "Bài giảng Ngũ Tuần với 3,000 người tin đạo và mở cửa Tin Lành cho Dân Ngoại (Cọt-nây)."}]'::jsonb
),
(
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    'Giao Ước Máu: Từ Lễ Vượt Qua Đến Thập Tự Giá',
    'Khảo cứu tiến trình mạc khải cứu chuộc: từ chiên con Lễ Vượt Qua tại Ai Cập đến Chiên Con Đức Chúa Trời gánh tội lỗi thế gian.',
    'theology',
    '[{"reference": "Xuất Ê-díp-tô Ký 12:13", "text": "Huyết bôi trên nhà các ngươi ở sẽ dùng làm dấu hiệu; khi ta hành hại xứ Ê-díp-tô, thấy huyết đó, thì sẽ vượt qua."}, {"reference": "Giăng 1:29", "text": "Kìa, Chiên con của Đức Chúa Trời, là Đấng cất tội lỗi thế gian đi!"}, {"reference": "1 Cô-rinh-tô 5:7", "text": "Vì Đấng Christ là con chiên Lễ Vượt Qua của chúng ta, đã bị hy sinh rồi."}]'::jsonb,
    '[{"type": "event", "slug": "xuat-ai-cap-vuot-bien-do", "name": "Xuất Ai Cập & Vượt Biển Đỏ"}, {"type": "event", "slug": "su-dong-dinh-thap-tu-gia", "name": "Chúa Giê-xu Chịu Đóng Đinh"}]'::jsonb,
    '["Huyết chiên con bôi trên mày cửa tượng trưng cho điều gì trong thần học cứu rỗi?", "Làm thế nào thập tự giá của Đấng Christ làm trọn vẹn mọi của tế lễ Cựu Ước?"]'::jsonb,
    '[{"section": "I. Bối Cảnh Lễ Vượt Qua Ban Đầu (Xuất 12)", "content": "Sự phán xét các thần Ai Cập và sự phân rẽ tuyển dân qua huyết chiên con vô tì vết."}, {"section": "II. Lời Tiên Tri Về Người Đầy Tớ Chịu Khổ (Ê-sai 53)", "content": "Như chiên câm trước mặt kẻ hớt lông, Ngài mang lấy sự đau ốm và tội ác của chúng ta."}, {"section": "III. Sự Ứng Nghiệm Nơi Đấng Christ", "content": "Chúa Giê-xu chịu đóng đinh đúng vào giờ dâng chiên Lễ Vượt Qua, xé toang bức màn Đền Thờ."}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
