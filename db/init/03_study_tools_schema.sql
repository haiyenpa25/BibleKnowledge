-- ==============================================================================
-- 03_study_tools_schema.sql: Strong Lexicon, User Study Notes & Bookmarks
-- Reference: docs/DATABASE.md & ROADMAP1.md Sections 14, 37, 50
-- ==============================================================================

CREATE TABLE IF NOT EXISTS strong_lexicon (
    id VARCHAR(20) PRIMARY KEY, -- e.g., 'G26', 'H7225'
    strong_number VARCHAR(10) NOT NULL,
    language VARCHAR(10) NOT NULL CHECK (language IN ('greek', 'hebrew', 'aramaic')),
    lemma VARCHAR(100) NOT NULL,
    transliteration VARCHAR(100) NOT NULL,
    pronunciation VARCHAR(100),
    part_of_speech VARCHAR(50),
    definition TEXT NOT NULL,
    theological_significance TEXT,
    occurrences_count INT DEFAULT 0,
    key_verses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_strong_lemma ON strong_lexicon(lemma);
CREATE INDEX IF NOT EXISTS idx_strong_number ON strong_lexicon(strong_number);

CREATE TABLE IF NOT EXISTS user_study_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    scripture_ref VARCHAR(100),
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verse_code INT NOT NULL,
    reference VARCHAR(100) NOT NULL,
    note TEXT,
    color VARCHAR(20) DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
