# Current Repository State & Environment Audit

> **Thời điểm kiểm tra**: 2026-10-01  
> **Mục đích**: Đối chiếu hiện trạng kho mã nguồn và môi trường với yêu cầu của `ROADMAP1.md` trước khi tiến hành Phase 0.

---

## 1. Môi trường phần cứng & Hệ thống (Audited)

* **Hệ điều hành**: Windows 11 (64-bit).
* **RAM vật lý**: **16.0 GB** (16,845,373,440 bytes).
* **GPU**: **NVIDIA GeForce RTX 5050 Laptop GPU**
  * VRAM: **8,151 MiB (~8 GB VRAM)**.
  * Driver Version: 591.91 | CUDA Version: 13.1.
* **Docker Engine**: **Docker Desktop đang chạy**.
  * Docker Engine: `29.8.0`
  * Docker Compose: `v5.5.1`
* **Node.js**: `v20.x` (Đang chạy tốt trên máy chủ).
* **Ollama trên host**: Chưa cài đặt trực tiếp trên Windows CLI (Sẽ chạy container hóa qua `docker-compose` theo chuẩn Phase 0).

---

## 2. Hiện trạng mã nguồn & Dữ liệu trong Repository

### 2.1 Git & Cấu trúc quy chuẩn
* **Nhánh chính**: `main`.
* **Remote**: `origin https://github.com/haiyenpa25/BibleKnowledge.git`.
* **Quy chuẩn Antigravity Pro**: Đã tích hợp đầy đủ:
  * `.agents/AGENTS.md` (Quy tắc kỹ sư cao cấp).
  * `.agents/skills/` (8 skills: `repo-research`, `feature-planner`, `implementation`, `database`, `api`, `testing`, `security-review`, `code-review`).
  * `.agents/workflows/` (8 workflows: `bootstrap-project`, `implement-feature`, `notebook-research`, `notebook-sync`, `plan-feature`, `research-feature`, `review-feature`, `ship-feature`).
  * `docs/` (Thư mục tài liệu canonical).

### 2.2 Kho dữ liệu tri thức (Local Data)
* Đã tải và cấu trúc hóa **275 đầu sách, bộ từ điển, bách khoa toàn thư thần học**:
  * Tệp mục lục: `data/catalog.json` (Metadata, số chương, tác giả, phân loại sách Kinh Thánh).
  * Thư mục chi tiết: `data/sources/` (275 tệp JSON cấu trúc cây 3 tầng: Sách ➔ Chương ➔ Tiểu mục ➔ Đoạn văn).
  * Kích thước dữ liệu: ~242.5 MB text thuần đã làm sạch rác OCR.

### 2.3 Kết nối MCP & NotebookLM
* **Server MCP**: `@roomi-fields/notebooklm-mcp@3.2.0` (đang kết nối qua stdio).
* **Notebooks liên kết**:
  * `NGHIÊN CỨU KINH THÁNH © AICoDoc.com` (ID `058481ca-131d-41e5-9d8f-8383604a7ed3`, 275 sources).
  * `App_Architecture_Docs` (ID `25a741ee-20cf-4091-9dca-9981db56ad05`, hiện đang trống, sẵn sàng làm kho lưu trữ thiết kế kiến trúc).

---

## 3. Khoảng trống cần hoàn thiện cho Phase 0 (Gaps Analysis)

So với mục tiêu của `ROADMAP1.md`:
1. **Chưa có Web Application Service**: Cần khởi tạo ứng dụng `web` bằng Next.js (TypeScript, Tailwind CSS, shadcn/ui, Cytoscape.js).
2. **Chưa có AI Backend Service**: Cần khởi tạo ứng dụng `api-ai` bằng Python + FastAPI (LangChain/LlamaIndex hoặc custom RAG pipeline, BGE-M3 embedding).
3. **Chưa có CSDL PostgreSQL + pgvector**: Cần định nghĩa container `postgres` với extension `pgvector` và volume lưu trữ bền vững.
4. **Chưa có Container Ollama**: Cần định nghĩa service `ollama` trong `docker-compose.yml` có cấu hình GPU reservation (`NVIDIA 8GB VRAM`) và tự động pull model `qwen2.5:3b` / `qwen3:4b`.
5. **Chưa có Bộ dữ liệu Kinh Thánh gốc (Bible Text Core)**: Cần import bản dịch Kinh Thánh (Tiếng Việt BTT / VI1934 và tiếng Anh KJV/WEB) vào cơ sở dữ liệu.
