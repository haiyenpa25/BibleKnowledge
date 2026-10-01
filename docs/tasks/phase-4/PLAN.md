# Phase 4 Implementation Plan — Knowledge Graph, Biblical Entities & Timeline (Explore & Connect Layer)

> **Nhiệm vụ**: Triển khai Module **Explore & Connect Layer (Tầng 2 & 3: Khám Phá & Kết Nối)** theo chuẩn `ROADMAP1.md` (Mục 1, 6, 7, 8, 9, 10, 11, 43, 44, 45) và `docs/ARCHITECTURE.md`.  
> **Nền tảng**: PostgreSQL 16 (`people`, `places`, `events`, `knowledge_nodes`, `knowledge_edges`), mô hình đồ thị quan hệ tri thức, dòng thời gian đa tầng (Biblical Eras & Timeline), và bộ trực quan hóa đồ thị tương tác.

---

## 1. Mục tiêu Cốt lõi (Objectives)

1. **Bộ Dữ Liệu Thực Thể & Đồ Thị Tri Thức (Seed Entities & Knowledge Graph)**:
   - Nạp các Nhân vật tiêu biểu (`people`): Chúa Giê-xu, Phi-e-rơ, Phao-lô, Đa-vít, Môi-se, Áp-ra-ham, Giô-sép, Ma-ri, Giăng, Sa-lô-môn.
   - Nạp các Địa danh lịch sử (`places`): Giê-ru-sa-lem, Bết-lê-hem, Ca-na, Biển Ga-li-lê, Núi Si-na-i, Ai Cập, Ba-by-lôn, Đa-mách.
   - Nạp các Biến cố trọng đại (`events`): Sáng tạo vũ trụ, Giao ước Áp-ra-ham, Xuất Ai Cập & Vượt Biển Đỏ, Giáng sinh, Phép lạ Ca-na, Bước đi trên biển, Đóng đinh & Phục sinh, Lễ Ngũ Tuần.
   - Đồng bộ sang bảng `knowledge_nodes` và `knowledge_edges` với các mối quan hệ ngữ nghĩa (`DISCIPLE_OF`, `PARTICIPATED_IN`, `OCCURRED_AT`, `FATHER_OF`, `BROTHER_OF`, `PROPHECY_FULFILLED_BY`).

2. **Dòng Thời Gian Lịch Sử Đa Tầng (Multi-Era Timeline)**:
   - Phân chia 6 thời kỳ Kinh Thánh kinh điển:
     1. Thời kỳ Nguyên thủy & Tộc trưởng (Creation & Patriarchs)
     2. Thời kỳ Xuất Ai Cập & Đất Hứa (Exodus & Conquest)
     3. Thời kỳ Thống nhất Vương quốc & Các Vua (United Kingdom & Kings)
     4. Thời kỳ Lưu đày & Trở về (Exile & Return)
     5. Đời sống & Chức vụ của Đấng Christ (Life of Christ)
     6. Thời kỳ Hội Thánh Ban Đầu & Các Sứ Đồ (Early Church & Apostles)

3. **Backend API (FastAPI `app/routers/graph.py`)**:
   - `GET /api/graph/data`: Trả về dữ liệu mạng lưới `{ nodes: [...], edges: [...] }` hỗ trợ lọc theo loại node và tìm kiếm.
   - `GET /api/graph/entities`: Danh sách thực thể (People, Places, Events).
   - `GET /api/graph/entities/{type}/{slug}`: Chi tiết thực thể kèm quan hệ lân cận và câu gốc liên quan.
   - `GET /api/graph/timeline`: Danh sách các biến cố lịch sử theo trình tự thời gian và thời kỳ.

4. **Giao Diện Khám Phá & Đồ Thị Tri Thức Tương Tác (Explore & Graph UI)**:
   - Trang `/explore` trên Next.js 15:
     - **Tab 1: Mạng Lưới Tri Thức (Knowledge Graph)**: Trực quan hóa các node thực thể và liên kết dạng đồ thị tương tác, có tính năng kéo thả, lọc theo nhóm, nhấp node để mở bảng thông tin chi tiết (Inspector Panel).
     - **Tab 2: Dòng Thời Gian Lịch Sử (Biblical Timeline)**: Hiển thị các sự kiện theo dòng thời gian sinh động kèm năm ước tính, nhân vật tham gia và câu Kinh Thánh liên quan.
     - **Tab 3: Thư Mục Nhân Vật & Địa Danh (Entities Directory)**: Khám phá tiểu sử, bản đồ thu nhỏ và vai trò cứu chuộc.
