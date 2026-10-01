"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  BrainCircuit, 
  Search, 
  Sparkles, 
  BookOpen, 
  ExternalLink, 
  ChevronRight, 
  Home, 
  Loader2, 
  Quote, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Library,
  Copy,
  Check
} from "lucide-react";

interface BibleEvidence {
  reference: string;
  text: string;
}

interface StudyInsight {
  heading: string;
  content: string;
}

interface Citation {
  source_title: string;
  chapter: string;
  quote: string;
}

interface CitedAnswer {
  summary: string;
  bible_evidence: BibleEvidence[];
  theological_insights: StudyInsight[];
  citations: Citation[];
  further_study_questions: string[];
  retrieved_chunks_count: number;
  model: string;
}

const SAMPLE_QUESTIONS = [
  "Làm thế nào để hiểu đúng một phân đoạn Kinh Thánh theo văn cảnh lịch sử?",
  "Ý nghĩa thần học của giao ước Áp-ra-ham đối với dân Y-sơ-ra-ên là gì?",
  "Tại sao Chúa Giê-xu dùng các ẩn dụ khi giảng dạy cho đoàn dân đông?",
  "Khảo lược bối cảnh viết sách Khải-huyền và bức thư gửi bảy Hội Thánh."
];

export default function ResearchPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<CitedAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null);

  async function handleSearch(qToAsk?: string) {
    const targetQuery = qToAsk || query;
    if (!targetQuery.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await fetch(`${apiUrl}/api/rag/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: targetQuery })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Lỗi máy chủ HTTP ${res.status}`);
      }

      const data: CitedAnswer = await res.json();
      setAnswer(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi nghiên cứu.");
    } finally {
      setLoading(false);
    }
  }

  function copyCitation(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedQuote(text);
    setTimeout(() => setCopiedQuote(null), 2000);
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 px-4 py-8 md:px-12 lg:px-20 max-w-6xl mx-auto flex flex-col gap-10">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors"
            title="Quay lại Trang chính"
          >
            <Home className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Không Gian Nghiên Cứu Thần Học <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">RAG AI</span>
              </h1>
              <p className="text-xs text-slate-400">Trợ lý nghiên cứu có căn cứ • BGE-M3 1024D • 275 Sách chú giải</p>
            </div>
          </div>
        </div>

        <Link
          href="/bible"
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>Mở Kinh Thánh 1925</span>
        </Link>
      </header>

      {/* Query Input Section */}
      <section className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800 flex flex-col gap-4 bg-gradient-to-b from-slate-900/80 to-slate-950/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Nghiên cứu thần học có trích dẫn nguồn
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            PostgreSQL pgvector • HNSW Cosine Search
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input 
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
              placeholder="Đặt câu hỏi thần học, nhân vật, sự kiện hoặc nhập câu gốc..."
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSearch()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            Nghiên Cứu
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-slate-400">Gợi ý câu hỏi:</span>
          {SAMPLE_QUESTIONS.map(sample => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setQuery(sample);
                handleSearch(sample);
              }}
              className="px-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-300 transition-colors text-left"
            >
              {sample}
            </button>
          ))}
        </div>
      </section>

      {/* Loading Indicator */}
      {loading && (
        <div className="p-12 rounded-3xl glass-panel border border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <h3 className="text-base font-bold text-white">Đang thực hiện Semantic Search & Tra cứu 275 sách...</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Mô hình BGE-M3 đang quét không gian vector 1024 chiều trong PostgreSQL và Qwen AI đang tổng hợp câu trả lời dựa trên căn cứ khoa học.
          </p>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* RAG Answer Display */}
      {answer && (
        <div className="flex flex-col gap-8 animate-in fade-in-50 duration-300">
          {/* Main Synthesized Response */}
          <section className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Tổng hợp nghiên cứu thần học có căn cứ
              </span>
              <span className="text-xs text-slate-400">
                Đã đối chiếu <strong>{answer.retrieved_chunks_count} đoạn trích</strong> từ kho học thuật
              </span>
            </div>

            {/* Answer Content */}
            <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
              {answer.summary}
            </div>
          </section>

          {/* Scripture Evidence if matched */}
          {answer.bible_evidence && answer.bible_evidence.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Kinh văn minh chứng (Bible Evidence)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {answer.bible_evidence.map((b, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/30 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-blue-300">{b.reference}</span>
                    <p className="text-xs font-serif text-slate-200 italic leading-relaxed">
                      &ldquo;{b.text}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Scholarly Citations Section */}
          {answer.citations && answer.citations.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Library className="w-4 h-4" /> Nguồn tài liệu học thuật trích dẫn (Scholarly Citations)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {answer.citations.map((c, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-3 hover:border-slate-700 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-white line-clamp-1">
                        {c.source_title}
                      </span>
                      <span className="text-[11px] text-slate-400 line-clamp-1">
                        Chương: {c.chapter}
                      </span>
                      <p className="text-xs text-slate-300 font-serif italic mt-2 line-clamp-4 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                        &ldquo;{c.quote}&rdquo;
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyCitation(`${c.source_title} (${c.chapter}): "${c.quote}"`)}
                      className="self-end text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copiedQuote?.includes(c.quote) ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedQuote?.includes(c.quote) ? "Đã chép" : "Trích dẫn"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Further Study Questions */}
          {answer.further_study_questions && answer.further_study_questions.length > 0 && (
            <section className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Câu hỏi gợi ý suy ngẫm sâu hơn (Further Reflection)
              </h3>
              <div className="flex flex-col gap-2">
                {answer.further_study_questions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(q);
                      handleSearch(q);
                    }}
                    className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white text-left flex items-center justify-between gap-2 transition-colors"
                  >
                    <span>{idx + 1}. {q}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>BibleKnowledge RAG Engine — Tôn trọng bản văn Kinh Thánh & Minh bạch trích dẫn</div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>BGE-M3 (1024D)</span>
          <span>•</span>
          <span>Qwen2.5</span>
          <span>•</span>
          <span>PostgreSQL 16 pgvector</span>
        </div>
      </footer>
    </main>
  );
}
