"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookMarked, 
  Search, 
  BookOpen, 
  Sparkles, 
  ArrowLeft, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Compass, 
  Loader2, 
  Bookmark, 
  ExternalLink,
  Tag,
  Calendar,
  Languages,
  ChevronRight
} from "lucide-react";

interface LexiconItem {
  id: string;
  strong_number: string;
  language: string;
  lemma: string;
  transliteration: string;
  pronunciation?: string;
  part_of_speech?: string;
  definition: string;
  theological_significance?: string;
  occurrences_count: number;
  key_verses: string[];
}

interface PassageStudyResult {
  reference: string;
  passage_text: string;
  literary_context: string;
  theological_themes: string[];
  structural_outline: Array<{ section: string; theme: string }>;
  original_language_insights: string;
  application_questions: string[];
}

interface StudyNote {
  id: string;
  title: string;
  scripture_ref?: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState<"lexicon" | "passage" | "notes">("lexicon");

  // Lexicon State
  const [lexiconList, setLexiconList] = useState<LexiconItem[]>([]);
  const [langFilter, setLangFilter] = useState<string>("all");
  const [searchLexicon, setSearchLexicon] = useState("");
  const [loadingLexicon, setLoadingLexicon] = useState(true);

  // Passage Study State
  const [passageRef, setPassageRef] = useState("Giăng 3:16-21");
  const [passageResult, setPassageResult] = useState<PassageStudyResult | null>(null);
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [passageError, setPassageError] = useState<string | null>(null);

  // Notes State
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newRef, setNewRef] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch Lexicon
  const fetchLexicon = async (lang?: string, search?: string) => {
    setLoadingLexicon(true);
    try {
      let url = `${apiUrl}/api/study/lexicon?`;
      if (lang && lang !== "all") url += `language=${encodeURIComponent(lang)}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLexiconList(data);
      }
    } catch (err) {
      console.error("Failed to fetch lexicon:", err);
    } finally {
      setLoadingLexicon(false);
    }
  };

  // Fetch Notes
  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const res = await fetch(`${apiUrl}/api/study/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    fetchLexicon();
    fetchNotes();
  }, [apiUrl]);

  // Passage Study Submit
  const handlePassageStudy = async () => {
    if (!passageRef.trim()) return;
    setLoadingPassage(true);
    setPassageError(null);
    setPassageResult(null);

    try {
      const res = await fetch(`${apiUrl}/api/study/passage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: passageRef })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Không thể phân tích đoạn văn.");
      }
      const data: PassageStudyResult = await res.json();
      setPassageResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi gọi AI phân tích giải kinh.";
      setPassageError(msg);
    } finally {
      setLoadingPassage(false);
    }
  };

  // Save Note Submit
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setSavingNote(true);
    setNoteSuccess(null);

    try {
      const tagsArray = newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`${apiUrl}/api/study/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          scripture_ref: newRef.trim() || undefined,
          content: newContent,
          tags: tagsArray
        })
      });
      if (!res.ok) throw new Error("Lỗi khi lưu ghi chú.");
      
      setNewTitle("");
      setNewRef("");
      setNewContent("");
      setNewTags("");
      setNoteSuccess("Đã lưu ghi chú nghiên cứu thành công!");
      fetchNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async (id: string) => {
    try {
      await fetch(`${apiUrl}/api/study/notes/${id}`, { method: "DELETE" });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  // Save passage result to notes
  const handleSavePassageToNotes = async () => {
    if (!passageResult) return;
    const content = `Bối cảnh: ${passageResult.literary_context}\n\nChủ đề thần học: ${passageResult.theological_themes.join(", ")}\n\nNguyên ngữ: ${passageResult.original_language_insights}`;
    try {
      await fetch(`${apiUrl}/api/study/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Phân tích giải kinh: ${passageResult.reference}`,
          scripture_ref: passageResult.reference,
          content: content,
          tags: ["passage_study", "exegesis"]
        })
      });
      fetchNotes();
      alert("Đã lưu phân tích vào mục Sổ tay nghiên cứu!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-purple-400" />
              Xưởng Nghiên Cứu Thần Học (Study Workspace)
            </h1>
            <p className="text-xs text-slate-400">
              Từ điển Strong Hy Lạp / Hê-bơ-rơ • Phân tích giải kinh (Passage Exegesis) • Sổ tay dự án cá nhân
            </p>
          </div>
        </div>

        {/* Tab Badges */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("lexicon")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "lexicon"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Languages className="w-4 h-4" /> Từ Điển Nguyên Ngữ
          </button>
          <button
            onClick={() => setActiveTab("passage")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "passage"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Phân Tích Đoạn Văn
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "notes"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-4 h-4" /> Sổ Tay Dự Án ({notes.length})
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 1. STRONG LEXICON (ORIGINAL LANGUAGES) */}
      {/* ===================================================================== */}
      {activeTab === "lexicon" && (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 whitespace-nowrap">Ngôn ngữ:</span>
              {[
                { id: "all", label: "Tất cả từ ngữ" },
                { id: "greek", label: "Hy Lạp (Greek / Tân Ước)" },
                { id: "hebrew", label: "Hê-bơ-rơ (Hebrew / Cựu Ước)" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setLangFilter(f.id);
                    fetchLexicon(f.id, searchLexicon);
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    langFilter === f.id
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold"
                      : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchLexicon}
                onChange={(e) => {
                  setSearchLexicon(e.target.value);
                  fetchLexicon(langFilter, e.target.value);
                }}
                placeholder="Tìm mã Strong, từ gốc hoặc nghĩa..."
                className="bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-full sm:w-64"
              />
            </div>
          </div>

          {loadingLexicon ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-xs">Đang nạp từ điển nguyên ngữ Strong...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lexiconList.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl glass-card border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono font-bold">
                        {item.id}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {item.language === "greek" ? "Tân Ước (Hy Lạp)" : "Cựu Ước (Hê-bơ-rơ)"}
                      </span>
                    </div>

                    {/* Big Original Script Display */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <div className="text-3xl font-serif font-black text-white tracking-wider">
                          {item.lemma}
                        </div>
                        <div className="text-xs text-purple-300 font-mono mt-0.5">
                          {item.transliteration} {item.pronunciation && `[${item.pronunciation}]`}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.occurrences_count} lần
                        </span>
                      </div>
                    </div>

                    {/* Part of Speech & Definition */}
                    {item.part_of_speech && (
                      <span className="text-[11px] text-slate-400 italic">
                        {item.part_of_speech}
                      </span>
                    )}
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {item.definition}
                    </p>

                    {/* Theological Depth */}
                    {item.theological_significance && (
                      <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 font-serif">
                        <span className="font-bold text-purple-400 block mb-1">Ý nghĩa thần học:</span>
                        {item.theological_significance}
                      </div>
                    )}
                  </div>

                  {/* Key Verses */}
                  {item.key_verses.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500">Câu then chốt:</span>
                      {item.key_verses.map((kv, i) => (
                        <Link
                          key={i}
                          href={`/bible?ref=${encodeURIComponent(kv)}`}
                          className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 transition-colors"
                        >
                          {kv}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. PASSAGE STUDY (EXEGESIS ENGINE) */}
      {/* ===================================================================== */}
      {activeTab === "passage" && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
          {/* Passage Search Bar */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-700/60 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Công Cụ Phân Tích Giải Kinh Tự Động (AI Passage Exegesis)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Nhập phân đoạn Kinh Thánh bất kỳ để AI bóc tách bối cảnh, cấu trúc phân đoạn, luận điểm thần học và câu hỏi suy ngẫm.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={passageRef}
                onChange={(e) => setPassageRef(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handlePassageStudy(); }}
                placeholder="Ví dụ: Giăng 3:16-21, Rô-ma 8:28-39, Thi-thiên 23..."
                className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handlePassageStudy}
                disabled={loadingPassage}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {loadingPassage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Phân Tích
              </button>
            </div>

            {/* Quick Chips */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
              <span>Đoạn mẫu:</span>
              {["Giăng 3:16-21", "Rô-ma 8:28-39", "Thi-thiên 23:1-6", "Ê-phê-sô 2:1-10", "Ma-thi-ơ 14:22-33"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPassageRef(p);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-blue-300 font-mono transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {passageError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
              {passageError}
            </div>
          )}

          {/* Analysis Results Display */}
          {passageResult && (
            <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-700/60 flex flex-col gap-6">
              <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                    Kết quả Giải Kinh Toàn Diện
                  </span>
                  <h3 className="text-2xl font-black text-white">{passageResult.reference}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSavePassageToNotes}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> Lưu Vào Sổ Tay
                  </button>
                  <Link
                    href={`/bible?ref=${encodeURIComponent(passageResult.reference)}`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Đọc Trong Bản 1925
                  </Link>
                </div>
              </div>

              {/* 1. Scripture Text Box */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 font-serif leading-relaxed whitespace-pre-line">
                <span className="text-[11px] font-sans font-bold text-slate-400 block mb-1">Kinh văn đối chiếu:</span>
                {passageResult.passage_text}
              </div>

              {/* 2. Literary & Historical Context */}
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" /> Bối Cảnh Lịch Sử & Văn Học
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-serif bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  {passageResult.literary_context}
                </p>
              </div>

              {/* 3. Structural Outline */}
              {passageResult.structural_outline?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" /> Bố Cục & Cấu Trúc Phân Đoạn
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {passageResult.structural_outline.map((sec, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs flex flex-col gap-1">
                        <span className="font-bold text-amber-300">{sec.section}</span>
                        <span className="text-slate-300 font-serif">{sec.theme}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Theological Themes */}
              {passageResult.theological_themes?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Các Luận Điểm Thần Học Cốt Lõi
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {passageResult.theological_themes.map((th, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs font-medium">
                        ✨ {th}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Original Language Insights */}
              {passageResult.original_language_insights && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Languages className="w-4 h-4 text-emerald-400" /> Điểm Sáng Ngữ Nghĩa & Nguyên Ngữ
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif bg-emerald-950/20 p-4 rounded-2xl border border-emerald-800/30">
                    {passageResult.original_language_insights}
                  </p>
                </div>
              )}

              {/* 6. Application Questions */}
              {passageResult.application_questions?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Câu Hỏi Suy Ngẫm Thực Hành Đời Sống
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {passageResult.application_questions.map((q, i) => (
                      <li key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. MY STUDY NOTES & PROJECTS */}
      {/* ===================================================================== */}
      {activeTab === "notes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Note Form */}
          <div className="lg:col-span-1 rounded-3xl glass-panel border border-slate-700/60 p-6 flex flex-col gap-4 h-fit">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Thêm Ghi Chú Mới
              </h2>
              <p className="text-xs text-slate-400 mt-1">Lưu trữ suy ngẫm, dàn ý bài giảng hoặc bài học thuộc linh.</p>
            </div>

            <form onSubmit={handleCreateNote} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300 font-medium">Tiêu đề ghi chú *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Bài học về đức tin của Áp-ra-ham"
                  className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300 font-medium">Câu Kinh Thánh liên quan</label>
                <input
                  type="text"
                  value={newRef}
                  onChange={(e) => setNewRef(e.target.value)}
                  placeholder="Ví dụ: Sáng-thế Ký 12:1-4"
                  className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300 font-medium">Nội dung ghi chú *</label>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Nhập nội dung suy ngẫm, ứng dụng đời sống..."
                  className="bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300 font-medium">Thẻ phân loại (ngăn cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="duc-tin, ap-ra-ham, phuc-am"
                  className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingNote}
                className="mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Lưu Ghi Chú
              </button>

              {noteSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
                  {noteSuccess}
                </div>
              )}
            </form>
          </div>

          {/* Notes List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Danh Sách Ghi Chú Đã Lưu ({notes.length})
            </h2>

            {loadingNotes ? (
              <div className="p-12 text-center text-slate-400">Đang tải danh sách ghi chú...</div>
            ) : notes.length === 0 ? (
              <div className="p-12 rounded-3xl glass-panel text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <Bookmark className="w-8 h-8 text-slate-700" />
                <p className="text-xs">Chưa có ghi chú nào. Hãy thêm ghi chú đầu tiên ở bảng bên trái!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-white">{n.title}</h3>
                        {n.scripture_ref && (
                          <Link
                            href={`/bible?ref=${encodeURIComponent(n.scripture_ref)}`}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mt-1"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{n.scripture_ref}</span>
                          </Link>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Xóa ghi chú"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-serif whitespace-pre-line bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                      {n.content}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(n.created_at).toLocaleDateString("vi-VN")}</span>
                      </div>
                      {n.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {n.tags.map((tg, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                              #{tg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
