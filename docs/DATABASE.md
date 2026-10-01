# Database Architecture & Schema Specification — BibleKnowledge

> **Hệ quản trị CSDL chính**: PostgreSQL 16 + Extension `pgvector`  
> **Căn cứ thiết kế**: `ROADMAP1.md` (Mục 11, 28, 35, 36)

---

## 1. Danh sách Bảng & Nhóm Thực thể

```text
PostgreSQL Schema
├── 1. Bible Core
│   ├── bible_translations
│   ├── bible_books
│   ├── bible_chapters
│   └── bible_verses
│
├── 2. Knowledge Entities
│   ├── people
│   ├── places
│   ├── events
│   ├── topics
│   └── Junctions (verse_people, verse_places, verse_events, verse_topics, event_people, event_places)
│
├── 3. Graph Model (Cytoscape-ready)
│   ├── knowledge_nodes
│   └── knowledge_edges
│
├── 4. RAG & Vector Embeddings
│   ├── documents
│   └── document_chunks (embedding vector(1024))
│
└── 5. Learning & Interaction
    ├── quiz_questions
    ├── flashcards (Spaced Repetition SM-2/FSRS)
    └── user_study_notes
```

---

## 2. Chi tiết Lược đồ CSDL (Detailed DDL Schema)

### 2.1 Nhóm Bible Core

```sql
-- Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Các bản dịch Kinh Thánh (BTT, KJV, WEB...)
CREATE TABLE bible_translations (
    id VARCHAR(20) PRIMARY KEY, -- e.g., 'vi_btt', 'en_kjv', 'en_web'
    name VARCHAR(100) NOT NULL,
    language VARCHAR(10) NOT NULL,
    license_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 66 Sách Kinh Thánh
CREATE TABLE bible_books (
    id SERIAL PRIMARY KEY,
    testament VARCHAR(2) NOT NULL CHECK (testament IN ('OT', 'NT')),
    book_order INT NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE, -- e.g., 'GEN', 'EXO', 'MAT', 'REV'
    name_vi VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    total_chapters INT NOT NULL
);

-- 3. Từng câu Kinh Thánh
CREATE TABLE bible_verses (
    id BIGSERIAL PRIMARY KEY,
    translation_id VARCHAR(20) REFERENCES bible_translations(id) ON DELETE CASCADE,
    book_id INT REFERENCES bible_books(id) ON DELETE CASCADE,
    chapter INT NOT NULL,
    verse INT NOT NULL,
    text TEXT NOT NULL,
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', text)) STORED,
    CONSTRAINT uq_translation_book_chap_verse UNIQUE (translation_id, book_id, chapter, verse)
);

CREATE INDEX idx_bible_verses_lookup ON bible_verses(translation_id, book_id, chapter, verse);
CREATE INDEX idx_bible_verses_search ON bible_verses USING GIN(search_vector);
```

---

### 2.2 Nhóm Entities & Relationships

```sql
-- 1. Nhân vật (People)
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    original_name VARCHAR(100), -- Tên tiếng Do Thái / Hy Lạp
    gender VARCHAR(10),
    title_or_role VARCHAR(150),
    summary TEXT,
    timeline_period VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Địa danh (Places)
CREATE TABLE places (
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

-- 3. Sự kiện (Events)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    approximate_date VARCHAR(100),
    date_type VARCHAR(20) CHECK (date_type IN ('exact', 'approximate', 'range', 'disputed', 'unknown')),
    period VARCHAR(100),
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Chủ đề (Topics)
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description TEXT
);

-- 5. Bảng liên kết câu Kinh Thánh với thực thể (Verse Junctions)
CREATE TABLE verse_entities (
    id BIGSERIAL PRIMARY KEY,
    verse_id BIGINT REFERENCES bible_verses(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('person', 'place', 'event', 'topic')),
    entity_id UUID NOT NULL,
    mention_type VARCHAR(30) DEFAULT 'direct' -- 'direct', 'allusion', 'prophetic'
);

CREATE INDEX idx_verse_entities_lookup ON verse_entities(entity_type, entity_id);
```

---

### 2.3 Nhóm Knowledge Graph (Cytoscape.js Backend)

```sql
-- Đỉnh đồ thị tri thức
CREATE TABLE knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_type VARCHAR(30) NOT NULL, -- 'Person', 'Place', 'Event', 'Topic', 'Book', 'Verse'
    node_key VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(200) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cạnh đồ thị tri thức
CREATE TABLE knowledge_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    relation VARCHAR(50) NOT NULL, -- 'PARTICIPATED_IN', 'OCCURRED_AT', 'FATHER_OF', 'CROSS_REFERENCE'
    confidence VARCHAR(20) DEFAULT 'canonical', -- 'canonical', 'scholarly', 'traditional', 'ai_suggested'
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_edges_source ON knowledge_edges(source_node_id);
CREATE INDEX idx_edges_target ON knowledge_edges(target_node_id);
CREATE INDEX idx_edges_relation ON knowledge_edges(relation);
```

---

### 2.4 Nhóm RAG & Vector Embeddings (BGE-M3 1024 chiều)

```sql
-- 1. Danh mục tài liệu / sách chú giải (275 sách)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_key VARCHAR(150) UNIQUE NOT NULL, -- e.g. '244_wiersbe_be_heroic'
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150),
    series VARCHAR(150),
    total_chapters INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Chunks phục vụ tìm kiếm ngữ nghĩa (pgvector)
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chapter_index INT,
    chapter_title VARCHAR(255),
    section_heading VARCHAR(255),
    scripture_ref VARCHAR(100),
    content TEXT NOT NULL,
    char_length INT NOT NULL,
    embedding vector(1024), -- BGE-M3 embedding dimension
    metadata JSONB DEFAULT '{}'::jsonb
);

-- HNSW Vector Index cho tìm kiếm cosine cực nhanh
CREATE INDEX idx_document_chunks_vector ON document_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Full-text index cho tìm kiếm từ khóa kết hợp (Hybrid Search)
CREATE INDEX idx_document_chunks_fts ON document_chunks 
USING GIN (to_tsvector('simple', content));
```

---

### 2.5 Nhóm Learning (Quiz & Flashcards)

```sql
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_type VARCHAR(30) NOT NULL, -- 'person', 'verse', 'event', 'word'
    front_text TEXT NOT NULL,
    back_text TEXT NOT NULL,
    related_entity_type VARCHAR(30),
    related_entity_id UUID,
    difficulty_level INT DEFAULT 1,
    repetition_count INT DEFAULT 0,
    interval_days INT DEFAULT 1,
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_type VARCHAR(30) NOT NULL, -- 'multiple_choice', 'who_am_i', 'timeline_order'
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"]
    correct_option INT NOT NULL,
    explanation TEXT,
    scripture_reference VARCHAR(100),
    difficulty INT DEFAULT 1
);
```
