"use client";

import React, { useState, useEffect } from "react";
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
  Check,
  User,
  Bookmark,
  Languages,
  Calendar,
  Layers,
  ArrowRight,
  Compass
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

interface MilestoneEvent {
  title: string;
  period: string;
  description: string;
}

interface RelationshipItem {
  target_name: string;
  relation: string;
}

interface CharacterStudyData {
  slug: string;
  name_vi: string;
  name_en: string;
  original_name?: string;
  title_or_role: string;
  timeline_period: string;
  summary: string;
  key_verses: string[];
  milestone_events: MilestoneEvent[];
  relationships: RelationshipItem[];
  ai_theological_portrait: string;
  spiritual_lessons: string[];
  reflection_questions: string[];
}

interface LexiconBrief {
  strong_number: string;
  language: string;
  lemma: string;
  transliteration: string;
  definition: string;
}

interface ThemeStudyData {
  theme_key: string;
  theme_name: string;
  theme_en: string;
  core_concept: string;
  lexicon_roots: LexiconBrief[];
  key_scriptures: { ref: string; text: string }[];
  ot_development: string;
  nt_fulfillment: string;
  practical_application: string;
  reflection_questions: string[];
}

interface ThemeOption {
  key: string;
  name_vi: string;
  name_en: string;
  concept: string;
}

const SAMPLE_QUESTIONS = [
  "Làm thế nào để hiểu đúng một phân đoạn Kinh Thánh theo văn cảnh lịch sử?",
  "Ý nghĩa thần học của giao ước Áp-ra-ham đối với dân Y-sơ-ra-ên là gì?",
  "Tại sao Chúa Giê-xu dùng các ẩn dụ khi giảng dạy cho đoàn dân đông?",
  "Khảo lược bối cảnh viết sách Khải-huyền và bức thư gửi bảy Hội Thánh."
];

const PRESET_CHARACTERS = [
  { slug: "si-mon-phi-e-ro", name: "Phi-e-rơ", role: "Sứ đồ của Chúa Giê-xu" },
  { slug: "su-do-phao-lo", name: "Phao-lô", role: "Sứ đồ cho Dân Ngoại" },
  { slug: "vua-da-vit", name: "Đa-vít", role: "Vua thứ hai của Y-sơ-ra-ên" },
  { slug: "moi-se", name: "Môi-se", role: "Người ban Luật pháp & Giải phóng" },
  { slug: "ap-ra-ham", name: "Áp-ra-ham", role: "Tổ phụ của Đức tin" },
  { slug: "gio-sep", name: "Giô-sép", role: "Quan Tể tướng Ai Cập" },
  { slug: "ma-ri", name: "Ma-ri", role: "Mẹ của Chúa Giê-xu" },
  { slug: "su-do-giang", name: "Giăng", role: "Môn đồ được Chúa yêu" }
];

export default function ResearchPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Active Research Mode Tab
  const [activeTab, setActiveTab] = useState<"qa" | "character" | "theme">("qa");

  // Tab 1: Cited RAG Q&A States
  const [query, setQuery] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaAnswer, setQaAnswer] = useState<CitedAnswer | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null);

  // Tab 2: Character Study States
  const [selectedCharacterSlug, setSelectedCharacterSlug] = useState("si-mon-phi-e-ro");
  const [characterSearchInput, setCharacterSearchInput] = useState("");
  const [characterLoading, setCharacterLoading] = useState(false);
  const [characterData, setCharacterData] = useState<CharacterStudyData | null>(null);
  const [characterError, setCharacterError] = useState<string | null>(null);

  // Tab 3: Theme Study States
  const [availableThemes, setAvailableThemes] = useState<ThemeOption[]>([]);
  const [selectedThemeKey, setSelectedThemeKey] = useState("faith");
  const [themeLoading, setThemeLoading] = useState(false);
  const [themeData, setThemeData] = useState<ThemeStudyData | null>(null);
  const [themeError, setThemeError] = useState<string | null>(null);

  // Load available themes on mount
  useEffect(() => {
    async function loadThemes() {
      try {
        const res = await fetch(`${apiUrl}/api/rag/themes`);
        if (res.ok) {
          const data = await res.json();
          setAvailableThemes(data);
        }
      } catch (e) {
        console.error("Failed to load themes:", e);
      }
    }
    loadThemes();
  }, [apiUrl]);

  // Tab 1 Handler: Q&A
  async function handleSearch(qToAsk?: string) {
    const targetQuery = qToAsk || query;
    if (!targetQuery.trim()) return;

    setQaLoading(true);
    setQaError(null);
    setQaAnswer(null);

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
      setQaAnswer(data);
    } catch (err: unknown) {
      setQaError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi nghiên cứu.");
    } finally {
      setQaLoading(false);
    }
  }

  // Tab 2 Handler: Character Study
  async function handleCharacterStudy(slugOrName: string) {
    if (!slugOrName.trim()) return;
    setCharacterLoading(true);
    setCharacterError(null);
    setCharacterData(null);

    try {
      const res = await fetch(`${apiUrl}/api/rag/character-study`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_or_slug: slugOrName.trim() })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Không tìm thấy nhân vật: ${slugOrName}`);
      }

      const data: CharacterStudyData = await res.json();
      setCharacterData(data);
      setSelectedCharacterSlug(data.slug);
    } catch (err: unknown) {
      setCharacterError(err instanceof Error ? err.message : "Lỗi khi phân tích nhân vật.");
    } finally {
      setCharacterLoading(false);
    }
  }

  // Tab 3 Handler: Theme Study
  async function handleThemeStudy(themeKey: string) {
    if (!themeKey) return;
    setSelectedThemeKey(themeKey);
    setThemeLoading(true);
    setThemeError(null);
    setThemeData(null);

    try {
      const res = await fetch(`${apiUrl}/api/rag/theme-study`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme_key: themeKey })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Lỗi khi khảo cứu chủ đề thần học.");
      }

      const data: ThemeStudyData = await res.json();
      setThemeData(data);
    } catch (err: unknown) {
      setThemeError(err instanceof Error ? err.message : "Lỗi khi khảo cứu chủ đề thần học.");
    } finally {
      setThemeLoading(false);
    }
  }

  function copyCitation(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedQuote(text);
    setTimeout(() => setCopiedQuote(null), 2000);
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 px-4 py-8 md:px-12 lg:px-20 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors"
            title="Quay lại Trang chính"
          >
            <Home className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Không Gian Nghiên Cứu Thần Học <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">RAG AI & Grounded Analysis</span>
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

      {/* Main Tab Switcher */}
      <nav className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("qa")}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all ${
            activeTab === "qa"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hỏi Đáp Thần Học Có Trích Dẫn</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("character");
            if (!characterData && !characterLoading) {
              handleCharacterStudy(selectedCharacterSlug);
            }
          }}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all ${
            activeTab === "character"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Chuyên Đề Nhân Vật (Character Study)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("theme");
            if (!themeData && !themeLoading) {
              handleThemeStudy(selectedThemeKey);
            }
          }}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all ${
            activeTab === "theme"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Chuyên Đề Thần Học (Theological Themes)</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* TAB 1: CITED RAG Q&A                                                      */}
      {/* ========================================================================= */}
      {activeTab === "qa" && (
        <div className="flex flex-col gap-8">
          {/* Query Input Section */}
          <section className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800 flex flex-col gap-4 bg-gradient-to-b from-slate-900/80 to-slate-950/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Nghiên cứu thần học có trích dẫn nguồn
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Chế độ Grounded Synthesis • Qwen 2.5:3b
              </span>
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Đặt câu hỏi về bối cảnh lịch sử, ý nghĩa câu Kinh Thánh, thần học giao ước..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={qaLoading || !query.trim()}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {qaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Nghiên Cứu</span>
              </button>
            </form>

            {/* Preset Sample Questions */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Gợi ý chủ đề nghiên cứu:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuery(q);
                      handleSearch(q);
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 text-slate-300 hover:text-white border border-slate-700/50 text-left transition-colors flex items-center gap-1.5"
                  >
                    <span>{q}</span>
                    <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* QA Loading state */}
          {qaLoading && (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <Loader2 className="w-14 h-14 animate-spin text-emerald-500 absolute -top-1 -left-1 opacity-70" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-white">Đang thực hiện phân tích RAG đa tầng...</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Truy vấn Vector 1024D qua 4,673 phân đoạn tài liệu chú giải &amp; kiểm chứng câu Kinh Thánh gốc.
                </p>
              </div>
            </div>
          )}

          {/* QA Error state */}
          {qaError && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{qaError}</span>
            </div>
          )}

          {/* QA Answer Render */}
          {qaAnswer && (
            <article className="flex flex-col gap-6">
              {/* Summary Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Tổng Hợp Nghiên Cứu Thần Học
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Mô hình: {qaAnswer.model} • {qaAnswer.retrieved_chunks_count} tài liệu tham khảo
                  </span>
                </div>
                <div className="text-sm md:text-base text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {qaAnswer.summary}
                </div>
              </div>

              {/* Bible Evidence List */}
              {qaAnswer.bible_evidence && qaAnswer.bible_evidence.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Căn Cứ Kinh Thánh Trực Tiếp (Kinh Thánh 1925)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qaAnswer.bible_evidence.map((b) => (
                      <div key={b.reference} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-blue-300">{b.reference}</span>
                        <p className="text-xs font-serif text-slate-300 italic leading-relaxed">
                          &ldquo;{b.text}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Theological Insights */}
              {qaAnswer.theological_insights && qaAnswer.theological_insights.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Phân Tích Chú Giải Thần Học Chuyên Sâu
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {qaAnswer.theological_insights.map((ins, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                        <h4 className="text-xs font-bold text-amber-300">{ins.heading}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{ins.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citations Verbatim */}
              {qaAnswer.citations && qaAnswer.citations.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Library className="w-4 h-4" /> Nguồn Trích Dẫn &amp; Tác Giả (Grounded Sources)
                  </h3>
                  <div className="flex flex-col gap-3">
                    {qaAnswer.citations.map((c, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">
                            📖 {c.source_title} <span className="text-slate-500 font-normal">({c.chapter})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCitation(`[${c.source_title}] "${c.quote}"`)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
                            title="Sao chép đoạn trích"
                          >
                            {copiedQuote === `[${c.source_title}] "${c.quote}"` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedQuote === `[${c.source_title}] "${c.quote}"` ? "Đã chép" : "Sao chép"}</span>
                          </button>
                        </div>
                        <p className="text-xs font-serif text-slate-300 italic bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                          &ldquo;{c.quote}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reflection Questions */}
              {qaAnswer.further_study_questions && qaAnswer.further_study_questions.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-400" /> Câu Hỏi Suy Ngẫm Mở Rộng
                  </h3>
                  <ul className="list-disc list-inside text-xs text-slate-300 flex flex-col gap-1.5 pl-2">
                    {qaAnswer.further_study_questions.map((q, idx) => (
                      <li key={idx} className="leading-relaxed">{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHARACTER STUDY ENGINE                                             */}
      {/* ========================================================================= */}
      {activeTab === "character" && (
        <div className="flex flex-col gap-6">
          {/* Character Selector Section */}
          <section className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-4 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Khảo sát chuyên đề nhân vật (Character Study Pipeline)
              </span>
              <span className="text-[11px] text-slate-500">
                Tiểu sử • Lời nói • Biến cố • Bài học thuộc linh
              </span>
            </div>

            {/* Quick Character Selection Pills */}
            <div className="flex flex-wrap gap-2">
              {PRESET_CHARACTERS.map(c => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => handleCharacterStudy(c.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedCharacterSlug === c.slug
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Search Any Character Custom Form */}
            <form 
              onSubmit={e => { e.preventDefault(); handleCharacterStudy(characterSearchInput); }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={characterSearchInput}
                onChange={e => setCharacterSearchInput(e.target.value)}
                placeholder="Hoặc gõ tên nhân vật khác (VD: 'Sa-lô-môn', 'Giô-sép', 'Ê-li')..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={characterLoading || !characterSearchInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {characterLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Khảo Sát</span>
              </button>
            </form>
          </section>

          {/* Character Study Loading */}
          {characterLoading && (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <div className="text-sm font-bold text-white">Đang tổng hợp chân dung thần học nhân vật...</div>
              <p className="text-xs text-slate-400">Trích xuất mạng quan hệ, biến cố và bài học từ Ngũ Kinh &amp; Thư Tín.</p>
            </div>
          )}

          {characterError && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{characterError}</span>
            </div>
          )}

          {/* Character Data Display */}
          {characterData && (
            <article className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Profile Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-blue-400 tracking-wider">
                      {characterData.timeline_period}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                      {characterData.name_vi}
                      {characterData.original_name && (
                        <span className="text-sm font-normal text-slate-400 italic">
                          ({characterData.original_name})
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      {characterData.title_or_role} • {characterData.name_en}
                    </p>
                  </div>

                  <Link
                    href={`/explore?tab=graph&search=${encodeURIComponent(characterData.name_vi)}`}
                    className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold text-blue-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>Xem Knowledge Graph</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
                  {characterData.summary}
                </p>

                {/* Key Scripture Anchors */}
                {characterData.key_verses && characterData.key_verses.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      Phân đoạn then chốt:
                    </span>
                    {characterData.key_verses.map(v => (
                      <Link
                        key={v}
                        href={`/bible`}
                        className="px-2.5 py-0.5 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-300 hover:text-white text-xs font-mono transition-colors"
                      >
                        ⚓ {v}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Two Column Grid: Milestones & Relationships */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Milestones */}
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Các Biến Cố &amp; Bước Ngoặt Quan Trọng
                  </h3>
                  {characterData.milestone_events && characterData.milestone_events.length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                      {characterData.milestone_events.map((ev, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col gap-1">
                          <span className="font-bold text-white">{ev.title}</span>
                          <span className="text-[10px] text-amber-500 font-semibold">{ev.period}</span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">{ev.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Không có dữ liệu biến cố chi tiết.</p>
                  )}
                </div>

                {/* Relationships */}
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Compass className="w-4 h-4" /> Mạng Lưới Quan Hệ Thuộc Linh
                  </h3>
                  {characterData.relationships && characterData.relationships.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {characterData.relationships.map((rel, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                            {rel.relation}
                          </span>
                          <span className="font-bold text-white">{rel.target_name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Không có quan hệ mạng lưới nào được ghi nhận.</p>
                  )}
                </div>
              </div>

              {/* AI Theological Portrait */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-blue-500/30 flex flex-col gap-3 shadow-lg">
                <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" /> Luận Đề Thần Học Về Cuộc Đời &amp; Chức Vụ (Ollama Qwen)
                </h3>
                <div className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {characterData.ai_theological_portrait}
                </div>
              </div>

              {/* Spiritual Lessons & Reflection */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Bài Học Thuộc Linh &amp; Câu Hỏi Tự Vấn
                </h3>
                <div className="flex flex-col gap-2">
                  {characterData.spiritual_lessons.map((lesson, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-2.5">
                      <span className="font-bold text-emerald-400">✓</span>
                      <span className="leading-relaxed">{lesson}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Câu hỏi tự soi xét cho bạn:
                  </span>
                  {characterData.reflection_questions.map((rq, idx) => (
                    <div key={idx} className="text-xs text-slate-300 italic pl-3 border-l-2 border-blue-500">
                      &ldquo;{rq}&rdquo;
                    </div>
                  ))}
                </div>
              </div>
            </article>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: THEME STUDY ENGINE                                                 */}
      {/* ========================================================================= */}
      {activeTab === "theme" && (
        <div className="flex flex-col gap-6">
          {/* Theme Selector Section */}
          <section className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-4 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Khảo luận chủ đề thần học (Theological Theme Engine)
              </span>
              <span className="text-[11px] text-slate-500">
                Nguyên ngữ Strong • Hình bóng Cựu Ước • Đấng Christ ứng nghiệm
              </span>
            </div>

            {/* Available Themes Pills */}
            <div className="flex flex-wrap gap-2">
              {availableThemes.map(th => (
                <button
                  key={th.key}
                  type="button"
                  onClick={() => handleThemeStudy(th.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedThemeKey === th.key
                      ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  {th.name_vi}
                </button>
              ))}
            </div>
          </section>

          {/* Theme Loading */}
          {themeLoading && (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <div className="text-sm font-bold text-white">Đang thực hiện phân tích chủ đề thần học...</div>
              <p className="text-xs text-slate-400">Tra cứu từ nguyên Strong Hê-bơ-rơ &amp; Hy Lạp, đối chiếu Cựu Ước &amp; Tân Ước.</p>
            </div>
          )}

          {themeError && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{themeError}</span>
            </div>
          )}

          {/* Theme Data Display */}
          {themeData && (
            <article className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Concept Banner */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3 shadow-xl">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Chủ đề cốt lõi • {themeData.theme_en}
                </span>
                <h2 className="text-3xl font-bold text-white">
                  {themeData.theme_name}
                </h2>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  {themeData.core_concept}
                </p>
              </div>

              {/* Strong's Lexicon Roots */}
              {themeData.lexicon_roots && themeData.lexicon_roots.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Languages className="w-4 h-4" /> Từ Nguyên Gốc Trong Tiếng Hê-bơ-rơ &amp; Hy Lạp (Strong&apos;s Lexicon)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {themeData.lexicon_roots.map(lr => (
                      <div key={lr.strong_number} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {lr.strong_number}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-slate-500">
                            {lr.language}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-amber-200">
                            {lr.lemma}
                          </span>
                          <span className="text-xs italic text-slate-400">
                            {lr.transliteration}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          {lr.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anchor Scriptures with Full Text */}
              {themeData.key_scriptures && themeData.key_scriptures.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Các Câu Kinh Thánh Trọng Tâm (Anchor Verses)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {themeData.key_scriptures.map(s => (
                      <div key={s.ref} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
                        <span className="font-bold text-blue-300 text-xs flex items-center gap-1">
                          ⚓ {s.ref}
                        </span>
                        {s.text ? (
                          <p className="text-xs font-serif text-slate-300 italic leading-relaxed">
                            &ldquo;{s.text}&rdquo;
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Typological Development & Christological Fulfillment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Cựu Ước • Hình Bóng &amp; Tiến Trình
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {themeData.ot_development}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Tân Ước • Ứng Nghiệm Nơi Đấng Christ
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {themeData.nt_fulfillment}
                  </p>
                </div>
              </div>

              {/* Practical Spiritual Application */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-emerald-500/30 flex flex-col gap-3 shadow-lg">
                <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Ứng Dụng Thuộc Linh Cho Đời Sống Ngày Nay
                </h3>
                <div className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {themeData.practical_application}
                </div>
              </div>

              {/* Reflection Questions */}
              {themeData.reflection_questions && themeData.reflection_questions.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" /> Câu Hỏi Suy Ngẫm Thực Tiễn
                  </h3>
                  <div className="flex flex-col gap-2">
                    {themeData.reflection_questions.map((rq, idx) => (
                      <div key={idx} className="text-xs text-slate-300 italic pl-3 border-l-2 border-amber-500">
                        &ldquo;{rq}&rdquo;
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      )}
    </main>
  );
}
