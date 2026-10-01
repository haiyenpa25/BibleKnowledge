# Task Planning & Execution Directory

This directory tracks non-trivial features, architectural phases, bug fixes, and development tasks for the **BibleKnowledge** platform.

## Task Folder Standard
For every non-trivial task, create a subfolder named `docs/tasks/<task-slug>/` containing:

```text
docs/tasks/<task-slug>/
├── REQUEST.md           # User feature request and objectives
├── RESEARCH.md          # Repository and technical findings
├── NOTEBOOK-RESEARCH.md # Grounded findings from NotebookLM (if applicable)
├── PLAN.md              # Detailed implementation plan
├── TEST-PLAN.md         # Automated and manual verification strategy
└── REVIEW.md            # Independent review feedback
```

## Active Tasks
- `continuous-production-maintenance`: Automated regression auditing via `scripts/find_missing.js` and RAM budget monitoring (< 2048 MiB non-Ollama container memory).

## Completed Tasks & Architectural Phases

1. `0000-antigravity-pro-bootstrap`: Baseline Antigravity Pro standards, `.agents/`, skills, and canonical documentation templates.
2. `phase-0`: System Foundation & Docker Topology (Next.js 14, FastAPI Python 3.11, PostgreSQL 16 + pgvector, Ollama Local LLM with RTX 5050 GPU reservation).
3. `phase-1`: Bible Core Engine (31,081 canonical verses across 66 books, accent-insensitive search, reader customization, cross-references).
4. `phase-2`: Knowledge Entities (Biblical people, places, events, covenants with deep relational profiles).
5. `phase-3`: Biblical Timeline (Chronological timeline mapping from Creation & Primeval through Early Church & Consummation).
6. `phase-4`: Theological Knowledge Graph (Cytoscape.js and SVG interactive visualization with 30 nodes, 35 theological edges).
7. `phase-5`: Interactive Learning & Discipleship Engine (Interactive multi-choice quiz, SM-2 flashcards with Anki export, 5 curriculum challenge packs, 5 systematic Bible reading plans, 12 memory verses with word occlusion & TTS).
8. `phase-6`: Scholarly RAG & Vector Embeddings (275 volumes, 4,673 vector chunks embedded with 1024-dim vectors, grounded theological Q&A, academic citation formatters).
9. `phase-7`: Multi-Dimensional Exegesis & Context Engine (6-dimension contextual analysis §15, 11-dimension passage exegesis study §13).
10. `phase-8`: Original Languages & Strong's Concordance (Greek & Hebrew Strong's lexicon, transliterations, morphological parsing).
11. `phase-9`: Advanced Homiletical & Exegetical Workspace (4 sermon outline templates, in-browser Markdown editor, study dossier export bundle, 16 parallel Gospel events, 14 Messianic prophecies, 9 biblical cartography journeys).
12. `phase-10`: Autonomous Multi-Step Theological Agent (Comparative matrices, Scripture foundations, academic citations).
13. `phase-11`: Comprehensive Theological Library Portal (275 theological works reader, search, categories, and user study notes).
