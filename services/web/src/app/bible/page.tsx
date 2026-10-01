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
  BookMarked,
  Languages,
  Users,
  MapPin,
  Calendar,
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  Tag,
  ArrowRight
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

interface VerseDetails {
  verse: {
    global_id: number;
    verse_code: number;
    book_id: number;
    book_code: string;
    book_name: string;
    book_en: string;
    testament: "OT" | "NT";
    chapter: number;
    verse: number;
    section_title: string;
    text: string;
    reference: string;
  };
  entities: {
    people: {
      id: string;
      slug: string;
      name_vi: string;
      name_en: string;
      role: string;
      summary: string;
    }[];
    places: {
      id: string;
      slug: string;
      name_vi: string;
      name_en: string;
      modern_name: string;
      latitude: number;
      longitude: number;
      description: string;
    }[];
    events: {
      id: string;
      slug: string;
      title: string;
      period: string;
      description: string;
    }[];
  };
  lexicon: {
    id: string;
    strong_number: string;
    language: "greek" | "hebrew";
    lemma: string;
    transliteration: string;
    pronunciation?: string;
    part_of_speech?: string;
    definition: string;
    theological_significance?: string;
    matched_by: string;
  }[];
  bookmark: {
    is_bookmarked: boolean;
    color: string | null;
    note: string | null;
  };
  user_notes: {
    id: string;
    title: string;
    scripture_ref: string;
    content: string;
    tags: string[];
    updated_at: string;
  }[];
  cross_references: {
    reference: string;
    preview_text: string;
  }[];
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
  const [currentBookCode, setCurrentBookCode] = useState("mat");
  const [currentChapter, setCurrentChapter] = useState(14);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);

  // UI Modals & Drawers
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  // Verse Details (Entities, Strong Lexicon, Notes, Bookmark)
  const [verseDetails, setVerseDetails] = useState<VerseDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"insight" | "lexicon" | "entities" | "notes">("insight");

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

  // Inline Note Creation State
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTags, setNewNoteTags] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

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

  // Fetch user bookmarks from database
  useEffect(() => {
    async function loadBookmarks() {
      try {
        const res = await fetch(`${apiUrl}/api/study/bookmarks`);
        if (res.ok) {
          const data = await res.json();
          setBookmarkedVerses(data.map((b: { verse_code: number }) => b.verse_code));
        }
      } catch (e) {
        console.error("Failed to load bookmarks:", e);
      }
    }
    loadBookmarks();
  }, [apiUrl]);

  // Fetch chapter data when currentBookCode or currentChapter changes
  useEffect(() => {
    async function loadChapter() {
      setLoading(true);
      setSelectedVerse(null);
      setVerseDetails(null);
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

  // When a verse is selected, fetch deep theological details
  useEffect(() => {
    if (!selectedVerse) {
      setVerseDetails(null);
      return;
    }

    async function loadVerseDetails() {
      setDetailsLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/bible/verse-details?verse_code=${selectedVerse?.verse_code}`);
        if (res.ok) {
          const data = await res.json();
          setVerseDetails(data);
        }
      } catch (e) {
        console.error("Failed to load verse details:", e);
      } finally {
        setDetailsLoading(false);
      }
    }
    loadVerseDetails();
  }, [selectedVerse, apiUrl]);

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

  // Persistent Bookmark Toggle
  async function toggleBookmark(verse: Verse) {
    if (!currentBook) return;
    const isBookmarked = bookmarkedVerses.includes(verse.verse_code);
    const scriptureRef = `${currentBook.name_vi} ${verse.chapter}:${verse.verse}`;

    if (isBookmarked) {
      // Delete from DB
      try {
        await fetch(`${apiUrl}/api/study/bookmarks/${verse.verse_code}`, { method: "DELETE" });
        setBookmarkedVerses(prev => prev.filter(c => c !== verse.verse_code));
        if (verseDetails) {
          setVerseDetails({
            ...verseDetails,
            bookmark: { is_bookmarked: false, color: null, note: null }
          });
        }
      } catch (e) {
        console.error("Failed to delete bookmark:", e);
      }
    } else {
      // Save to DB
      try {
        await fetch(`${apiUrl}/api/study/bookmarks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verse_code: verse.verse_code,
            reference: scriptureRef,
            color: "amber",
            note: ""
          })
        });
        setBookmarkedVerses(prev => [...prev, verse.verse_code]);
        if (verseDetails) {
          setVerseDetails({
            ...verseDetails,
            bookmark: { is_bookmarked: true, color: "amber", note: "" }
          });
        }
      } catch (e) {
        console.error("Failed to add bookmark:", e);
      }
    }
  }

  // Save Inline Personal Note
  async function handleCreateNote() {
    if (!selectedVerse || !currentBook || !newNoteTitle.trim() || !newNoteContent.trim()) return;
    setNoteSaving(true);
    const scriptureRef = `${currentBook.name_vi} ${selectedVerse.chapter}:${selectedVerse.verse}`;
    const tagArray = newNoteTags.split(",").map(t => t.trim()).filter(Boolean);

    try {
      const res = await fetch(`${apiUrl}/api/study/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newNoteTitle.trim(),
          scripture_ref: scriptureRef,
          content: newNoteContent.trim(),
          tags: tagArray
        })
      });

      if (res.ok) {
        const savedNote = await res.json();
        setNewNoteTitle("");
        setNewNoteContent("");
        setNewNoteTags("");
        // Refresh verse details
        if (verseDetails) {
          setVerseDetails({
            ...verseDetails,
            user_notes: [savedNote, ...verseDetails.user_notes]
          });
        }
      }
    } catch (e) {
      console.error("Failed to save study note:", e);
    } finally {
      setNoteSaving(false);
    }
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
            <div className={`flex flex-col gap-3 font-serif leading-relaxed ${
              fontSize === "sm" ? "text-base md:text-lg" : fontSize === "lg" ? "text-xl md:text-2xl" : "text-lg md:text-xl"
            }`}>
              {chapterData.verses.map((v, idx) => {
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
                        setActiveDrawerTab("insight");
                      }}
                      className={`group p-3 rounded-2xl cursor-pointer transition-all duration-200 flex items-start gap-3.5 border ${
                        isSelected 
                          ? "bg-blue-950/70 border-blue-500/60 shadow-lg shadow-blue-950/60" 
                          : isBookmarked
                            ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-400/50"
                            : "hover:bg-slate-900/60 border-transparent hover:border-slate-800"
                      }`}
                    >
                      {/* Verse Number Pill */}
                      <span className={`select-none text-xs font-sans font-bold pt-1 min-w-[1.75rem] text-right ${
                        isSelected 
                          ? "text-blue-400" 
                          : isBookmarked 
                            ? "text-amber-400 font-extrabold" 
                            : "text-slate-500 group-hover:text-blue-400"
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
                          <span className="inline-block ml-2 text-amber-400 text-xs" title="Đã lưu vào danh sách Đánh Dấu">
                            ★
                          </span>
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

      {/* Selected Verse Deep Theological Context Drawer (Bottom Sliding Panel) */}
      {selectedVerse && (
        <aside className="fixed bottom-0 inset-x-0 z-50 bg-[#0c1220]/95 backdrop-blur-2xl border-t border-slate-700/80 shadow-2xl p-4 md:px-8 max-w-4xl mx-auto rounded-t-3xl transition-all animate-in slide-in-from-bottom duration-200 flex flex-col gap-3">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5" />
                {currentBook?.name_vi} {selectedVerse.chapter}:{selectedVerse.verse}
              </span>
              {selectedVerse.section_title && (
                <span className="text-xs text-slate-400 hidden sm:inline">
                  • {selectedVerse.section_title}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Jump to Deep Passage Exegesis in /study */}
              <Link
                href={`/study?ref=${encodeURIComponent(`${currentBook?.name_vi} ${selectedVerse.chapter}:${selectedVerse.verse}`)}`}
                className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 text-[11px] font-semibold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
                title="Mở phân tích thần học & bối cảnh đoạn văn"
              >
                <span>Nghiên cứu đoạn</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <button 
                type="button"
                onClick={() => setSelectedVerse(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Verse Snippet Text */}
          <p className="text-xs md:text-sm font-serif text-slate-300 italic line-clamp-2 px-1">
            &ldquo;{selectedVerse.text}&rdquo;
          </p>

          {/* Drawer Navigation Tabs */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs font-medium border-b border-slate-800/60 pb-2">
            <button
              type="button"
              onClick={() => setActiveDrawerTab("insight")}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeDrawerTab === "insight"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI & Tổng Quan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDrawerTab("lexicon")}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeDrawerTab === "lexicon"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>Từ Ngữ Gốc ({verseDetails?.lexicon?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDrawerTab("entities")}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeDrawerTab === "entities"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Thực Thể ({(verseDetails?.entities?.people?.length || 0) + (verseDetails?.entities?.places?.length || 0) + (verseDetails?.entities?.events?.length || 0)})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDrawerTab("notes")}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeDrawerTab === "notes"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ghi Chú ({verseDetails?.user_notes?.length || 0})</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="max-h-64 overflow-y-auto pr-1">
            {/* TAB 1: INSIGHT & AI EXPLANATION */}
            {activeDrawerTab === "insight" && (
              <div className="flex flex-col gap-3">
                {/* Actions Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyVerse(selectedVerse)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>

                  {/* Bookmark Button (DB synced) */}
                  <button
                    type="button"
                    onClick={() => toggleBookmark(selectedVerse)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarkedVerses.includes(selectedVerse.verse_code) ? "text-amber-400 fill-amber-400" : ""}`} />
                    <span>{bookmarkedVerses.includes(selectedVerse.verse_code) ? "Đã đánh dấu" : "Đánh dấu"}</span>
                  </button>

                  {/* Ask AI Button */}
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={() => handleAskAi(selectedVerse)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
                  >
                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Hỏi AI Giải Thích</span>
                  </button>
                </div>

                {/* AI Explanation Box */}
                {aiExplanation && (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-blue-500/30 text-xs text-slate-200 leading-relaxed flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-blue-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5" /> Giải nghĩa thần học & bối cảnh (Ollama Qwen):
                    </div>
                    <div className="whitespace-pre-wrap font-sans text-slate-300">
                      {aiExplanation}
                    </div>
                  </div>
                )}

                {aiError && (
                  <div className="text-xs text-red-400">
                    {aiError}
                  </div>
                )}

                {/* Cross References Previews */}
                {verseDetails?.cross_references && verseDetails.cross_references.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Các phân đoạn song song & tham chiếu chéo:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {verseDetails.cross_references.map(cr => (
                        <div key={cr.reference} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col gap-1">
                          <span className="font-bold text-blue-400 flex items-center gap-1">
                            ⚓ {cr.reference}
                          </span>
                          {cr.preview_text ? (
                            <p className="font-serif text-slate-400 italic line-clamp-2">
                              &ldquo;{cr.preview_text}&rdquo;
                            </p>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Nhấp để xem liên kết</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: STRONG LEXICON (ORIGINAL LANGUAGES) */}
            {activeDrawerTab === "lexicon" && (
              <div className="flex flex-col gap-3">
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Đang tra cứu từ điển ngữ căn Strong...</span>
                  </div>
                ) : verseDetails?.lexicon && verseDetails.lexicon.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {verseDetails.lexicon.map(item => (
                      <div 
                        key={item.id}
                        className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                              {item.strong_number}
                            </span>
                            <span className="text-xs uppercase font-semibold text-slate-400">
                              {item.language === "greek" ? "Hy Lạp" : "Hê-bơ-rơ"}
                            </span>
                          </div>
                          <Link
                            href={`/study?word=${item.strong_number}`}
                            className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>Xem tra cứu</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-amber-200" dir={item.language === "hebrew" ? "rtl" : "ltr"}>
                            {item.lemma}
                          </span>
                          <span className="text-xs italic text-slate-400">
                            {item.transliteration} ({item.pronunciation})
                          </span>
                        </div>

                        {item.part_of_speech && (
                          <div className="text-[11px] text-slate-400">
                            Từ loại: <span className="text-slate-300">{item.part_of_speech}</span>
                          </div>
                        )}

                        <p className="text-xs text-slate-200 leading-snug">
                          {item.definition}
                        </p>

                        {item.theological_significance && (
                          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                            <span className="text-amber-400 font-semibold">Ý nghĩa thần học: </span>
                            {item.theological_significance}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center">
                    Không tìm thấy từ ngữ căn Strong đặc biệt cho câu này. Hãy mở chế độ Phân Tích Thần Học ở trang Nghiên Cứu.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CONNECT LAYER ENTITIES (PEOPLE, PLACES, EVENTS) */}
            {activeDrawerTab === "entities" && (
              <div className="flex flex-col gap-4">
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Đang trích xuất mạng lưới thực thể...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* People */}
                    {verseDetails?.entities.people && verseDetails.entities.people.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> Nhân vật Kinh Thánh:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {verseDetails.entities.people.map(p => (
                            <div key={p.slug} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs">{p.name_vi}</span>
                                <Link 
                                  href={`/explore?tab=graph&search=${encodeURIComponent(p.name_vi)}`}
                                  className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5"
                                >
                                  Graph <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              </div>
                              <span className="text-[11px] text-slate-400">{p.role}</span>
                              <p className="text-[11px] text-slate-300 line-clamp-2">{p.summary}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Places */}
                    {verseDetails?.entities.places && verseDetails.entities.places.length > 0 && (
                      <div className="flex flex-col gap-2 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Địa danh & Tọa độ Địa lý:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {verseDetails.entities.places.map(pl => (
                            <div key={pl.slug} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs">{pl.name_vi}</span>
                                <Link 
                                  href={`/explore?tab=map&place=${encodeURIComponent(pl.slug)}`}
                                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                                >
                                  Bản đồ <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              </div>
                              <span className="text-[11px] text-slate-400">Hiện đại: {pl.modern_name}</span>
                              <p className="text-[11px] text-slate-300 line-clamp-2">{pl.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Events */}
                    {verseDetails?.entities.events && verseDetails.entities.events.length > 0 && (
                      <div className="flex flex-col gap-2 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Sự kiện & Biến cố Cứu chuộc:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {verseDetails.entities.events.map(ev => (
                            <div key={ev.slug} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs">{ev.title}</span>
                                <Link 
                                  href={`/explore?tab=timeline&event=${encodeURIComponent(ev.slug)}`}
                                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                                >
                                  Timeline <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              </div>
                              <span className="text-[11px] text-slate-400">Thời kỳ: {ev.period}</span>
                              <p className="text-[11px] text-slate-300 line-clamp-2">{ev.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!verseDetails?.entities.people?.length && !verseDetails?.entities.places?.length && !verseDetails?.entities.events?.length) && (
                      <div className="text-xs text-slate-400 py-6 text-center">
                        Không có thực thể đặc biệt được liên kết trực tiếp với câu này. Bạn có thể mở Knowledge Graph toàn diện ở trang Khám Phá.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PERSONAL STUDY NOTES (POSTGRESQL SYNC) */}
            {activeDrawerTab === "notes" && (
              <div className="flex flex-col gap-4">
                {/* Existing Notes List */}
                {verseDetails?.user_notes && verseDetails.user_notes.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Ghi chú đã lưu ({verseDetails.user_notes.length}):
                    </span>
                    {verseDetails.user_notes.map(note => (
                      <div key={note.id} className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-white">{note.title}</h4>
                          <span className="text-[10px] text-slate-500">
                            {new Date(note.updated_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap font-sans">
                          {note.content}
                        </p>
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {note.tags.map(t => (
                              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Chưa có ghi chú nào cho câu này. Hãy viết bài học và suy ngẫm cá nhân của bạn bên dưới:
                  </p>
                )}

                {/* Create Note Inline Form */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Thêm Ghi Chú Mới Cho Câu Này
                  </span>
                  <input
                    type="text"
                    value={newNoteTitle}
                    onChange={e => setNewNoteTitle(e.target.value)}
                    placeholder="Tiêu đề ghi chú (VD: Suy ngẫm về đức tin của Phi-e-rơ)..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <textarea
                    rows={2}
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    placeholder="Nội dung suy ngẫm, bài học thuộc linh, hoặc điều cần áp dụng..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-sans"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={newNoteTags}
                      onChange={e => setNewNoteTags(e.target.value)}
                      placeholder="Thẻ gắn (cách nhau dấu phẩy, VD: ductin, phero)..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      disabled={noteSaving || !newNoteTitle.trim() || !newNoteContent.trim()}
                      onClick={handleCreateNote}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
                    >
                      {noteSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      <span>Lưu Ghi Chú</span>
                    </button>
                  </div>
                </div>
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
                                currentBookCode.toLowerCase() === b.code.toLowerCase()
                                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
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
                                currentBookCode.toLowerCase() === b.code.toLowerCase()
                                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
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

      {/* Chapter Selection Modal */}
      {isChapterModalOpen && currentBook && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 max-w-xl w-full max-h-[80vh] rounded-3xl p-6 flex flex-col gap-5 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Chọn đoạn trong sách <span className="text-blue-400">{currentBook.name_vi}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsChapterModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {Array.from({ length: currentBook.total_chapters }, (_, i) => i + 1).map(cNum => (
                  <button
                    key={cNum}
                    type="button"
                    onClick={() => selectBookAndChapter(currentBook.code, cNum)}
                    className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                      currentChapter === cNum
                        ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30"
                        : "bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {cNum}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-text Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 max-w-2xl w-full max-h-[85vh] rounded-3xl p-6 flex flex-col gap-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" /> Tìm kiếm toàn văn Kinh Thánh
              </h3>
              <button 
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={e => { e.preventDefault(); handleSearch(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Nhập từ khóa (VD: 'yêu thương', 'bình an', 'đức tin')..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tìm"}
              </button>
            </form>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
              {searchResults.length > 0 ? (
                searchResults.map(r => (
                  <div
                    key={r.global_id}
                    onClick={() => {
                      const matchedBook = books.find(b => b.name_vi.toLowerCase() === r.book.toLowerCase());
                      if (matchedBook) {
                        selectBookAndChapter(matchedBook.code, r.chapter);
                        setIsSearchOpen(false);
                      }
                    }}
                    className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-colors flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-400">
                        {r.book} {r.chapter}:{r.verse}
                      </span>
                      {r.section_title && (
                        <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                          {r.section_title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-serif text-slate-300 line-clamp-2">
                      {r.text}
                    </p>
                  </div>
                ))
              ) : searchQuery && !searchLoading ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  Không tìm thấy câu Kinh Thánh phù hợp cho từ khóa &quot;{searchQuery}&quot;
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
