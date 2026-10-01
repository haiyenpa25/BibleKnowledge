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
  Compass,
  Bot,
  Workflow,
  Volume2,
  BookMarked,
  ShieldCheck,
  SplitSquareVertical,
  Filter,
  BarChart3,
  BookA
} from "lucide-react";

// --- Types ---
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

// AI Agent Research Interfaces (§51)
interface AgentResearchStep {
  step_number: number;
  title: string;
  description: string;
  status: string;
  findings_count: number;
}

interface ComparativeColumn {
  dimension: string;
  perspective_a: string;
  perspective_b: string;
  synthesis: string;
}

interface AgentResearchData {
  query: string;
  focus: string;
  steps: AgentResearchStep[];
  executive_summary: string;
  scripture_evidence: BibleEvidence[];
  knowledge_entities: {
    slug: string;
    label: string;
    type: string;
    summary: string;
    connections: string[];
  }[];
  lexicon_roots: {
    strong_number: string;
    language: string;
    lemma: string;
    transliteration: string;
    pronunciation: string;
    definition: string;
    theological_significance: string;
    occurrences: number;
  }[];
  comparative_matrix?: ComparativeColumn[];
  historical_theological_context: string;
  synthesis_analysis: string;
  citations: Citation[];
  hermeneutical_guardrails: string;
  further_investigation: string[];
}

// Strong's Lexicon & Concordance Interfaces (§37, §49)
interface LexiconItem {
  strong_number: string;
  language: string;
  lemma: string;
  transliteration: string;
  pronunciation: string;
  part_of_speech: string;
  definition: string;
  theological_significance: string;
  occurrences_count: number;
  key_verses: string[];
}

interface ConcordanceVerse {
  global_id: number;
  verse_code: number;
  reference: string;
  book_code: string;
  testament: string;
  chapter: number;
  verse: number;
  text: string;
}

interface ConcordanceData {
  search_term: string;
  clean_keyword: string;
  lexicon_info?: {
    strong_number: string;
    language: string;
    lemma: string;
    transliteration: string;
    definition: string;
  };
  distribution: {
    old_testament: number;
    new_testament: number;
    total_matches: number;
  };
  verses: ConcordanceVerse[];
}

// Sample presets
const PRESET_AGENT_QUERIES = [
  "So sánh quan điểm về Sự Công Bình và Đức Tin giữa Sứ đồ Phao-lô trong Rô-ma và Gia-cơ trong Thư tín Gia-cơ",
  "Ý nghĩa giao ước trong Cựu Ước và sự ứng nghiệm tối hậu qua Giao Ước Mới trong Huyết Chúa Giê-xu",
  "Biểu tượng Chiên Con Lễ Vượt Qua từ Xuất Ê-díp-tô Ký đến Chiên Con bị giết trong Khải Huyền",
  "Mối quan hệ giữa Ân điển (Charis) và Luật pháp (Torah) trong toàn cảnh Cứu Rỗi"
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
  const [activeTab, setActiveTab] = useState<"agent" | "lexicon" | "qa" | "character" | "theme">("agent");

  // --- Tab 1: AI Agent Research States (§51) ---
  const [agentQuery, setAgentQuery] = useState(PRESET_AGENT_QUERIES[0]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentData, setAgentData] = useState<AgentResearchData | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);

  // --- Tab 2: Strong's Lexicon & Concordance States (§37, §49) ---
  const [lexiconList, setLexiconList] = useState<LexiconItem[]>([]);
  const [lexiconFilterLang, setLexiconFilterLang] = useState<"all" | "greek" | "hebrew">("all");
  const [lexiconSearch, setLexiconSearch] = useState("");
  const [lexiconLoading, setLexiconLoading] = useState(false);
  const [selectedLexiconItem, setSelectedLexiconItem] = useState<LexiconItem | null>(null);
  const [concordanceLoading, setConcordanceLoading] = useState(false);
  const [concordanceData, setConcordanceData] = useState<ConcordanceData | null>(null);

  // --- Tab 3: Cited RAG Q&A States ---
  const [qaQuery, setQaQuery] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaAnswer, setQaAnswer] = useState<CitedAnswer | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null);

  // --- Tab 4: Character Study States ---
  const [selectedCharacterSlug, setSelectedCharacterSlug] = useState("si-mon-phi-e-ro");
  const [characterSearchInput, setCharacterSearchInput] = useState("");
  const [characterLoading, setCharacterLoading] = useState(false);
  const [characterData, setCharacterData] = useState<CharacterStudyData | null>(null);
  const [characterError, setCharacterError] = useState<string | null>(null);

  // --- Tab 5: Theme Study States ---
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

  // Load Lexicon items when Lexicon tab is selected
  useEffect(() => {
    if (activeTab === "lexicon" && lexiconList.length === 0) {
      fetchLexicon();
    }
  }, [activeTab]);

  async function fetchLexicon(langFilter?: string, queryStr?: string) {
    setLexiconLoading(true);
    try {
      const params = new URLSearchParams();
      if (langFilter && langFilter !== "all") params.append("lang", langFilter);
      if (queryStr && queryStr.trim()) params.append("q", queryStr.trim());
      params.append("limit", "60");

      const res = await fetch(`${apiUrl}/api/bible/lexicon?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLexiconList(data);
      }
    } catch (e) {
      console.error("Failed to load lexicon:", e);
    } finally {
      setLexiconLoading(false);
    }
  }

  // Pronunciation audio helper
  function playPronunciation(textToSpeak: string, lang: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang === "greek" ? "el-GR" : "he-IL";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Fetch Concordance for a specific strong number or keyword
  async function handleOpenConcordance(strongNumber: string, item: LexiconItem) {
    setSelectedLexiconItem(item);
    setConcordanceLoading(true);
    setConcordanceData(null);

    try {
      const res = await fetch(`${apiUrl}/api/bible/concordance?strong_number=${encodeURIComponent(strongNumber)}&limit=25`);
      if (res.ok) {
        const data = await res.json();
        setConcordanceData(data);
      }
    } catch (e) {
      console.error("Failed to fetch concordance:", e);
    } finally {
      setConcordanceLoading(false);
    }
  }

  // Tab 1: AI Agent Research Handler (§51)
  async function handleRunAgentResearch(targetQ?: string) {
    const q = targetQ || agentQuery;
    if (!q.trim()) return;

    setAgentLoading(true);
    setAgentError(null);
    setAgentData(null);

    try {
      const res = await fetch(`${apiUrl}/api/rag/agent-research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim(), focus: "comparative" })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Lỗi từ AI Agent (HTTP ${res.status})`);
      }

      const data: AgentResearchData = await res.json();
      setAgentData(data);
    } catch (err: unknown) {
      setAgentError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi AI Agent nghiên cứu.");
    } finally {
      setAgentLoading(false);
    }
  }

  // Tab 3 Handler: Q&A
  async function handleSearch(qToAsk?: string) {
    const targetQuery = qToAsk || qaQuery;
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

  // Tab 4 Handler: Character Study
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

  // Tab 5 Handler: Theme Study
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-500/30 flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Không Gian Nghiên Cứu Thần Học Chuyên Sâu <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">Autonomous AI Agent §51</span>
              </h1>
              <p className="text-xs text-slate-400">Đồ thị Tri thức • Căn ngữ Strong&apos;s Greek &amp; Hebrew • 4,673 Chunks RAG • 275 Sách Chú giải</p>
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

      {/* Main Tab Switcher (5 High-End Modes) */}
      <nav className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs md:text-sm">
        {/* Mode 1: AI Agent Research */}
        <button
          type="button"
          onClick={() => setActiveTab("agent")}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
            activeTab === "agent"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Bot className="w-4 h-4 text-purple-200" />
          <span>AI Agent Nghiên Cứu Đa Tầng</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-400/20 text-purple-300 uppercase tracking-wider">Mới §51</span>
        </button>

        {/* Mode 2: Strong's Lexicon & Concordance */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("lexicon");
            if (lexiconList.length === 0) fetchLexicon();
          }}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
            activeTab === "lexicon"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Languages className="w-4 h-4 text-cyan-200" />
          <span>Nguyên Ngữ &amp; Strong&apos;s Lexicon</span>
        </button>

        {/* Mode 3: Grounded Q&A */}
        <button
          type="button"
          onClick={() => setActiveTab("qa")}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
            activeTab === "qa"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Hỏi Đáp Thần Học Có Trích Dẫn</span>
        </button>

        {/* Mode 4: Character Study */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("character");
            if (!characterData && !characterLoading) handleCharacterStudy(selectedCharacterSlug);
          }}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
            activeTab === "character"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <User className="w-4 h-4 text-blue-200" />
          <span>Chuyên Khảo Nhân Vật</span>
        </button>

        {/* Mode 5: Theological Themes */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("theme");
            if (!themeData && !themeLoading) handleThemeStudy(selectedThemeKey);
          }}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
            activeTab === "theme"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Layers className="w-4 h-4 text-amber-200" />
          <span>Chuyên Đề Thần Học</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* TAB 1: AUTONOMOUS AI AGENT RESEARCH (§51)                 */}
      {/* ======================================================== */}
      {activeTab === "agent" && (
        <div className="flex flex-col gap-6">
          {/* Intro Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/50 border border-purple-500/30 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Bot className="w-4 h-4" /> Autonomous Multi-Hop Study Workflow
            </div>
            <h2 className="text-xl font-bold text-white">
              AI Agent Khảo Khảo &amp; So Sánh Thần Học Tự Động
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Khi tiếp nhận một câu hỏi phức tạp, AI Agent tự động lập kế hoạch 6 bước: 
              <strong> 1) Phân rã câu hỏi</strong> &rarr; 
              <strong> 2) Khai thác Kinh Thánh Cựu/Tân Ước</strong> &rarr; 
              <strong> 3) Mở rộng Knowledge Graph</strong> &rarr; 
              <strong> 4) Tra cứu nguyên ngữ Strong&apos;s</strong> &rarr; 
              <strong> 5) Truy vấn văn liệu 275 sách</strong> &rarr; 
              <strong> 6) Tổng hợp bảng ma trận đối chiếu</strong> có guardrails bảo vệ chân lý tuyệt đối.
            </p>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">Gợi ý chủ đề chuyên sâu:</span>
              {PRESET_AGENT_QUERIES.map((pq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAgentQuery(pq);
                    handleRunAgentResearch(pq);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-purple-900/30 hover:bg-purple-800/50 border border-purple-700/40 text-[11px] text-purple-200 transition-colors text-left"
                >
                  {pq.length > 55 ? pq.substring(0, 55) + "..." : pq}
                </button>
              ))}
            </div>
          </div>

          {/* Query Input Box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAgentResearch();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <textarea
                value={agentQuery}
                onChange={(e) => setAgentQuery(e.target.value)}
                placeholder="Nhập câu hỏi so sánh hoặc nghiên cứu thần học đa tầng..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={agentLoading || !agentQuery.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all self-end sm:self-auto"
            >
              {agentLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Agent Đang Phân Tích...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  <span>Khởi Chạy Agent §51</span>
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {agentError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{agentError}</span>
            </div>
          )}

          {/* Loading Animation with 6 Hops Preview */}
          {agentLoading && (
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-purple-500/30 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 animate-pulse">
                <Workflow className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Agent đang thực hiện quy trình nghiên cứu đa tầng</h3>
                <p className="text-xs text-slate-400 mt-1">Đang khai thác phân đoạn Kinh Thánh &bull; Duyệt đồ thị tri thức &bull; Đối chiếu căn ngữ Strong&apos;s &bull; Tổng hợp Qwen 3B</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 w-full max-w-3xl mt-4">
                {["1. Lập Kế Hoạch", "2. Khai Thác Kinh Thánh", "3. Duyệt Đồ Thị", "4. Tra Strong's", "5. RAG Văn Liệu", "6. Hài Hòa Thần Học"].map((st, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-purple-900/40 text-[10px] text-purple-300 flex items-center justify-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Display */}
          {agentData && !agentLoading && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-500">
              {/* Step Progress Tracker */}
              <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Workflow className="w-3.5 h-3.5 text-purple-400" /> Tiến Trình Khảo Sát Đa Tầng Của Agent ({agentData.steps.length} Bước Đã Hoàn Tất)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                  {agentData.steps.map((st) => (
                    <div key={st.step_number} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-[10px] flex-shrink-0">
                        {st.step_number}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{st.title}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {st.findings_count} mục
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{st.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-purple-950/30 via-slate-900 to-indigo-950/30 border border-purple-500/40 flex flex-col gap-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Tóm Lược Thần Học Trọng Tâm (Executive Summary)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Sola Fide &amp; Sola Gratia
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans font-medium">
                  {agentData.executive_summary}
                </p>
              </div>

              {/* Comparative Matrix Table (If available) */}
              {agentData.comparative_matrix && agentData.comparative_matrix.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                      <SplitSquareVertical className="w-4 h-4 text-indigo-400" /> Ma Trận So Sánh Đối Chiếu Thần Học (Comparative Matrix)
                    </h3>
                    <span className="text-[10px] text-slate-400">4 Chiều Kích Khảo Sát</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3 bg-slate-950/50 rounded-tl-xl w-1/5">Chiều Kích So Sánh</th>
                          <th className="py-2.5 px-3 bg-blue-950/20 text-blue-300 w-2/5">Góc Nhìn Phao-lô (Thư Rô-ma)</th>
                          <th className="py-2.5 px-3 bg-amber-950/20 text-amber-300 w-2/5">Góc Nhìn Gia-cơ (Thư Gia-cơ)</th>
                          <th className="py-2.5 px-3 bg-emerald-950/20 text-emerald-300 rounded-tr-xl w-2/5">Tổng Hợp Hòa Hợp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {agentData.comparative_matrix.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-200 align-top">
                              {row.dimension}
                            </td>
                            <td className="py-3 px-3 text-slate-300 leading-relaxed align-top bg-blue-950/5">
                              {row.perspective_a}
                            </td>
                            <td className="py-3 px-3 text-slate-300 leading-relaxed align-top bg-amber-950/5">
                              {row.perspective_b}
                            </td>
                            <td className="py-3 px-3 text-emerald-200 leading-relaxed align-top bg-emerald-950/5 font-medium">
                              {row.synthesis}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Scriptural Foundation Cards */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Các Phân Đoạn Kinh Thánh Nền Tảng (Scripture Evidence)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agentData.scripture_evidence.map((s, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-blue-300 text-xs flex items-center gap-1.5">
                          📖 {s.reference}
                        </span>
                        <p className="text-xs font-serif text-slate-300 italic leading-relaxed">
                          &ldquo;{s.text}&rdquo;
                        </p>
                      </div>
                      <Link
                        href={`/bible?book=${encodeURIComponent(s.reference.split(" ")[0])}`}
                        className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 self-end transition-colors"
                      >
                        <span>Mở trong Bible Reader</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lexicon Roots & Knowledge Graph Entities (2 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Greek & Hebrew Lexicon */}
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Languages className="w-4 h-4" /> Căn Ngữ Hy Lạp &amp; Hê-bơ-rơ (Strong&apos;s Roots)
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {agentData.lexicon_roots.map((lr) => (
                      <div key={lr.strong_number} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300 font-mono">
                              {lr.strong_number}
                            </span>
                            <span className="font-serif text-sm">{lr.lemma}</span>
                            <span className="text-[11px] text-slate-400 italic">({lr.transliteration})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => playPronunciation(lr.lemma, lr.language)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">{lr.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Knowledge Graph Connections */}
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <Workflow className="w-4 h-4" /> Thực Thể &amp; Mối Quan Hệ Trong Knowledge Graph
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {agentData.knowledge_entities.map((ke) => (
                      <div key={ke.slug} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-purple-300">{ke.label}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-500/10 text-purple-400 uppercase">
                            {ke.type}
                          </span>
                        </div>
                        {ke.summary ? (
                          <p className="text-[11px] text-slate-300 leading-snug">{ke.summary.substring(0, 140)}...</p>
                        ) : null}
                        {ke.connections && ke.connections.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ke.connections.map((c, i) => (
                              <span key={i} className="text-[9px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comprehensive Synthesis Analysis */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-indigo-500/30 flex flex-col gap-3 shadow-xl">
                <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Báo Cáo Tổng Hợp Thần Học Chuyên Sâu (Theological Synthesis)
                </h3>
                <div className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {agentData.synthesis_analysis}
                </div>
              </div>

              {/* Theological Library Citations */}
              {agentData.citations && agentData.citations.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Library className="w-4 h-4" /> Trích Dẫn Từ Thư Viện 275 Sách Thần Học
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {agentData.citations.map((c, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-xs text-emerald-300">{c.source_title}</span>
                          <span className="text-[10px] text-slate-400">{c.chapter}</span>
                          <p className="text-[11px] text-slate-300 italic leading-snug mt-1">&ldquo;{c.quote}&rdquo;</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyCitation(c.quote)}
                          className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 self-end transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedQuote === c.quote ? "Đã chép" : "Chép trích dẫn"}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hermeneutical Guardrails Alert Box (§39) */}
              <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/40 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Nguyên Tắc Bảo Vệ Chân Lý &amp; Kiểm Định Giải Kinh (§39 Guardrails)
                </div>
                <div className="text-xs text-amber-200/90 leading-relaxed whitespace-pre-wrap font-sans">
                  {agentData.hermeneutical_guardrails}
                </div>
              </div>

              {/* Further Investigation */}
              {agentData.further_investigation && agentData.further_investigation.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-400" /> Hướng Nghiên Cứu &amp; Đối Chiếu Tiếp Theo
                  </h3>
                  <div className="flex flex-col gap-2">
                    {agentData.further_investigation.map((fq, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAgentQuery(fq);
                          handleRunAgentResearch(fq);
                        }}
                        className="text-xs text-left text-purple-300 hover:text-purple-200 pl-3 border-l-2 border-purple-500 py-1 transition-colors hover:bg-purple-950/20 rounded-r-lg"
                      >
                        &rarr; {fq}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ORIGINAL LANGUAGE & STRONG'S LEXICON (§37, §49)   */}
      {/* ======================================================== */}
      {activeTab === "lexicon" && (
        <div className="flex flex-col gap-6">
          {/* Header & Filter Controls */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Languages className="w-4 h-4" /> Strong&apos;s Greek &amp; Hebrew Lexicon Explorer
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Từ Điển Nguyên Ngữ &amp; Đối Chiếu Concordance
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Khảo cứu căn ngữ gốc Hy Lạp (Tân Ước) và Hê-bơ-rơ (Cựu Ước) với phát âm ngữ âm và số lần xuất hiện
              </p>
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLexiconFilterLang("all");
                  fetchLexicon("all", lexiconSearch);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  lexiconFilterLang === "all" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Tất Cả ({lexiconList.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setLexiconFilterLang("greek");
                  fetchLexicon("greek", lexiconSearch);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  lexiconFilterLang === "greek" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Hy Lạp (Greek - G)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLexiconFilterLang("hebrew");
                  fetchLexicon("hebrew", lexiconSearch);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  lexiconFilterLang === "hebrew" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Hê-bơ-rơ (Hebrew - H)
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lexiconSearch}
              onChange={(e) => {
                setLexiconSearch(e.target.value);
                fetchLexicon(lexiconFilterLang, e.target.value);
              }}
              placeholder="Tìm theo số Strong (G4102, H7965), chữ Hy Lạp/Hê-bơ-rơ, phiên âm hoặc định nghĩa tiếng Việt..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Lexicon Grid */}
          {lexiconLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-slate-400">Đang tải từ điển nguyên ngữ...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lexiconList.map((item) => (
                <div
                  key={item.strong_number}
                  className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 shadow-md group"
                >
                  <div className="flex flex-col gap-2">
                    {/* Card Top: Strong number, Lang & Pronunciation */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {item.strong_number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          item.language === "greek" ? "bg-blue-500/20 text-blue-300" : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {item.language}
                        </span>
                        <button
                          type="button"
                          onClick={() => playPronunciation(item.lemma, item.language)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                          title="Nghe phát âm chuẩn"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Word Lemma in original alphabet & Transliteration */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-serif text-2xl font-bold text-white tracking-wide">
                        {item.lemma}
                      </span>
                      <span className="text-xs text-cyan-300 font-sans italic">
                        {item.transliteration}
                      </span>
                    </div>

                    {item.pronunciation && (
                      <span className="text-[10px] text-slate-400">
                        Phát âm: <span className="font-mono text-slate-300">[{item.pronunciation}]</span>
                      </span>
                    )}

                    {/* Part of Speech & Definition */}
                    <p className="text-xs text-slate-300 font-sans leading-relaxed mt-1">
                      {item.definition}
                    </p>

                    {item.theological_significance && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-2 mt-1 border-l-2 border-cyan-500/40 pl-2">
                        {item.theological_significance}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom: Occurrences & Concordance Button */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                      Xuất hiện: <strong className="text-white">{item.occurrences_count.toLocaleString()}</strong> lần
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenConcordance(item.strong_number, item)}
                      className="px-3 py-1 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-600/30 text-xs font-bold text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      <BookA className="w-3.5 h-3.5" />
                      <span>Concordance</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Concordance Modal / Flyout */}
          {selectedLexiconItem && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0b101c] border border-cyan-500/40 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {selectedLexiconItem.strong_number}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>{selectedLexiconItem.lemma}</span>
                        <span className="text-sm font-normal text-cyan-300 italic font-sans">({selectedLexiconItem.transliteration})</span>
                      </h3>
                      <p className="text-xs text-slate-400 font-sans">{selectedLexiconItem.definition}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLexiconItem(null);
                      setConcordanceData(null);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex flex-col gap-6">
                  {concordanceLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                      <p className="text-xs text-slate-400">Đang truy xuất 31,081 câu Kinh Thánh để đối chiếu Concordance...</p>
                    </div>
                  ) : concordanceData ? (
                    <div className="flex flex-col gap-6">
                      {/* Distribution Stat */}
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="w-5 h-5 text-cyan-400" />
                          <div>
                            <span className="text-xs font-bold text-slate-200">Phân Phối Toàn Cảnh Trong Kinh Thánh</span>
                            <p className="text-[11px] text-slate-400">Từ khóa đối chiếu: &ldquo;{concordanceData.clean_keyword}&rdquo;</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold">
                          <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Cựu Ước (OT): {concordanceData.distribution.old_testament} câu
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Tân Ước (NT): {concordanceData.distribution.new_testament} câu
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Tổng cộng: {concordanceData.distribution.total_matches}
                          </span>
                        </div>
                      </div>

                      {/* Matching Verses List */}
                      <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Các Câu Tiêu Biểu Trong Bản Dịch Truyền Thống 1925
                        </h4>
                        <div className="flex flex-col gap-2.5">
                          {concordanceData.verses.map((cv) => (
                            <div key={cv.global_id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-blue-400 flex items-center gap-1.5">
                                  <span>📖 {cv.reference}</span>
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                    cv.testament === "OT" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"
                                  }`}>
                                    {cv.testament}
                                  </span>
                                </span>
                                <Link
                                  href={`/bible?book=${encodeURIComponent(cv.reference.split(" ")[0])}`}
                                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                                >
                                  <span>Xem trong ngữ cảnh</span>
                                  <ChevronRight className="w-3 h-3" />
                                </Link>
                              </div>
                              <p className="text-xs font-serif text-slate-200 leading-relaxed italic">
                                &ldquo;{cv.text}&rdquo;
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: GROUNDED RAG Q&A                                   */}
      {/* ======================================================== */}
      {activeTab === "qa" && (
        <div className="flex flex-col gap-6">
          {/* Search Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={qaQuery}
                onChange={(e) => setQaQuery(e.target.value)}
                placeholder="Đặt câu hỏi nghiên cứu (ví dụ: bối cảnh lịch sử, ý nghĩa giao ước, phân tích ẩn dụ...)"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={qaLoading || !qaQuery.trim()}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all self-end sm:self-auto"
            >
              {qaLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Truy Vấn RAG...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tra Cứu Có Căn Cứ</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Questions */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Gợi ý câu hỏi:
            </span>
            {SAMPLE_QUESTIONS.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQaQuery(sq);
                  handleSearch(sq);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-[11px] text-slate-300 hover:text-white transition-colors text-left"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {qaError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{qaError}</span>
            </div>
          )}

          {/* Q&A Result */}
          {qaAnswer && !qaLoading && (
            <article className="flex flex-col gap-6 animate-in fade-in duration-500">
              {/* Executive Summary */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-emerald-500/30 flex flex-col gap-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Kết Luận Nghiên Cứu
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Mô hình {qaAnswer.model}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans font-medium">
                  {qaAnswer.summary}
                </p>
              </div>

              {/* Bible Evidence */}
              {qaAnswer.bible_evidence && qaAnswer.bible_evidence.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Bằng Chứng Kinh Thánh (Scripture Evidence)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qaAnswer.bible_evidence.map((be, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                        <span className="font-bold text-blue-300 text-xs flex items-center gap-1.5">
                          📖 {be.reference}
                        </span>
                        <p className="text-xs font-serif text-slate-300 italic leading-relaxed">
                          &ldquo;{be.text}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Theological Insights */}
              {qaAnswer.theological_insights && qaAnswer.theological_insights.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Các Khía Cạnh Thần Học Sâu Sắc
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qaAnswer.theological_insights.map((ti, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                        <span className="font-bold text-purple-300 text-xs">{ti.heading}</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{ti.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Theological Citations */}
              {qaAnswer.citations && qaAnswer.citations.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Library className="w-4 h-4" /> Trích Dẫn Từ Thư Viện Sách Chú Giải
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {qaAnswer.citations.map((c, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-xs text-emerald-300">{c.source_title}</span>
                          <span className="text-[10px] text-slate-400">{c.chapter}</span>
                          <p className="text-[11px] text-slate-300 italic leading-snug mt-1">&ldquo;{c.quote}&rdquo;</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyCitation(c.quote)}
                          className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 self-end transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedQuote === c.quote ? "Đã chép" : "Chép trích dẫn"}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CHARACTER STUDY ENGINE                             */}
      {/* ======================================================== */}
      {activeTab === "character" && (
        <div className="flex flex-col gap-6">
          {/* Character Picker */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chọn nhân vật tiêu biểu:</span>
            {PRESET_CHARACTERS.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => handleCharacterStudy(c.slug)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                  selectedCharacterSlug === c.slug
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search by Any Name */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleCharacterStudy(characterSearchInput);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={characterSearchInput}
                onChange={(e) => setCharacterSearchInput(e.target.value)}
                placeholder="Tìm nhân vật khác (ví dụ: Áp-ra-ham, Môi-se, Đa-vít, Ê-li, Phao-lô...)"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={characterLoading || !characterSearchInput.trim()}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {characterLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Khảo cứu</span>
            </button>
          </form>

          {/* Error Message */}
          {characterError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{characterError}</span>
            </div>
          )}

          {/* Character Study Result Display */}
          {characterData && !characterLoading && (
            <article className="flex flex-col gap-6 animate-in fade-in duration-500">
              {/* Profile Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-blue-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                    <span>{characterData.timeline_period}</span>
                    <span>&bull;</span>
                    <span>{characterData.title_or_role}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1 flex items-baseline gap-2">
                    {characterData.name_vi}
                    {characterData.name_en && (
                      <span className="text-sm font-normal text-slate-400 font-sans">
                        ({characterData.name_en})
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed font-sans">
                    {characterData.summary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 max-w-xs self-start md:self-center">
                  {characterData.key_verses?.map((kv) => (
                    <span key={kv} className="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] font-medium text-blue-300">
                      📖 {kv}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Theological Portrait */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/70 border border-indigo-500/30 flex flex-col gap-3 shadow-lg">
                <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Bức Chân Dung Thần Học &amp; Mối Quan Hệ Giao Ước
                </h3>
                <div className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {characterData.ai_theological_portrait}
                </div>
              </div>

              {/* Milestones & Relationships */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Milestones */}
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Các Cột Mốc Sự Kiện Lịch Sử
                  </h3>
                  <div className="flex flex-col gap-3">
                    {characterData.milestone_events?.map((me, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-200">{me.title}</span>
                          <span className="text-[10px] text-amber-400 font-mono">{me.period}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{me.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relationships */}
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Compass className="w-4 h-4" /> Mạng Lưới Quan Hệ Trong Kinh Thánh
                  </h3>
                  <div className="flex flex-col gap-2">
                    {characterData.relationships?.map((rel, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-300">{rel.target_name}</span>
                        <span className="text-slate-400 text-[11px]">{rel.relation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Spiritual Lessons */}
              {characterData.spiritual_lessons && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-emerald-500/20 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Bài Học Thuộc Linh Rút Ra
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {characterData.spiritual_lessons.map((sl, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span>{sl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: THEOLOGICAL THEMES ENGINE                          */}
      {/* ======================================================== */}
      {activeTab === "theme" && (
        <div className="flex flex-col gap-6">
          {/* Theme Chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chủ đề cứu rỗi trọng tâm:</span>
            {availableThemes.map((th) => (
              <button
                key={th.key}
                type="button"
                onClick={() => handleThemeStudy(th.key)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                  selectedThemeKey === th.key
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800"
                }`}
              >
                {th.name_vi}
              </button>
            ))}
          </div>

          {/* Theme Result Display */}
          {themeData && !themeLoading && (
            <article className="flex flex-col gap-6 animate-in fade-in duration-500">
              {/* Header Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-amber-500/30 flex flex-col gap-3 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <span>Chuyên Đề Thần Học Thánh Kinh</span>
                  <span>&bull;</span>
                  <span>{themeData.theme_en}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Chủ Đề: {themeData.theme_name}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl font-sans">
                  {themeData.core_concept}
                </p>
              </div>

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
                    Cựu Ước &bull; Hình Bóng &amp; Tiến Trình
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {themeData.ot_development}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Tân Ước &bull; Ứng Nghiệm Nơi Đấng Christ
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
            </article>
          )}
        </div>
      )}
    </main>
  );
}
