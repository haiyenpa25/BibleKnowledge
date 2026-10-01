# Architecture Documentation — BibleKnowledge

> **Tiêu chuẩn**: Antigravity Pro Canonical Documentation  
> **Căn cứ**: `ROADMAP1.md`  
> **Môi trường vận hành**: Docker Desktop (Windows 11, 16 GB RAM, RTX 5050 8 GB VRAM)

---

## 1. Tầm nhìn 4 Lớp Sản phẩm (4-Layer System Architecture)

```text
┌────────────────────────────────────────────────────────┐
│ 1. LEARN LAYER                                        │
│ Quiz / Flashcard (FSRS/SM-2) / Challenges / Progress   │
├────────────────────────────────────────────────────────┤
│ 2. EXPLORE LAYER                                      │
│ Bible Reader / Timeline / People / Events / Places     │
├────────────────────────────────────────────────────────┤
│ 3. CONNECT LAYER                                      │
│ Knowledge Graph (Cytoscape.js) / Cross-References      │
├────────────────────────────────────────────────────────┤
│ 4. RESEARCH LAYER                                     │
│ Local LLM (Ollama) + RAG (pgvector) + Grounded MCP     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Kiến trúc Dịch vụ & Container (Docker Compose Topology)

```text
               ┌───────────────────────┐
               │  Trình duyệt Người dùng │
               └───────────┬───────────┘
                           │ (HTTP :3000)
                           ▼
               ┌───────────────────────┐
               │    web (Next.js 15)   │
               │  TypeScript, React,   │
               │  Tailwind, shadcn/ui  │
               └───┬───────────────┬───┘
                   │               │
       (App Queries│:5432)         │ (AI / Research Tasks :8000)
                   ▼               ▼
      ┌────────────────────┐   ┌───────────────────────────┐
      │     postgres       │   │      api-ai (FastAPI)     │
      │ PostgreSQL 16 +    │◄──┤  Python 3.11, RAG,        │
      │ pgvector extension │   │  BGE-M3, Document Chunking│
      └────────────────────┘   └─────────────┬─────────────┘
                                             │ (Ollama API :11434)
                                             ▼
                               ┌───────────────────────────┐
                               │       ollama (GPU)        │
                               │  Qwen3 4B Q4_K_M (NVIDIA) │
                               └───────────────────────────┘
```

---

## 3. Phân bổ Tài nguyên Hệ thống (16 GB RAM / 8 GB VRAM Budget)

Hệ thống được thiết kế tối ưu hóa nghiêm ngặt để vận hành mượt mà trên máy trạm cá nhân:

| Thành phần | RAM ước tính | VRAM ước tính | Ghi chú |
| :--- | :---: | :---: | :--- |
| **Windows OS & Docker Overhead** | 3.5 – 4.5 GB | ~0.2 GB | Môi trường hệ điều hành |
| **PostgreSQL + pgvector** | 1.0 – 1.5 GB | 0 GB | Shared buffers 512MB, work_mem 64MB |
| **Next.js Web Service** | 0.5 – 0.8 GB | 0 GB | Node.js production runtime |
| **FastAPI AI Service** | 0.8 – 1.2 GB | 0 GB (chạy Embedding trên CPU hoặc batch) |
| **Ollama Runtime & Model** | 1.5 – 2.5 GB | 4.0 – 5.5 GB | Qwen3 4B Q4_K_M + KV Cache (Context 4K - 8K) |
| **Dung lượng dự phòng (Buffer)** | 4.0 – 5.0 GB | 2.5 – 3.5 GB | Chống nghẽn bộ nhớ khi mở đa tác vụ |

---

## 4. Đặc tả các Service

### 4.1 `web` (Next.js Application)
* **Công nghệ**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui.
* **Đồ họa tri thức**: `Cytoscape.js` (render đồ thị tương tác các thực thể Kinh Thánh).
* **Nhiệm vụ**:
  * Giao diện đọc Kinh Thánh đa bản dịch (Bible Reader).
  * Giao diện học tập: Quiz ABCD, Who Am I?, Verse Challenge, Flashcards.
  * Giao diện trực quan hóa: Dòng thời gian đa tầng (Timeline), Bản đồ, Cây quan hệ nhân vật.
  * Giao diện không gian nghiên cứu (Study Workspace & AI Chat with Citations).

### 4.2 `api-ai` (Python FastAPI AI Engine)
* **Công nghệ**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0 / AsyncPG, Sentence-Transformers (`BGE-M3`).
* **Nhiệm vụ**:
  * Pipeline phân tích câu hỏi người dùng (Query Analyzer: Thần học, Nhân vật, Địa danh, Từ ngữ).
  * Hybrid Retrieval: Kết hợp Full-Text Search (PostgreSQL) + Semantic Search (pgvector) + Graph Traversal.
  * RAG Synthesis: Tổng hợp câu trả lời dựa trên nguồn trích dẫn nghiêm ngặt (Strict Grounded Citations).

### 4.3 `postgres` (Relational & Vector Database)
* **Phiên bản**: PostgreSQL 16 + `pgvector`.
* **Nhiệm vụ**:
  * Lưu trữ dữ liệu Kinh Thánh (Sách, Chương, Câu).
  * Lưu trữ các thực thể tri thức (Nhân vật, Địa danh, Sự kiện, Chủ đề).
  * Lưu trữ Graph (Nodes & Edges phân loại).
  * Lưu trữ vector embeddings cho các đoạn sách chú giải và tài liệu nghiên cứu.

### 4.4 `ollama` (Local LLM Runtime)
* **Model chuẩn**: `Qwen3 4B Q4_K_M` (hoặc `qwen2.5:3b` / `qwen2.5:7b`).
* **Cấu hình GPU**: Kích hoạt `deploy.resources.reservations.devices` trỏ đến GPU NVIDIA RTX 5050.
* **Context size baseline**: 4,096 – 8,192 tokens.

---

## 5. Phân định Vai trò Tri thức (Ground Truth & Sources)

1. **Văn bản Kinh Thánh & Dữ liệu thực thể (Level 1 - Canonical)**: Lưu trữ trong PostgreSQL, quản lý bằng Git migrations.
2. **275 Sách Chú giải & Nghiên cứu (Level 2 - Local RAG)**: Đã cấu trúc hóa tại `data/sources/*.json`, được chunk và nạp vào vector database.
3. **NotebookLM MCP (Level 2 - Supporting Research)**: Dùng trong quá trình phát triển (development research) và đối soát tài liệu lớn.
