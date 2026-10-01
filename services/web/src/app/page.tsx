"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  BrainCircuit, 
  Network, 
  GraduationCap, 
  Server, 
  Database, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Sparkles,
  ExternalLink,
  Layers,
  Loader2,
  Bookmark
} from "lucide-react";

interface HealthStatus {
  status: string;
  api: string;
  database: string;
  pgvector: string;
  ollama: string;
}

interface VerseItem {
  global_id: number;
  verse_code: number;
  book: string;
  osis: string;
  chapter: number;
  verse: number;
  section_title: string;
  text: string;
}

interface VerseRangeResponse {
  reference: string;
  book: string;
  total_verses: number;
  verses: VerseItem[];
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  // Verse Query State
  const [searchRef, setSearchRef] = useState("Ma-thi-ơ 14:22 - 15:5");
  const [rangeData, setRangeData] = useState<VerseRangeResponse | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setHealth(data);
        } else {
          setHealth(null);
        }
      } catch {
        setHealth(null);
      } finally {
        setLoadingHealth(false);
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  async function handleFetchVerses(refToFetch?: string) {
    const target = refToFetch || searchRef;
    if (!target.trim()) return;

    setQueryLoading(true);
    setQueryError(null);

    try {
      const res = await fetch(`${apiUrl}/api/bible/verse-range?ref=${encodeURIComponent(target)}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Lỗi truy vấn HTTP ${res.status}`);
      }
      const data: VerseRangeResponse = await res.json();
      setRangeData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi trích dẫn.";
      setQueryError(msg);
      setRangeData(null);
    } finally {
      setQueryLoading(false);
    }
  }

  // Load default example once
  useEffect(() => {
    handleFetchVerses("Giăng 3:16-18");
  }, []);

  return (
    <main className="min-h-screen px-4 py-8 md:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Top Navigation / Status Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              BibleKnowledge <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Phase 0 Ready</span>
            </h1>
            <p className="text-xs text-slate-400">Hệ thống Nghiên cứu Thần học & Khám phá Kinh Thánh AI</p>
          </div>
        </div>

        {/* Live Service Indicator Badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-300">Postgres + pgvector:</span>
            {loadingHealth ? (
              <span className="text-slate-500">Đang kiểm tra...</span>
            ) : health?.database === "connected" ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sẵn sàng
              </span>
            ) : (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Đang kết nối
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">Ollama AI (RTX 5050):</span>
            {loadingHealth ? (
              <span className="text-slate-500">...</span>
            ) : health?.ollama?.includes("connected") ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> GPU Active
              </span>
            ) : (
              <span className="text-slate-400">Chờ khởi động</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">FastAPI Engine:</span>
            {health?.api === "online" ? (
              <span className="text-emerald-400 font-medium">Online (:8000)</span>
            ) : (
              <span className="text-slate-400">Offline</span>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass-panel border border-slate-700/50 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-950/40">
        <div className="max-w-3xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Khởi tạo thành công Nền tảng Phase 0
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Khám phá & Nghiên cứu Kinh Thánh Với <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">Trí Tuệ Nhân Tạo Bản Địa</span>
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Hạ tầng Docker tích hợp hoàn chỉnh: <strong>66 sách Kinh Thánh Bản dịch 1925</strong> (31.081 câu đã nạp vào PostgreSQL), kho tàng <strong>275 tài liệu nghiên cứu thần học</strong> (Wiersbe 50 tập, Zondervan), cùng công nghệ trích dẫn nghiêm ngặt có cơ sở (Grounded Citations).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a 
              href="http://localhost:8000/docs" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30"
            >
              <Server className="w-4 h-4" /> FastAPI Swagger Docs <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <div className="px-4 py-2.5 rounded-xl glass-card text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              31.081 câu kinh văn trong PostgreSQL + pgvector
            </div>
          </div>
        </div>
      </section>

      {/* 4-Layer Product Architecture Grid */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" /> Kiến trúc 4 Tầng Sản phẩm (Product Layers)
          </h3>
          <span className="text-xs text-slate-400">Theo chuẩn ROADMAP1.md</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Layer 1: Learn */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4 border-l-4 border-l-amber-500">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Tầng 1</div>
              <h4 className="text-lg font-bold text-white mt-1">Học Tập (Learn)</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Trắc nghiệm ABCD, Đố vui nhân vật (Who am I?), Thử thách thuộc lòng câu gốc, Flashcards thuật toán lặp lại ngắt quãng (SM-2 / FSRS).
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 font-medium">
              Chế độ Gamification & Tiến độ
            </div>
          </div>

          {/* Layer 2: Explore */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4 border-l-4 border-l-blue-500">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Tầng 2</div>
              <h4 className="text-lg font-bold text-white mt-1">Khám Phá (Explore)</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Trình đọc Kinh Thánh Bản dịch 1925, Bản đồ không gian Thánh địa, Dòng thời gian lịch sử đa tầng từ Cựu Ước đến Tân Ước.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 font-medium">
              66 Sách • 1.189 Đoạn • 31.081 Câu
            </div>
          </div>

          {/* Layer 3: Connect */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4 border-l-4 border-l-indigo-500">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                <Network className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Tầng 3</div>
              <h4 className="text-lg font-bold text-white mt-1">Kết Nối (Connect)</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Đồ thị tri thức Knowledge Graph (Cytoscape.js), biểu diễn tương tác giữa Nhân vật, Địa danh, Biến cố và Tham chiếu chéo giữa các sách.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 font-medium">
              Mô hình Đồ thị & Phả hệ
            </div>
          </div>

          {/* Layer 4: Research */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4 border-l-4 border-l-emerald-500">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Tầng 4</div>
              <h4 className="text-lg font-bold text-white mt-1">Nghiên Cứu (Research)</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Trợ lý AI RAG bản địa với mô hình Qwen, Embeddings BGE-M3 1024D, tra cứu ngữ nghĩa sâu sắc từ 275 nguồn thần học đáng tin cậy.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 font-medium">
              Grounded AI • Không ảo giác
            </div>
          </div>
        </div>
      </section>

      {/* Scripture Range Citation Interactive Engine */}
      <section className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-800 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" /> Hệ thống Trích dẫn Kinh Thánh Trực tiếp (Live Verse Engine)
            </h3>
            <p className="text-xs text-slate-400">
              Truy vấn trực tiếp từ PostgreSQL 16 qua FastAPI bằng Composite Verse Index.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Composite Index O(1)
          </span>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={searchRef} 
            onChange={(e) => setSearchRef(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleFetchVerses(); }}
            placeholder="Nhập câu gốc ví dụ: Giăng 3:16-18 hoặc Ma-thi-ơ 14:22 - 15:5"
            className="flex-1 bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="button"
            disabled={queryLoading}
            onClick={() => handleFetchVerses()}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            {queryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Trích Dẫn
          </button>
        </div>

        {/* Sample Quick Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400">Thử nhanh:</span>
          {[
            "Giăng 3:16",
            "Giăng 3:16-18",
            "Ma-thi-ơ 14:22 - 15:5",
            "Thi-thiên 23:1-6",
            "Sáng-thế Ký 1:1-5"
          ].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setSearchRef(sample);
                handleFetchVerses(sample);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-blue-300 font-mono transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Result Area */}
        {queryError && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{queryError}</span>
          </div>
        )}

        {rangeData && (
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                Kết quả cho: <span className="text-white font-bold">{rangeData.reference}</span>
              </span>
              <span>Tổng số câu: <strong className="text-emerald-400">{rangeData.total_verses}</strong></span>
            </div>

            <div className="max-h-96 overflow-y-auto pr-2 flex flex-col gap-2.5">
              {rangeData.verses.map((v) => (
                <div key={v.global_id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs flex flex-col gap-1 hover:border-slate-700 transition-colors">
                  {v.section_title && (
                    <span className="text-[11px] font-semibold text-blue-400/90 tracking-wide uppercase">
                      § {v.section_title}
                    </span>
                  )}
                  <p className="text-slate-200 leading-relaxed text-[13px]">
                    <span className="font-bold text-blue-300 mr-1.5 select-none">
                      {v.chapter}:{v.verse}
                    </span>
                    {v.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>BibleKnowledge © 2026 — Thiết kế cho phần cứng cá nhân (16 GB RAM / RTX 5050 8 GB VRAM)</div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>PostgreSQL 16</span>
          <span>•</span>
          <span>pgvector</span>
          <span>•</span>
          <span>Next.js 15</span>
          <span>•</span>
          <span>FastAPI</span>
        </div>
      </footer>
    </main>
  );
}
