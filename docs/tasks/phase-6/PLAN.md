# Phase 6 Implementation Plan — Biblical Geography, Interactive Map & Spatial Journeys

> **Nhiệm vụ**: Triển khai Module **Bản Đồ Không Gian Thánh Địa & Các Hành Trình Địa Lý Kinh Thánh (Spatial Journeys & Bible Map)** theo chuẩn `ROADMAP1.md` (Mục 1, 9, 36) và `docs/ARCHITECTURE.md`.  
> **Nền tảng**: PostgreSQL 16 (`places`, `events`, `knowledge_edges`), hệ tọa độ địa lý Thánh địa & Cận Đông cổ đại, và bản đồ tương tác vector SVG đa tầng trên Next.js 15.

---

## 1. Mục tiêu Cốt lõi (Objectives)

1. **Hệ Thống Dữ Liệu Tọa Độ Địa Lý Thánh Địa (Biblical Geospatial Data)**:
   - Cung cấp tọa độ địa lý chính xác (`latitude`, `longitude`) của các địa danh trọng yếu: Giê-ru-sa-lem, Bết-lê-hem, Ca-na, Biển Ga-li-lê, Núi Si-na-i, Na-xa-rét, U-rơ, Ha-ran, Ai Cập, Ba-by-lôn, Đa-mách, Cô-rinh-tô, Ê-phê-sô, Rô-ma.
   - API `GET /api/graph/places`: Truy xuất danh sách địa danh kèm vị trí, tên hiện đại, và các sự kiện/nhân vật liên quan.

2. **Các Tuyến Hành Trình Lịch Sử Cứu Rỗi (Biblical Spatial Journeys)**:
   - Xây dựng 4 tuyến hành trình kinh điển:
     1. **Hành trình của Áp-ra-ham**: Từ xứ U-rơ Canh-đê $\rightarrow$ Ha-ran $\rightarrow$ Si-chem $\rightarrow$ Bê-tên $\rightarrow$ Ai Cập $\rightarrow$ Hếp-rôn $\rightarrow$ Núi Mô-ri-a.
     2. **Cuộc Xuất Ai Cập & Vượt Biển Đỏ**: Từ Ram-se Ai Cập $\rightarrow$ Biển Đỏ $\rightarrow$ Ma-ra $\rightarrow$ Núi Si-na-i $\rightarrow$ Ca-đe-bạt-nê-a $\rightarrow$ Núi Nê-bô / Đất Hứa.
     3. **Chức vụ Của Chúa Giê-xu**: Bết-lê-hem $\rightarrow$ Na-xa-rét $\rightarrow$ Sông Giô-đanh $\rightarrow$ Ca-na $\rightarrow$ Ca-bê-na-um & Biển Ga-li-lê $\rightarrow$ Sa-ma-ri $\rightarrow$ Giê-ru-sa-lem.
     4. **Các Chuyến Truyền Giáo Của Sứ Đồ Phao-lô**: Tuyến đường truyền giáo từ An-ti-ốt qua Đảo Chíp, Tiểu Á, Hy Lạp (Phi-líp, Cô-rinh-tô, A-thên) và chuyến đi La-mã.
   - API `GET /api/graph/journeys`: Cung cấp danh sách các trạm dừng chân (Waypoints), tọa độ, sự kiện và câu Kinh Thánh tương ứng.

3. **Giao Diện Bản Đồ Tương Tác Sống Động (Interactive Map UI)**:
   - Tích hợp trực tiếp vào `/explore` (Tab "Bản Đồ Thánh Địa") hoặc `/map`:
     - Bản đồ đồ họa Thánh địa & Cận Đông cổ đại với hiệu ứng Dark Parchment / Glowing Map Pins.
     - Lựa chọn từng hành trình để hiển thị đường nét đứt phát sáng (animated dotted polyline) kết nối qua các trạm dừng.
     - Bảng điều khiển lộ trình (Journey Stepper): Cho phép người dùng chuyển qua từng chặng để đọc biến cố và câu Kinh Thánh liên quan.
