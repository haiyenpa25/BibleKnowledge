# BibleKnowledge Project Roadmap & Verification Status

> **Canonical Roadmap**: Based on `ROADMAP1.md` (§41–§65)  
> **Status**: Production Operational / All 11 Phases Completed & Audited  
> **Audited Date**: 2026-10-02  
> **Continuous Gate**: Non-Ollama Application Container RAM < 2048 MiB (Current: ~961.6 MiB / 2048 MiB)

---

## Phase 0 — Foundation & Infrastructure (Completed)
- [x] Standardize Docker Compose containerization across all 4 core services.
- [x] `bibleknowledge-postgres`: PostgreSQL 16 Alpine with `pgvector` extension.
- [x] `bibleknowledge-api-ai`: FastAPI backend running Python 3.11 with SQLAlchemy & pgvector.
- [x] `bibleknowledge-web`: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons, Cytoscape.js.
- [x] `bibleknowledge-ollama`: Local LLM container (`qwen2.5:3b`) with GPU acceleration (8 GB VRAM).
- [x] Verified automated health check endpoint (`GET /api/health`).
- [x] Strict RAM budgeting enforced: Non-Ollama containers strictly < 2.0 GB.

---

## Phase 1 — Bible Core Engine (Completed)
- [x] Complete canonical Vietnamese 1925/1934 text ingestion: **31,081 / 31,081 verses across all 66 books**.
- [x] Fast accent-insensitive full-text search with Vietnamese diacritic folding (`GET /api/bible/search`).
- [x] Dynamic passage range parser (`GET /api/bible/passage?ref=...`).
- [x] Reading preferences: Serif / Sans font switching, font scaling, Red-Letter mode for Christ's words.
- [x] Interactive bookmarking, personal highlighting, and verse notes.
- [x] Text-Critical auditor (`scripts/check_missing.js`) calibrating all 50 textual differences between KJV (31,102 verses) and Vietnamese 1925 (31,081 verses).

---

## Phase 2 — Knowledge Entities (Completed)
- [x] Entity database for Biblical People, Places, Events, and Covenants (`knowledge_nodes`).
- [x] Deep entity profiles (`GET /api/graph/entities/{type}/{slug}`).
- [x] Global indexed entity catalog endpoint (`GET /api/graph/entities`).
- [x] Cross-linking between Scripture verses and entity cards.

---

## Phase 3 — Biblical Timeline (Completed)
- [x] Global chronological timeline (`GET /api/graph/timeline`).
- [x] Historical era order metadata mapping from Creation & Primeval through Early Church & Consummation.
- [x] Scripture references and historical dates (exact, approximate, range) for each milestone event.

---

## Phase 4 — Theological Knowledge Graph (Completed)
- [x] Cytoscape.js and SVG interactive graph visualization in `/explore`.
- [x] Relational edges: `DISCIPLE_OF`, `APOSTLE_OF`, `COVENANT_WITH`, `FULFILLED_IN`, `CRUCIFIED_AT`, etc.
- [x] Zero broken edges, zero isolated nodes verified via `scripts/find_missing.js`.
- [x] Filtering by node type (`person`, `place`, `event`) and real-time keyword search.

---

## Phase 5 — Interactive Learning & Discipleship Engine (Completed)
- [x] Multiple-choice theological quiz across difficulty levels (`GET /api/learn/quiz`).
- [x] SM-2 Spaced Repetition flashcards with Anki and CSV export (`GET /api/learn/flashcards`).
- [x] Thematic curriculum challenge packs (§46) (`GET /api/learn/challenges`).
- [x] Systematic Bible Reading Plans (§3, §46, §53) with 5 structured tracks and real-time progress tracking.
- [x] Scripture Memorization Assistant (§3, §4) with interactive word occlusion (25%–100%), accuracy scoring, and Vietnamese Text-to-Speech audio.

---

## Phase 6 — Scholarly RAG & Vector Embeddings (Completed)
- [x] Ingested and cleaned **275 volumes of classic theological literature** (242.5 MB plain text).
- [x] Chunked into **4,673 text segments** with 100% embedding coverage (1024-dim vectors).
- [x] Grounded theological Q&A with semantic vector similarity and citation footnotes (`POST /api/rag/ask`).
- [x] Integrated 5 academic citation formatters (SBL, Chicago 9th, APA 7th, MLA 9th, BibTeX).

---

## Phase 7 — Multi-Dimensional Exegesis & Context Engine (Completed)
- [x] 6-dimension context analysis (§15): Historical, Cultural, Political, Religious, Geographical, Literary (`POST /api/rag/context-study`).
- [x] 11-dimension passage exegesis study engine (§13): Canonical text, historical setting, literary genre, author/date, key entities, Roman numeral outline, Strong's keywords, cross-references, theological themes, reflection questions, scholarly citations (`POST /api/rag/passage-study`).
- [x] Direct bridge buttons from Bible reader (`/bible`) chapter header and verse modal drawer into passage exegesis.

---

## Phase 8 — Original Languages & Strong's Concordance (Completed)
- [x] Strong's Greek & Hebrew Lexicon search and dictionary lookups (`GET /api/rag/lexicon/search`).
- [x] Original lemmas, pronunciations, transliterations, and morphological definitions.
- [x] Embedded Strong's keyword items in passage study exegesis and Bible reader drawer.

---

## Phase 9 — Advanced Homiletical & Exegetical Workspace (Completed)
- [x] Exegetical sermon outline templates (§50) across 4 homiletical styles (`GET /api/study/sermon-templates`).
- [x] In-browser Markdown sermon editor with auto-save and Scripture inserts.
- [x] Export study dossier and research notebook bundles in Markdown format (`POST /api/study/export-bundle`).
- [x] Typology & Messianic Prophecy Fulfillment Matrix (§18, §45) with 14 foundational prophecies (`GET /api/study/prophecies`).
- [x] Gospel Harmony & Parallel Accounts matrix across 16 major events and 54 parallel records (`GET /api/study/harmony`).
- [x] Interactive Biblical Cartography & Journeys (§9) across 9 biblical expeditions with animated speed control (`GET /api/study/journeys`).

---

## Phase 10 — Autonomous Multi-Step Theological Agent (Completed)
- [x] Autonomous deep research agent (`POST /api/rag/agent-research`).
- [x] 4-dimension comparative matrix (e.g. Paul vs James on Justification).
- [x] Integrated Scripture foundations, lexicon roots, knowledge graph links, and academic bibliography.

---

## Phase 11 — Comprehensive Theological Library Portal (Completed)
- [x] Global library portal at `/library` serving 275 volumes across 4 primary categories.
- [x] Paginated book catalog with full-text search and series grouping (TOTC, TNTC, Wiersbe, IVP...).
- [x] Chapter-by-chapter exegesis reader with section navigation and detected Bible references.
- [x] Personal user note-taking and highlighting system.

---

## Future Horizon & Continuous Enhancement
- [x] Mobile PWA offline reading pack with service worker pre-caching and network-first fallback (`/manifest.json`, `sw.js`).
- [x] Seasonal reading challenge tracks (Easter/Passion Week 7, Advent 25, Reformation 30).
- [x] Extended Hebrew grammatical parsing for Old Testament poetic books (Psalms, Job, Proverbs) covering `H1984` (Halal), `H2451` (Chokmah), `H3374` (Yirah), `H0835` (Ashrei), `H7462` (Ra'ah/Rohi), `H1350` (Go'el), `H0982` (Batach), `H6666` (Tzedakah).
- [x] Homiletical Slide Deck Exporter & Presentation Engine (§50) with keyboard navigation and Marp/Slidev Markdown downloads.
- [x] Bidirectional Entity Pinning into Study Projects (§50) bridging Knowledge Graph nodes into research workspaces.
- [ ] Community sermon sharing and collaborative peer review workflows.
