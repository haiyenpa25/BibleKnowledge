# BibleKnowledge

> Hệ thống quản lý, tra cứu và nghiên cứu tri thức Kinh Thánh thông minh (Smart Biblical Knowledge & Research System) kết hợp Google Antigravity, NotebookLM MCP và kiến trúc Antigravity Pro.

---

## 📖 Giới thiệu dự án

**BibleKnowledge** là nền tảng tri thức Kinh Thánh toàn diện, được thiết kế để phục vụ việc tra cứu, nghiên cứu thần học, phân tích bản văn và hỏi đáp thông minh dựa trên các nguồn tài liệu uy tín đã được xác minh.

### 🌟 Tính năng nổi bật
* **Kho tài liệu thần học đồ sộ**: Tích hợp hơn 275 đầu sách, bộ bách khoa toàn thư, từ điển và bình luận Kinh Thánh (Bộ Warren Wiersbe BE Series 50 tập, Zondervan Encyclopedia, NIV Study Commentary, v.v.).
* **Dữ liệu cấu trúc cây (Hierarchical Tree JSON)**: Toàn bộ sách được phân cấp chuẩn: Sách ➔ Chương ➔ Phân đoạn Kinh Thánh ➔ Tiểu mục ➔ Đoạn văn.
* **Grounded AI Research với NotebookLM**:
  * **Domain Knowledge**: Notebook `NGHIÊN CỨU KINH THÁNH © AICoDoc.com` (275 tài liệu nguồn).
  * **Architecture Knowledge**: Notebook `App_Architecture_Docs` (Tài liệu kiến trúc và quy chuẩn phát triển).
* **Chuẩn hóa Antigravity Pro**: Tuân thủ quy trình Git-first, bảo mật secret, chất lượng kiểm thử và kiến trúc module hóa.

---

## 🗂️ Cấu trúc thư mục

```text
BibleKnowledge/
├── .agents/                    # Cấu hình AI Agent (Skills, Workflows, MCP)
│   ├── AGENTS.md               # Quy chuẩn hoạt động của Agent
│   ├── mcp_config.json         # Cấu hình MCP server
│   ├── skills/                 # Bộ kỹ năng chuyên biệt (api, database, testing...)
│   └── workflows/              # Quy trình làm việc (research, plan, implement...)
├── data/                       # Dữ liệu tri thức cục bộ
│   ├── catalog.json            # Mục lục tổng hợp 275 sách (metadata, số chương, tác giả)
│   └── sources/                # 275 sách định dạng JSON cấu trúc cây phân cấp
├── docs/                       # Tài liệu chuẩn hóa dự án (Canonical Documentation)
│   ├── ARCHITECTURE.md         # Kiến trúc hệ thống
│   ├── DATABASE.md             # Thiết kế CSDL & Schema
│   ├── API.md                  # Hợp đồng & Đặc tả API
│   ├── SECURITY.md             # Quy tắc bảo mật
│   ├── KNOWLEDGE-SOURCES.md    # Chiến lược nguồn tri thức & NotebookLM
│   ├── ROADMAP.md              # Lộ trình phát triển
│   ├── ADR/                    # Quyết định kiến trúc (Architecture Decision Records)
│   └── tasks/                  # Kế hoạch & Báo cáo từng Task
├── scripts/                    # Scripts tự động hóa
│   ├── download_notebook_sources.js # Tải tài liệu từ NotebookLM
│   └── convert_sources_to_tree.js   # Chuyển đổi dữ liệu sang dạng cây
├── ANTIGRAVITY_PRO_BOOTSTRAP.md
└── README.md
```

---

## 🚀 Bắt đầu nhanh

### 1. Yêu cầu môi trường
* Node.js >= 18
* XAMPP (Apache / MySQL / PHP)
* Git

### 2. Cài đặt MCP kết nối NotebookLM
```bash
npm install -g @roomi-fields/notebooklm-mcp@3.2.0
notebooklm-mcp setup-auth
```

### 3. Đồng bộ dữ liệu sách
```bash
# Tải và cập nhật 275 sách từ NotebookLM về data/sources/
node scripts/download_notebook_sources.js
```

---

## 📜 Giấy phép & Đóng góp
Dự án được phát triển và vận hành bởi **haiyenpa25** trên nền tảng Antigravity IDE.
