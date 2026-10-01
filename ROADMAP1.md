# ROADMAP1 — BibleKnowledge: Nền tảng Học & Nghiên cứu Kinh Thánh có AI

> Mục tiêu: Xây dựng một nền tảng Kinh Thánh kết hợp học tương tác, dòng thời gian, nhân vật, sự kiện, knowledge graph và AI nghiên cứu chuyên sâu.  
> Môi trường mục tiêu ban đầu: Windows + Docker Desktop, RAM 16 GB, GPU NVIDIA 8 GB VRAM.  
> Nguyên tắc chính: AI không tự bịa nội dung thần học hoặc dữ kiện. Các câu trả lời nghiên cứu phải dựa trên nguồn, trích dẫn được đoạn Kinh Thánh/tài liệu liên quan và phân biệt rõ “văn bản”, “dữ kiện”, “diễn giải”, “quan điểm”.

---

# 1. Tầm nhìn sản phẩm

BibleKnowledge không chỉ là một trang đọc Kinh Thánh.

Nó nên trở thành một hệ thống gồm 4 lớp:

```text
┌─────────────────────────────────────────┐
│ 1. LEARN                               │
│ Quiz / Flashcard / Challenge / Progress│
├─────────────────────────────────────────┤
│ 2. EXPLORE                             │
│ Timeline / People / Events / Maps      │
├─────────────────────────────────────────┤
│ 3. CONNECT                             │
│ Knowledge Graph / Cross references     │
├─────────────────────────────────────────┤
│ 4. RESEARCH                            │
│ Local LLM + RAG + Notebook knowledge   │
└─────────────────────────────────────────┘
```

Một người dùng có thể đi theo hành trình:

```text
Đọc câu Kinh Thánh
      ↓
Xem bối cảnh
      ↓
Xem nhân vật
      ↓
Xem sự kiện
      ↓
Xem timeline
      ↓
Xem các câu liên quan
      ↓
Mở graph
      ↓
Đặt câu hỏi AI
      ↓
Đào sâu từ ngữ / bối cảnh / thần học
      ↓
Lưu note / flashcard / bài học
```

---

# 2. Các module sản phẩm chính

## 2.1 Bible Reader

Tính năng nền tảng:

- Chọn sách / chương / câu.
- Đọc theo nhiều bản dịch nếu giấy phép cho phép.
- Highlight câu.
- Bookmark.
- Note cá nhân.
- Tag.
- So sánh các bản dịch.
- Cross reference.
- Click trực tiếp vào nhân vật, địa danh, sự kiện, từ khóa, chủ đề.
- Mở chế độ nghiên cứu ngay từ một câu.

Ví dụ:

```text
Ma-thi-ơ 14:29
      │
      ├── Person: Phi-e-rơ
      ├── Person: Chúa Giê-xu
      ├── Event: Đi bộ trên mặt nước
      ├── Location: Biển Ga-li-lê
      ├── Topic: Đức tin
      └── Related passages
```

---

# 3. Học Kinh Thánh tương tác

Không nên chỉ có dạng ABCD.

Các game mode nên có:

- Multiple Choice
- True / False
- Fill in the Blank
- Match
- Timeline Order
- Who Am I?
- Event Guessing
- Verse Challenge
- Character Challenge

Ví dụ Who Am I?:

```text
Tôi là ngư phủ.
Tôi từng đi trên mặt nước.
Tôi đã chối Chúa ba lần.

Tôi là ai?
```

---

# 4. Flashcards

Các loại card:

## Person Card

Front:

```text
Phi-e-rơ là ai?
```

Back:

```text
Tên khác: Si-môn
Nghề nghiệp: Ngư phủ
Anh/em: Anh-rê
Vai trò: Môn đồ / Sứ đồ
Các sự kiện chính:
- Được Chúa gọi
- Đi trên mặt nước
- Chối Chúa
- Phục hồi
- Bài giảng Ngũ Tuần
```

## Verse Card

Front: `Giăng 3:16`

Back: nội dung câu Kinh Thánh.

## Event Card

Front: `Sự kiện Ngũ Tuần xảy ra ở đâu?`

Back: `Jerusalem — Công vụ 2`

## Timeline Card

So sánh hai sự kiện xem điều gì xảy ra trước.

## Word Study Card

Front: `Agape`

Back:

- Greek
- lemma
- transliteration
- nghĩa
- cách sử dụng
- câu ví dụ

---

# 5. Hệ thống học thích nghi

Phase sau có thể thêm spaced repetition.

Mỗi flashcard lưu:

```text
difficulty
last_reviewed_at
next_review_at
success_count
failure_count
```

Có thể triển khai SM-2 hoặc FSRS sau.

Hệ thống dần phát hiện chủ đề người dùng yếu và ưu tiên quiz/flashcard phù hợp.

---

# 6. Bible Timeline

Timeline nên có nhiều layer:

```text
TIME
│
├── Biblical events
├── People lifetime
├── Kings
├── Prophets
├── Empires
├── Books
└── Historical context
```

Một event:

```text
EVENT
│
├── title
├── approximate_date
├── date_confidence
├── description
├── people[]
├── places[]
├── verses[]
├── sources[]
└── related_events[]
```

Không ép mọi sự kiện vào một năm chính xác.

```text
date_type:
- exact
- approximate
- range
- disputed
- unknown
```

---

# 7. People / Character Database

Mỗi nhân vật là một entity.

Ví dụ:

```text
Peter
│
├── names
│   ├── Simon
│   ├── Peter
│   └── Cephas
│
├── relationships
│   ├── Andrew → brother
│   ├── Jesus → disciple-of
│   └── apostles
│
├── places
├── events
├── verses
├── timeline
├── actions
├── speeches
└── themes
```

Trang nhân vật nên có:

- Tiểu sử.
- Timeline cá nhân.
- Gia đình.
- Quan hệ.
- Địa điểm.
- Các câu nhắc đến.
- Hành động.
- Câu nói.
- Chủ đề.
- Graph.
- AI Analyze.

---

# 8. Events

Một event liên kết:

```text
Event
├── people
├── places
├── verses
├── parallel passages
├── topics
└── historical context
```

AI có thể phát hiện các đoạn song song và tổng hợp, nhưng phải giữ nguồn riêng cho từng chi tiết.

---

# 9. Places / Bible Map

Entity địa danh:

```text
Jerusalem
Nazareth
Bethlehem
Sea of Galilee
Rome
Corinth
Ephesus
```

Liên kết:

```text
Place
├── events
├── people
├── journeys
├── verses
└── historical context
```

Phase sau tích hợp bản đồ.

---

# 10. Knowledge Graph

Các node chính:

```text
Book
Chapter
Verse
Person
Place
Event
Topic
Word
Nation
Kingdom
Prophecy
Object
TimelinePeriod
Source
```

Các edge:

```text
PERSON --PARTICIPATED_IN--> EVENT
EVENT --OCCURRED_AT--> PLACE
EVENT --MENTIONED_IN--> VERSE
PERSON --MENTIONED_IN--> VERSE
PERSON --FATHER_OF--> PERSON
PERSON --BROTHER_OF--> PERSON
PERSON --DISCIPLE_OF--> PERSON
VERSE --CROSS_REFERENCE--> VERSE
VERSE --HAS_TOPIC--> TOPIC
PROPHECY --FULFILLED_BY--> EVENT
WORD --OCCURS_IN--> VERSE
```

Frontend graph cần:

- zoom
- drag
- filter node type
- click node
- expand neighbors
- trace path

---

# 11. Công nghệ Graph

## Phase đầu

Không cần Neo4j.

Dùng PostgreSQL:

```text
knowledge_nodes

id
type
key
name
metadata_json
```

```text
knowledge_edges

id
from_node_id
to_node_id
relation
metadata_json
```

Ưu điểm:

- ít RAM hơn
- Docker đơn giản
- backup dễ
- không cần thêm database server
- phù hợp máy 16 GB RAM

Frontend graph: **Cytoscape.js**.

Sau này nếu graph rất lớn/phức tạp mới cân nhắc Neo4j như read-model riêng.

---

# 12. AI Bible Research

Không xây chatbot kiểu:

```text
User → LLM → Answer
```

Phải xây:

```text
Question
   │
   ▼
Query Analyzer
   │
   ├── Bible DB
   ├── Vector Search
   ├── Knowledge Graph
   ├── Lexicon
   └── Study Documents
          │
          ▼
       Context
          │
          ▼
        LLM
          │
          ▼
Answer + Sources + Citations
```

---

# 13. Các chế độ AI Research

## Passage Study

Input: `Matthew 14:22-33`

Output:

1. đoạn văn
2. bối cảnh
3. nhân vật
4. sự kiện
5. địa điểm
6. cấu trúc đoạn
7. từ khóa
8. các câu liên quan
9. themes
10. câu hỏi suy ngẫm
11. nguồn

---

# 14. Word Study

Ví dụ:

```text
ἀγάπη
agapē
```

Thông tin:

```text
Language
Lemma
Transliteration
Strong Number
Morphology
Definition
Occurrences
Books
Authors
Context
Related words
```

LLM không phải nguồn từ điển.

Word data phải lấy từ lexicon/morphology/concordance datasets. AI chỉ tổng hợp, so sánh và diễn giải.

---

# 15. Context Study

AI phân tích:

```text
Historical Context
Cultural Context
Political Context
Religious Context
Geographical Context
Literary Context
```

Ví dụ: `Why was Samaria significant in John 4?`

AI tìm Bible passages + historical sources + study documents rồi tổng hợp.

---

# 16. Character Study

Ví dụ: `Analyze Peter`

Workflow:

```text
Find all Peter verses
       ↓
Find Peter events
       ↓
Chronological ordering
       ↓
Actions
       ↓
Speeches
       ↓
Relationships
       ↓
Behavior patterns
       ↓
Important turning points
```

Output:

- Overview
- Timeline
- Relationships
- Key Events
- Actions
- Statements
- Development
- Related passages
- Study questions

---

# 17. Theme Study

Ví dụ:

```text
Faith
Grace
Covenant
Kingdom
Holy Spirit
Prayer
```

Graph:

```text
Topic
 ↓
Verses
 ↓
People
 ↓
Events
 ↓
Books
 ↓
Timeline
```

---

# 18. Cross-Bible Connections

Ví dụ:

```text
Exodus
 ↓
Passover
 ↓
Lamb
 ↓
Jesus
 ↓
Crucifixion
```

Các liên kết cần phân loại:

```text
connection_type:
- explicit
- quotation
- allusion
- parallel
- traditional_interpretation
- scholarly_interpretation
- AI_suggested
```

Không cho AI-suggested ngang hàng với liên kết trực tiếp trong văn bản.

---

# 19. AI Answer Structure

Mỗi câu trả lời AI research nên có:

```text
ANSWER
BIBLE EVIDENCE
RELATED PASSAGES
HISTORICAL / STUDY CONTEXT
INTERPRETATION
ALTERNATIVE INTERPRETATIONS
SOURCES
CONFIDENCE / UNCERTAINTIES
```

---

# 20. RAG Architecture

```text
Documents
    │
    ▼
Parser
    │
    ▼
Chunking
    │
    ▼
Metadata extraction
    │
    ▼
Embedding
    │
    ▼
PostgreSQL + pgvector
```

Metadata chunk:

```text
source_id
book
chapter
verse_range
author
document_type
language
topic
person_ids
event_ids
date
```

Query pipeline:

```text
User question
      │
      ▼
Query Classification
      │
      ├── Bible query
      ├── Person query
      ├── Word query
      ├── Timeline query
      ├── Theology query
      └── General study
      │
      ▼
Hybrid Retrieval
      │
      ├── SQL
      ├── Full-text
      ├── pgvector
      └── Knowledge Graph
      │
      ▼
Rerank (later)
      │
      ▼
Context
      │
      ▼
Local LLM
```

---

# 21. Local LLM

Target machine:

```text
RAM: 16 GB
VRAM: 8 GB
```

## Recommended default

**Qwen3 4B — Q4_K_M**

Lý do:

- model nhỏ
- multilingual tốt
- reasoning khá
- phù hợp tiếng Việt
- phù hợp 8 GB VRAM
- đủ tốt cho RAG synthesis
- Ollama API đơn giản

Knowledge phải đến từ retrieval, không dựa vào “trí nhớ” model.

LLM dùng để:

```text
interpret query
summarize retrieved context
compare sources
structure answer
generate quiz
generate flashcards
```

---

# 22. Model Tier

## Tier 1 — Default / Fast

`Qwen3 4B Q4_K_M`

Dùng cho:

- chat
- RAG
- quiz generation
- summaries
- character analysis
- passage analysis

## Tier 2 — Optional

Có thể benchmark `Qwen3 8B quantized`, nhưng không dùng làm baseline trên 8 GB VRAM.

## Tier 3 — Cloud Escalation

Optional:

```text
Local LLM
    ↓
insufficient evidence / hard task
    ↓
ChatGPT / Gemini / Claude
```

Local-first vẫn là mặc định.

---

# 23. Ollama vs llama.cpp

## Development

Dùng **Ollama**.

Ưu điểm:

- easy setup
- Docker
- API
- model management

Endpoint:

```text
http://ollama:11434
```

## Optimization phase

Benchmark **llama.cpp** khi cần kiểm soát sâu hơn về GPU layers, KV cache, context và memory.

---

# 24. Embedding Model

Đề xuất: **BGE-M3**.

Lý do:

- multilingual
- phù hợp tiếng Việt
- semantic retrieval tốt
- phù hợp tài liệu nghiên cứu đa dạng

Ưu tiên chạy embedding bằng CPU/background job để không chiếm VRAM LLM lâu dài.

---

# 25. Reranker

Phase đầu: chưa cần.

Phase sau:

```text
Vector top 30
      ↓
reranker
      ↓
top 6–10
      ↓
LLM
```

---

# 26. Backend Language

Đề xuất chia 2 lớp.

## Main Application

**TypeScript + Next.js**

Dùng cho:

- web UI
- authentication
- dashboards
- quiz
- flashcards
- Bible reader
- graph UI
- admin
- normal CRUD APIs

## AI Service

**Python + FastAPI**

Dùng cho:

- RAG
- embeddings
- LLM orchestration
- document parsing
- NLP
- graph extraction
- word analysis
- background indexing

Kiến trúc:

```text
Next.js
   │
   ▼
Application API
   │
   ▼
FastAPI AI Service
   │
   ├── Ollama
   ├── pgvector
   └── Knowledge DB
```

---

# 27. Frontend

Recommended:

```text
Next.js
TypeScript
React
Tailwind CSS
shadcn/ui
Cytoscape.js
```

Charts: `Recharts`.

---

# 28. Database

Main DB:

```text
PostgreSQL
```

Extension:

```text
pgvector
```

Dùng chung cho:

- users
- Bible
- notes
- quiz
- flashcards
- people
- events
- places
- timeline
- graph
- documents
- embeddings

---

# 29. Search

Hybrid search:

```text
PostgreSQL full-text
       +
pgvector
```

Không cần Elasticsearch ở v1.

---

# 30. Redis

Không bắt buộc ban đầu.

Thêm khi cần:

- background jobs
- rate limiting
- cache
- queues

---

# 31. Docker Architecture

```text
docker-compose.yml

services:
- web
- api-ai
- postgres
- ollama
```

Sau này:

```text
- redis
- worker
```

Architecture:

```text
Browser
   │
   ▼
Next.js
   │
   ├───────────────┐
   ▼               ▼
PostgreSQL       FastAPI
                   │
             ┌─────┴─────┐
             ▼           ▼
          pgvector     Ollama
                         │
                         ▼
                    Qwen3 4B
```

---

# 32. Docker Resource Strategy — 16 GB RAM

Không cho Docker Desktop ăn hết RAM.

Target tương đối:

```text
Windows + Docker overhead     3–5 GB
PostgreSQL                    1–2 GB
Next.js                       0.5–1 GB
FastAPI                       0.5–1 GB
Ollama / model runtime        phần còn lại
```

Mục tiêu active khoảng 10–12 GB khi phát triển.

---

# 33. GPU Strategy — 8 GB VRAM

Baseline: `Qwen3 4B Q4_K_M`.

Phần VRAM còn lại dành cho:

- KV cache
- context
- runtime overhead

Không đặt context cực lớn ngay từ đầu.

Baseline: **4K–8K context**.

RAG tốt không cần ném hàng chục nghìn token vào model; retrieve đúng 6–10 chunks tốt hơn.

---

# 34. Document Pipeline

```text
Upload
  ↓
Detect type
  ↓
Extract
  ↓
Clean
  ↓
Structure
  ↓
Chunk
  ↓
Embed
  ↓
Store
```

Các loại:

- PDF
- DOCX
- TXT
- Markdown
- HTML
- EPUB (later)

---

# 35. Bible Text Data Model

```text
bible_translations
books
chapters
verses
```

Verse:

```text
id
translation_id
book_id
chapter
verse
text
```

---

# 36. Entities

```text
people
places
events
topics
words
sources
documents
```

Junctions:

```text
verse_people
verse_places
verse_events
verse_topics
event_people
event_places
```

Graph có thể build từ các bảng này.

---

# 37. Original Language Module

Phase sau.

Tables:

```text
lexemes
word_occurrences
morphology
strong_numbers
```

Word occurrence:

```text
verse_id
surface
lemma
transliteration
strong_number
morphology
position
```

Cho phép click một từ → lemma → all occurrences → contexts.

---

# 38. Source / Citation System

Mọi AI research output nên có citation object:

```text
citation

type
source_id
verse_id
document_id
chunk_id
page
quote
```

Frontend hiển thị nguồn và cho phép click mở source.

---

# 39. AI Guardrails

Không cho model:

- tạo câu Kinh Thánh không tồn tại
- đổi citation
- tự bịa Strong number
- tự bịa từ Hy Lạp/Hê-bơ-rơ
- trình bày một quan điểm thần học như fact tuyệt đối

Prompt nền tảng:

```text
If evidence is insufficient, say so.
Every factual research statement should be supported by retrieved source material whenever possible.
Clearly distinguish text, historical evidence, interpretation, and uncertainty.
```

---

# 40. NotebookLM / Gemini Notebook Role

NotebookLM không thay thế local RAG.

Dùng NotebookLM cho:

- research tài liệu lớn
- compare documents
- extract requirements
- study document analysis
- knowledge discovery

Local BibleKnowledge giữ:

- production knowledge
- Bible DB
- graph
- RAG
- AI UX
- user notes
- quiz
- progress

Antigravity có thể dùng NotebookLM MCP trong quá trình development, nhưng production app không nên phụ thuộc vào unofficial NotebookLM MCP.

---

# 41. Phase 0 — Foundation

Mục tiêu: project chạy ổn định bằng Docker.

Tasks:

- audit repo
- chuẩn hóa Docker
- Next.js
- FastAPI
- PostgreSQL
- pgvector
- Ollama
- Qwen3 4B
- health checks
- environment config
- migration system
- seed data
- CI baseline

Definition of done:

```text
docker compose up -d

→ web works
→ api works
→ postgres works
→ ollama works
→ model answers
```

---

# 42. Phase 1 — Bible Core

Build:

- Bible reader
- books
- chapters
- verses
- search
- bookmarks
- notes
- highlights

Admin:

- import translation
- validate verse counts
- detect duplicates

---

# 43. Phase 2 — Knowledge Entities

Build:

```text
People
Places
Events
Topics
```

Each entity:

- detail page
- related verses
- related entities
- timeline entries
- graph links

---

# 44. Phase 3 — Timeline

Build:

- global Bible timeline
- character timeline
- event timeline
- historical periods
- kings
- prophets
- empires

Features:

- zoom
- filters
- compare
- click event

---

# 45. Phase 4 — Knowledge Graph

Build node/edge model.

Frontend interactive graph.

Filters:

- people
- events
- places
- topics
- books
- verses

Features:

- expand
- collapse
- find path
- related nodes

---

# 46. Phase 5 — Learning

Build:

```text
Quiz
Flashcards
Daily challenge
Character guessing
Timeline challenge
Verse challenge
```

User profile:

```text
score
streak
mastery
weak topics
history
```

---

# 47. Phase 6 — RAG

Build document ingestion:

```text
upload
parse
chunk
embed
index
```

Search:

```text
keyword
+
vector
+
metadata
```

Return citations.

---

# 48. Phase 7 — AI Research Assistant

Research modes:

```text
Ask
Passage
Person
Event
Topic
Word
Compare
Timeline
```

Backend:

```text
Query classifier
      ↓
Retriever
      ↓
Graph expansion
      ↓
Context builder
      ↓
Qwen3
      ↓
Cited answer
```

---

# 49. Phase 8 — Original Languages

Add:

- Hebrew
- Greek
- lemma
- Strong
- morphology
- concordance

Features:

- word lookup
- verse parsing
- occurrence search
- semantic comparison

---

# 50. Phase 9 — Advanced Study Workspace

User creates `Study Project`.

Ví dụ: `Life of Peter`.

Workspace:

```text
Questions
Notes
Verses
People
Events
Sources
AI research
Graph
Timeline
```

AI hỗ trợ:

- study outline
- questions
- summary
- flashcards

---

# 51. Phase 10 — AI Agent Research

Later:

```text
Research question
     ↓
create plan
     ↓
search Bible
     ↓
search graph
     ↓
search documents
     ↓
word research
     ↓
compare passages
     ↓
synthesize
     ↓
citations
```

Không cho agent tự do ghi/xóa mọi thứ ở phiên bản đầu.

---

# 52. Suggested UI Navigation

```text
Bible

Explore
├── People
├── Events
├── Places
├── Timeline
└── Graph

Learn
├── Quiz
├── Flashcards
└── Challenges

Research
├── Ask AI
├── Passage Study
├── Word Study
├── Character Study
├── Theme Study
└── Study Projects

Library
├── Documents
├── Notes
└── Sources
```

---

# 53. Suggested Home Dashboard

```text
Today's Verse
Continue Reading
Daily Quiz
Review Flashcards
Person of the Day
Timeline Event
Study Projects
Ask Bible Research AI
```

---

# 54. MVP Scope

MVP nên có:

```text
Bible Reader
People
Events
Timeline
Basic Graph
Quiz
Flashcards
Document RAG
AI Ask
Passage Study
```

Chưa cần:

```text
Neo4j
complex agents
multiplayer
mobile app
full Hebrew morphology
large LLM
Elasticsearch
```

---

# 55. Tech Stack Summary

## Frontend

```text
Next.js
React
TypeScript
Tailwind
shadcn/ui
Cytoscape.js
```

## Backend

```text
Next.js application API
+
Python FastAPI AI service
```

## Database

```text
PostgreSQL
pgvector
```

## AI

```text
Ollama
Qwen3 4B Q4_K_M
```

## Embedding

```text
BGE-M3
```

## Infrastructure

```text
Docker Compose
```

---

# 56. Why This Stack

## TypeScript

Phù hợp cho web app, UI, type safety, Next.js ecosystem và maintainability.

## Python

Phù hợp cho NLP, embeddings, RAG, AI, document parsing và model tooling.

Không nên lấy PHP/XAMPP làm nền tảng AI chính cho architecture mới. XAMPP có thể tồn tại cho project cũ, nhưng hệ thống mới nên Docker hóa độc lập.

---

# 57. Hardware Evaluation

Target:

```text
RAM 16 GB
GPU 8 GB VRAM
```

Đánh giá:

- Web application: rất ổn.
- PostgreSQL: rất ổn.
- pgvector: phù hợp quy mô cá nhân/nhóm nhỏ.
- Qwen3 4B Q4: rất phù hợp.
- Embedding: phù hợp.
- Neo4j + LLM + everything: có thể chạy nhưng không đáng ở giai đoạn đầu.
- 14B+ model: không phù hợp làm baseline trên 8 GB VRAM.

---

# 58. Upgrade Path

Nếu sau này nâng lên:

```text
RAM 32 GB
VRAM 16 GB
```

có thể thêm:

- model lớn hơn
- context dài hơn
- reranker tốt hơn
- Neo4j
- parallel AI jobs
- larger embeddings
- multi-agent research

Architecture hiện tại vẫn giữ được.

---

# 59. Data Quality Is More Important Than LLM Size

Đối với BibleKnowledge:

```text
Good data
+
good retrieval
+
citations
+
knowledge graph
+
4B model
```

có thể hữu ích hơn:

```text
14B model
+
poor data
+
no citations
```

Ưu tiên:

1. dữ liệu sạch
2. mapping chuẩn
3. citation
4. retrieval
5. graph
6. rồi mới model size

---

# 60. Recommended Development Order

```text
FOUNDATION
↓
BIBLE DATA
↓
ENTITIES
↓
TIMELINE
↓
GRAPH
↓
LEARNING
↓
RAG
↓
AI RESEARCH
↓
ORIGINAL LANGUAGES
↓
AGENTIC RESEARCH
```

---

# 61. Suggested First Milestone

Tên: **BibleKnowledge Alpha**

Bao gồm:

```text
Bible Reader
Person pages
Event pages
Timeline
Basic graph
Quiz
Flashcards
Local Qwen3
Document upload
RAG Q&A
Citations
```

---

# 62. First Technical Tasks for Antigravity

Antigravity cần làm trước:

```text
1. Audit current repository.
2. Identify existing frontend/backend architecture.
3. Create architecture proposal matching this roadmap.
4. Create:
   docs/ARCHITECTURE.md
   docs/DATABASE.md
   docs/AI-ARCHITECTURE.md
5. Design Docker Compose.
6. Design initial PostgreSQL schema.
7. Implement Ollama health check.
8. Implement Qwen3 test endpoint.
9. Implement basic Bible data import.
10. Do NOT implement the entire roadmap at once.
```

---

# 63. Antigravity Master Prompt

Use this after placing `ROADMAP1.md` in repository root:

```text
Read ROADMAP1.md completely.

This file describes the target architecture and long-term roadmap
for the BibleKnowledge application.

Do NOT attempt to implement the whole roadmap.

First audit the existing repository.

Then produce:

1. docs/CURRENT-STATE.md
2. docs/ARCHITECTURE.md
3. docs/DATABASE.md
4. docs/AI-ARCHITECTURE.md
5. docs/tasks/phase-0/PLAN.md

Use the following target constraints:

- Windows development machine
- Docker Desktop
- 16 GB RAM
- NVIDIA GPU with 8 GB VRAM
- local-first AI
- PostgreSQL + pgvector
- Qwen3 4B Q4_K_M via Ollama as baseline
- TypeScript/Next.js for the application
- Python/FastAPI for AI/RAG services
- Git repository is canonical source of truth

Inspect the existing project before proposing migrations.

Do not delete working functionality.
Do not rewrite the entire application.
Do not invent missing requirements.

After planning Phase 0, stop and show me:

- current architecture
- proposed architecture
- files/services to add
- migration risks
- Docker resource estimates
- implementation order
- acceptance criteria

Do not begin Phase 1 until Phase 0 is stable.
```

---

# 64. Success Criteria

BibleKnowledge thành công khi người dùng có thể:

```text
Read
↓
Understand
↓
Explore
↓
Connect
↓
Study
↓
Research
↓
Remember
```

AI luôn đóng vai trò **Research Assistant**, không phải “Ultimate Authority”.

Nguồn dữ liệu, văn bản Kinh Thánh và tài liệu nghiên cứu luôn phải truy xuất và kiểm tra được.

---

# 65. Recommended Baseline Decision

Nếu bắt đầu ngay:

```text
Frontend:
Next.js + TypeScript

AI:
Python + FastAPI

Database:
PostgreSQL + pgvector

Graph:
PostgreSQL nodes/edges + Cytoscape.js

LLM:
Qwen3 4B Q4_K_M

Runtime:
Ollama

Embedding:
BGE-M3

Deployment:
Docker Compose
```

Đây là baseline phù hợp với mục tiêu sản phẩm và giới hạn phần cứng 16 GB RAM / 8 GB VRAM.

Không thêm Neo4j, Elasticsearch, Kubernetes hoặc model rất lớn cho tới khi sản phẩm thực sự cần.
