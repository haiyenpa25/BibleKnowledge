# Phase 0 Implementation Plan — System Foundation & Docker Topology

> **Nhiệm vụ**: Thiết lập nền móng hạ tầng Phase 0 theo chuẩn `ROADMAP1.md` (Mục 41, 62, 63).  
> **Nguyên tắc**: Không phá hủy dữ liệu hiện có (`data/sources/`, `data/catalog.json`). Chạy độc lập, an toàn qua Docker Compose.

---

## 1. Mục tiêu Cốt lõi (Objectives)

Khởi tạo môi trường phát triển trọn vẹn, chạy container hóa bằng Docker Desktop trên Windows (16 GB RAM, RTX 5050 8 GB VRAM) đạt chuẩn **Definition of Done**:

```text
docker compose up -d

✔ postgres (Port 5432)   ➔ Sẵn sàng PostgreSQL 16 + pgvector
✔ ollama (Port 11434)    ➔ Nhận diện GPU NVIDIA, sẵn sàng nạp Qwen model
✔ api-ai (Port 8000)     ➔ FastAPI trả lời health check, kết nối DB & Ollama
✔ web (Port 3000)        ➔ Next.js 15 UI hiển thị trang chào đón & dashboard
```

---

## 2. Danh mục Dịch vụ & File Cần Tạo (Services & Files to Add)

```text
c:\xampp\htdocs\BibleKnowledge\
├── docker-compose.yml             # Cấu hình 4 services (web, api-ai, postgres, ollama)
├── .env.example                   # Mẫu cấu hình môi trường chuẩn
│
├── services/
│   ├── web/                       # Next.js 15 Application
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   └── src/
│   │       ├── app/page.tsx       # Dashboard chính
│   │       └── components/
│   │
│   └── api-ai/                    # FastAPI AI Service
│       ├── Dockerfile
│       ├── requirements.txt       # fastapi, uvicorn, sqlalchemy, psycopg2-binary, pgvector, httpx
│       └── app/
│           ├── main.py            # API Entrypoint & Health check
│           ├── core/config.py     # Đọc cấu hình từ .env
│           ├── db/session.py      # Kết nối PostgreSQL
│           └── routers/
│               ├── health.py      # /health, /ready
│               └── ai.py          # /api/ai/test-llm (kiểm tra Ollama)
│
└── db/
    └── init/
        ├── 01_init_extensions.sql # Kích hoạt uuid-ossp, pgvector
        └── 02_init_schema.sql     # Tạo các bảng cơ sở theo docs/DATABASE.md
```

---

## 3. Dự toán Phân bổ Tài nguyên Docker (Resource Estimates)

| Service | Memory Limit | Memory Reservation | GPU / Core Limits |
| :--- | :---: | :---: | :--- |
| `postgres` | 1.5 GB | 512 MB | CPU 1.0 |
| `ollama` | 4.0 GB | 1.5 GB | NVIDIA GPU (1 Device, RTX 5050) |
| `api-ai` | 1.0 GB | 256 MB | CPU 1.0 |
| `web` | 1.0 GB | 256 MB | CPU 1.0 |
| **Tổng ước tính** | **~7.5 GB** | **~2.5 GB** | **An toàn tuyệt đối trên máy 16 GB RAM** |

---

## 4. Các Rủi ro Kỹ thuật & Biện pháp Phòng ngừa (Risks & Safeguards)

1. **Rủi ro tràn RAM máy chủ khi build Docker đồng thời**:
   * *Giải pháp*: Cấu hình `memory limits` rõ ràng trong `docker-compose.yml`. Build từng image theo thứ tự.
2. **Rủi ro Docker Desktop không nhận GPU NVIDIA trên Windows**:
   * *Giải pháp*: Cấu hình khối `deploy.resources.reservations.devices` chuẩn của Docker Compose v2. Đồng thời cung cấp fallback CPU mode nếu cần.
3. **Rủi ro nạp model lớn làm treo máy**:
   * *Giải pháp*: Bắt đầu với model siêu nhẹ và tối ưu: `qwen2.5:3b` hoặc `qwen2.5:1.5b` trong Phase 0 để test đường truyền, sau đó nâng cấp `qwen3:4b` khi hạ tầng ổn định.
4. **Bảo toàn dữ liệu 275 sách JSON hiện có**:
   * Thư mục `data/` được giữ nguyên làm dữ liệu nguồn, chỉ mount read-only hoặc import từng phần vào PostgreSQL.

---

## 5. Trình tự Thực hiện Từng bước (Implementation Steps)

### Bước 1: Khởi tạo Tệp Cấu hình & Môi trường
* Tạo `.env.example` và `.env` chứa mật khẩu DB nội bộ, cổng dịch vụ, tên model.
* Tạo `db/init/` với các scripts SQL khởi tạo extensions `uuid-ossp`, `pgvector` và các bảng cơ sở.

### Bước 2: Khởi tạo Container PostgreSQL & Ollama
* Viết `docker-compose.yml` cho 2 service lõi trước: `postgres` và `ollama`.
* Chạy thử nghiệm và xác nhận `postgres` đã sẵn sàng nhận kết nối, `pgvector` hoạt động.

### Bước 3: Khởi tạo Dịch vụ `api-ai` (FastAPI)
* Tạo khung dự án Python FastAPI với cấu trúc module hóa chuẩn.
* Viết endpoint `/health` kiểm tra kết nối DB và kết nối sang Ollama.
* Viết endpoint `/api/ai/test-llm` gửi prompt test sang Ollama và nhận phản hồi.

### Bước 4: Khởi tạo Dịch vụ `web` (Next.js)
* Tạo ứng dụng Next.js (TypeScript, Tailwind CSS).
* Tạo giao diện Dashboard kết nối hiển thị trạng thái hệ thống:
  * Status PostgreSQL: Online / Offline
  * Status Ollama & Model: Online / Offline
  * Thống kê 275 sách chú giải đã có sẵn.

### Bước 5: Kiểm thử Toàn diện & Bàn giao Phase 0
* Chạy `docker compose up -d`.
* Kiểm tra toàn bộ acceptance criteria.

---

## 6. Tiêu chí Chấp thuận (Acceptance Criteria)

- [ ] Lệnh `docker compose up -d` hoàn tất mà không gặp lỗi.
- [ ] PostgreSQL lắng nghe trên cổng 5432, extension `vector` được cài đặt thành công (`SELECT * FROM pg_extension WHERE extname = 'vector';` trả về kết quả).
- [ ] Container Ollama nhận diện GPU hoặc khởi chạy thành công trên cổng 11434.
- [ ] FastAPI endpoint `GET http://localhost:8000/health` trả về `{ "status": "healthy", "database": "connected", "ollama": "connected" }`.
- [ ] FastAPI endpoint `POST http://localhost:8000/api/ai/test` gửi prompt thành công và nhận câu trả lời từ model local.
- [ ] Web Next.js mở được tại `http://localhost:3000` với giao diện hiện đại, hiển thị trạng thái hệ thống xanh (green health).
- [ ] Dữ liệu 275 sách trong `data/sources/` và `data/catalog.json` được bảo toàn nguyên vẹn.
