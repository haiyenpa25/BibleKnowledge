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

### 2.6 Inline Passage Exegesis Integration (Reader Drawer)
- **Component**: `/bible` reader bottom drawer (`exegesis` tab)
- **Integration**: Directly invokes `POST /api/rag/passage-study` with the currently selected chapter/passage range, delivering 11-dimension exegesis (Roman numeral outlines, historical context, Strong keywords, commentary citations, and reflection questions) without navigating away from the reader.
- **Offline Resilience**: Bookmarks and user notes are backed by local cache (`localStorage`) hydration with graceful fallback when working offline.

### 2.7 Daily Insight & Audio Devotional Meditation Feed (§53)
- **Endpoint**: `GET /api/bible/daily-insight`
- **Description**: Returns daily spiritual nourishment for the home dashboard:
  - `verse_of_the_day`: Curated canonical golden verse with Vietnamese text, reference, and chapter/verse codes.
  - `devotional_meditation`: Daily exegetical devotional including theological theme, title, spiritual reflection paragraph, and personalized daily prayer.
  - `person_of_the_day`: Biographical overview and key verse of a prominent biblical figure.
  - `event_of_the_day`: Landmark historical event from the redemptive timeline.
  - `daily_quiz`: Spaced practice question with immediate explanation and Scripture reference.
  - `featured_sermon`, `featured_challenge_pack`, `featured_journey`: Recommended daily learning pathways.
  - `metrics`: Real-time system statistics (verses, chunks, flashcards, notes, nodes).

### 2.8 Interactive Cross-Reference Network Visualizer & Redemptive History Chains (§18)
- **Endpoint**: `GET /api/bible/cross-references/network?reference={reference}&chain_id={chain_id}`
- **Description**: Generates an interactive graph of canonical cross-references and redemptive-historical trajectories for any verse:
  - **Node Architecture**: Central root node, Old Testament nodes, New Testament nodes, Gospel harmony parallels, and thematic chain steps.
  - **Edge Classification**: Directed connections typed as `quotation` (OT quotation in NT), `allusion`, `parallel` (synoptic parallels), `explicit` (direct cross-reference), or `theological_connection`.
  - **Redemptive History Chains**: 8 foundational biblico-theological trajectories (Paschal Lamb, Justification by Faith, Good Shepherd, Suffering Servant, New Covenant, Salvation by Grace, Davidic King, Melchizedek Priesthood) tracing typology from OT shadows through Gospel fulfillment to New Jerusalem consummation.
  - **Response Payload**: Contains `root`, `nodes`, `edges`, `matched_chain`, `all_chains`, and `stats` (OT/NT connection counts, parallel counts, chain steps).

### 2.9 Multi-Translation Bible Alignment & Comparison Viewer (§2.1, Horizon Item)
- **Endpoints**:
  - `GET /api/bible/translations`: Lists all benchmark canonical translations registered in the system (Vietnamese 1925 / BTT, King James Version / KJV 1611, World English Bible / WEB, American Standard Version / ASV 1901) with language, year, license status, and text-critical basis.
  - `GET /api/bible/parallel-chapter?book={book}&chapter={chapter}&target_translation={kjv|web|asv}`: Returns dual-column parallel verses comparing Vietnamese 1925 with a chosen benchmark English translation, with Strong's Lexicon mappings for interlinear alignment.
  - `GET /api/bible/compare-verse?book={book}&chapter={chapter}&verse={verse}&translations={trans_list}`: Renders a single verse across all 4 translations simultaneously, displaying word count, character length, translation metadata, and original language (Hebrew / Greek) root words for high-fidelity comparative exegesis.

### 2.10 Advanced Semantic Audio Search & Daily Devotional Catalogue (§53)
- **Endpoints**:
  - `GET /api/bible/devotionals?theme={theme}&tag={tag}&limit={limit}&offset={offset}`: Lists all 16 canonical theological devotionals with themes, golden verses, reflections, pastoral prayers, theological tradition tags, and audio durations.
  - `GET /api/bible/devotionals/search?q={query}&theme={theme}`: Accent-insensitive and case-insensitive full-text search across devotionals, scriptures, reflections, prayers, and theological tags.
  - `GET /api/bible/devotionals/{id}`: Returns single devotional detail with previous/next devotional navigation cues.
### 2.11 Interactive Hebrew & Greek Interlinear Word-by-Word Reader & Exegetical Parser (§2.1, §49)
- **Endpoint**: `GET /api/bible/verse-interlinear?ref={ref}&verse_code={verse_code}&book={book}&chapter={chapter}&verse={verse}`
- **Description**: Returns word-by-word tokenized interlinear original language data (Biblical Hebrew for Old Testament, Koine Greek for New Testament) across all 31,081 canonical verses with algorithmic fallback:
  - **Reading Direction**: RTL (Right-to-Left) for Biblical Hebrew, LTR (Left-to-Right) for Koine Greek.
  - **Token Structure**:
    - `position`: Sequential token index (1, 2, ...).
    - `original_text`: Original script in Biblical Hebrew or Greek.
    - `transliteration`: Phonetic romanization.
    - `lemma`: Root lexical form.
    - `strong_number`: Strong's Concordance identifier (`Hxxxx` or `Gxxxx`).
    - `morphology_code`: Standard morphological tag (e.g., `Prep-b | N-fs`, `PREP`, `V-AAI-3S`).
    - `morphology_expanded`: Detailed Vietnamese grammatical breakdown.
    - `part_of_speech`: Grammatical part of speech.
    - `vietnamese_gloss`: Exact word-for-word Vietnamese translation.
    - `english_gloss`: Exact word-for-word English translation.
    - `lexicon_definition`: Concise definition from Strong's Lexicon.
    - `pronunciation_audio`: Phonetic pronunciation text for Web Speech API synthesis (`el-GR` or `he-IL`).
  - **Syntactic Structure & Clause Grammar**: Hierarchical breakdown of clauses (Subject, Predicate, Direct Object, Prepositional Phrase) with theological and syntactic functions.
  - **Theological Exegetical Insight**: In-depth analysis of original language nuances and theological significance.
  - **Ancient Codex Manuscripts (Textual Criticism)**: Parallel textual witness evidence from early uncials and codices (Codex Sinaiticus `א`, Codex Vaticanus `B`, Codex Alexandrinus `A`, Leningrad Codex `B19A`, Aleppo Codex).
- **Frontend Integration**:
  - `/bible`: Dedicated "Nguyên Ngữ Liên Dòng (§2.1, §49)" tab in Verse Drawer and in-line exegesis trigger in Interlinear Chapter View.
  - `/research`: Interactive Word-by-Word Interlinear Exegesis Parser sub-mode under Lexicon Explorer with 8 foundational theological presets and custom search across all 31,081 verses.

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

### 3.7 Original Language Morphological Parser & Concordance (§37, §49)
- **Endpoint**: `GET /api/rag/morphology?code={strong_code}` (Aliased: `GET /api/bible/morphology`)
- **Parameters**: `code` (e.g., `G4102` for Greek *Pistis*, `H7965` for Hebrew *Shalom*, `G0026` for *Agape*, `H2451` for *Chokmah*, `H1984` for *Halal*).
- **Description**: Returns seminary-grade grammatical parsing (declensions, gender, stems, case inflections for Greek; Binyanim verbal stems, root, affix analysis for Hebrew), theological synthesis, exegetical nuances, resolved Vietnamese 1925 key Scriptures, and related lemmas.
- **Extended Hebrew Poetic & Wisdom Suite (§14, §49)**: Pre-compiled comprehensive morphological and theological analyses for foundational roots across Psalms, Job, and Proverbs:
  - `H1984` (*Halal* - Ca ngợi, cội nguồn Ha-lê-lu-gia & Tehillim)
  - `H2451` (*Chokmah* - Sự khôn ngoan thiên thượng trong Châm Ngôn & Gióp)
  - `H3374` (*Yirah* - Kính sợ Đức Giê-hô-va là khởi đầu khôn ngoan)
  - `H0835` (*Ashrei* - Phước thay người gắn bó Lời Chúa, Thi Thiên 1:1)
  - `H7462` (*Ra'ah / Rohi* - Đấng Chăn Giữ tôi, Thi Thiên 23:1)
  - `H1350` (*Go'el* - Đấng Cứu Chuộc tôi hằng sống, Gióp 19:25)
  - `H0982` (*Batach* - Hết lòng tin cậy Đức Giê-hô-va, Châm Ngôn 3:5)
  - `H6666` (*Tzedakah* - Sự công bình và chính trực theo giao ước)
- **Response Structure**:
  ```json
  {
    "strong_number": "G4102",
    "language": "greek",
    "lemma": "πίστις",
    "transliteration": "pistis",
    "pronunciation": "pis'-tis",
    "part_of_speech": "Danh từ, Giống cái",
    "grammatical_category": "Danh từ Nữ tính (Noun Feminine)",
    "morphological_parsing": {
      "declension": "Biến cách thứ ba (-ις, -εως)",
      "gender": "Nữ tính (Feminine)",
      "stem": "πιστι- (pisti-)",
      "case_paradigm": {
        "nominative_singular": "πίστις (pistis - Chủ cách)",
        "genitive_singular": "πίστεως (pisteos - Sở hữu cách)",
        "dative_singular": "πίστει (pistei - Tặng cách/Dụng cách)",
        "accusative_singular": "πίστιν (pistin - Đối cách)"
      },
      "theological_aspect": "Không chỉ là đồng thuận trí tuệ mà là sự ký thác trọn vẹn vào thân vị của Đấng Christ."
    },
    "definition": "Đức tin, lòng tin cậy vững chắc...",
    "theological_significance": "Đức tin là phương tiện để con người tiếp nhận sự công bình...",
    "exegetical_insight": "Trong thư tín Rô-ma và Ga-la-ti, ngữ cách 'ek pisteos'...",
    "occurrences_count": 243,
    "key_scriptures": [
      { "reference": "Hê-bơ-rơ 11:1", "text": "..." }
    ],
    "related_lemmas": [
      { "strong_number": "G4100", "lemma": "πιστεύω", "gloss": "Tin, nương cậy" }
    ]
  }
  ```

### 3.8 Multi-Passage Comparative Exegesis Matrix & Synoptic Lens Engine (§48, §51)
- **Presets Endpoint**: `GET /api/rag/comparative-presets`
  - **Description**: Returns 8 curated foundational comparative study presets covering Synoptic Gospels, Covenant Theology, Faith vs. Works, Typology, Christology, Messianic Prophecy, and Pneumatology.
- **Synchronous Analysis Endpoint**: `POST /api/rag/comparative-study`
  - **Request Body**:
    ```json
    {
      "passages": ["Ma-thi-ơ 28:18-20", "Mác 16:15-18", "Lu-ca 24:46-49"],
      "focus_theme": "Thẩm Quyền & Mạng Lệnh Môn Đồ Hóa",
      "comparative_lens": "synoptic_harmony"
    }
    ```
  - **Response Structure**:
    - `request_passages`: Array of input Scripture references.
    - `focus_theme`: Central theological subject.
    - `comparative_lens`: Active hermeneutical lens (`synoptic_harmony`, `covenant_fulfillment`, `theological_synthesis`, `typology_redemption`, `christological_roots`, `messianic_prophecy`).
    - `lens_title`: Human-readable lens description.
    - `executive_synthesis`: Executive summary of comparative findings.
    - `profiles`: Detailed exegetical profiles for each passage, including book name, author, canonical era, audience, literary genre, verses text from the 1925 Bible, core motif, and local Strong's roots.
    - `comparative_dimensions`: 5-dimensional breakdown (Historical Setting, Literary Form, Doctrinal Core, Practical Praxis) comparing each passage side-by-side with theological synthesis.
    - `lexicon_roots_overlap`: Original language Strong's Greek/Hebrew roots connecting the passages.
    - `points_of_convergence`: Core doctrinal truths shared across all passages.
    - `points_of_divergence_or_nuance`: Distinctive authorial emphases.
    - `harmonization_analysis`: Redemptive-historical harmonization resolving apparent tensions.
    - `scholarly_commentary_citations`: Citations from 275 library volumes.
    - `homiletical_sermon_outline`: 3-point homiletical preaching outline with exposition, Scripture links, and pastoral application.
    - `reflection_questions`: Probing personal and small group discussion questions.
    - `epistemic_guardrail`: Statement affirming grounded canonical text.
- **GET Endpoint Variant (Shareable)**: `GET /api/rag/comparative-study?passages={comma_separated_refs}&theme={optional_theme}&lens={optional_lens}`
  - **Description**: Supports direct URL links, browser bookmarks, and external cross-reference routing.

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

### 4.3 Biblical Chronological Timeline (§6, §44)
- **Endpoint**: `GET /api/graph/timeline`
- **Description**: Returns 22 chronological redemptive history milestones covering the entire narrative from Creation to Revelation.
- **Payload Structure**: Each event item contains `id`, `slug`, `title`, `approximate_date`, `date_type` (`exact`, `approximate`, `range`, `disputed`, `unknown`), `period`, `description`, `scripture`, `era_order`, `people` (array of historical figures), `places` (geographic settings), and `theological_significance` (Christological typology and redemptive impact).

### 4.4 Foundational Biblical & Covenantal Thematic Catalog (§17, §18)
- **Endpoint**: `GET /api/graph/themes`
- **Description**: Returns 7 foundational biblical thematic master catalogs (`covenant_redemption`, `grace_faith`, `kingdom_god`, `paschal_atonement`, `holy_spirit`, `resurrection_hope`, `prayer_communion`) with category classifications, golden verses, redemptive summaries, and component counts (scriptures, characters, events, doctrinal pillars).

### 4.5 Thematic Knowledge Graph & Covenant Trajectories Visualizer (§17, §18)
- **Endpoint**: `GET /api/graph/theme-map?theme_id={theme_id}`
- **Parameters**: `theme_id` (e.g. `covenant_redemption`, `grace_faith`, `kingdom_god`, `paschal_atonement`, `holy_spirit`, `resurrection_hope`, `prayer_communion`).
- **Description**: Computes interactive SVG/Cytoscape radial coordinates (Center Hub, Inner Orbit Doctrines r=150, Middle Orbit Scripture Anchors r=265 with OT/NT typological fulfillment links, Outer Orbit Historical Characters & Events r=370). Dynamically retrieves authentic 1925 Vietnamese Bible verses from PostgreSQL `bible_verses`, an 8-era progressive revelation trajectory track, scholarly citations from 275 commentary volumes, and a 3-point homiletical preaching outline with pastoral life applications.

### 4.6 Biblical Chronological Event Atlas & Geo-Temporal Historical Synthesis (§6, §8, §9, §44)
- **Endpoint**: `GET /api/graph/event-atlas?era={era}&search={search}`
- **Parameters**:
  - `era` (optional): Filter events by redemptive era (`primeval_patriarch`, `exodus_judges`, `united_kingdom`, `divided_kingdom`, `exile`, `restoration_intertestamental`, `life_of_christ`, `apostolic_church`, `all`).
  - `search` (optional): Accent-insensitive search query across event titles, ancient locations, modern sites, and key figures.
- **Description**: Unifies all 22 redemptive history milestones with precise GPS coordinates, projected SVG cartographic space (900x600 canvas), ancient vs. modern geographic identifications, authentic Protestant 1925 Vietnamese scripture verse texts retrieved from PostgreSQL `bible_verses`, archaeological excavation contexts, strategic topographical positioning, and Christological typology.
- **Payload Structure**:
  ```json
  {
    "total_events": 22,
    "era_filter": "all",
    "events": [
      {
        "id": "uuid",
        "slug": "su-sang-tao",
        "title": "Sự Sáng Tạo Vũ Trụ & Loài Người",
        "approximate_date": "~4004 TCN",
        "period": "Creation & Primeval",
        "era_order": 1,
        "era_key": "primeval_patriarch",
        "scripture": "Sáng-thế Ký 1-2",
        "verse_text": "Ban đầu Đức Chúa Trời dựng nên trời đất.",
        "people": ["A-đam", "Ê-va"],
        "places": ["Vườn Ê-đen"],
        "theological_significance": "Thiết lập quyền tể trị tuyệt đối...",
        "geo": {
          "site_name": "Vườn Ê-đen / Vùng Lưỡng Hà",
          "ancient_site": "Garden of Eden / Mesopotamia",
          "modern_name": "Hạ lưu sông Tigris & Euphrates, Iraq",
          "latitude": 31.02,
          "longitude": 47.41,
          "svg_x": 848,
          "svg_y": 411,
          "archaeological_context": "Vùng 'Lưỡi Liềm Màu Mỡ'...",
          "strategic_geography": "Điểm khởi đầu địa lý..."
        }
      }
    ]
  }
  ```

### 4.7 Biblical Spatial Journeys & Projected Vector Cartography (§9)
- **Endpoint**: `GET /api/graph/geo-routes`
- **Description**: Returns all 9 foundational biblical spatial journeys (Abraham's Pilgrimage, The Exodus & Wilderness, David as Fugitive, Elijah to Horeb, Jesus' Galilean Ministry, Paul's Three Missionary Journeys, Journey to Rome) pre-computed with projected SVG canvas coordinates (`svg_x`, `svg_y`) on each ordered waypoint, narrative exegesis, scripture citations, and contemporary geographical references.
- **Payload Structure**:
  ```json
  {
    "total_routes": 9,
    "routes": [
      {
        "id": "journey-abraham",
        "title": "Hành Trình Đức Tin Của Áp-ra-ham",
        "period": "Patriarchs (khoảng 2091 TCN)",
        "color": "#f59e0b",
        "waypoints": [
          {
            "order": 1,
            "name": "U-rơ (Ur)",
            "modern": "Tell el-Muqayyar, Iraq",
            "lat": 30.9628,
            "lng": 46.1031,
            "svg_x": 818,
            "svg_y": 413,
            "scripture": "Sáng-thế Ký 11:31",
            "notes": "Nơi Áp-ram sinh ra..."
          }
        ]
      }
    ]
  }
  ```

---

## 5. Learning & Memorization Engine (`/api/learn`)

### 5.1 Multiple-Choice Theology Quiz
- **Endpoint**: `GET /api/learn/quiz?category={category}&level={level}`
- **Description**: Returns 48 verified multiple-choice theological questions covering the Pentateuch, Historical books, Wisdom literature, Gospels, Acts, Pauline Epistles (Romans, Corinthians, Galatians, Ephesians, Philippians, Colossians, Timothy), and General Epistles with Scripture references and detailed explanations.

### 5.2 Spaced Repetition Flashcards (SM-2 Algorithm)
- **Endpoint**: `GET /api/learn/flashcards`
- **Description**: Returns 11 active flashcards with Anki export and CSV export capability.

### 5.3 Thematic Learning Challenges & Packs (§46)
- **Endpoint**: `GET /api/learn/challenge-packs`
- **Description**: Returns 8 specialized curriculum packs (5 foundational + 3 liturgical seasonal):
  1. *Ngũ Kinh & Nền Tảng Giao Ước*
  2. *Lịch Sử & Vương Quốc Y-sơ-ra-ên*
  3. *Thi Ca & Văn Chương Khôn Ngoan*
  4. *Bốn Sách Tin Lành & Chức Vụ Đấng Christ*
  5. *Thư Tín & Giáo Lý Hội Thánh*
  6. *Tuần Lễ Khổ Nạn & Thập Tự Giá* (Seasonal: Passion Week & Easter)
  7. *Mùa Vọng & Đấng Mê-si Giáng Sinh* (Seasonal: Advent & Messianic Prophecies)
  8. *Năm Khái Luận Cải Chánh Giáo Hội* (Seasonal: Five Solas of the Reformation)

### 5.4 Systematic & Seasonal Bible Reading Plans (§3, §46, §53)
- **Endpoint**: `GET /api/bible/reading-plans` (Aliased: `GET /api/learn/reading-plans`)
- **Description**: Returns 8 structured reading plans:
  1. *Toàn Bộ Kinh Thánh Trong 365 Ngày* (Cựu Ước, Tân Ước, Thi Thiên, Châm Ngôn mỗi ngày).
  2. *Tân Ước Trong 90 Ngày* (Tập trung toàn bộ 260 chương Tân Ước).
  3. *Cuộc Đời Đấng Christ Trong 30 Ngày* (Hài hòa 4 sách Tin Lành).
  4. *Thi Thiên & Châm Ngôn Trong 60 Ngày* (Dưỡng linh và suy ngẫm).
  5. *Lịch Sử Cứu Chuộc Theo Thứ Tự Thời Gian (Chronological)*.
  6. *Tuần Lễ Khổ Nạn & Phục Sinh 7 Ngày* (Palm Sunday đến Easter Sunday).
  7. *Mùa Vọng 25 Ngày - Lời Tiên Tri Về Đấng Mê-si* (Từ Sáng-thế Ký 3:15 đến Bethlehem).
  8. *30 Ngày Khám Phá Di Sản Cải Chánh Giáo Hội* (5 Solas và giáo lý ân điển).

### 5.5 Scripture Memorization Assistant with Word Occlusion (§3, §4)
- **Endpoint**: `GET /api/learn/memorize-verses`
- **Description**: Returns 12 core memory verses across 4 mastery levels:
  - Level 1: Nhập Môn & Sự Cứu Rỗi (`Giăng 3:16`, `Rô-ma 10:9`, `Ê-phê-sô 2:8-9`).
  - Level 2: Đời Sống Môn Đồ & Đức Tin (`Ga-la-ti 2:20`, `Hê-bơ-rơ 11:1`, `Châm-ngôn 3:5-6`).
  - Level 3: Chiến Đấu Thuộc Linh & Bình An (`Phi-líp 4:6-7`, `I Cô-rinh-tô 10:13`, `Thi-thiên 23:1-3`).
  - Level 4: Trưởng Thành & Sứ Mạng (`II Ti-mô-thê 3:16-17`, `Ma-thi-ơ 28:19-20`, `Công-vụ 1:8`).
### 5.6 Interactive Biblical Geography & Spatial Cartography Challenges (§3, §9, §46)
- **Challenges Endpoint**: `GET /api/learn/geo-challenges?category={category}&search={search}`
  - **Description**: Returns 16 curated biblical spatial geography challenges spanning 6 canonical eras: Patriarchs, Exodus, Kingdom, Exile, Gospels, and Apostles. Each challenge projects latitude/longitude to a $900 \times 600$ SVG vector cartographic space, enriches with authentic 1925 Vietnamese scripture verses extracted directly from PostgreSQL `bible_verses`, provides 4 multiple-choice location options with coordinates, archaeological excavation details, and strategic covenant theology.
  - **Payload Structure**:
    ```json
    [
      {
        "id": "geo-1",
        "title": "Khởi Đầu Đức Tin Của Áp-ra-ham",
        "category": "Patriarchs",
        "period": "Thời Kỳ Tổ Phụ (~2091 TCN)",
        "narrative_clue": "Thành phố cảng Sumer cổ đại trù phú bên bờ vịnh Ba Tư nơi Áp-ram nhận lời kêu gọi rời bỏ quê hương.",
        "scripture_ref": "Sáng-thế Ký 12:1",
        "verse_text": "Vả, Đức Giê-hô-va có phán cùng Áp-ram rằng: Ngươi hãy ra khỏi quê hương, vòng bà con và nhà cha ngươi, mà đi đến xứ ta sẽ chỉ cho.",
        "target_site": "U-rơ Canh-đê",
        "ancient_site": "Ur of the Chaldees",
        "modern_name": "Tell el-Muqayyar, Iraq",
        "target_coords": { "lat": 30.9628, "lng": 46.1031, "svg_x": 818, "svg_y": 413 },
        "options": [
          { "name": "U-rơ Canh-đê", "ancient_name": "Ur of the Chaldees", "modern_name": "Tell el-Muqayyar, Iraq", "lat": 30.9628, "lng": 46.1031, "svg_x": 818, "svg_y": 413 },
          { "name": "Ha-ran", "ancient_name": "Haran", "modern_name": "Harran, Thổ Nhĩ Kỳ", "lat": 36.8667, "lng": 39.0333, "svg_x": 586, "svg_y": 145 },
          { "name": "Ba-by-lôn", "ancient_name": "Babylon", "modern_name": "Hillah, Iraq", "lat": 32.5364, "lng": 44.4208, "svg_x": 762, "svg_y": 341 },
          { "name": "Si-chem", "ancient_name": "Shechem", "modern_name": "Nablus, Bờ Tây", "lat": 32.2138, "lng": 35.2858, "svg_x": 456, "svg_y": 356 }
        ],
        "correct_index": 0,
        "archaeological_fact": "Di chỉ Tell el-Muqayyar do Sir Leonard Woolley khai quật phát hiện Tháp Ziggurat Ur...",
        "strategic_theology": "Cuộc gọi Áp-ram rời khỏi một trong những đại đô thị phát triển nhất thế giới cổ đại...",
        "xp_reward": 100
      }
    ]
    ```
- **Verification & Gamification Endpoint**: `POST /api/learn/geo-challenges/verify`
  - **Request Body**:
    ```json
    {
      "challenge_id": "geo-1",
      "selected_option": 0,
      "selected_option_id": "opt-1-a",
      "user_identifier": "local_user"
    }
    ```
  - **Response Structure**:
    ```json
    {
      "is_correct": true,
      "score_awarded": 100,
      "total_xp": 100,
      "explanation": "Chính xác! U-rơ Canh-đê (Ur of the Chaldees) là câu trả lời đúng. Vị trí hiện đại: Tell el-Muqayyar, Iraq.",
      "target_site": "U-rơ Canh-đê",
      "modern_name": "Tell el-Muqayyar, Iraq",
      "archaeological_fact": "Di chỉ Tell el-Muqayyar do Sir Leonard Woolley khai quật...",
      "strategic_theology": "Cuộc gọi Áp-ram rời khỏi một trong những đại đô thị...",
      "scripture_ref": "Sáng-thế Ký 12:1",
      "verse_text": "Vả, Đức Giê-hô-va có phán cùng Áp-ram rằng..."
    }
    ```

### 5.7 Interactive Biblical Chronology & Era Order Challenges (§3, §6, §44, §46)
- **Challenges Endpoint**: `GET /api/learn/timeline-challenge?category={category}`
  - **Description**: Returns 10 curated canonical redemptive history challenge packs (Creation to Consummation) with chronological sequence milestones. Dynamically enriches every historical event with authentic 1925 Vietnamese scripture verses retrieved directly from PostgreSQL `bible_verses`, date approximations, historical period tags, key people, and geographic settings.
  - **Challenge Sets**:
    1. `tl-1`: Toàn Cảnh 6 Kỷ Nguyên Lịch Sử Cứu Chuộc (Creation to Early Church)
    2. `tl-2`: Thời Kỳ Tổ Phụ Đến Chinh Phục Ca-na-an
    3. `tl-3`: Vương Quốc Thống Nhất & Đền Thờ Thứ Nhất
    4. `tl-4`: Vương Quốc Phân Chia & Sự Sụp Đổ Lưu Đày
    5. `tl-5`: Hồi Hương Tái Thiết Đến 400 Năm Im Lặng
    6. `tl-6`: Cuộc Đời & Chức Vụ Của Chúa Cứu Thế Giê-xu
    7. `tl-7`: Cuộc Khổ Nạn, Phục Sinh & Lễ Ngũ Tuần
    8. `tl-8`: Kỷ Nguyên Các Sứ Đồ Đến Khải Huyền Hoàn Tất
    9. `tl-9`: Dòng Niên Biểu Đền Thờ Giê-ru-sa-lem
    10. `tl-10`: Đại Niên Biểu Toàn Thư: Từ Sáng Thế Đến Khải Huyền
- **Verification & Gamification Endpoint**: `POST /api/learn/timeline-challenge/verify`
  - **Request Body**:
    ```json
    {
      "challenge_id": "tl-1",
      "submitted_slug_order": [
        "su-sang-tao",
        "giao-uoc-ap-ra-ham",
        "xuat-ai-cap-vuot-bien-do",
        "xay-den-tho-sa-lo-mon",
        "su-giang-sinh-chua-gie-xu",
        "bien-co-le-ngu-tuan"
      ],
      "user_identifier": "local_user"
    }
    ```
  - **Response Structure**:
    ```json
    {
      "challenge_id": "tl-1",
      "is_perfect": true,
      "accuracy_percentage": 100.0,
      "correct_slots": 6,
      "total_slots": 6,
      "score_awarded": 150,
      "user_xp": 150,
      "streak_days": 1,
      "narrative_explanation": "Kế hoạch cứu chuộc của Đức Chúa Trời khởi đi từ sự sáng tạo hoàn hảo qua lịch sử cứu chuộc đến khi Tin Lành bùng nổ sang muôn dân.",
      "feedback_slots": [
        {
          "slot_index": 0,
          "event_slug": "su-sang-tao",
          "event_title": "Sự Sáng Tạo Vũ Trụ & Loài Người",
          "submitted_order": 1,
          "correct_order": 1,
          "is_correct": true
        }
      ]
    }
    ```

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

### 6.8 Study Projects & Entity Pinning (§50)
- **Endpoints**:
  - `POST /api/study/projects`: Create a named study project (e.g. "Đời Sống Cầu Nguyện Của Chúa Giê-xu").
  - `POST /api/study/projects/{project_id}/pin-verse`: Pin a canonical Bible verse to the workspace.
  - `POST /api/study/projects/{project_id}/pin-entity`: Pin a knowledge graph entity (`person`, `place`, `event`, `topic`) to the project.
  - `POST /api/study/projects/{project_id}/generate-outline`: AI analyzes pinned verses and entities to synthesize a 3-part study outline.
  - `POST /api/study/projects/{project_id}/generate-questions`: AI generates 4-5 deep theological and practical discussion questions.
  - `POST /api/study/projects/{project_id}/generate-summary`: AI generates a comprehensive grounded research synthesis note.
  - `POST /api/study/projects/{project_id}/export-flashcards`: Exports project insights and scriptures directly into SM-2 flashcard deck.
  - `GET /api/study/projects/{project_id}/export-leader-guide`: Generates a publication-grade Small Group Leader Guide & Study Curriculum (§50) featuring 3H learning objectives (Head, Heart, Hands), icebreaker question, pinned scripture exegesis, historical entity contexts, 3-step lesson outline, discovery discussion questions, citations from 275 commentary volumes, and weekly practical action plan. Returns JSON with formatted Markdown curriculum.

### 6.9 Homiletical Slide Deck Exporter & Presentation Engine (§50)
- **Component**: `/study` Homiletical Workspace (`sermon` tab)
- **Description**: Transforms expository sermon manuscripts and blueprints into interactive, fullscreen presentation slides:
  - **Slide Architecture**: Slide 0 (Title & Golden Verse), Slide 1 (Big Idea & Expository Setting), Slides 2..N (Expository Points with Scripture Text, Original Language Insights, Exposition, and Illustrations), Slide N+1 (Practical Life Applications), Slide N+2 (Conclusion, Call to Faith & Theological Citations).
  - **Interaction**: Keyboard navigation (`ArrowRight` / `Space` for next, `ArrowLeft` for previous, `Esc` to exit), progress dots, and slide counter.
  - **Slide Deck Markdown Export**: One-click generation and download of Marp / Slidev compliant Markdown files (`.md`) with slide separators (`---`), typography classes, and presenter notes.

### 6.10 Community Sermon Sharing & 3-Dimensional Peer Review Workflows (Roadmap Horizon Item 4)
- **Endpoints**:
  - `GET /api/study/sermons/community`: Lists community expository sermon manuscripts with query filtering by keyword (`search`), homiletical style (`style`: `expository`, `topical`, `textual`, `narrative`), and sorting (`sort_by`: `popular`, `top_rated`, `latest`).
  - `GET /api/study/sermons/community/{id}`: Detailed manuscript, big idea, expository points, practical applications, citations, likes count, and full peer review dossier.
  - `POST /api/study/sermons/share`: Publishes a sermon from the Homiletical Workspace into the community repository.
  - `POST /api/study/sermons/community/{id}/like`: Increments community appreciation/like counter.
  - `POST /api/study/sermons/community/{id}/review`: Submits a peer evaluation assessed across 3 normative dimensions:
    1. **Độ Trung Thực Giải Kinh (Hermeneutical Fidelity - 1..5 stars)**: Faithfulness to original Greek/Hebrew text, authorial intent, and canonical context.
    2. **Bố Cục Sư Phạm (Homiletical Clarity - 1..5 stars)**: Sharp Big Idea, logical progression, transitions, and memorable illustrations.
    3. **Ứng Dụng Thực Tiễn (Pastoral Application - 1..5 stars)**: Relevance to daily Christian walk, spiritual discipline, and clear call to repentance/action.

### 6.11 Collaborative Multi-Pastor Study Groups & Cohorts (Roadmap Horizon Item 5)
- **Endpoints**:
  - `GET /api/study/groups`: Lists ministerial study cohorts with filtering by `search` (name, scripture focus, leader) and `tag`, returning member counts and note counts.
  - `POST /api/study/groups`: Establishes a new ministerial cohort with target scripture focus, leader role, schedule, and thematic tags.
  - `GET /api/study/groups/{group_id}`: Retrieves complete cohort details including all collaborative study notes and threaded comments.
  - `POST /api/study/groups/{group_id}/notes`: Contributes a collaborative study note classified by insight type (`exegesis`, `pastoral`, `discussion_question`, `prayer`).
  - `POST /api/study/groups/{group_id}/notes/{note_id}/comments`: Appends an inline threaded comment or theological critique to a study note.
  - `POST /api/study/groups/{group_id}/notes/{note_id}/like`: Upvotes/endorses a collaborative note.
  - `GET /api/study/groups/{group_id}/export`: Exports the complete cohort minutes, exegesis dossier, and discussion transcript as formatted Markdown.

### 6.12 Personal Study Notes & Spiritual Journaling Engine with Offline-First Sync (§2.1, §4, §50)
- **Endpoints**:
  - `GET /api/study/notes`: Lists personal study notes with optional search query (`search`), tag filter (`tag`), category filter (`category`: `devotional`, `exegesis`, `sermon_notes`, `prayer_journal`, `general`), and paginated limit (`limit`, default 100).
  - `GET /api/study/notes/stats`: Returns analytics including total notes count, distinct scripture references count, category breakdown, top tags, and recent activity timeline.
  - `GET /api/study/notes/export`: Exports the user's personal journal archive as formatted Markdown bundle (`.md`) or JSON backup (`.json`).
  - `POST /api/study/notes`: Creates a new study note with title, scripture reference, markdown content, and tags.
  - `PUT /api/study/notes/{note_id}`: Updates existing note title, scripture reference, content, and tags.
  - `DELETE /api/study/notes/{note_id}`: Deletes a study note.
  - `POST /api/study/notes/sync`: Bidirectional offline-first sync engine reconciling local client notes array (`localStorage`) with PostgreSQL `user_study_notes` using timestamp-based Last-Write-Wins conflict resolution. Returns authoritative merged list and counts.

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

