"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Library, 
  Search, 
  BookOpen, 
  FileText, 
  ExternalLink, 
  ChevronRight, 
  Home, 
  Loader2, 
  Layers, 
  BookMarked, 
  Bookmark, 
  Tag, 
  Trash2, 
  Plus, 
  BrainCircuit, 
  BarChart3, 
  Sparkles,
  Bot,
  Filter,
  Check,
  AlertCircle,
  ChevronLeft,
  Volume2,
  VolumeX,
  Copy,
  ArrowLeft,
  X
} from "lucide-react";

interface LibraryStats {
  notebook_name: string;
  total_books: number;
  total_chunks_indexed: number;
  total_chapters: number;
  total_characters: number;
  total_user_notes: number;
  categories: {
    commentaries: { count: number; label_vi: string };
    dictionaries: { count: number; label_vi: string };
    surveys: { count: number; label_vi: string };
    monographs: { count: number; label_vi: string };
  };
  series?: { series_name: string; count: number }[];
}

interface BookItem {
  index: number;
  id: string;
  title: string;
  author: string;
  category: string;
  category_vi: string;
  series?: string;
  chars: number;
  total_chapters: number;
  filename: string;
}

interface ChapterSummary {
  chapter_index: number;
  title: string;
  sections_count: number;
  preview: string;
}

interface ChapterSectionItem {
  heading: string;
  content: string;
  paragraphs: string[];
  scripture_ref?: string;
}

interface ChapterDetail {
  book_index: number;
  book_title: string;
  book_author: string;
  series?: string;
  chapter_index: number;
  chapter_title: string;
  chapter_number?: string;
  total_sections: number;
  sections: ChapterSectionItem[];
  has_previous: boolean;
  has_next: boolean;
  previous_chapter_index?: number;
  next_chapter_index?: number;
}

interface BookDetail {
  index: number;
  id: string;
  title: string;
  author: string;
  category: string;
  category_vi: string;
  chars: number;
  total_chapters: number;
  chapters_outline: ChapterSummary[];
  sample_excerpt: string;
}

interface StudyNote {
  id: string;
  title: string;
  scripture_ref: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function LibraryPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Tab State: 'catalog' | 'notes'
  const [activeTab, setActiveTab] = useState<"catalog" | "notes">("catalog");

  // Stats
  const [stats, setStats] = useState<LibraryStats | null>(null);

  // Catalog States
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeries, setSelectedSeries] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalBooksCount, setTotalBooksCount] = useState(0);

  // Book Detail Modal State
  const [selectedBookIndex, setSelectedBookIndex] = useState<number | null>(null);
  const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Chapter Reader State
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | null>(null);
  const [chapterDetail, setChapterDetail] = useState<ChapterDetail | null>(null);
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [copiedSectionIndex, setCopiedSectionIndex] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Notes States
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [noteSearch, setNoteSearch] = useState("");
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteRef, setNewNoteRef] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTags, setNewNoteTags] = useState("");
  const [creatingNote, setCreatingNote] = useState(false);

  // Initial load: stats and books
  useEffect(() => {
    fetchStats();
    fetchBooks("all", "", "all");
  }, [apiUrl]);

  // Fetch Stats
  async function fetchStats() {
    try {
      const res = await fetch(`${apiUrl}/api/library/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch library stats:", e);
    }
  }

  // Fetch Books Catalog
  async function fetchBooks(cat: string, q: string, ser: string = "all") {
    setLoadingBooks(true);
    try {
      const params = new URLSearchParams();
      if (cat && cat !== "all") params.append("category", cat);
      if (ser && ser !== "all") params.append("series", ser);
      if (q && q.trim()) params.append("q", q.trim());
      params.append("limit", "150");

      const res = await fetch(`${apiUrl}/api/library/catalog?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
        setTotalBooksCount(data.total || 0);
      }
    } catch (e) {
      console.error("Failed to load catalog:", e);
    } finally {
      setLoadingBooks(false);
    }
  }

  // Open Book Detail
  async function handleOpenBook(index: number) {
    setSelectedBookIndex(index);
    setLoadingDetail(true);
    setBookDetail(null);
    try {
      const res = await fetch(`${apiUrl}/api/library/books/${index}`);
      if (res.ok) {
        const data = await res.json();
        setBookDetail(data);
      }
    } catch (e) {
      console.error("Failed to load book details:", e);
    } finally {
      setLoadingDetail(false);
    }
  }

  // Chapter Reader Handlers
  async function handleOpenChapter(bookIdx: number, chapterIdx: number) {
    setSelectedChapterIndex(chapterIdx);
    setLoadingChapter(true);
    setChapterDetail(null);
    setIsPlayingAudio(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const res = await fetch(`${apiUrl}/api/library/books/${bookIdx}/chapters/${chapterIdx}`);
      if (res.ok) {
        const data = await res.json();
        setChapterDetail(data);
      }
    } catch (err) {
      console.error("Failed to load chapter content:", err);
    } finally {
      setLoadingChapter(false);
    }
  }

  function handleToggleAudio() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!chapterDetail || chapterDetail.sections.length === 0) return;

    const fullNarrative = chapterDetail.sections
      .map(s => (s.heading ? s.heading + ". " : "") + s.content)
      .join("\n\n");

    const utterance = new SpeechSynthesisUtterance(fullNarrative.slice(0, 3000));
    utterance.lang = "vi-VN";
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  }

  function handleCopyCitation(section: ChapterSectionItem, idx: number) {
    if (!chapterDetail) return;
    const citation = `"${section.content.slice(0, 400)}..."\n— Trích từ: ${chapterDetail.book_title}, ${chapterDetail.chapter_title} (Tác giả: ${chapterDetail.book_author})`;
    navigator.clipboard.writeText(citation);
    setCopiedSectionIndex(idx);
    setTimeout(() => setCopiedSectionIndex(null), 2500);
  }

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fetch Notes
  async function fetchNotes(q?: string) {
    setLoadingNotes(true);
    try {
      const params = new URLSearchParams();
      if (q && q.trim()) params.append("q", q.trim());
      const res = await fetch(`${apiUrl}/api/library/notes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data || []);
      }
    } catch (e) {
      console.error("Failed to fetch notes:", e);
    } finally {
      setLoadingNotes(false);
    }
  }

  // Handle Create Note
  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    setCreatingNote(true);
    try {
      const tagsArray = newNoteTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`${apiUrl}/api/library/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newNoteTitle.trim(),
          scripture_ref: newNoteRef.trim() || null,
          content: newNoteContent.trim(),
          tags: tagsArray
        })
      });

      if (res.ok) {
        setNewNoteTitle("");
        setNewNoteRef("");
        setNewNoteContent("");
        setNewNoteTags("");
        setShowCreateNote(false);
        fetchNotes();
        fetchStats();
      }
    } catch (e) {
      console.error("Failed to create note:", e);
    } finally {
      setCreatingNote(false);
    }
  }

  // Handle Delete Note
  async function handleDeleteNote(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa ghi chú nghiên cứu này?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/library/notes/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchNotes(noteSearch);
        fetchStats();
      }
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 px-4 py-8 md:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col gap-8">
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 border border-amber-500/30 flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Thư Viện Tài Liệu Thần Học Toàn Thư <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold font-mono">275 Sách &bull; §34, §52</span>
              </h1>
              <p className="text-xs text-slate-400">Bộ Chú Giải TOTC &amp; TNTC &bull; Bách Khoa Toàn Thư &bull; Từ Điển &bull; Ghi Chú Cá Nhân</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/research"
            className="px-3.5 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Nghiên Cứu Với AI</span>
          </Link>
          <Link
            href="/bible"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Kinh Thánh 1925</span>
          </Link>
        </div>
      </header>

      {/* Hero Stats Banner */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg md:text-xl font-bold text-white tracking-tight">{stats.total_books}</span>
              <p className="text-[11px] text-slate-400">Tác phẩm thần học</p>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg md:text-xl font-bold text-white tracking-tight">{stats.total_chunks_indexed.toLocaleString()}</span>
              <p className="text-[11px] text-slate-400">Vector chunks RAG (BGE-M3)</p>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg md:text-xl font-bold text-white tracking-tight">{stats.total_chapters.toLocaleString()}</span>
              <p className="text-[11px] text-slate-400">Chương mục &amp; Chuyên khảo</p>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg md:text-xl font-bold text-white tracking-tight">{stats.total_user_notes}</span>
              <p className="text-[11px] text-slate-400">Ghi chú cá nhân đã lưu</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Switcher: Catalog vs Personal Study Notes */}
      <nav className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs md:text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all ${
            activeTab === "catalog"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Library className="w-4 h-4 text-amber-200" />
          <span>Kho 275 Tác Phẩm Thần Học</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("notes");
            fetchNotes();
          }}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all ${
            activeTab === "notes"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Bookmark className="w-4 h-4 text-emerald-200" />
          <span>Ghi Chú Nghiên Cứu Cá Nhân</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* SECTION 1: CATALOG OF 275 THEOLOGICAL BOOKS             */}
      {/* ======================================================== */}
      {activeTab === "catalog" && (
        <div className="flex flex-col gap-6">
          {/* Filter Bar & Categories */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  fetchBooks("all", searchQuery, selectedSeries);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === "all" ? "bg-amber-600 text-white" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Tất Cả ({stats?.total_books || 275})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("commentary");
                  fetchBooks("commentary", searchQuery, selectedSeries);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === "commentary" ? "bg-amber-600 text-white" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Chú Giải ({stats?.categories.commentaries.count || 135})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("dictionary");
                  fetchBooks("dictionary", searchQuery, selectedSeries);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === "dictionary" ? "bg-amber-600 text-white" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Từ Điển &amp; Bách Khoa ({stats?.categories.dictionaries.count || 42})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("survey");
                  fetchBooks("survey", searchQuery, selectedSeries);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === "survey" ? "bg-amber-600 text-white" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Khảo Lược ({stats?.categories.surveys.count || 17})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("monograph");
                  fetchBooks("monograph", searchQuery, selectedSeries);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === "monograph" ? "bg-amber-600 text-white" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Chuyên Đề ({stats?.categories.monographs.count || 81})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchBooks(selectedCategory, e.target.value, selectedSeries);
                }}
                placeholder="Tìm theo tác giả, tựa sách..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {/* Series Filter Horizontal Bar */}
          {stats?.series && stats.series.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap mr-1">Bộ sách:</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedSeries("all");
                  fetchBooks(selectedCategory, searchQuery, "all");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                  selectedSeries === "all"
                    ? "bg-amber-600/30 text-amber-300 border border-amber-500/50 font-bold"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                Tất cả bộ ({stats.total_books})
              </button>
              {stats.series.map(s => (
                <button
                  key={s.series_name}
                  type="button"
                  onClick={() => {
                    setSelectedSeries(s.series_name);
                    fetchBooks(selectedCategory, searchQuery, s.series_name);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                    selectedSeries === s.series_name
                      ? "bg-amber-600/30 text-amber-300 border border-amber-500/50 font-bold"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {s.series_name} ({s.count})
                </button>
              ))}
            </div>
          )}

          {/* Books List Grid */}
          {loadingBooks ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-slate-400">Đang tải danh mục 275 sách thần học...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3 shadow-md group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        #{b.index}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-800 text-slate-300">
                        {b.category_vi}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors leading-snug line-clamp-2">
                      {b.title}
                    </h3>

                    {b.series && b.series !== "Độc lập / Tuyển tập chuyên khảo" && (
                      <span className="inline-block text-[10px] text-amber-400/90 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/40 truncate max-w-full">
                        🏷️ {b.series}
                      </span>
                    )}

                    {b.author && (
                      <p className="text-xs text-slate-400">
                        Tác giả: <strong className="text-slate-300">{b.author}</strong>
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>{b.total_chapters} chương mục</span>
                      <span>&bull;</span>
                      <span>{(b.chars / 1000).toFixed(0)}K ký tự</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleOpenBook(b.index)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Xem mục lục</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/research`}
                      className="px-2.5 py-1 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-600/30 text-[11px] font-bold text-purple-300 flex items-center gap-1 transition-colors"
                    >
                      <Bot className="w-3 h-3" />
                      <span>Hỏi AI</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Book Detail Modal */}
          {selectedBookIndex && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0b101c] border border-amber-500/40 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      #{bookDetail?.index || selectedBookIndex}
                    </span>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white line-clamp-1">
                        {bookDetail?.title || "Đang tải tác phẩm..."}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {bookDetail?.author ? `Tác giả: ${bookDetail.author}` : ""} &bull; {bookDetail?.category_vi}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBookIndex(null);
                      setBookDetail(null);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto flex flex-col gap-6">
                  {loadingDetail ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                      <p className="text-xs text-slate-400">Đang đọc cấu trúc tác phẩm...</p>
                    </div>
                  ) : bookDetail ? (
                    <div className="flex flex-col gap-6">
                      {/* Meta stats */}
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-4">
                          <span>Tổng số chương: <strong className="text-white">{bookDetail.total_chapters}</strong></span>
                          <span>Độ dài: <strong className="text-white">{bookDetail.chars.toLocaleString()} ký tự</strong></span>
                        </div>
                        <Link
                          href="/research"
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>Hỏi AI về sách này</span>
                        </Link>
                      </div>

                      {/* Chapters Outline */}
                      <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-amber-400" /> Cấu Trúc Các Chương &amp; Đề Mục (Nhấp để đọc toàn văn)
                        </h4>
                        <div className="flex flex-col gap-2">
                          {bookDetail.chapters_outline.map((ch, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => handleOpenChapter(bookDetail.index, ch.chapter_index)}
                              className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 flex flex-col gap-1.5 cursor-pointer transition-all group shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-amber-300 group-hover:text-amber-200 transition-colors flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{ch.title}</span>
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">{ch.sections_count} phân đoạn</span>
                                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                                    Đọc chương này →
                                  </span>
                                </div>
                              </div>
                              {ch.preview && (
                                <p className="text-[11px] text-slate-400 group-hover:text-slate-300 line-clamp-2 mt-0.5 transition-colors pl-5">
                                  {ch.preview}...
                                </p>
                              )}
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

          {/* Chapter Reader Full Modal */}
          {selectedChapterIndex !== null && (
            <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in">
              <div className="bg-[#080d19] border border-amber-500/50 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChapterIndex(null);
                        setChapterDetail(null);
                        if (typeof window !== "undefined" && "speechSynthesis" in window) {
                          window.speechSynthesis.cancel();
                        }
                        setIsPlayingAudio(false);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Quay lại mục lục sách"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        {chapterDetail?.series && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {chapterDetail.series}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-medium line-clamp-1">
                          {chapterDetail?.book_title}
                        </span>
                      </div>
                      <h3 className="text-base md:text-xl font-bold text-white mt-0.5">
                        {chapterDetail?.chapter_title || "Đang tải chương..."}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Read Aloud Button */}
                    <button
                      type="button"
                      onClick={handleToggleAudio}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isPlayingAudio
                          ? "bg-amber-600 text-white animate-pulse shadow-md shadow-amber-600/40"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      }`}
                      title="Nghe đọc âm thanh toàn chương"
                    >
                      {isPlayingAudio ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Dừng đọc</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Nghe đọc</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChapterIndex(null);
                        setChapterDetail(null);
                        if (typeof window !== "undefined" && "speechSynthesis" in window) {
                          window.speechSynthesis.cancel();
                        }
                        setIsPlayingAudio(false);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-8 overflow-y-auto flex flex-col gap-6">
                  {loadingChapter ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                      <p className="text-xs">Đang tải phân đoạn và nội dung chương...</p>
                    </div>
                  ) : chapterDetail ? (
                    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
                      {/* Chapter Sections */}
                      {chapterDetail.sections.map((sec, sIdx) => (
                        <article
                          key={sIdx}
                          className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 flex flex-col gap-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/60">
                            <div>
                              {sec.heading && (
                                <h4 className="text-base md:text-lg font-bold text-amber-300">
                                  {sec.heading}
                                </h4>
                              )}
                              {sec.scripture_ref && (
                                <Link
                                  href={`/bible?ref=${encodeURIComponent(sec.scripture_ref)}`}
                                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mt-1"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>Kinh Thánh: {sec.scripture_ref} →</span>
                                </Link>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopyCitation(sec, sIdx)}
                              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
                              title="Sao chép đoạn trích kèm nguồn tài liệu"
                            >
                              {copiedSectionIndex === sIdx ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Đã chép!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Trích dẫn</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Section Paragraphs */}
                          <div className="flex flex-col gap-3 text-slate-200 font-serif leading-relaxed text-sm md:text-base">
                            {sec.paragraphs && sec.paragraphs.length > 0 ? (
                              sec.paragraphs.map((p, pIdx) => (
                                <p key={pIdx} className="leading-relaxed">
                                  {p}
                                </p>
                              ))
                            ) : (
                              <p className="leading-relaxed whitespace-pre-line">{sec.content}</p>
                            )}
                          </div>
                        </article>
                      ))}

                      {/* Chapter Navigation Footer */}
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 text-xs mt-4">
                        <button
                          type="button"
                          disabled={!chapterDetail.has_previous || chapterDetail.previous_chapter_index === null}
                          onClick={() => {
                            if (chapterDetail.previous_chapter_index !== null && chapterDetail.previous_chapter_index !== undefined) {
                              handleOpenChapter(chapterDetail.book_index, chapterDetail.previous_chapter_index);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Chương trước</span>
                        </button>

                        <span className="text-slate-500 font-mono text-[11px]">
                          Chương #{chapterDetail.chapter_index} &bull; {chapterDetail.total_sections} phân đoạn
                        </span>

                        <button
                          type="button"
                          disabled={!chapterDetail.has_next || chapterDetail.next_chapter_index === null}
                          onClick={() => {
                            if (chapterDetail.next_chapter_index !== null && chapterDetail.next_chapter_index !== undefined) {
                              handleOpenChapter(chapterDetail.book_index, chapterDetail.next_chapter_index);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <span>Chương sau</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
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
      {/* SECTION 2: PERSONAL STUDY NOTES ARCHIVE                  */}
      {/* ======================================================== */}
      {activeTab === "notes" && (
        <div className="flex flex-col gap-6">
          {/* Notes Top Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={noteSearch}
                onChange={(e) => {
                  setNoteSearch(e.target.value);
                  fetchNotes(e.target.value);
                }}
                placeholder="Tìm ghi chú theo tiêu đề, câu Kinh Thánh hoặc nội dung..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowCreateNote(!showCreateNote)}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Viết Ghi Chú Mới</span>
            </button>
          </div>

          {/* Create Note Form */}
          {showCreateNote && (
            <form onSubmit={handleCreateNote} className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/40 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <Bookmark className="w-4 h-4" /> Tạo Ghi Chú Nghiên Cứu Mới
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateNote(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Đóng
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Tiêu đề ghi chú (ví dụ: Suy ngẫm về Ân điển trong Ê-phê-sô 2)"
                  required
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <input
                  type="text"
                  value={newNoteRef}
                  onChange={(e) => setNewNoteRef(e.target.value)}
                  placeholder="Câu Kinh Thánh liên quan (ví dụ: Ê-phê-sô 2:8-10)"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Nội dung bài học, khám phá giải kinh, hoặc ghi chú cá nhân..."
                rows={4}
                required
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none font-sans"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <input
                  type="text"
                  value={newNoteTags}
                  onChange={(e) => setNewNoteTags(e.target.value)}
                  placeholder="Tags ngăn cách bằng dấu phẩy (ví dụ: andien, ductin, epheso)"
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 flex-1"
                />
                <button
                  type="submit"
                  disabled={creatingNote || !newNoteTitle.trim() || !newNoteContent.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {creatingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Lưu Ghi Chú</span>
                </button>
              </div>
            </form>
          )}

          {/* Notes Grid List */}
          {loadingNotes ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs text-slate-400">Đang tải ghi chú nghiên cứu...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center gap-3">
              <Bookmark className="w-10 h-10 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-300">Chưa có ghi chú nào</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Bạn có thể tạo ghi chú khi đọc Kinh Thánh ở Reader, hoặc nhấn nút &ldquo;Viết Ghi Chú Mới&rdquo; ở trên.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((n) => (
                <div key={n.id} className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-3 shadow-md">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-100">{n.title}</h4>
                        {n.scripture_ref && (
                          <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1 mt-0.5">
                            📖 {n.scripture_ref}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(n.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Xóa ghi chú"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap mt-1">
                      {n.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex flex-wrap gap-1">
                      {n.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span>{new Date(n.updated_at).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
