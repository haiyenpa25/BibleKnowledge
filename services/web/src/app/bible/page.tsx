"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Sparkles, 
  Bookmark, 
  Copy, 
  Check, 
  X, 
  Home, 
  Type, 
  Compass, 
  Loader2,
  Share2,
  BookMarked
} from "lucide-react";

interface BookMeta {
  id: number;
  order: number;
  code: string;
  osis: string;
  name_vi: string;
  name_en: string;
  testament: "OT" | "NT";
  total_chapters: number;
}

interface Verse {
  global_id: number;
  verse_code: number;
  chapter: number;
  verse: number;
  section_title: string;
  text: string;
  cross_references: string[];
}

interface ChapterData {
  book: BookMeta;
  chapter: number;
  total_verses: number;
  has_previous: boolean;
  has_next: boolean;
  verses: Verse[];
}

interface SearchResult {
  global_id: number;
  verse_code: number;
  book: string;
  chapter: number;
  verse: number;
  section_title: string;
  text: string;
}

// Canonical Categorization for 66 Books
const BOOK_CATEGORIES = {
  OT: [
    { title: "Ngũ Kinh Môi-se", range: [1, 5] },
    { title: "Lịch Sử", range: [6, 17] },
    { title: "Thi Ca & Khôn Ngoan", range: [18, 22] },
    { title: "Tiên Tri Lớn", range: [23, 27] },
    { title: "Tiên Tri Nhỏ", range: [28, 39] },
  ],
  NT: [
    { title: "Phúc Âm", range: [40, 43] },
    { title: "Lịch Sử Hội Thánh", range: [44, 44] },
    { title: "Thư Tín Phao-lô", range: [45, 58] },
    { title: "Thư Tín Chung", range: [59, 65] },
    { title: "Khải Huyền", range: [66, 66] },
  ]
};

export default function BibleReaderPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Data states
  const [books, setBooks] = useState<BookMeta[]>([]);
  const [currentBookCode, setCurrentBookCode] = useState("sa");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);

  // UI Modals & Drawers
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  // AI Explain State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Bookmark / Copy feedback
  const [copied, setCopied] = useState(false);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<number[]>([]);

  // Fetch all 66 books once
  useEffect(() => {
    async function loadBooks() {
      try {
        const res = await fetch(`${apiUrl}/api/bible/books`);
        if (res.ok) {
          const data = await res.json();
          setBooks(data);
        }
      } catch (e) {
        console.error("Failed to load books:", e);
      }
    }
    loadBooks();
  }, [apiUrl]);

  // Fetch chapter data when currentBookCode or currentChapter changes
  useEffect(() => {
    async function loadChapter() {
      setLoading(true);
      setSelectedVerse(null);
      setAiExplanation(null);
      try {
        const res = await fetch(`${apiUrl}/api/bible/chapter?book=${currentBookCode}&chapter=${currentChapter}`);
        if (res.ok) {
          const data = await res.json();
          setChapterData(data);
        }
      } catch (e) {
        console.error("Failed to load chapter:", e);
      } finally {
        setLoading(false);
      }
    }
    loadChapter();
  }, [currentBookCode, currentChapter, apiUrl]);

  // Current active book object
  const currentBook = useMemo(() => {
    return books.find(b => b.code.toLowerCase() === currentBookCode.toLowerCase()) || chapterData?.book || null;
  }, [books, currentBookCode, chapterData]);

  // Navigation handlers
  function handlePrevChapter() {
    if (!currentBook) return;
    if (currentChapter > 1) {
      setCurrentChapter(prev => prev - 1);
    } else {
      // Go to previous book's last chapter
      const prevOrder = currentBook.order - 1;
      const prevBook = books.find(b => b.order === prevOrder);
      if (prevBook) {
        setCurrentBookCode(prevBook.code);
        setCurrentChapter(prevBook.total_chapters);
      }
    }
  }

  function handleNextChapter() {
    if (!currentBook) return;
    if (currentChapter < currentBook.total_chapters) {
      setCurrentChapter(prev => prev + 1);
    } else {
      // Go to next book chapter 1
      const nextOrder = currentBook.order + 1;
      const nextBook = books.find(b => b.order === nextOrder);
      if (nextBook) {
        setCurrentBookCode(nextBook.code);
        setCurrentChapter(1);
      }
    }
  }

  function selectBookAndChapter(bookCode: string, chapterNum: number) {
    setCurrentBookCode(bookCode);
    setCurrentChapter(chapterNum);
    setIsBookModalOpen(false);
    setIsChapterModalOpen(false);
  }

  // Copy verse text
  function handleCopyVerse(verse: Verse) {
    if (!currentBook) return;
    const textToCopy = `[${currentBook.name_vi} ${verse.chapter}:${verse.verse}] "${verse.text}" (Kinh Thánh 1925)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Toggle local bookmark
  function toggleBookmark(verseCode: number) {
    setBookmarkedVerses(prev => 
      prev.includes(verseCode) ? prev.filter(c => c !== verseCode) : [...prev, verseCode]
    );
  }

  // Ask AI to explain verse
  async function handleAskAi(verse: Verse) {
    if (!currentBook) return;
    setAiLoading(true);
    setAiError(null);
    setAiExplanation(null);

    try {
      const res = await fetch(`${apiUrl}/api/ai/explain-verse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verse_ref: `${currentBook.name_vi} ${verse.chapter}:${verse.verse}`,
          verse_text: verse.text,
          context: verse.section_title || `Đoạn ${verse.chapter}`
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Lỗi máy chủ khi giải nghĩa");
      }

      const data = await res.json();
      setAiExplanation(data.explanation);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "Không thể kết nối trợ lý AI.");
    } finally {
      setAiLoading(false);
    }
  }

  // Live full-text search
  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/bible/search?q=${encodeURIComponent(searchQuery)}&limit=15`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Header / Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: App Logo & Back to Dashboard */}
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors"
            title="Quay lại Trang chính"
          >
            <Home className="w-4 h-4" />
          </Link>
          <div className="hidden sm:block text-xs font-bold uppercase tracking-wider text-blue-400">
            Kinh Thánh 1925
          </div>
        </div>

        {/* Center: Book & Chapter Selector Pills */}
        <div className="flex items-center gap-2">
          {/* Book Selector Button */}
          <button
            type="button"
            onClick={() => setIsBookModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>{currentBook?.name_vi || "Chọn Sách"}</span>
          </button>

          {/* Chapter Selector Button */}
          <button
            type="button"
            onClick={() => setIsChapterModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition-all"
          >
            Đoạn {currentChapter}
          </button>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-1 ml-1">
            <button
              type="button"
              onClick={handlePrevChapter}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Đoạn trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextChapter}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Đoạn sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Search & Typography Control */}
        <div className="flex items-center gap-2">
          {/* Font Size Selector */}
          <div className="hidden md:flex items-center rounded-lg bg-slate-800/60 p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setFontSize("sm")}
              className={`px-2 py-1 rounded-md ${fontSize === "sm" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize("md")}
              className={`px-2 py-1 rounded-md ${fontSize === "md" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize("lg")}
              className={`px-2 py-1 rounded-md ${fontSize === "lg" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              A+
            </button>
          </div>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs"
          >
            <Search className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Tìm kiếm</span>
          </button>
        </div>
      </header>

      {/* Main Reading Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col gap-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm">Đang tải kinh văn đoạn {currentChapter}...</span>
          </div>
        ) : chapterData ? (
          <article className="flex flex-col gap-6">
            {/* Chapter Header */}
            <div className="text-center pb-6 border-b border-slate-800/80 flex flex-col items-center gap-2">
              <span className="text-xs uppercase font-semibold text-blue-400 tracking-widest">
                {currentBook?.testament === "OT" ? "Cựu Ước" : "Tân Ước"} • {currentBook?.name_en}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                {currentBook?.name_vi}
              </h1>
              <div className="text-xl font-serif text-slate-400 font-medium">
                Đoạn {currentChapter}
              </div>
            </div>

            {/* Verses Flow with Pericopes */}
            <div className={`flex flex-col gap-4 font-serif leading-relaxed ${
              fontSize === "sm" ? "text-base md:text-lg" : fontSize === "lg" ? "text-xl md:text-2xl" : "text-lg md:text-xl"
            }`}>
              {chapterData.verses.map((v, idx) => {
                // Check if section title changed compared to previous verse
                const isNewSection = v.section_title && (idx === 0 || chapterData.verses[idx - 1].section_title !== v.section_title);
                const isSelected = selectedVerse?.global_id === v.global_id;
                const isBookmarked = bookmarkedVerses.includes(v.verse_code);

                return (
                  <React.Fragment key={v.global_id}>
                    {/* Render Section Heading if present */}
                    {isNewSection && (
                      <div className="pt-6 pb-2">
                        <div className="inline-block text-xs md:text-sm font-sans font-bold uppercase tracking-wider text-blue-400/90 bg-blue-950/40 px-3 py-1 rounded-md border border-blue-800/40">
                          § {v.section_title}
                        </div>
                      </div>
                    )}

                    {/* Verse Line */}
                    <div
                      onClick={() => {
                        setSelectedVerse(v);
                        setAiExplanation(null);
                      }}
                      className={`group p-2.5 rounded-xl cursor-pointer transition-all duration-150 flex items-start gap-3 ${
                        isSelected 
                          ? "bg-blue-950/60 border border-blue-500/40 shadow-md shadow-blue-950/50" 
                          : "hover:bg-slate-900/50 border border-transparent"
                      }`}
                    >
                      {/* Verse Number Pill */}
                      <span className={`select-none text-xs font-sans font-bold pt-1 min-w-[1.75rem] text-right ${
                        isSelected ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400"
                      }`}>
                        {v.verse}
                      </span>

                      {/* Text Body */}
                      <div className="flex-1 text-slate-200 leading-relaxed">
                        <span>{v.text}</span>

                        {/* Cross References tags if any */}
                        {v.cross_references && v.cross_references.length > 0 && (
                          <span className="inline-flex gap-1 ml-2 select-none">
                            {v.cross_references.map(ref => (
                              <span 
                                key={ref} 
                                className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hover:text-blue-300"
                                title={`Tham chiếu chéo: ${ref}`}
                              >
                                ⚓ {ref}
                              </span>
                            ))}
                          </span>
                        )}

                        {isBookmarked && (
                          <span className="inline-block ml-2 text-amber-400 text-xs">★</span>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Bottom Chapter Pagination Controls */}
            <div className="pt-10 pb-8 flex items-center justify-between border-t border-slate-800 text-sm font-sans">
              <button
                type="button"
                onClick={handlePrevChapter}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Đoạn trước
              </button>
              <div className="text-xs text-slate-500">
                {currentBook?.name_vi} • Đoạn {currentChapter} / {currentBook?.total_chapters}
              </div>
              <button
                type="button"
                onClick={handleNextChapter}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
              >
                Đoạn kế tiếp <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ) : null}
      </main>

      {/* Selected Verse Action Drawer (Bottom Sticky Panel) */}
      {selectedVerse && (
        <aside className="fixed bottom-0 inset-x-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-700 shadow-2xl p-4 md:px-8 max-w-4xl mx-auto rounded-t-3xl transition-transform animate-in slide-in-from-bottom duration-200">
          <div className="flex flex-col gap-3">
            {/* Header: Verse Ref & Close Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30">
                  {currentBook?.name_vi} {selectedVerse.chapter}:{selectedVerse.verse}
                </span>
                {selectedVerse.section_title && (
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    • {selectedVerse.section_title}
                  </span>
                )}
              </div>
              <button 
                type="button"
                onClick={() => setSelectedVerse(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Verse Snippet Text */}
            <p className="text-xs md:text-sm font-serif text-slate-300 italic line-clamp-2">
              &ldquo;{selectedVerse.text}&rdquo;
            </p>

            {/* Action Bar Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
              {/* Copy Button */}
              <button
                type="button"
                onClick={() => handleCopyVerse(selectedVerse)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Đã chép" : "Sao chép"}</span>
              </button>

              {/* Bookmark Button */}
              <button
                type="button"
                onClick={() => toggleBookmark(selectedVerse.verse_code)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Bookmark className={`w-3.5 h-3.5 ${bookmarkedVerses.includes(selectedVerse.verse_code) ? "text-amber-400 fill-amber-400" : ""}`} />
                <span>{bookmarkedVerses.includes(selectedVerse.verse_code) ? "Đã lưu" : "Đánh dấu"}</span>
              </button>

              {/* AI Explain Button */}
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAskAi(selectedVerse)}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Hỏi AI Giải Thích</span>
              </button>
            </div>

            {/* AI Explanation Result Box */}
            {aiExplanation && (
              <div className="mt-2 p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 max-h-60 overflow-y-auto text-xs text-slate-200 leading-relaxed flex flex-col gap-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Giải nghĩa thần học & bối cảnh (Ollama Qwen):
                </div>
                <div className="whitespace-pre-wrap font-sans text-slate-300">
                  {aiExplanation}
                </div>
              </div>
            )}

            {aiError && (
              <div className="text-xs text-red-400 mt-1">
                {aiError}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Book Selection Categorized Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 max-w-4xl w-full max-h-[85vh] rounded-3xl p-6 flex flex-col gap-6 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" /> Chọn Sách Kinh Thánh (66 Sách)
                </h3>
                <p className="text-xs text-slate-400">Bản dịch truyền thống 1925 / 1934</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Categorized List */}
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-8">
              {/* Cựu Ước (39 Sách) */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                    Cựu Ước (39 Sách)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {BOOK_CATEGORIES.OT.map(cat => {
                    const catBooks = books.filter(b => b.order >= cat.range[0] && b.order <= cat.range[1]);
                    return (
                      <div key={cat.title} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          {cat.title}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {catBooks.map(b => (
                            <button
                              key={b.code}
                              type="button"
                              onClick={() => selectBookAndChapter(b.code, 1)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                b.code === currentBookCode 
                                  ? "bg-blue-600 text-white font-bold" 
                                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                              }`}
                            >
                              {b.name_vi}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tân Ước (27 Sách) */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                    Tân Ước (27 Sách)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {BOOK_CATEGORIES.NT.map(cat => {
                    const catBooks = books.filter(b => b.order >= cat.range[0] && b.order <= cat.range[1]);
                    return (
                      <div key={cat.title} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          {cat.title}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {catBooks.map(b => (
                            <button
                              key={b.code}
                              type="button"
                              onClick={() => selectBookAndChapter(b.code, 1)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                b.code === currentBookCode 
                                  ? "bg-blue-600 text-white font-bold" 
                                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                              }`}
                            >
                              {b.name_vi}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Grid Modal */}
      {isChapterModalOpen && currentBook && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 max-w-xl w-full max-h-[75vh] rounded-3xl p-6 flex flex-col gap-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                Chọn Đoạn trong {currentBook.name_vi} ({currentBook.total_chapters} đoạn)
              </h3>
              <button 
                type="button"
                onClick={() => setIsChapterModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-1 grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {Array.from({ length: currentBook.total_chapters }, (_, i) => i + 1).map(ch => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => {
                    setCurrentChapter(ch);
                    setIsChapterModalOpen(false);
                  }}
                  className={`h-11 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
                    ch === currentChapter
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full-Text Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 max-w-2xl w-full max-h-[80vh] rounded-3xl p-6 flex flex-col gap-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" /> Tìm Kiếm Toàn Văn Kinh Thánh
              </h3>
              <button 
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
                placeholder="Nhập từ khóa (ví dụ: bánh hằng sống, yêu thương, đức tin)..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                disabled={searchLoading}
                onClick={handleSearch}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Tìm
              </button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 pt-2">
              {searchResults.length === 0 && !searchLoading && searchQuery.trim() && (
                <div className="text-center text-slate-500 text-xs py-8">
                  Không tìm thấy kết quả nào phù hợp với từ khóa.
                </div>
              )}
              {searchResults.map(r => (
                <div
                  key={r.global_id}
                  onClick={() => {
                    const matchedBook = books.find(b => b.name_vi.toLowerCase() === r.book.toLowerCase());
                    if (matchedBook) {
                      selectBookAndChapter(matchedBook.code, r.chapter);
                      setIsSearchOpen(false);
                    }
                  }}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 cursor-pointer transition-colors flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-400">
                      {r.book} {r.chapter}:{r.verse}
                    </span>
                    {r.section_title && (
                      <span className="text-slate-400 text-[11px] truncate max-w-[200px]">
                        § {r.section_title}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-serif text-slate-300 line-clamp-2">
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
