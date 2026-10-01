# BibleKnowledge REST API Specification

> **Base URL**: `http://localhost:8000` (Direct FastAPI Backend) / `http://localhost:3000` (Web UI Next.js Gateway)  
> **API Version**: `v1`  
> **Data Format**: JSON (`Content-Type: application/json; charset=utf-8`)  
> **Architecture**: FastAPI, PostgreSQL 16 + pgvector, Ollama Local LLM

---

## 1. Overview & Conventions

All endpoints follow standard RESTful conventions and return UTF-8 JSON.
- **Success Responses**: Return HTTP 200 OK with typed JSON payload.
- **Validation Errors**: Return HTTP 422 Unprocessable Entity with error field breakdown.
- **Not Found**: Return HTTP 404 with `{"detail": "..."}`.
- **Internal Server Errors**: Return HTTP 500 with descriptive error messages.

---

## 2. Bible Text & Search Engine (`/api/bible`)

### 2.1 Get All Books
- **Endpoint**: `GET /api/bible/books`
- **Description**: Returns all 66 canonical books of the Bible (39 Old Testament, 27 New Testament) with Vietnamese names, codes, testaments, chapter counts, and metadata.
- **Response**: Array of `BookSummary`:
  ```json
  [
    {
      "code": "gen",
      "name": "Sáng-thế Ký",
      "testament": "OT",
      "chapters": 50,
      "book_group": "Ngũ Kinh Môi-se"
    }
  ]
  ```

### 2.2 Get Book Details
- **Endpoint**: `GET /api/bible/books/{code}`
- **Parameters**: `code` (e.g. `mat`, `gen`, `rom`)
- **Response**: Book metadata and chapter list.

### 2.3 Get Chapter Verses
- **Endpoint**: `GET /api/bible/books/{code}/chapters/{chapter}`
- **Parameters**: `code` (string), `chapter` (integer)
- **Response**:
  ```json
  {
    "book_code": "mat",
    "book_name": "Ma-thi-ơ",
    "chapter": 14,
    "verses": [
      {
        "verse": 22,
        "text": "Kế đó, Ngài liền hối môn đồ xuống thuyền, qua trước bờ bên kia...",
        "section_title": "Chúa Giê-xu đi bộ trên mặt biển",
        "cross_references": ["Mác 6:45-52", "Giăng 6:16-21"]
      }
    ]
  }
  ```

### 2.4 Full-Text Bible Search
- **Endpoint**: `GET /api/bible/search?q={query}&testament={OT|NT}&limit={limit}&offset={offset}`
- **Description**: Accent-insensitive full-text search across all 31,081 canonical Vietnamese 1925 verses.
- **Parameters**:
  - `q`: Search keyword or phrase.
  - `testament`: Optional filter (`OT` or `NT`).
  - `limit`: Number of results (default 50, max 200).
  - `offset`: Pagination offset.

### 2.5 Dynamic Passage Range Retrieval
- **Endpoint**: `GET /api/bible/passage?ref={reference}`
- **Description**: Parses freeform Vietnamese or code reference strings (e.g., `Ma-thi-ơ 14:22-33`, `Giăng 3:16`, `Gen 1:1-5`) and returns exact ordered verses.

---

## 3. Theological RAG & AI Exegesis Engine (`/api/rag`)

### 3.1 Grounded Q&A with Scholarly Citations
- **Endpoint**: `POST /api/rag/ask`
- **Request Body**:
  ```json
  {
    "question": "Ân điển và đức tin liên hệ như thế nào trong sự cứu rỗi?",
    "top_k": 5
  }
  ```
- **Response**: Synthesized theological answer, Scripture citations, and scholarly excerpts from 275 reference books.

### 3.2 Deep Autonomous Research Agent
- **Endpoint**: `POST /api/rag/agent-research`
- **Request Body**:
  ```json
  {
    "query": "So sánh sự xưng công bình giữa Phao-lô và Gia-cơ",
    "depth": "deep"
  }
  ```
- **Response**: Executive summary, 4-dimension comparative matrix, Scripture foundations, Greek/Hebrew lexicon roots, related knowledge graph entities, and academic citations.

### 3.3 Multi-Dimensional Context Study (§15)
- **Presets**: `GET /api/rag/context-presets`
  - Returns pre-configured historical contexts (e.g., Bài Giảng Trên Núi, Thư Rô-ma, Lễ Vượt Qua).
- **Analysis**: `POST /api/rag/context-study`
  - Request: `{"subject_or_passage": "Bài Giảng Trên Núi"}`
  - Response: 6 contextual dimensions (Historical, Cultural, Political, Religious, Geographical, Literary), key Scriptures, and hermeneutical principles.

### 3.4 11-Dimension Passage Exegesis Engine (§13)
- **Presets**: `GET /api/rag/passage-presets`
  - Returns 6 curated theological passages (`mat-14`, `jhn-3`, `rom-8`, `gen-22`, `eph-2`, `psa-23`).
- **Passage Analysis**: `POST /api/rag/passage-study`
  - **Request Body**:
    ```json
    {
      "reference": "Ma-thi-ơ 14:22-33"
    }
    ```
  - **Response Structure**:
    - `reference`: Canonical reference string.
    - `book_name`: Vietnamese book name.
    - `chapter_range`: Chapters covered.
    - `total_verses`: Number of verses.
    - `verses`: Array of `{verse, text, section_title, cross_references}` fetched directly from DB.
    - `historical_context`: Historical and cultural setting.
    - `literary_genre`: Literary genre classification.
    - `author_and_date`: Authorship and canonical dating.
    - `people`: Key historical figures in passage.
    - `locations`: Geographic setting.
    - `events`: Central theological events.
    - `structure_outline`: Array of Roman numeral outline points `{section_title, verse_range, summary, key_truth}`.
    - `keywords`: Strong's Greek/Hebrew lemmas `{word, strong_number, original_lemma, meaning}`.
    - `cross_references`: Intertextual Scripture links.
    - `theological_themes`: Core biblical doctrines.
    - `reflection_questions`: Pastoral and devotional questions.
    - `scholarly_commentary_citations`: Citations from 275 volumes.
    - `hermeneutical_takeaway`: Summary application for modern faith.

### 3.5 Strong's Greek & Hebrew Lexicon
- **Endpoint**: `GET /api/rag/lexicon/search?q={query}`
- **Parameters**: `q` (Strong's ID like `G0026`, `H0430`, or transliteration `agape`, `elohim`).
- **Response**: Original lemma, pronunciation, definition, grammar parsing, and biblical occurrences.

### 3.6 Character Theological Study
- **Endpoint**: `GET /api/rag/character-study/{slug}`
- **Parameters**: `slug` (e.g. `abraham`, `david`, `peter`, `paul`).
- **Response**: Biography, timeline, typology, theological significance, key verses, and lessons.

---

## 4. Theological Knowledge Graph (`/api/graph`)

### 4.1 Knowledge Graph Network Data
- **Endpoint**: `GET /api/graph/data`
- **Description**: Returns Cytoscape.js compatible nodes and edges representing people, locations, covenants, and theological concepts.
- **Node Types**: `person`, `location`, `covenant`, `theme`.
- **Edge Types**: `COVENANT_WITH`, `FULFILLED_IN`, `TRAVELED_TO`, `TYPOLOGY_OF`, `WROTE_TO`.

### 4.2 Entities Directory
- **Endpoint**: `GET /api/graph/entities`
- **Description**: Returns all indexed entities with descriptions, Scripture references, and relationship counts.

---

## 5. Learning & Memorization Engine (`/api/learn`)

### 5.1 Multiple-Choice Theology Quiz
- **Endpoint**: `GET /api/learn/quiz?category={category}&level={level}`
- **Description**: Returns 30 verified multiple-choice theological questions with Scripture references and detailed explanations.

### 5.2 Spaced Repetition Flashcards (SM-2 Algorithm)
- **Endpoint**: `GET /api/learn/flashcards`
- **Description**: Returns 11 active flashcards with Anki export and CSV export capability.

### 5.3 Thematic Learning Challenges (§46)
- **Endpoint**: `GET /api/learn/challenges`
- **Description**: Returns 5 specialized curriculum packs:
  1. *Ngũ Kinh & Nền Tảng Giao Ước*
  2. *Lịch Sử & Vương Quốc Y-sơ-ra-ên*
  3. *Thi Ca & Văn Chương Khôn Ngoan*
  4. *Bốn Sách Tin Lành & Chức Vụ Đấng Christ*
  5. *Thư Tín & Giáo Lý Hội Thánh*

### 5.4 Systematic Bible Reading Plans (§3, §46, §53)
- **Endpoint**: `GET /api/learn/reading-plans`
- **Description**: Returns 5 structured reading plans:
  1. *Toàn Bộ Kinh Thánh Trong 365 Ngày* (Cựu Ước, Tân Ước, Thi Thiên, Châm Ngôn mỗi ngày).
  2. *Tân Ước Trong 90 Ngày* (Tập trung toàn bộ 260 chương Tân Ước).
  3. *Cuộc Đời Đấng Christ Trong 30 Ngày* (Hài hòa 4 sách Tin Lành).
  4. *Thi Thiên & Châm Ngôn Trong 60 Ngày* (Dưỡng linh và suy ngẫm).
  5. *Lịch Sử Cứu Chuộc Theo Thứ Tự Thời Gian (Chronological)*.

### 5.5 Scripture Memorization Assistant with Word Occlusion (§3, §4)
- **Endpoint**: `GET /api/learn/memorize-verses`
- **Description**: Returns 12 core memory verses across 4 mastery levels:
  - Level 1: Nhập Môn & Sự Cứu Rỗi (`Giăng 3:16`, `Rô-ma 10:9`, `Ê-phê-sô 2:8-9`).
  - Level 2: Đời Sống Môn Đồ & Đức Tin (`Ga-la-ti 2:20`, `Hê-bơ-rơ 11:1`, `Châm-ngôn 3:5-6`).
  - Level 3: Chiến Đấu Thuộc Linh & Bình An (`Phi-líp 4:6-7`, `I Cô-rinh-tô 10:13`, `Thi-thiên 23:1-3`).
  - Level 4: Trưởng Thành & Sứ Mạng (`II Ti-mô-thê 3:16-17`, `Ma-thi-ơ 28:19-20`, `Công-vụ 1:8`).
- **Interactive Features**: Word occlusion masking (25%, 50%, 75%, 100%), real-time accuracy scoring, and Vietnamese Text-to-Speech audio support.

---

## 6. Scholarly Exegesis & Synthesis Engine (`/api/study`)

### 6.1 Gospel Harmony & Parallel Accounts
- **Endpoint**: `GET /api/study/harmony`
- **Description**: 16 major events across 54 parallel Gospel and OT/NT accounts.

### 6.2 Typology & Messianic Prophecy Fulfillment Matrix (§18, §45)
- **Endpoint**: `GET /api/study/prophecies`
- **Description**: 14 prophecies mapping Old Testament predictions to New Testament fulfillments, along with theological typology notes.

### 6.3 Interactive Biblical Cartography & Journeys (§9)
- **Endpoint**: `GET /api/study/journeys`
- **Description**: 9 interactive geospatial journeys (Abraham, Exodus, David, Elijah, Jesus' Ministry, Paul's 1st-4th journeys).

### 6.4 Exegetical Sermon Outline Templates (§50)
- **Endpoint**: `GET /api/study/sermon-templates`
- **Description**: 4 homiletical and hermeneutical sermon templates with introduction, main points, applications, and illustrations.

### 6.5 Export Research Notebook Bundle (§48, §50)
- **Endpoint**: `POST /api/study/export-bundle`
- **Description**: Packages research findings, passage analyses, and outlines into downloadable Markdown (`.md`) or study dossier.

### 6.6 Scholarly Commentary Catalog & Multi-Volume Series
- **Endpoint**: `GET /api/study/authors` & `GET /api/study/multivolume`
- **Description**: Indexes 171 classic theological commentators and 10 premier multi-volume commentary series.

### 6.7 Citation Formatter
- **Endpoint**: `GET /api/study/citation-formats?source_id={id}&format={sbl|chicago|apa|mla|bibtex}`
- **Description**: Formats citations according to 5 academic publication standards.

---

## 7. Theological Library & Document Engine (`/api/library`)

### 7.1 Library Overview & Statistics
- **Endpoint**: `GET /api/library/stats`
- **Description**: Returns global statistics across 275 volumes: 135 commentaries, 42 dictionaries/encyclopedias, 17 surveys, 81 monographs, total chapters, indexed chunks, and series counts.

### 7.2 Theological Catalog & Filtering
- **Endpoint**: `GET /api/library/catalog?category={category}&series={series}&search={query}&limit={limit}&offset={offset}`
- **Description**: Paginated catalog of all 275 theological works with filtering by category, multi-volume series, and text search.

### 7.3 Book Details & Table of Contents
- **Endpoint**: `GET /api/library/books/{book_index}`
- **Description**: Returns volume metadata, author, classification, and list of all chapters with section counts and previews.

### 7.4 Chapter Reader & Exegesis Content
- **Endpoint**: `GET /api/library/books/{book_index}/chapters/{chapter_index}`
- **Description**: Retrieves full chapter text, section headings, paragraphs, and detected Scripture references.

### 7.5 User Notes & Highlighting
- **Endpoints**:
  - `GET /api/library/notes`: List user research notes and annotations.
  - `POST /api/library/notes`: Create new study note with target book, chapter, and tags.
  - `DELETE /api/library/notes/{note_id}`: Remove note.

### 7.6 Series & Author Indexes
- **Endpoints**:
  - `GET /api/library/authors`: List 171 classic theological commentators.
  - `GET /api/library/series-catalog`: List 10 premier multi-volume commentary series (TOTC, TNTC, Wiersbe, IVP...).

---

## 8. Performance & Resource Constraints

- **Maximum Allowed Non-Ollama Application Container RAM**: 2048 MiB (2.0 GB).
- **Current Audited Usage**: ~961.6 MiB / 2048 MiB (46.9% headroom).
- **Ollama LLM GPU Reservation**: Up to 8 GB VRAM on NVIDIA RTX 5050 Laptop GPU.

