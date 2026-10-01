-- ==============================================================================
-- 02_init_schema.sql: Initialize BibleKnowledge Core Schema
-- Reference: docs/DATABASE.md
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BIBLE CORE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bible_translations (
    id VARCHAR(20) PRIMARY KEY, -- e.g., 'vi_1934', 'en_kjv', 'en_web'
    name VARCHAR(100) NOT NULL,
    language VARCHAR(10) NOT NULL,
    license_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bible_books (
    id SERIAL PRIMARY KEY,
    testament VARCHAR(2) NOT NULL CHECK (testament IN ('OT', 'NT')),
    book_order INT NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE, -- e.g., 'sa', 'xu', 'mat', 'kh'
    osis VARCHAR(10) NOT NULL UNIQUE, -- e.g., 'Gen', 'Exod', 'Matt', 'Rev'
    name_vi VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    total_chapters INT NOT NULL
);

CREATE TABLE IF NOT EXISTS bible_verses (
    id BIGSERIAL PRIMARY KEY,
    global_id INT UNIQUE,
    verse_code INT UNIQUE,
    translation_id VARCHAR(20) REFERENCES bible_translations(id) ON DELETE CASCADE,
    book_id INT REFERENCES bible_books(id) ON DELETE CASCADE,
    chapter INT NOT NULL,
    verse INT NOT NULL,
    section_title TEXT,
    text TEXT NOT NULL,
    cross_references JSONB DEFAULT '[]'::jsonb,
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', text)) STORED,
    CONSTRAINT uq_translation_book_chap_verse UNIQUE (translation_id, book_id, chapter, verse)
);

CREATE INDEX IF NOT EXISTS idx_bible_verses_lookup ON bible_verses(translation_id, book_id, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_bible_verses_global_id ON bible_verses(global_id);
CREATE INDEX IF NOT EXISTS idx_bible_verses_code ON bible_verses(verse_code);
CREATE INDEX IF NOT EXISTS idx_bible_verses_search ON bible_verses USING GIN(search_vector);

-- ------------------------------------------------------------------------------
-- 2. KNOWLEDGE ENTITIES & RELATIONSHIPS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    original_name VARCHAR(100),
    gender VARCHAR(10),
    title_or_role VARCHAR(150),
    summary TEXT,
    timeline_period VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    modern_name VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    approximate_date VARCHAR(100),
    date_type VARCHAR(20) CHECK (date_type IN ('exact', 'approximate', 'range', 'disputed', 'unknown')),
    period VARCHAR(100),
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS verse_entities (
    id BIGSERIAL PRIMARY KEY,
    verse_id BIGINT REFERENCES bible_verses(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('person', 'place', 'event', 'topic')),
    entity_id UUID NOT NULL,
    mention_type VARCHAR(30) DEFAULT 'direct'
);

CREATE INDEX IF NOT EXISTS idx_verse_entities_lookup ON verse_entities(entity_type, entity_id);

-- ------------------------------------------------------------------------------
-- 3. KNOWLEDGE GRAPH (Cytoscape Backend)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_type VARCHAR(30) NOT NULL,
    node_key VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(200) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    relation VARCHAR(50) NOT NULL,
    confidence VARCHAR(20) DEFAULT 'canonical',
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_edges_source ON knowledge_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON knowledge_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_relation ON knowledge_edges(relation);

-- ------------------------------------------------------------------------------
-- 4. RAG & VECTOR EMBEDDINGS (BGE-M3 1024 Dimensions)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_key VARCHAR(150) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    series TEXT,
    total_chapters INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chapter_index INT,
    chapter_title TEXT,
    section_heading TEXT,
    scripture_ref TEXT,
    content TEXT NOT NULL,
    char_length INT NOT NULL,
    embedding vector(1024),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_vector ON document_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_document_chunks_fts ON document_chunks 
USING GIN (to_tsvector('simple', content));

-- ------------------------------------------------------------------------------
-- 5. LEARNING (Quiz & Flashcards)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_type VARCHAR(30) NOT NULL,
    front_text TEXT NOT NULL,
    back_text TEXT NOT NULL,
    related_entity_type VARCHAR(30),
    related_entity_id UUID,
    difficulty_level INT DEFAULT 1,
    repetition_count INT DEFAULT 0,
    interval_days INT DEFAULT 1,
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_type VARCHAR(30) NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INT NOT NULL,
    explanation TEXT,
    scripture_reference VARCHAR(100),
    difficulty INT DEFAULT 1
);
