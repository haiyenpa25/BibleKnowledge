"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Bookmark,
  Calendar,
  Clock,
  Quote,
  Copy,
  Check,
  ChevronRight,
  BookMarked,
  Library,
  FolderKanban,
  ArrowRight,
  Compass,
  FileText,
  GitCompare,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Headphones,
  X
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

interface DevotionalItem {
  id: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  title: string;
  theme: string;
  golden_verse?: string;
  reflection: string;
  prayer: string;
  tradition?: string;
  audio_duration_seconds?: number;
  tags?: string[];
  prev_id?: string;
  next_id?: string;
}

interface DailyInsight {
  verse_of_the_day: {
    reference: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
    verse_code: number;
  };
  devotional_meditation?: DevotionalItem;
  person_of_the_day: {
    slug: string;
    name_vi: string;
    name_en?: string;
    title_or_role?: string;
    summary?: string;
    timeline_period?: string;
    key_verse?: string;
  };
  event_of_the_day: {
    slug: string;
    title: string;
    approximate_date?: string;
    period?: string;
    description?: string;
    scripture?: string;
  };
  daily_quiz?: {
    id: string;
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
    scripture_ref: string;
    difficulty_level: number;
  };
  featured_sermon?: {
    id: string;
    title: string;
    passage_ref: string;
    theme: string;
    summary: string;
  };
  featured_challenge_pack?: {
    id: string;
    title: string;
    description: string;
    category: string;
    total_questions: number;
    badge_label: string;
  };
  featured_journey?: {
    id: string;
    title: string;
    period: string;
    waypoints_count: number;
    description: string;
  };
  metrics: {
    total_verses: number;
    total_chunks: number;
    total_flashcards: number;
    total_notes: number;
    total_nodes: number;
    total_journeys?: number;
    total_challenge_packs?: number;
    total_sermon_presets?: number;
    total_devotionals?: number;
  };
}

interface TodayReadingPlanData {
  plan_id: string;
  plan_title: string;
  plan_category: string;
  total_days: number;
  current_day: number;
  is_completed: boolean;
  day_info: {
    day: number;
    title: string;
    passages: string[];
    primary_book: string;
    primary_chapter: number;
    golden_verse: string;
    devotional_prompt: string;
  };
  streak: number;
  completed_count: number;
  completion_percentage: number;
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  // Daily Insight State
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [todayPlan, setTodayPlan] = useState<TodayReadingPlanData | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [copiedVerse, setCopiedVerse] = useState(false);
  const [isDevotionalSpeaking, setIsDevotionalSpeaking] = useState(false);
  const [isDevotionalExpanded, setIsDevotionalExpanded] = useState(false);
  const [copiedDevotional, setCopiedDevotional] = useState(false);

  // Devotional Library & Audio State (§53)
  const [isDevotionalModalOpen, setIsDevotionalModalOpen] = useState(false);
  const [devotionalsList, setDevotionalsList] = useState<DevotionalItem[]>([]);
  const [devotionalThemes, setDevotionalThemes] = useState<string[]>([]);
  const [selectedDevotionalTheme, setSelectedDevotionalTheme] = useState<string>("Tất cả");
  const [devotionalSearchQuery, setDevotionalSearchQuery] = useState("");
  const [loadingDevotionals, setLoadingDevotionals] = useState(false);
  const [activeDevotionalAudio, setActiveDevotionalAudio] = useState<DevotionalItem | null>(null);
  const [devotionalSpeechRate, setDevotionalSpeechRate] = useState<number>(1.0);
  const [playingDevotionalId, setPlayingDevotionalId] = useState<string | null>(null);

  function speakDevotional(dev: DevotionalItem, rate: number = devotionalSpeechRate) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (playingDevotionalId === dev.id && isDevotionalSpeaking) {
      window.speechSynthesis.cancel();
      setPlayingDevotionalId(null);
      setIsDevotionalSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    setActiveDevotionalAudio(dev);

    const ref = dev.reference;
    const text = dev.golden_verse || (dailyInsight?.verse_of_the_day.reference === ref ? dailyInsight?.verse_of_the_day.text : "");
    const title = dev.title;
    const reflection = dev.reflection;
    const prayer = dev.prayer;

    let textToSpeak = `Linh lực hằng ngày. Câu gốc suy ngẫm trong ${ref}: "${text}". Chủ đề: ${title}. ${reflection}. Lời cầu nguyện: ${prayer}`;

    const utt = new SpeechSynthesisUtterance(textToSpeak);
    utt.lang = "vi-VN";
    utt.rate = rate;

    utt.onend = () => {
      setPlayingDevotionalId(null);
      setIsDevotionalSpeaking(false);
    };
    utt.onerror = () => {
      setPlayingDevotionalId(null);
      setIsDevotionalSpeaking(false);
    };

    setPlayingDevotionalId(dev.id);
    setIsDevotionalSpeaking(true);
    window.speechSynthesis.speak(utt);
  }

  function stopAllSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setPlayingDevotionalId(null);
      setIsDevotionalSpeaking(false);
    }
  }

  function toggleDevotionalSpeech() {
    if (!dailyInsight || !dailyInsight.devotional_meditation) return;
    const m = dailyInsight.devotional_meditation;
    const item: DevotionalItem = {
      id: m.id || "daily-verse",
      reference: dailyInsight.verse_of_the_day.reference,
      book: dailyInsight.verse_of_the_day.book,
      chapter: dailyInsight.verse_of_the_day.chapter,
      verse: dailyInsight.verse_of_the_day.verse,
      title: m.title,
      theme: m.theme,
      golden_verse: dailyInsight.verse_of_the_day.text,
      reflection: m.reflection,
      prayer: m.prayer,
      tradition: m.tradition || "Thần Học Suy Ngẫm",
      audio_duration_seconds: m.audio_duration_seconds || 65,
      tags: m.tags || []
    };
    speakDevotional(item);
  }

  async function openDevotionalLibrary() {
    setIsDevotionalModalOpen(true);
    if (devotionalsList.length === 0) {
      setLoadingDevotionals(true);
      try {
        const res = await fetch(`${apiUrl}/api/bible/devotionals`);
        if (res.ok) {
          const data = await res.json();
          setDevotionalsList(data.devotionals || []);
          setDevotionalThemes(["Tất cả", ...(data.themes || [])]);
        }
      } catch (err) {
        console.error("Failed to fetch devotionals:", err);
      } finally {
        setLoadingDevotionals(false);
      }
    }
  }

  async function handleFilterDevotionals(query: string, theme: string) {
    setDevotionalSearchQuery(query);
    setSelectedDevotionalTheme(theme);
    setLoadingDevotionals(true);
    try {
      if (!query.trim()) {
        const themeParam = theme && theme !== "Tất cả" ? `?theme=${encodeURIComponent(theme)}` : "";
        const res = await fetch(`${apiUrl}/api/bible/devotionals${themeParam}`);
        if (res.ok) {
          const data = await res.json();
          setDevotionalsList(data.devotionals || []);
        }
      } else {
        let url = `${apiUrl}/api/bible/devotionals/search?q=${encodeURIComponent(query.trim())}`;
        if (theme && theme !== "Tất cả") {
          url += `&theme=${encodeURIComponent(theme)}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setDevotionalsList(data.devotionals || []);
        }
      }
    } catch (e) {
      console.error("Devotional search error:", e);
    } finally {
      setLoadingDevotionals(false);
    }
  }

  function handleCopyDevotional() {
    if (!dailyInsight) return;
    const v = dailyInsight.verse_of_the_day;
    const m = dailyInsight.devotional_meditation;
    let fullText = `[CÂU GỐC TRONG NGÀY - ${v.reference}]\n"${v.text}"\n\n`;
    if (m) {
      fullText += `[SUY NGẪM: ${m.title}]\nChủ đề: ${m.theme}\n${m.reflection}\n\n[CẦU NGUYỆN]\n${m.prayer}\n\n(Nền tảng Kinh Thánh BibleKnowledge)`;
    }
    navigator.clipboard.writeText(fullText);
    setCopiedDevotional(true);
    setTimeout(() => setCopiedDevotional(false), 2500);
  }

  // Daily Quiz Interactive State (§53)
  const [selectedQuizIdx, setSelectedQuizIdx] = useState<number | null>(null);
  const [hasAnsweredQuiz, setHasAnsweredQuiz] = useState<boolean>(false);

  // Verse Query State
  const [searchRef, setSearchRef] = useState("Ma-thi-ơ 14:22 - 15:5");
  const [rangeData, setRangeData] = useState<VerseRangeResponse | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const router = useRouter();
  const [aiResearchInput, setAiResearchInput] = useState("");

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiResearchInput.trim()) return;
    router.push(`/research?q=${encodeURIComponent(aiResearchInput.trim())}`);
  };

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

    async function fetchDaily() {
      try {
        const [dRes, pRes] = await Promise.all([
          fetch(`${apiUrl}/api/bible/daily-insight`, { cache: "no-store" }),
          fetch(`${apiUrl}/api/bible/reading-plans/today`, { cache: "no-store" })
        ]);
        if (dRes.ok) {
          const data = await dRes.json();
          setDailyInsight(data);
        }
        if (pRes.ok) {
          const pData = await pRes.json();
          setTodayPlan(pData);
        }
      } catch (err) {
        console.error("Failed to fetch daily insight or reading plan:", err);
      } finally {
        setLoadingDaily(false);
      }
    }

    checkHealth();
    fetchDaily();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
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

  const handleCopyVerse = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedVerse(true);
    setTimeout(() => setCopiedVerse(false), 2000);
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Top Status & Metrics Pill Bar */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            BibleKnowledge <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Alpha 5-Layer Ready</span>
          </h1>
          <p className="text-xs text-slate-400">Nền tảng Học tập, Đồ thị Tri thức & Nghiên cứu Thần học AI</p>
        </div>

        {/* Live Service Indicator Badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-300">PostgreSQL + pgvector:</span>
            {loadingHealth ? (
              <span className="text-slate-500">...</span>
            ) : health?.database === "connected" ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sẵn sàng
              </span>
            ) : (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Kết nối...
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
            <span className="text-slate-300">FastAPI:</span>
            {health?.api === "online" ? (
              <span className="text-emerald-400 font-medium">:8000 Online</span>
            ) : (
              <span className="text-slate-400">Offline</span>
            )}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass-panel border border-slate-700/50 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-950/40">
        <div className="max-w-3xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Nền tảng Học Thuật & Nghiên Cứu Đã Sẵn Sàng
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Khám phá & Nghiên cứu Kinh Thánh Với <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">Trí Tuệ Nhân Tạo Bản Địa</span>
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Hạ tầng tích hợp toàn diện: <strong>66 sách Kinh Thánh Bản 1925</strong> (31.081 câu), kho <strong>275 tài liệu nghiên cứu thần học</strong> với vector embeddings BGE-M3 1024D, <strong>Từ điển nguyên ngữ Strong</strong> Hy Lạp/Hê-bơ-rơ, và <strong>Đồ thị tri thức</strong> tương tác.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link 
              href="/bible"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30"
            >
              <BookOpen className="w-4 h-4" /> Đọc Kinh Thánh (66 Sách) →
            </Link>
            <Link 
              href="/learn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-600/30"
            >
              <GraduationCap className="w-4 h-4" /> Học Tập & Đố Vui (Learn) →
            </Link>
            <Link 
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
            >
              <Network className="w-4 h-4" /> Khám Phá & Đồ Thị (Explore) →
            </Link>
            <Link 
              href="/study"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/30"
            >
              <BookMarked className="w-4 h-4" /> Tra Cứu Strong & Giải Kinh (/study) →
            </Link>
            <Link 
              href="/research"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30"
            >
              <BrainCircuit className="w-4 h-4" /> Nghiên Cứu AI (RAG) →
            </Link>
            <Link 
              href="/library"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-600/30"
            >
              <Library className="w-4 h-4" /> Thư Viện 275 Sách (/library) →
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* DAILY INSIGHT HUB (ROADMAP1.md Section 53) */}
      {/* ===================================================================== */}
      {dailyInsight && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" /> Linh Lực &amp; Khám Phá Hằng Ngày (Daily Insight)
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={openDevotionalLibrary}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Headphones className="w-3.5 h-3.5 text-amber-400" />
                <span>Thư Viện Audio Suy Ngẫm ({dailyInsight.metrics?.total_devotionals || 16}) →</span>
              </button>
              <span className="text-xs text-slate-400 font-mono">ROADMAP1.md §53</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Verse of the Day */}
            <div className="md:col-span-1 rounded-3xl glass-card border border-blue-500/30 p-6 flex flex-col justify-between gap-4 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-950/40 relative overflow-hidden">
              <Quote className="w-16 h-16 text-blue-500/10 absolute -right-2 -bottom-2 pointer-events-none" />
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Câu Gốc Trong Ngày
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={toggleDevotionalSpeech}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                        isDevotionalSpeaking
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse shadow-sm shadow-rose-900/40"
                          : "bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30"
                      }`}
                      title={isDevotionalSpeaking ? "Dừng đọc suy ngẫm" : "Nghe đọc suy ngẫm Lời Chúa hằng ngày"}
                    >
                      {isDevotionalSpeaking ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-rose-400" />
                          <span>Đang đọc</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Nghe suy ngẫm</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyVerse(`${dailyInsight.verse_of_the_day.reference} - "${dailyInsight.verse_of_the_day.text}"`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Sao chép câu gốc"
                    >
                      {copiedVerse ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <h4 className="text-base font-bold text-white">
                  {dailyInsight.verse_of_the_day.reference}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed font-serif italic pt-1">
                  "{dailyInsight.verse_of_the_day.text}"
                </p>

                {/* Devotional Reflection Expandable Card */}
                {dailyInsight.devotional_meditation && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/60 mt-1">
                    <button
                      onClick={() => setIsDevotionalExpanded(!isDevotionalExpanded)}
                      className="text-[11px] font-semibold text-amber-300/90 hover:text-amber-200 flex items-center gap-1.5 w-fit transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isDevotionalExpanded ? "Thu gọn bài suy ngẫm ▲" : "Xem bài suy ngẫm & cầu nguyện ▼"}</span>
                    </button>

                    {isDevotionalExpanded && (
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col gap-2.5 text-xs animate-in fade-in">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                              {dailyInsight.devotional_meditation.theme}
                            </span>
                            <h5 className="font-bold text-white text-xs mt-0.5">
                              {dailyInsight.devotional_meditation.title}
                            </h5>
                          </div>
                          <button
                            onClick={handleCopyDevotional}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 shrink-0 transition-colors"
                            title="Sao chép toàn bộ bài suy ngẫm"
                          >
                            {copiedDevotional ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedDevotional ? "Đã chép!" : "Chép"}</span>
                          </button>
                        </div>
                        <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                          {dailyInsight.devotional_meditation.reflection}
                        </p>
                        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-100/90 italic font-serif">
                          <span className="font-bold not-italic text-amber-400 font-sans">Lời cầu nguyện: </span>
                          {dailyInsight.devotional_meditation.prayer}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/bible?ref=${encodeURIComponent(dailyInsight.verse_of_the_day.reference)}`}
                    className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Đọc Cả Đoạn →
                  </Link>
                  <Link
                    href={`/study?ref=${encodeURIComponent(dailyInsight.verse_of_the_day.reference)}`}
                    className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                  >
                    Giải Kinh →
                  </Link>
                </div>
                <button
                  onClick={openDevotionalLibrary}
                  className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                >
                  <Headphones className="w-3.5 h-3.5" /> Thư viện Audio →
                </button>
              </div>
            </div>

            {/* 2. Person of the Day */}
            <div className="md:col-span-1 rounded-3xl glass-card border border-indigo-500/30 p-6 flex flex-col justify-between gap-4 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/40">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Nhân Vật Trong Ngày
                  </span>
                  {dailyInsight.person_of_the_day.key_verse && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      {dailyInsight.person_of_the_day.key_verse}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white">
                  {dailyInsight.person_of_the_day.name_vi}
                  {dailyInsight.person_of_the_day.name_en && (
                    <span className="text-xs font-normal text-slate-400 ml-1.5">
                      ({dailyInsight.person_of_the_day.name_en})
                    </span>
                  )}
                </h4>
                {dailyInsight.person_of_the_day.title_or_role && (
                  <span className="text-xs text-indigo-300 font-medium">
                    👑 {dailyInsight.person_of_the_day.title_or_role}
                  </span>
                )}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {dailyInsight.person_of_the_day.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500 text-[11px]">{dailyInsight.person_of_the_day.timeline_period}</span>
                <Link
                  href="/explore"
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  Mở Đồ Thị →
                </Link>
              </div>
            </div>

            {/* 3. Event of the Day */}
            <div className="md:col-span-1 rounded-3xl glass-card border border-amber-500/30 p-6 flex flex-col justify-between gap-4 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-amber-950/40">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Biến Cố Lịch Sử
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-400">
                    {dailyInsight.event_of_the_day.approximate_date}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">
                  {dailyInsight.event_of_the_day.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-serif">
                  {dailyInsight.event_of_the_day.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500 text-[11px]">{dailyInsight.event_of_the_day.period}</span>
                <Link
                  href="/explore"
                  className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                >
                  Xem Timeline →
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2: Interactive Daily Quiz + Featured Journey + Featured Expository Sermon (§9, §46, §50, §53) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 4. Interactive Daily Quiz Card */}
            {dailyInsight.daily_quiz && (
              <div className="md:col-span-1 rounded-3xl glass-card border border-emerald-500/30 p-6 flex flex-col justify-between gap-4 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-emerald-950/40">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> Đố Vui Hôm Nay (§3, §53)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Cấp độ: {dailyInsight.daily_quiz.difficulty_level}/5
                    </span>
                  </div>

                  <h4 className="text-xs md:text-sm font-bold text-white leading-relaxed">
                    {dailyInsight.daily_quiz.question}
                  </h4>

                  {/* Options */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    {dailyInsight.daily_quiz.options.map((opt, idx) => {
                      const isSelected = selectedQuizIdx === idx;
                      const isCorrect = idx === dailyInsight.daily_quiz?.correct_index;
                      let btnStyle = "bg-slate-900/80 border-slate-700/60 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800/80";
                      if (hasAnsweredQuiz) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-950/80 border-rose-500 text-rose-300";
                        } else {
                          btnStyle = "bg-slate-900/40 border-slate-800 text-slate-500";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={hasAnsweredQuiz}
                          onClick={() => {
                            setSelectedQuizIdx(idx);
                            setHasAnsweredQuiz(true);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span className="font-sans line-clamp-1">{opt}</span>
                          {hasAnsweredQuiz && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          {hasAnsweredQuiz && isSelected && !isCorrect && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {hasAnsweredQuiz && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] flex flex-col gap-1 animate-in fade-in">
                      <span className={selectedQuizIdx === dailyInsight.daily_quiz.correct_index ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {selectedQuizIdx === dailyInsight.daily_quiz.correct_index ? "✔ Chính xác! (+20 XP)" : "✖ Chưa chính xác!"}
                      </span>
                      <p className="text-slate-300 leading-relaxed font-sans">{dailyInsight.daily_quiz.explanation}</p>
                      {dailyInsight.daily_quiz.scripture_ref && (
                        <span className="text-slate-400 font-mono pt-0.5">Kinh văn: {dailyInsight.daily_quiz.scripture_ref}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500 text-[11px]">30 câu hỏi đa dạng</span>
                  <Link
                    href="/learn"
                    className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                  >
                    Vào Học Tập & Gói Đề →
                  </Link>
                </div>
              </div>
            )}

            {/* 5. Featured Biblical Journey Card */}
            {dailyInsight.featured_journey && (
              <div className="md:col-span-1 rounded-3xl glass-card border border-cyan-500/30 p-6 flex flex-col justify-between gap-4 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/40">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                      <Compass className="w-3 h-3" /> Hành Trình Kinh Thánh (§9)
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300">
                      {dailyInsight.featured_journey.waypoints_count} Trạm Dừng
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {dailyInsight.featured_journey.title}
                  </h4>
                  <span className="text-xs text-cyan-300 font-medium">
                    Thời kỳ: {dailyInsight.featured_journey.period}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-sans">
                    {dailyInsight.featured_journey.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500 text-[11px]">9 Tuyến Không Gian</span>
                  <Link
                    href="/explore"
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                  >
                    Xem Bản Đồ & Tour →
                  </Link>
                </div>
              </div>
            )}

            {/* 6. Featured Expository Sermon Blueprint Card */}
            {dailyInsight.featured_sermon && (
              <div className="md:col-span-1 rounded-3xl glass-card border border-rose-500/30 p-6 flex flex-col justify-between gap-4 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-rose-950/40">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" /> Bài Giảng Giải Kinh (§50)
                    </span>
                    <span className="text-[11px] font-mono font-bold text-rose-300">
                      {dailyInsight.featured_sermon.passage_ref}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white line-clamp-2">
                    {dailyInsight.featured_sermon.title}
                  </h4>
                  <span className="text-xs text-amber-300 font-medium">
                    Chủ đề: {dailyInsight.featured_sermon.theme}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-serif">
                    {dailyInsight.featured_sermon.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500 text-[11px]">4 Mẫu Kinh Điển</span>
                  <Link
                    href="/study"
                    className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                  >
                    Soạn Bài Giảng →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* BIBLE READING PLAN TODAY WIDGET (§3, §46, §53)                        */}
      {/* ===================================================================== */}
      {todayPlan && (
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-amber-950/20 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
                    Kế Hoạch Đọc Hôm Nay • Ngày {todayPlan.current_day}/{todayPlan.total_days}
                  </span>
                  {todayPlan.streak > 0 && (
                    <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 flex items-center gap-1 font-bold">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {todayPlan.streak} ngày liên tục
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {todayPlan.plan_title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-400">Tiến độ kế hoạch</div>
                <div className="text-sm font-bold text-amber-300 font-mono">
                  {todayPlan.completed_count}/{todayPlan.total_days} ngày ({todayPlan.completion_percentage}%)
                </div>
              </div>
              <Link
                href="/learn"
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <span>Xem Tất Cả 5 Kế Hoạch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-3">
              <div>
                <div className="text-xs text-amber-400/90 font-medium mb-1">
                  {todayPlan.day_info.title}
                </div>
                <div className="flex flex-wrap gap-2">
                  {todayPlan.day_info.passages.map((p, idx) => (
                    <Link
                      key={idx}
                      href={`/bible?book=${encodeURIComponent(todayPlan.day_info.primary_book)}&chapter=${todayPlan.day_info.primary_chapter}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 border border-slate-700/60 hover:border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>{p}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {todayPlan.day_info.golden_verse && (
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                    Câu Gốc Suy Ngẫm
                  </span>
                  <p className="text-xs text-amber-100 font-serif italic leading-relaxed">
                    "{todayPlan.day_info.golden_verse}"
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Chủ Đề & Câu Hỏi Tĩnh Nguyện
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {todayPlan.day_info.devotional_prompt}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {todayPlan.is_completed ? "Đã hoàn thành hôm nay" : "Chưa hoàn thành"}
                </span>
                <Link
                  href="/learn"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  Vào Học & Đánh Dấu →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* ASK BIBLE RESEARCH AI & QUICK STUDY HUB (ROADMAP1.md §53)               */}
      {/* ===================================================================== */}
      <section className="flex flex-col gap-6">
        {/* Ask Bible Research AI Banner */}
        <div className="p-6 md:p-8 rounded-3xl glass-panel border border-emerald-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-950/30 flex flex-col gap-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                  Đặt Câu Hỏi Nghiên Cứu Thần Học Với AI (Ask Research AI §53)
                </h3>
                <p className="text-xs text-slate-400">
                  Phân tích tự động đa tầng: Văn bản Kinh Thánh • Ngữ nguyên Hy Lạp/Hê-bơ-rơ • Đồ thị tri thức • 275 sách chuyên khảo
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit">
              ROADMAP1 §51, §53
            </span>
          </div>

          <form onSubmit={handleAskAi} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={aiResearchInput}
                onChange={(e) => setAiResearchInput(e.target.value)}
                placeholder="Nhập câu hỏi nghiên cứu (ví dụ: Tại sao Phao-lô và Gia-cơ nói về đức tin khác nhau?)"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={!aiResearchInput.trim()}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nghiên Cứu Ngay →</span>
            </button>
          </form>

          {/* Preset Prompts */}
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-slate-400 text-[11px]">Chủ đề gợi ý:</span>
            {[
              "Tại sao Phao-lô và Gia-cơ nói về đức tin khác nhau?",
              "Ý nghĩa của Giao Ước Mới trong sách Hê-bơ-rơ",
              "Sự tương phản giữa Luật Pháp Môi-se và Ân Điển Đấng Christ"
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiResearchInput(p);
                  router.push(`/research?q=${encodeURIComponent(p)}`);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Core Action Pillars (§53): Bible Reader, Gospel Harmony, Academic Citations, Multi-Dimensional Context, Adaptive Learning */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {/* Card 1: Continue Reading */}
          <Link
            href="/bible?book=jhn&chapter=1"
            className="p-4 rounded-3xl glass-card border border-blue-500/20 hover:border-blue-500/40 transition-all flex flex-col justify-between gap-2.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                Đọc Kinh Thánh (§2.1, §53)
              </span>
              <BookOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-blue-200 transition-colors">
                Trình Đọc 66 Sách
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                Bản 1925, lời Chúa Giê-xu chữ đỏ, đối chiếu Hy-Hê Strong và âm thanh đọc.
              </p>
            </div>
            <div className="text-[11px] text-blue-400 font-medium flex items-center gap-1 pt-2 border-t border-slate-800/80">
              Đọc Kinh Thánh →
            </div>
          </Link>

          {/* Card 2: Gospel Harmony */}
          <Link
            href="/explore?tab=harmony"
            className="p-4 rounded-3xl glass-card border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-2.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                Đối Chiếu (§8, §18)
              </span>
              <GitCompare className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                Gospel Harmony Explorer
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                16 đại sự kiện đối chiếu 4 sách Tin Lành và song song Sử ký Cựu Ước.
              </p>
            </div>
            <div className="text-[11px] text-purple-400 font-medium flex items-center gap-1 pt-2 border-t border-slate-800/80">
              Mở Bảng Đối Chiếu →
            </div>
          </Link>

          {/* Card 3: Academic Citations */}
          <Link
            href="/library"
            className="p-4 rounded-3xl glass-card border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-2.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Thư Viện (§38, §52)
              </span>
              <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                Trích Dẫn Học Thuật
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                275 tác phẩm, 171 tác giả, chuẩn SBL, Chicago, APA, BibTeX luận văn.
              </p>
            </div>
            <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 pt-2 border-t border-slate-800/80">
              Khám Phá Nguồn Thần Học →
            </div>
          </Link>

          {/* Card 4: Multi-Dimensional Context */}
          <Link
            href="/research"
            className="p-4 rounded-3xl glass-card border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-2.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Giải Kinh (§15)
              </span>
              <Compass className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-emerald-200 transition-colors">
                Bối Cảnh Đa Chiều
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                5 chiều kích phân tích: Lịch sử, văn hóa, ngôn ngữ, địa lý và cứu rỗi.
              </p>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 pt-2 border-t border-slate-800/80">
              Phân Tích Đoạn Văn →
            </div>
          </Link>

          {/* Card 5: Interactive Learning */}
          <Link
            href="/learn"
            className="p-4 rounded-3xl glass-card border border-orange-500/20 hover:border-orange-500/40 transition-all flex flex-col justify-between gap-2.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                Học Tập (§3, §5)
              </span>
              <GraduationCap className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-orange-200 transition-colors">
                9 Chế Độ Game & SM-2
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                Đố vui Who Am I, Đúng/Sai, Thẻ lặp lại ngắt quãng, Thử thách timeline.
              </p>
            </div>
            <div className="text-[11px] text-orange-400 font-medium flex items-center gap-1 pt-2 border-t border-slate-800/80">
              Vào Không Gian Học →
            </div>
          </Link>
        </div>

        {/* Study Projects Showcase Card */}
        <div className="p-6 md:p-7 rounded-3xl glass-panel border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Không Gian Dự Án Nghiên Cứu Tiêu Biểu (Study Projects §50, §53)
              </h3>
            </div>
            <Link
              href="/study"
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
            >
              Quản lý Dự Án (/study) →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: "Hành Trình Đức Tin Của Si-môn Phi-e-rơ",
                desc: "Khảo cứu sự biến đổi từ ngư phủ bốc đồng thành người chăn bầy tận tụy dưới ân điển.",
                verses: 6,
                notes: 3,
                id: "1"
              },
              {
                title: "Thần Học Giao Ước & Ân Điển Trong Thư Rô-ma",
                desc: "Đối chiếu sự công chính bởi đức tin (Sola Fide) và công cuộc cứu chuộc trọn vẹn.",
                verses: 8,
                notes: 5,
                id: "2"
              },
              {
                title: "Bài Giảng Trên Núi & Đạo Đức Nước Trời",
                desc: "Ý nghĩa của 8 Phước Lành, luật pháp trọn vẹn và lối sống môn đồ môn hóa thế giới.",
                verses: 7,
                notes: 4,
                id: "3"
              }
            ].map((proj) => (
              <Link
                key={proj.id}
                href="/study"
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                    {proj.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {proj.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60 font-mono">
                  <span>📖 {proj.verses} câu ghim</span>
                  <span>📝 {proj.notes} ghi chú</span>
                </div>
              </Link>
            ))}
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
          <Link href="/learn" className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4 border-l-4 border-l-amber-500 hover:border-slate-600 transition-all hover:translate-y-[-2px] group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Tầng 1</div>
              <h4 className="text-lg font-bold text-white mt-1 group-hover:text-amber-300 transition-colors flex items-center justify-between">
                Học Tập (Learn) <span>→</span>
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Trắc nghiệm ABCD, Đố vui nhân vật (Who am I?), Thử thách thuộc lòng câu gốc, Flashcards thuật toán lặp lại ngắt quãng (SM-2).
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-xs text-amber-400/80 font-medium">
              Chế độ Gamification & Tiến độ →
            </div>
          </Link>

          {/* Layer 2: Explore */}
          <Link href="/bible" className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4 border-l-4 border-l-blue-500 hover:border-slate-600 transition-all hover:translate-y-[-2px] group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Tầng 2</div>
              <h4 className="text-lg font-bold text-white mt-1 group-hover:text-blue-300 transition-colors flex items-center justify-between">
                Khám Phá (Explore) <span>→</span>
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Trình đọc Kinh Thánh Bản dịch 1925, Bản đồ không gian Thánh địa, Dòng thời gian lịch sử đa tầng từ Cựu Ước đến Tân Ước.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-xs text-blue-400/80 font-medium">
              66 Sách • 1.189 Đoạn • 31.081 Câu →
            </div>
          </Link>

          {/* Layer 3: Connect */}
          <Link href="/explore" className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4 border-l-4 border-l-indigo-500 hover:border-slate-600 transition-all hover:translate-y-[-2px] group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                <Network className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Tầng 3</div>
              <h4 className="text-lg font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                Kết Nối (Connect) <span>→</span>
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Đồ thị tri thức Knowledge Graph, biểu diễn tương tác giữa Nhân vật, Địa danh, Biến cố và Dòng thời gian lịch sử cứu rỗi.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-xs text-indigo-400/80 font-medium">
              Mạng lưới Đồ thị & Timeline →
            </div>
          </Link>

          {/* Layer 4: Research */}
          <Link href="/research" className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4 border-l-4 border-l-emerald-500 hover:border-slate-600 transition-all hover:translate-y-[-2px] group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Tầng 4</div>
              <h4 className="text-lg font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                Nghiên Cứu (Research) <span>→</span>
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Trợ lý AI RAG bản địa với mô hình Qwen, Embeddings BGE-M3 1024D, tra cứu ngữ nghĩa sâu sắc từ 275 nguồn thần học đáng tin cậy.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-xs text-emerald-400/80 font-medium">
              Grounded AI • 275 Nguồn Sách →
            </div>
          </Link>
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
      {/* ===================================================================== */}
      {/* DEVOTIONAL AUDIO & MEDITATION CATALOGUE MODAL (§53) */}
      {/* ===================================================================== */}
      {isDevotionalModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => {
            setIsDevotionalModalOpen(false);
          }}
        >
          <div 
            className="max-w-4xl w-full p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Kho Linh Lực &amp; Audio (§53)
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {devotionalsList.length} bài suy ngẫm
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
                  <Headphones className="w-5 h-5 text-amber-400" />
                  Thư Viện Audio Suy Ngẫm Thần Học &amp; Cầu Nguyện
                </h3>
                <p className="text-xs text-slate-400">
                  Suy ngẫm Lời Chúa theo từng chủ đề với giọng đọc truyền cảm, bài học đức tin và lời nguyện
                </p>
              </div>
              <button
                onClick={() => {
                  stopAllSpeech();
                  setIsDevotionalModalOpen(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audio Now Playing Bar */}
            {activeDevotionalAudio && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-indigo-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    playingDevotionalId === activeDevotionalAudio.id && isDevotionalSpeaking
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}>
                    {playingDevotionalId === activeDevotionalAudio.id && isDevotionalSpeaking ? (
                      <Volume2 className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Headphones className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-amber-400">
                        {activeDevotionalAudio.reference}
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] text-slate-400">
                        ⏱ ~{activeDevotionalAudio.audio_duration_seconds || 60}s
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">
                      {activeDevotionalAudio.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Speed Selector */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-[11px]">
                    {[0.8, 1.0, 1.2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setDevotionalSpeechRate(rate);
                          if (playingDevotionalId === activeDevotionalAudio.id && isDevotionalSpeaking) {
                            speakDevotional(activeDevotionalAudio, rate);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-lg transition-all ${
                          devotionalSpeechRate === rate
                            ? "bg-amber-500 text-slate-950 font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  {/* Play / Pause Toggle */}
                  <button
                    onClick={() => speakDevotional(activeDevotionalAudio)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                      playingDevotionalId === activeDevotionalAudio.id && isDevotionalSpeaking
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-900/40"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-900/40"
                    }`}
                  >
                    {playingDevotionalId === activeDevotionalAudio.id && isDevotionalSpeaking ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Tạm dừng</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Phát Audio</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={stopAllSpeech}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Dừng hẳn"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={devotionalSearchQuery}
                    onChange={(e) => handleFilterDevotionals(e.target.value, selectedDevotionalTheme)}
                    placeholder="Tìm theo câu gốc, chủ đề, nội dung suy ngẫm hoặc lời cầu nguyện..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  {devotionalSearchQuery && (
                    <button
                      onClick={() => handleFilterDevotionals("", selectedDevotionalTheme)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Theme Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {devotionalThemes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleFilterDevotionals(devotionalSearchQuery, theme)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all text-xs font-medium ${
                      selectedDevotionalTheme === theme
                        ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                        : "bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/40"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Devotionals List */}
            <div className="overflow-y-auto pr-1 flex flex-col gap-3 max-h-[50vh]">
              {loadingDevotionals ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                  <p className="text-xs">Đang tìm kiếm bài suy ngẫm...</p>
                </div>
              ) : devotionalsList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Không tìm thấy bài suy ngẫm nào phù hợp với từ khóa &ldquo;{devotionalSearchQuery}&rdquo;.
                </div>
              ) : (
                devotionalsList.map((dev) => {
                  const isCurrent = activeDevotionalAudio?.id === dev.id;
                  const isPlayingThis = playingDevotionalId === dev.id && isDevotionalSpeaking;
                  return (
                    <div
                      key={dev.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                        isCurrent
                          ? "bg-slate-950/90 border-amber-500/50 shadow-md shadow-amber-950/30"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            {dev.reference}
                          </span>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {dev.theme}
                          </span>
                          {dev.tradition && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {dev.tradition}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => speakDevotional(dev)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isPlayingThis
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                                : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {isPlayingThis ? (
                              <>
                                <Pause className="w-3 h-3 text-rose-400" />
                                <span>Tạm dừng</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-current text-amber-400" />
                                <span>Nghe Audio</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              const text = `[SUY NGẪM: ${dev.title}]\nCâu gốc (${dev.reference}): "${dev.golden_verse}"\nChủ đề: ${dev.theme}\n\n${dev.reflection}\n\n[CẦU NGUYỆN]\n${dev.prayer}\n\n(Nền tảng BibleKnowledge)`;
                              navigator.clipboard.writeText(text);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Sao chép bài suy ngẫm"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white">
                        {dev.title}
                      </h4>

                      {dev.golden_verse && (
                        <p className="text-xs text-amber-200/90 font-serif italic border-l-2 border-amber-500/40 pl-2.5 py-0.5">
                          &ldquo;{dev.golden_verse}&rdquo;
                        </p>
                      )}

                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {dev.reflection}
                      </p>

                      <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs text-amber-100/90 italic font-serif">
                        <span className="font-bold not-italic text-amber-400 font-sans">Lời cầu nguyện: </span>
                        {dev.prayer}
                      </div>

                      <div className="flex justify-between items-center text-[11px] pt-1 text-slate-400 border-t border-slate-900">
                        <span className="font-mono">Thời lượng: ~{dev.audio_duration_seconds || 60}s</span>
                        <Link
                          href={`/bible?ref=${encodeURIComponent(dev.reference)}`}
                          onClick={() => {
                            stopAllSpeech();
                            setIsDevotionalModalOpen(false);
                          }}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium hover:underline"
                        >
                          <BookOpen className="w-3 h-3" /> Đọc Sách Kinh Thánh →
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

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
