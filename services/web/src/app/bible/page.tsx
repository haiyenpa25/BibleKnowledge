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
  ArrowRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Settings2,
  Sliders,
  Download,
  FileDown,
  Eye,
  AlignLeft,
  AlignJustify,
  Layers,
  BrainCircuit,
  Network,
  GitBranch,
  Filter,
  Info
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

interface ParallelLexiconItem {
  strong_number: string;
  language: "greek" | "hebrew";
  lemma: string;
  transliteration: string;
  pronunciation?: string;
  definition: string;
  matched_keyword: string;
}

interface ParallelVerse {
  global_id: number;
  verse_code: number;
  chapter: number;
  verse: number;
  section_title: string;
  text_vi: string;
  text_target: string;
  cross_references: string[];
  lexicon: ParallelLexiconItem[];
}

interface ParallelChapterData {
  book: BookMeta;
  chapter: number;
  total_verses: number;
  source_translation: { id: string; name: string; language: string };
  target_translation: { id: string; name: string; language: string };
  verses: ParallelVerse[];
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
    connection_type?: string;
    connection_label?: string;
    badge_color?: string;
  }[];
  harmony_event?: {
    event_id: string;
    title_vi: string;
    title_en: string;
    category: string;
    period_date?: string;
    location?: string;
    summary?: string;
    current_focus?: string;
    parallels: Array<{
      key: string;
      book_name: string;
      ref: string;
      theological_focus: string;
      is_current: boolean;
    }>;
    synoptic_distinctives?: {
      shared_elements: string[];
      unique_details: Record<string, string>;
      theological_significance: string;
      key_themes: string[];
    };
  } | null;
  citations?: {
    reference: string;
    sbl: string;
    chicago: string;
    apa: string;
    mla: string;
    bibtex: string;
    markdown: string;
  } | null;
}

interface CrossRefPreviewData {
  reference: string;
  book: string;
  total_verses: number;
  verses: {
    global_id: number;
    verse_code: number;
    book: string;
    chapter: number;
    verse: number;
    section_title?: string;
    text: string;
  }[];
}

interface ExportBundleData {
  summary: {
    total_notes: number;
    total_bookmarks: number;
    total_projects: number;
  };
  markdown_bundle: string;
}

interface PassageExegesisData {
  reference: string;
  book_name: string;
  chapter_range: string;
  total_verses: number;
  historical_context: string;
  literary_genre: string;
  author_and_date: string;
  people: string[];
  locations: string[];
  events: string[];
  structure_outline: Array<{
    section_title: string;
    verse_range: string;
    summary: string;
    key_truth: string;
  }>;
  keywords: Array<{
    word: string;
    strong_number?: string;
    original_lemma?: string;
    meaning: string;
  }>;
  cross_references: string[];
  theological_themes: string[];
  reflection_questions: string[];
  scholarly_commentary_citations: Array<{
    source_title: string;
    author: string;
    page_or_section: string;
    quote: string;
    theological_tradition?: string;
  }>;
  hermeneutical_takeaway: string;
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
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  // Reader Settings States (§2.1 & §2.2)
  const [viewMode, setViewMode] = useState<"verse" | "paragraph" | "parallel" | "interlinear">("verse");
  const [parallelData, setParallelData] = useState<ParallelChapterData | null>(null);
  const [parallelLoading, setParallelLoading] = useState(false);
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("md");
  const [readerTheme, setReaderTheme] = useState<"midnight" | "sepia" | "pure-black">("midnight");
  const [redLetter, setRedLetter] = useState(true);

  // Multi-Translation & Parallel Alignment States (§2.1, Horizon Item)
  const [targetTranslation, setTargetTranslation] = useState<string>("kjv");
  const [availableTranslations, setAvailableTranslations] = useState<any[]>([
    { id: "vi_1934", name: "Bản Dịch Truyền Thống 1925", short_name: "BTT 1925", language: "vi", language_label: "Tiếng Việt" },
    { id: "kjv", name: "King James Version (KJV 1611)", short_name: "KJV", language: "en", language_label: "English" },
    { id: "web", name: "World English Bible (WEB)", short_name: "WEB", language: "en", language_label: "English" },
    { id: "asv", name: "American Standard Version (ASV 1901)", short_name: "ASV", language: "en", language_label: "English" }
  ]);
  const [comparisonVerse, setComparisonVerse] = useState<any | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [copiedComparisonId, setCopiedComparisonId] = useState<string | null>(null);

  // Cross-Reference Preview State
  const [previewRef, setPreviewRef] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<CrossRefPreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Cross-Reference Network Visualizer & Redemptive Chains State (§18)
  const [networkData, setNetworkData] = useState<any | null>(null);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkViewMode, setNetworkViewMode] = useState<"graph" | "verses" | "chain">("graph");
  const [selectedNetworkNode, setSelectedNetworkNode] = useState<any | null>(null);
  const [networkFilter, setNetworkFilter] = useState<string>("all");

  // Web Speech API Audio Narration State
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [narratingVerse, setNarratingVerse] = useState<number | null>(null);
  const [narrationRate, setNarrationRate] = useState<number>(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Export Bundle State
  const [exportBundleData, setExportBundleData] = useState<ExportBundleData | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  // Verse Details (Entities, Strong Lexicon, Notes, Bookmark)
  const [verseDetails, setVerseDetails] = useState<VerseDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"insight" | "exegesis" | "interlinear" | "harmony" | "citations" | "lexicon" | "entities" | "notes" | "translations">("insight");
  const [copiedCitationKey, setCopiedCitationKey] = useState<string | null>(null);

  // Word-by-Word Interlinear Exegesis State (§2.1, §49)
  const [interlinearData, setInterlinearData] = useState<any | null>(null);
  const [interlinearLoading, setInterlinearLoading] = useState(false);
  const [interlinearError, setInterlinearError] = useState<string | null>(null);
  const [copiedInterlinear, setCopiedInterlinear] = useState(false);

  // Inline Exegesis State (§13)
  const [exegesisData, setExegesisData] = useState<PassageExegesisData | null>(null);
  const [exegesisLoading, setExegesisLoading] = useState(false);
  const [exegesisError, setExegesisError] = useState<string | null>(null);

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

  // Fetch user bookmarks from database with offline localStorage fallback
  useEffect(() => {
    async function loadBookmarks() {
      // 1. Instant offline hydration from localStorage
      try {
        const cached = typeof window !== "undefined" ? localStorage.getItem("bible_cached_bookmarks") : null;
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBookmarkedVerses(parsed);
          }
        }
      } catch (_) {}

      // 2. Network sync
      try {
        const res = await fetch(`${apiUrl}/api/study/bookmarks`);
        if (res.ok) {
          const data = await res.json();
          const codes = data.map((b: { verse_code: number }) => b.verse_code);
          setBookmarkedVerses(codes);
          if (typeof window !== "undefined") {
            localStorage.setItem("bible_cached_bookmarks", JSON.stringify(codes));
          }
        }
      } catch (e) {
        console.warn("Offline: bookmarks loaded from local cache", e);
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
      stopNarration();
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

  // Fetch available translations on mount (§2.1, Horizon Item)
  useEffect(() => {
    async function loadTranslations() {
      try {
        const res = await fetch(`${apiUrl}/api/bible/translations`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAvailableTranslations(data);
          }
        }
      } catch (err) {
        console.error("Failed to load translations:", err);
      }
    }
    loadTranslations();
  }, [apiUrl]);

  // Load parallel chapter data when parallel or interlinear view is active (§2.1 & §31)
  useEffect(() => {
    if (viewMode !== "parallel" && viewMode !== "interlinear") return;

    let isMounted = true;
    async function loadParallel() {
      setParallelLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/bible/parallel-chapter?book=${currentBookCode}&chapter=${currentChapter}&target_translation=${targetTranslation}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setParallelData(data);
        }
      } catch (e) {
        console.error("Failed to load parallel chapter:", e);
      } finally {
        if (isMounted) setParallelLoading(false);
      }
    }
    loadParallel();

    return () => {
      isMounted = false;
    };
  }, [currentBookCode, currentChapter, viewMode, targetTranslation, apiUrl]);

  // Verse comparison handlers (§2.1, Horizon Item)
  const handleOpenVerseComparison = async (verseNum: number) => {
    setComparisonLoading(true);
    setIsComparisonModalOpen(true);
    try {
      const res = await fetch(`${apiUrl}/api/bible/compare-verse?book=${currentBookCode}&chapter=${currentChapter}&verse=${verseNum}&translations=vi_1934,kjv,web,asv`);
      if (res.ok) {
        const data = await res.json();
        setComparisonVerse(data);
      }
    } catch (e) {
      console.error("Failed to load verse comparison:", e);
    } finally {
      setComparisonLoading(false);
    }
  };

  const handleCopySingleTranslation = (tr: any, ref: string) => {
    const textToCopy = `"${tr.text}" — ${ref} (${tr.short_name})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedComparisonId(tr.id);
    setTimeout(() => setCopiedComparisonId(null), 2000);
  };

  const handleCopyAllTranslations = (data: any) => {
    if (!data || !data.translations) return;
    const lines = [
      `### ĐỐI CHIẾU ĐA BẢN DỊCH: ${data.reference}`,
      ""
    ];
    for (const tr of data.translations) {
      lines.push(`**${tr.name} (${tr.short_name})**:`);
      lines.push(`> "${tr.text}"`);
      lines.push("");
    }
    lines.push(`*BibleKnowledge — Hệ sinh thái Tri Thức Kinh Thánh*`);
    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedComparisonId("all");
    setTimeout(() => setCopiedComparisonId(null), 2500);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  // Gospel / Revelation check for Red Letter feature
  const isGospelOrRev = useMemo(() => {
    if (!currentBook) return false;
    const c = currentBook.code.toLowerCase();
    return ["mat", "mrk", "luk", "jhn", "rev", "mt", "mk", "lk", "jn"].includes(c);
  }, [currentBook]);

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

  function copyCitationText(key: string, text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCitationKey(key);
    setTimeout(() => setCopiedCitationKey(null), 2500);
  }

  // Persistent Bookmark Toggle with Offline Fallback
  async function toggleBookmark(verse: Verse) {
    if (!currentBook) return;
    const isBookmarked = bookmarkedVerses.includes(verse.verse_code);
    const scriptureRef = `${currentBook.name_vi} ${verse.chapter}:${verse.verse}`;

    if (isBookmarked) {
      const nextBookmarks = bookmarkedVerses.filter(c => c !== verse.verse_code);
      setBookmarkedVerses(nextBookmarks);
      if (typeof window !== "undefined") {
        localStorage.setItem("bible_cached_bookmarks", JSON.stringify(nextBookmarks));
      }
      try {
        await fetch(`${apiUrl}/api/study/bookmarks/${verse.verse_code}`, { method: "DELETE" });
      } catch (e) {
        console.warn("Offline: bookmark deletion cached locally", e);
      }
      if (verseDetails) {
        setVerseDetails({
          ...verseDetails,
          bookmark: { is_bookmarked: false, color: null, note: null }
        });
      }
    } else {
      const nextBookmarks = [...bookmarkedVerses, verse.verse_code];
      setBookmarkedVerses(nextBookmarks);
      if (typeof window !== "undefined") {
        localStorage.setItem("bible_cached_bookmarks", JSON.stringify(nextBookmarks));
      }
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
      } catch (e) {
        console.warn("Offline: bookmark addition cached locally", e);
      }
      if (verseDetails) {
        setVerseDetails({
          ...verseDetails,
          bookmark: { is_bookmarked: true, color: "amber", note: "" }
        });
      }
    }
  }

  // Save Inline Personal Note with Offline Fallback
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
        if (verseDetails) {
          setVerseDetails({
            ...verseDetails,
            user_notes: [savedNote, ...verseDetails.user_notes]
          });
        }
      } else {
        throw new Error("API call failed");
      }
    } catch (e) {
      // Offline fallback: store locally
      const offlineNote = {
        id: `offline-${Date.now()}`,
        title: newNoteTitle.trim(),
        scripture_ref: scriptureRef,
        content: newNoteContent.trim(),
        tags: tagArray,
        updated_at: new Date().toISOString()
      };
      setNewNoteTitle("");
      setNewNoteContent("");
      setNewNoteTags("");
      if (verseDetails) {
        setVerseDetails({
          ...verseDetails,
          user_notes: [offlineNote, ...verseDetails.user_notes]
        });
      }
      try {
        const cached = JSON.parse(localStorage.getItem("bible_cached_notes") || "[]");
        localStorage.setItem("bible_cached_notes", JSON.stringify([offlineNote, ...cached]));
      } catch (_) {}
    } finally {
      setNoteSaving(false);
    }
  }

  // Inline Exegesis Fetcher (§13)
  async function handleLoadExegesis(refOverride?: string) {
    if (!selectedVerse || !currentBook) return;
    const targetRef = refOverride || `${currentBook.name_vi} ${selectedVerse.chapter}:${selectedVerse.verse}`;
    setActiveDrawerTab("exegesis");
    setExegesisLoading(true);
    setExegesisError(null);

    try {
      const res = await fetch(`${apiUrl}/api/rag/passage-study`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: targetRef })
      });
      if (res.ok) {
        const data = await res.json();
        setExegesisData(data);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setExegesisError(errJson.detail || "Không thể tải dữ liệu giải kinh phân đoạn.");
      }
    } catch (e: any) {
      setExegesisError(e.message || "Lỗi kết nối khi tải giải kinh.");
    } finally {
      setExegesisLoading(false);
    }
  }

  // Word-by-word Interlinear Fetcher (§2.1, §49)
  async function handleLoadInterlinear(verseCodeOrRef?: number | string) {
    setActiveDrawerTab("interlinear");
    setInterlinearLoading(true);
    setInterlinearError(null);

    try {
      let query = "";
      if (typeof verseCodeOrRef === "number") {
        query = `verse_code=${verseCodeOrRef}`;
      } else if (typeof verseCodeOrRef === "string") {
        query = `ref=${encodeURIComponent(verseCodeOrRef)}`;
      } else if (selectedVerse) {
        query = `verse_code=${selectedVerse.verse_code}`;
      } else {
        return;
      }

      const res = await fetch(`${apiUrl}/api/bible/verse-interlinear?${query}`);
      if (res.ok) {
        const data = await res.json();
        setInterlinearData(data);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setInterlinearError(errJson.detail || "Không thể tải phân tích nguyên ngữ liên dòng.");
      }
    } catch (e: any) {
      setInterlinearError(e.message || "Lỗi kết nối khi tải phân tích liên dòng.");
    } finally {
      setInterlinearLoading(false);
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

  // Cross-reference preview popover & network visualizer (§18)
  async function handleOpenCrossReference(ref: string, chainId?: string) {
    setPreviewRef(ref);
    setPreviewLoading(true);
    setNetworkLoading(true);
    setPreviewData(null);
    setNetworkData(null);
    setSelectedNetworkNode(null);

    // 1. Fetch verse-range for quick text preview
    fetch(`${apiUrl}/api/bible/verse-range?ref=${encodeURIComponent(ref)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setPreviewData(data);
      })
      .catch(e => console.error("Verse range load error:", e))
      .finally(() => setPreviewLoading(false));

    // 2. Fetch full cross-references network & typological chains (§18)
    const netUrl = chainId 
      ? `${apiUrl}/api/bible/cross-references/network?chain_id=${encodeURIComponent(chainId)}`
      : `${apiUrl}/api/bible/cross-references/network?ref=${encodeURIComponent(ref)}`;

    try {
      const netRes = await fetch(netUrl);
      if (netRes.ok) {
        const netJson = await netRes.json();
        setNetworkData(netJson);
        if (netJson.root) {
          setSelectedNetworkNode(netJson.root);
        }
      }
    } catch (e) {
      console.error("Network visualizer load error:", e);
    } finally {
      setNetworkLoading(false);
    }
  }

  // Navigate to cross reference chapter
  function navigateToCrossReferenceChapter(preview: CrossRefPreviewData) {
    if (!preview || !preview.verses.length) return;
    const targetBook = books.find(b => b.name_vi.toLowerCase() === preview.book.toLowerCase() || b.osis.toLowerCase() === preview.book.toLowerCase());
    if (targetBook) {
      setCurrentBookCode(targetBook.code);
      setCurrentChapter(preview.verses[0].chapter);
      setPreviewRef(null);
      setPreviewData(null);
    }
  }

  // Web Speech API Narration
  function startNarration(verseIndex = 0) {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !chapterData) return;
    window.speechSynthesis.cancel();
    setIsAudioActive(true);
    setIsAudioPlaying(true);

    function speakVerse(idx: number) {
      if (!chapterData || idx >= chapterData.verses.length) {
        stopNarration();
        return;
      }

      const v = chapterData.verses[idx];
      setNarratingVerse(v.verse);

      // Auto-scroll verse into view smoothly
      const elem = document.getElementById(`verse-row-${v.verse}`);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      const textToSpeak = `Câu ${v.verse}. ${v.text}`;
      const utt = new SpeechSynthesisUtterance(textToSpeak);
      utt.lang = "vi-VN";
      utt.rate = narrationRate;

      utt.onend = () => {
        speakVerse(idx + 1);
      };
      utt.onerror = () => {
        stopNarration();
      };

      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
    }

    speakVerse(verseIndex);
  }

  function pauseNarration() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsAudioPlaying(false);
    }
  }

  function resumeNarration() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setIsAudioPlaying(true);
    }
  }

  function stopNarration() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsAudioActive(false);
    setIsAudioPlaying(false);
    setNarratingVerse(null);
  }

  // Export Study Bundle
  async function handleOpenExportModal() {
    setIsExportModalOpen(true);
    setExportLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/study/export-bundle`);
      if (res.ok) {
        const data = await res.json();
        setExportBundleData(data);
      }
    } catch (e) {
      console.error("Failed to load export bundle:", e);
    } finally {
      setExportLoading(false);
    }
  }

  function handleCopyMarkdownBundle() {
    if (!exportBundleData?.markdown_bundle) return;
    navigator.clipboard.writeText(exportBundleData.markdown_bundle);
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2500);
  }

  function handleDownloadMarkdownFile() {
    if (!exportBundleData?.markdown_bundle) return;
    const blob = new Blob([exportBundleData.markdown_bundle], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BibleKnowledge_Study_Notebook_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Smart Red Letter Renderer
  function renderVerseBody(text: string) {
    if (!redLetter || !isGospelOrRev) {
      return <span>{text}</span>;
    }

    const colonIdx = text.indexOf(":");
    if (colonIdx === -1) {
      return <span>{text}</span>;
    }

    const intro = text.substring(0, colonIdx + 1);
    const speech = text.substring(colonIdx + 1);
    const introLower = intro.toLowerCase();

    const isJesusSpeaking =
      (introLower.includes("đức chúa jêsus") ||
       introLower.includes("đức chúa giê-xu") ||
       introLower.includes("ngài") ||
       introLower.includes("chúa jêsus") ||
       introLower.includes("con người")) &&
      (introLower.includes("phán") ||
       introLower.includes("đáp") ||
       introLower.includes("nói"));

    if (!isJesusSpeaking) {
      return <span>{text}</span>;
    }

    return (
      <span>
        <span className="opacity-80">{intro}</span>
        <span className={`font-medium transition-colors ${
          readerTheme === "sepia" ? "text-amber-300" : "text-rose-400"
        }`}>
          {speech}
        </span>
      </span>
    );
  }

  // Pericopes for Continuous Paragraph Mode
  const pericopeGroups = useMemo(() => {
    if (!chapterData) return [];
    const groups: { title: string; verses: Verse[] }[] = [];
    let currentGroup: { title: string; verses: Verse[] } | null = null;

    for (const v of chapterData.verses) {
      const title = v.section_title || "Toàn Văn";
      if (!currentGroup || currentGroup.title !== title) {
        currentGroup = { title, verses: [v] };
        groups.push(currentGroup);
      } else {
        currentGroup.verses.push(v);
      }
    }
    return groups;
  }, [chapterData]);

  // Theme Stylings
  const themeStyles = useMemo(() => {
    if (readerTheme === "sepia") {
      return {
        bg: "bg-[#18140e] text-[#f4ebd0]",
        header: "bg-[#18140e]/95 border-[#382f25]",
        card: "hover:bg-[#231b14] border-[#382f25]/60 text-[#f3ead3]",
        cardSelected: "bg-[#2f2217] border-amber-600/70 shadow-lg shadow-amber-950/40",
        cardActiveAudio: "bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/50",
        accentBadge: "text-amber-400 bg-amber-950/60 border-amber-800/40",
        verseNum: "text-amber-400/80",
        verseNumSelected: "text-amber-300 font-bold",
        subText: "text-[#c2b49c]"
      };
    }
    if (readerTheme === "pure-black") {
      return {
        bg: "bg-[#000000] text-slate-100",
        header: "bg-[#000000]/95 border-[#222222]",
        card: "hover:bg-[#0c0c0c] border-[#1e1e1e] text-slate-100",
        cardSelected: "bg-[#141414] border-blue-500/80 shadow-lg shadow-black",
        cardActiveAudio: "bg-blue-950/50 border-blue-500/80 ring-1 ring-blue-500/50",
        accentBadge: "text-blue-400 bg-blue-950/40 border-blue-800/40",
        verseNum: "text-slate-500",
        verseNumSelected: "text-blue-400 font-bold",
        subText: "text-slate-400"
      };
    }
    // midnight default
    return {
      bg: "bg-[#090d16] text-slate-100",
      header: "bg-[#090d16]/90 border-slate-800",
      card: "hover:bg-slate-900/60 border-slate-800/50 text-slate-200",
      cardSelected: "bg-blue-950/70 border-blue-500/60 shadow-lg shadow-blue-950/60",
      cardActiveAudio: "bg-indigo-950/60 border-indigo-500/80 ring-1 ring-indigo-500/50",
      accentBadge: "text-blue-400 bg-blue-950/40 border-blue-800/40",
      verseNum: "text-slate-500",
      verseNumSelected: "text-blue-400 font-bold",
      subText: "text-slate-400"
    };
  }, [readerTheme]);

  return (
    <div className={`min-h-screen ${themeStyles.bg} flex flex-col transition-colors duration-300`}>
      {/* Top Header / Sticky Navigation Bar */}
      <header className={`sticky top-0 z-40 ${themeStyles.header} backdrop-blur-md border-b px-4 md:px-8 py-3 flex items-center justify-between gap-3 shadow-md`}>
        {/* Left: App Logo & Back to Dashboard */}
        <div className="flex items-center gap-2.5">
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Book Selector Button */}
          <button
            type="button"
            onClick={() => setIsBookModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px] sm:max-w-none">{currentBook?.name_vi || "Chọn Sách"}</span>
          </button>

          {/* Chapter Selector Button */}
          <button
            type="button"
            onClick={() => setIsChapterModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all"
          >
            Đoạn {currentChapter}
          </button>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-1">
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

        {/* Right: Audio Narration, Reader Options, Search, Export */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio Read-Aloud Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (isAudioActive) {
                if (isAudioPlaying) {
                  pauseNarration();
                } else {
                  resumeNarration();
                }
              } else {
                startNarration(0);
              }
            }}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
              isAudioActive && isAudioPlaying
                ? "bg-rose-600/30 text-rose-300 border-rose-500/50 animate-pulse"
                : isAudioActive
                  ? "bg-amber-600/30 text-amber-300 border-amber-500/50"
                  : "bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60"
            }`}
            title={isAudioActive ? (isAudioPlaying ? "Tạm dừng đọc" : "Tiếp tục đọc") : "Đọc thành tiếng đoạn này"}
          >
            {isAudioActive && isAudioPlaying ? (
              <Pause className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            )}
            <span className="hidden lg:inline">
              {isAudioActive ? (isAudioPlaying ? "Đang đọc" : "Tạm dừng") : "Nghe"}
            </span>
          </button>

          {isAudioActive && (
            <button
              type="button"
              onClick={stopNarration}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors"
              title="Dừng đọc"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick View Mode Switcher */}
          <div className="hidden lg:flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode("verse")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "verse"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Chế độ đọc từng câu đơn"
            >
              Đơn Cột
            </button>
            <button
              type="button"
              onClick={() => setViewMode("parallel")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                viewMode === "parallel"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Chế độ đối chiếu đa bản dịch song song (BTT / KJV / WEB / ASV)"
            >
              <Languages className="w-3 h-3 text-emerald-400" />
              <span>Đối Chiếu Song Song</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("interlinear")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                viewMode === "interlinear"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Chế độ liên dòng từ gốc Strong"
            >
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Liên Dòng Strong</span>
            </button>
          </div>

          {/* Reading Options Trigger */}
          <button
            type="button"
            onClick={() => setIsOptionsOpen(true)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs"
            title="Tùy chỉnh hiển thị & kiểu đọc"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Tùy biến</span>
          </button>

          {/* Export Study Bundle Trigger */}
          <button
            type="button"
            onClick={handleOpenExportModal}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1 text-xs"
            title="Xuất Sổ Tay Nghiên Cứu Markdown"
          >
            <Download className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs"
          >
            <Search className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Tìm kiếm</span>
          </button>
        </div>
      </header>

      {/* Audio Active Floating Control Banner */}
      {isAudioActive && (
        <div className="sticky top-[57px] z-30 bg-indigo-950/90 backdrop-blur-md border-b border-indigo-500/40 px-4 md:px-8 py-2 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-indigo-200 font-medium">
              Đang đọc diễn cảm: <strong className="text-white">{currentBook?.name_vi} đoạn {currentChapter}</strong>
              {narratingVerse && <span> (câu {narratingVerse})</span>}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Speed Controls */}
            <div className="flex items-center gap-1 bg-indigo-900/60 px-2 py-0.5 rounded-lg border border-indigo-700/50 text-[11px]">
              <span className="text-indigo-300">Tốc độ:</span>
              {[0.85, 1.0, 1.25].map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    setNarrationRate(rate);
                    if (isAudioPlaying && narratingVerse) {
                      startNarration(narratingVerse - 1);
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded ${narrationRate === rate ? "bg-indigo-600 text-white font-bold" : "text-indigo-300 hover:text-white"}`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={stopNarration}
              className="text-indigo-300 hover:text-white text-xs underline"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

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
              <h1 className={`text-3xl md:text-4xl ${fontFamily === "serif" ? "font-serif" : "font-sans"} font-bold tracking-tight`}>
                {currentBook?.name_vi}
              </h1>
              <div className={`text-xl ${fontFamily === "serif" ? "font-serif" : "font-sans"} ${themeStyles.subText} font-medium`}>
                Đoạn {currentChapter}
              </div>

              {/* Progress pill */}
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <span>{chapterData.total_verses} câu</span>
                <span>•</span>
                <span>Chương {currentChapter} / {currentBook?.total_chapters}</span>
                {isGospelOrRev && redLetter && (
                  <>
                    <span>•</span>
                    <span className="text-rose-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      Lời Chúa Chữ Đỏ
                    </span>
                  </>
                )}
              </div>

              {/* Quick Study & Exegesis Bridges */}
              <div className="flex items-center justify-center gap-2 pt-3 flex-wrap">
                <Link
                  href={`/research?passage=${encodeURIComponent(`${currentBook?.name_vi} ${currentChapter}`)}`}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Nghiên cứu phân đoạn chuyên sâu 11 chiều (dàn ý, bối cảnh, từ khóa Strong's, chú giải)"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Giải Kinh 11 Chiều (§13)</span>
                </Link>

                <Link
                  href={`/research?context=${encodeURIComponent(`${currentBook?.name_vi} ${currentChapter}`)}`}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Khám phá 6 chiều kích bối cảnh lịch sử, địa lý, chính trị"
                >
                  <Compass className="w-3.5 h-3.5 text-rose-400" />
                  <span>Bối Cảnh Đa Chiều (§15)</span>
                </Link>

                <Link
                  href="/learn?tab=plans"
                  className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Theo dõi tiến độ kế hoạch đọc Kinh Thánh"
                >
                  <BookMarked className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kế Hoạch Đọc (§3)</span>
                </Link>
              </div>
            </div>

            {/* View Mode 1: VERSE BY VERSE MODE */}
            {viewMode === "verse" && (
              <div className={`flex flex-col gap-3 ${fontFamily === "serif" ? "font-serif" : "font-sans"} leading-relaxed ${
                fontSize === "sm" 
                  ? "text-base md:text-lg" 
                  : fontSize === "lg" 
                    ? "text-xl md:text-2xl" 
                    : fontSize === "xl"
                      ? "text-2xl md:text-3xl"
                      : "text-lg md:text-xl"
              }`}>
                {chapterData.verses.map((v, idx) => {
                  const isNewSection = v.section_title && (idx === 0 || chapterData.verses[idx - 1].section_title !== v.section_title);
                  const isSelected = selectedVerse?.global_id === v.global_id;
                  const isBookmarked = bookmarkedVerses.includes(v.verse_code);
                  const isBeingNarrated = narratingVerse === v.verse;

                  return (
                    <React.Fragment key={v.global_id}>
                      {/* Section Heading */}
                      {isNewSection && (
                        <div className="pt-6 pb-2">
                          <div className={`inline-block text-xs md:text-sm font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${themeStyles.accentBadge}`}>
                            § {v.section_title}
                          </div>
                        </div>
                      )}

                      {/* Verse Line Item */}
                      <div
                        id={`verse-row-${v.verse}`}
                        onClick={() => {
                          setSelectedVerse(v);
                          setActiveDrawerTab("insight");
                        }}
                        className={`group p-3 rounded-2xl cursor-pointer transition-all duration-200 flex items-start gap-3.5 border ${
                          isSelected 
                            ? themeStyles.cardSelected 
                            : isBeingNarrated
                              ? themeStyles.cardActiveAudio
                              : isBookmarked
                                ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-400/60"
                                : themeStyles.card
                        }`}
                      >
                        {/* Verse Number Pill */}
                        <span className={`select-none text-xs font-sans font-bold pt-1 min-w-[1.75rem] text-right ${
                          isSelected 
                            ? themeStyles.verseNumSelected 
                            : isBeingNarrated
                              ? "text-indigo-400 font-extrabold animate-bounce"
                              : isBookmarked 
                                ? "text-amber-400 font-extrabold" 
                                : themeStyles.verseNum
                        }`}>
                          {v.verse}
                        </span>

                        {/* Text Body with Red Letter Logic */}
                        <div className="flex-1 leading-relaxed">
                          {renderVerseBody(v.text)}

                          {/* Cross Reference Tags */}
                          {v.cross_references && v.cross_references.length > 0 && (
                            <span className="inline-flex flex-wrap gap-1 ml-2 select-none">
                              {v.cross_references.map(ref => (
                                <button
                                  key={ref}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCrossReference(ref);
                                  }}
                                  className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hover:text-blue-300 hover:border-blue-500 transition-colors"
                                  title={`Xem nhanh phân đoạn đối chiếu: ${ref}`}
                                >
                                  ⚓ {ref}
                                </button>
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
            )}

            {/* View Mode 2: CONTINUOUS PARAGRAPH MODE (§2.1) */}
            {viewMode === "paragraph" && (
              <div className={`flex flex-col gap-6 ${fontFamily === "serif" ? "font-serif" : "font-sans"} leading-loose ${
                fontSize === "sm" 
                  ? "text-base md:text-lg" 
                  : fontSize === "lg" 
                    ? "text-xl md:text-2xl" 
                    : fontSize === "xl"
                      ? "text-2xl md:text-3xl"
                      : "text-lg md:text-xl"
              }`}>
                {pericopeGroups.map((group, gIdx) => (
                  <div key={gIdx} className="flex flex-col gap-3">
                    {group.title && (
                      <div className="pt-4 pb-1">
                        <div className={`inline-block text-xs md:text-sm font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${themeStyles.accentBadge}`}>
                          § {group.title}
                        </div>
                      </div>
                    )}

                    <p className={`p-4 rounded-2xl border transition-all text-justify ${themeStyles.card}`}>
                      {group.verses.map((v) => {
                        const isSelected = selectedVerse?.global_id === v.global_id;
                        const isBeingNarrated = narratingVerse === v.verse;
                        const isBookmarked = bookmarkedVerses.includes(v.verse_code);

                        return (
                          <span
                            key={v.global_id}
                            id={`verse-row-${v.verse}`}
                            onClick={() => {
                              setSelectedVerse(v);
                              setActiveDrawerTab("insight");
                            }}
                            className={`inline cursor-pointer transition-colors px-1 py-0.5 rounded ${
                              isSelected 
                                ? "bg-blue-900/60 ring-1 ring-blue-400" 
                                : isBeingNarrated
                                  ? "bg-indigo-950/70 ring-1 ring-indigo-400"
                                  : isBookmarked
                                    ? "bg-amber-950/30"
                                    : "hover:bg-slate-800/50"
                            }`}
                          >
                            {/* Superscript Verse Number */}
                            <sup className={`text-xs font-sans font-bold select-none mr-1 ${
                              isSelected 
                                ? "text-blue-400 font-extrabold" 
                                : isBeingNarrated
                                  ? "text-indigo-400 font-extrabold"
                                  : isBookmarked 
                                    ? "text-amber-400 font-extrabold" 
                                    : "text-slate-500"
                            }`}>
                              [{v.verse}]
                            </sup>

                            {/* Verse Text */}
                            {renderVerseBody(v.text)}

                            {/* Cross References mini button */}
                            {v.cross_references && v.cross_references.length > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCrossReference(v.cross_references[0]);
                                }}
                                className="inline-block text-[10px] font-sans px-1 ml-1 text-slate-400 hover:text-blue-300 align-super"
                                title={`Tham chiếu: ${v.cross_references.join(", ")}`}
                              >
                                ⚓
                              </button>
                            )}

                            {" "}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* View Mode 3: PARALLEL DUAL TRANSLATION MODE (§2.1 & §31) */}
            {viewMode === "parallel" && (
              <div className="flex flex-col gap-4">
                {/* Column Headers with Multi-Translation Alignment Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b border-slate-800 text-xs font-bold tracking-wider">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-blue-300">
                    <span className="flex items-center gap-1.5">
                      <span>🇻🇳</span> Bản Dịch Truyền Thống 1925 (Tiếng Việt)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Nguyên Bản 1925
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-300 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span>{targetTranslation === "kjv" ? "🇬🇧" : targetTranslation === "web" ? "🌐" : "🇺🇸"}</span>
                      <span>{targetTranslation === "kjv" ? "King James (KJV 1611)" : targetTranslation === "web" ? "World English (WEB)" : "American Standard (ASV)"}</span>
                    </div>
                    {/* Quick switch translation buttons */}
                    <div className="flex items-center gap-1">
                      {[
                        { code: "kjv", label: "KJV" },
                        { code: "web", label: "WEB" },
                        { code: "asv", label: "ASV" }
                      ].map(t => (
                        <button
                          key={t.code}
                          type="button"
                          onClick={() => setTargetTranslation(t.code)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all uppercase ${
                            targetTranslation === t.code
                              ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40"
                              : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleOpenVerseComparison(selectedVerse?.verse || 1)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60 transition-all font-semibold flex items-center gap-1"
                        title="So sánh đồng thời 4 bản dịch"
                      >
                        <Languages className="w-3 h-3 text-emerald-400" />
                        <span>4 Bản Dịch</span>
                      </button>
                    </div>
                  </div>
                </div>

                {parallelLoading ? (
                  <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                    <p className="text-sm font-medium">Đang chuẩn bị bản dịch đối chiếu song song {targetTranslation.toUpperCase()}...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(parallelData?.verses || chapterData.verses.map(v => ({
                      global_id: v.global_id,
                      verse_code: v.verse_code,
                      chapter: v.chapter,
                      verse: v.verse,
                      section_title: v.section_title,
                      text_vi: v.text,
                      text_target: "",
                      cross_references: v.cross_references,
                      lexicon: []
                    }))).map((v, idx) => {
                      const isNewSection = v.section_title && (idx === 0 || (parallelData?.verses[idx - 1]?.section_title !== v.section_title));
                      const isSelected = selectedVerse?.global_id === v.global_id;
                      const isBookmarked = bookmarkedVerses.includes(v.verse_code);
                      const isBeingNarrated = narratingVerse === v.verse;

                      return (
                        <React.Fragment key={v.global_id}>
                          {isNewSection && (
                            <div className="pt-4 pb-1">
                              <div className={`inline-block text-xs md:text-sm font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${themeStyles.accentBadge}`}>
                                § {v.section_title}
                              </div>
                            </div>
                          )}

                          <div
                            id={`verse-row-${v.verse}`}
                            onClick={() => {
                              const baseVerse: Verse = {
                                global_id: v.global_id,
                                verse_code: v.verse_code,
                                chapter: v.chapter,
                                verse: v.verse,
                                section_title: v.section_title,
                                text: v.text_vi,
                                cross_references: v.cross_references
                              };
                              setSelectedVerse(baseVerse);
                              setActiveDrawerTab("insight");
                            }}
                            className={`group grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                              isSelected
                                ? themeStyles.cardSelected
                                : isBeingNarrated
                                ? themeStyles.cardActiveAudio
                                : isBookmarked
                                ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-400/60"
                                : themeStyles.card
                            }`}
                          >
                            {/* Left Column: Vietnamese 1925 */}
                            <div className="flex items-start gap-3">
                              <span className={`select-none text-xs font-sans font-bold pt-1 min-w-[1.75rem] text-right ${
                                isSelected ? themeStyles.verseNumSelected : themeStyles.verseNum
                              }`}>
                                {v.verse}
                              </span>
                              <div className={`flex-1 leading-relaxed ${fontFamily === "serif" ? "font-serif" : "font-sans"} ${
                                fontSize === "sm" ? "text-sm md:text-base" : fontSize === "lg" ? "text-lg md:text-xl" : "text-base md:text-lg"
                              }`}>
                                {renderVerseBody(v.text_vi)}
                                {v.cross_references && v.cross_references.length > 0 && (
                                  <span className="inline-flex flex-wrap gap-1 ml-2 select-none">
                                    {v.cross_references.slice(0, 2).map(ref => (
                                      <button
                                        key={ref}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenCrossReference(ref);
                                        }}
                                        className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hover:text-blue-300"
                                        title={`Xem nhanh: ${ref}`}
                                      >
                                        ⚓ {ref}
                                      </button>
                                    ))}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Right Column: Target Translation (KJV / WEB / ASV) */}
                            <div className="flex items-start gap-3 md:border-l md:border-slate-800/80 md:pl-4 pt-2 md:pt-0 border-t border-slate-800/60 md:border-t-0 relative">
                              <span className="select-none text-xs font-sans font-semibold pt-1 min-w-[1.5rem] text-right text-emerald-400/80">
                                {v.verse}
                              </span>
                              <div className="flex-1 leading-relaxed font-serif text-slate-300 text-sm md:text-base italic">
                                {v.text_target || <span className="text-slate-600 font-sans text-xs">Đang tải câu đối chiếu...</span>}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenVerseComparison(v.verse);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-1 rounded bg-slate-800/90 text-slate-300 hover:text-emerald-400 border border-slate-700 flex items-center gap-1 whitespace-nowrap self-start"
                                title="So sánh câu này trên 4 bản dịch"
                              >
                                <Languages className="w-3 h-3 text-emerald-400" />
                                <span>4 Bản</span>
                              </button>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* View Mode 4: INTERLINEAR ORIGINAL LANGUAGE STRONG'S LEXICON MODE (§31) */}
            {viewMode === "interlinear" && (
              <div className="flex flex-col gap-4">
                {/* Mode Intro Header */}
                <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Chế Độ Liên Dòng Ngữ Căn Nguyên Văn Strong (§31)</h4>
                      <p className="text-xs text-slate-400">
                        Phân tích trực tiếp các từ ngữ căn {currentBook?.testament === "OT" ? "Hê-bơ-rơ (Cựu Ước)" : "Hy Lạp (Tân Ước)"} dưới từng câu Kinh Thánh.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                    {currentBook?.testament === "OT" ? "Hê-bơ-rơ (Hebrew)" : "Hy Lạp (Greek)"}
                  </span>
                </div>

                {parallelLoading ? (
                  <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                    <p className="text-sm font-medium">Đang tra cứu hệ thống từ điển ngữ căn Strong...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {(parallelData?.verses || []).map((v, idx) => {
                      const isNewSection = v.section_title && (idx === 0 || (parallelData?.verses[idx - 1]?.section_title !== v.section_title));
                      const isSelected = selectedVerse?.global_id === v.global_id;
                      const isBookmarked = bookmarkedVerses.includes(v.verse_code);

                      return (
                        <React.Fragment key={v.global_id}>
                          {isNewSection && (
                            <div className="pt-4 pb-1">
                              <div className={`inline-block text-xs md:text-sm font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${themeStyles.accentBadge}`}>
                                § {v.section_title}
                              </div>
                            </div>
                          )}

                          <div
                            id={`verse-row-${v.verse}`}
                            onClick={() => {
                              const baseVerse: Verse = {
                                global_id: v.global_id,
                                verse_code: v.verse_code,
                                chapter: v.chapter,
                                verse: v.verse,
                                section_title: v.section_title,
                                text: v.text_vi,
                                cross_references: v.cross_references
                              };
                              setSelectedVerse(baseVerse);
                              setActiveDrawerTab("lexicon");
                            }}
                            className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 border flex flex-col gap-3 ${
                              isSelected
                                ? themeStyles.cardSelected
                                : isBookmarked
                                ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-400/60"
                                : themeStyles.card
                            }`}
                          >
                            {/* Main Vietnamese Verse */}
                            <div className="flex items-start gap-3">
                              <span className={`select-none text-xs font-sans font-bold pt-0.5 min-w-[1.75rem] text-right ${
                                isSelected ? themeStyles.verseNumSelected : "text-amber-400"
                              }`}>
                                {v.verse}
                              </span>
                              <div className="flex-1 font-serif text-base md:text-lg leading-relaxed text-slate-100">
                                {renderVerseBody(v.text_vi)}
                              </div>
                            </div>

                            {/* English KJV Translation Subtitle */}
                            {v.text_target && (
                              <div className="pl-8 text-xs text-slate-400 font-serif italic border-l-2 border-slate-800 ml-2">
                                {v.text_target}
                              </div>
                            )}

                            {/* Interlinear Strong Lexemes Chips */}
                            {v.lexicon && v.lexicon.length > 0 && (
                              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 items-center">
                                <span className="text-[10px] uppercase font-bold text-amber-400/80 select-none mr-1">
                                  Từ gốc:
                                </span>
                                {v.lexicon.map(lex => (
                                  <div
                                    key={lex.strong_number}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const baseVerse: Verse = {
                                        global_id: v.global_id,
                                        verse_code: v.verse_code,
                                        chapter: v.chapter,
                                        verse: v.verse,
                                        section_title: v.section_title,
                                        text: v.text_vi,
                                        cross_references: v.cross_references
                                      };
                                      setSelectedVerse(baseVerse);
                                      setActiveDrawerTab("lexicon");
                                    }}
                                    className="group/chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition-all text-xs"
                                    title={`${lex.lemma} (${lex.transliteration}) — ${lex.definition}`}
                                  >
                                    <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1 rounded">
                                      {lex.strong_number}
                                    </span>
                                    <span className="font-bold text-amber-200 text-sm" dir={lex.language === "hebrew" ? "rtl" : "ltr"}>
                                      {lex.lemma}
                                    </span>
                                    <span className="italic text-slate-400 text-[11px]">
                                      ({lex.transliteration})
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (typeof window !== "undefined" && "speechSynthesis" in window) {
                                          window.speechSynthesis.cancel();
                                          const utt = new SpeechSynthesisUtterance(lex.lemma);
                                          utt.lang = lex.language === "greek" ? "el-GR" : "he-IL";
                                          utt.rate = 0.85;
                                          window.speechSynthesis.speak(utt);
                                        }
                                      }}
                                      className="p-0.5 rounded text-slate-500 hover:text-amber-300 transition-colors"
                                      title="Nghe phát âm"
                                    >
                                      <Volume2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Interlinear Detail Trigger Button */}
                            <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-xs">
                              <span className="text-[11px] text-slate-400">
                                {v.lexicon?.length || 0} từ ngữ căn • {currentBook?.testament === "OT" ? "Hê-bơ-rơ (Hebrew)" : "Hy Lạp (Greek)"}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const baseVerse: Verse = {
                                    global_id: v.global_id,
                                    verse_code: v.verse_code,
                                    chapter: v.chapter,
                                    verse: v.verse,
                                    section_title: v.section_title,
                                    text: v.text_vi,
                                    cross_references: v.cross_references
                                  };
                                  setSelectedVerse(baseVerse);
                                  handleLoadInterlinear(v.verse_code);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1.5 transition-all text-[11px]"
                              >
                                <Languages className="w-3.5 h-3.5" />
                                <span>Phân Tích Cú Pháp Liên Dòng Chi Tiết (§49)</span>
                              </button>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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

          {/* Harmony Banner Prompt if verse belongs to an event */}
          {verseDetails?.harmony_event && (
            <div 
              onClick={() => setActiveDrawerTab("harmony")}
              className="p-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-indigo-950/60 border border-purple-500/40 flex items-center justify-between gap-2 cursor-pointer hover:border-purple-400 transition-all group shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <span>✨</span> Đối Chiếu Tin Lành Đồng Quan (§8, §18)
                </span>
                <span className="text-xs font-semibold text-white group-hover:text-purple-200 transition-colors">
                  {verseDetails.harmony_event.title_vi}
                </span>
              </div>
              <span className="text-[11px] text-purple-400 font-bold flex items-center gap-1 group-hover:underline">
                <span>Xem {verseDetails.harmony_event.parallels?.length || 4} bản song song</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          {/* Drawer Navigation Tabs */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs font-medium border-b border-slate-800/60 pb-2">
            <button
              type="button"
              onClick={() => setActiveDrawerTab("insight")}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
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
              onClick={() => handleLoadExegesis()}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeDrawerTab === "exegesis"
                  ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Giải Kinh Phân Đoạn (§13)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveDrawerTab("interlinear");
                if (selectedVerse) handleLoadInterlinear(selectedVerse.verse_code);
              }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeDrawerTab === "interlinear"
                  ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>Nguyên Ngữ Liên Dòng (§2.1, §49)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDrawerTab("harmony")}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeDrawerTab === "harmony"
                  ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                  : verseDetails?.harmony_event
                    ? "bg-purple-950/40 text-purple-300 border border-purple-500/40 hover:text-white"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Đối Chiếu Song Song (§8, §18)</span>
              {verseDetails?.harmony_event && (
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveDrawerTab("citations")}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeDrawerTab === "citations"
                  ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Trích Dẫn Học Thuật (§38)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDrawerTab("lexicon")}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
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
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
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
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeDrawerTab === "notes"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ghi Chú ({verseDetails?.user_notes?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveDrawerTab("translations");
                if (selectedVerse) handleOpenVerseComparison(selectedVerse.verse);
              }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeDrawerTab === "translations"
                  ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>Đối Chiếu 4 Bản Dịch</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="max-h-80 md:max-h-[30rem] overflow-y-auto pr-1">
            {/* TAB 1: INSIGHT & AI EXPLANATION */}
            {activeDrawerTab === "insight" && (
              <div className="flex flex-col gap-3">
                {/* Actions Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyVerse(selectedVerse)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleBookmark(selectedVerse)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarkedVerses.includes(selectedVerse.verse_code) ? "text-amber-400 fill-amber-400" : ""}`} />
                    <span>{bookmarkedVerses.includes(selectedVerse.verse_code) ? "Đã đánh dấu" : "Đánh dấu"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={() => handleAskAi(selectedVerse)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
                  >
                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Hỏi AI Giải Thích</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadExegesis()}
                    className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Giải Kinh Phân Đoạn 11 Chiều (§13) trực tiếp ngay tại đây"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Giải Kinh 11 Chiều (§13)</span>
                  </button>

                  <Link
                    href={`/research?query=${encodeURIComponent(`Nghiên cứu thần học chuyên sâu về ${currentBook?.name_vi || ''} ${selectedVerse.chapter}:${selectedVerse.verse}`)}`}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Nghiên cứu với Agent đa tầng và 275 sách thần học"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Nghiên Cứu Đa Tầng</span>
                  </Link>

                  <Link
                    href={`/research?ref=${encodeURIComponent(`${currentBook?.name_vi || ''} ${selectedVerse.chapter}:${selectedVerse.verse}`)}`}
                    className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Phân tích bối cảnh lịch sử, địa lý, thần học (§15)"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bối Cảnh Đa Chiều</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setActiveDrawerTab("citations")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
                    title="Xem trích dẫn học thuật tự động SBL, Chicago, APA"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trích Dẫn (§38)</span>
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
                        <div 
                          key={cr.reference} 
                          onClick={() => handleOpenCrossReference(cr.reference)}
                          className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 cursor-pointer text-xs flex flex-col gap-1 transition-colors"
                        >
                          <span className="font-bold text-blue-400 flex items-center justify-between">
                            <span>⚓ {cr.reference}</span>
                            <span className="text-[10px] text-blue-300 underline">Đọc ngay</span>
                          </span>
                          {cr.preview_text ? (
                            <p className="font-serif text-slate-400 italic line-clamp-2">
                              &ldquo;{cr.preview_text}&rdquo;
                            </p>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Nhấp để xem đoạn Kinh Thánh</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB EXEGESIS: 11-DIMENSION PASSAGE EXEGESIS (§13) */}
            {activeDrawerTab === "exegesis" && (
              <div className="flex flex-col gap-4 text-xs">
                {exegesisLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    <p className="text-slate-400 text-xs">Đang phân tích 11 chiều thần học, cấu trúc La Mã & chú giải 275 sách...</p>
                  </div>
                ) : exegesisError ? (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs">
                    {exegesisError}
                  </div>
                ) : exegesisData ? (
                  <div className="flex flex-col gap-4">
                    {/* Exegesis Header Banner */}
                    <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{exegesisData.reference}</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                            {exegesisData.literary_genre}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tác giả & Niên đại: <span className="text-slate-200">{exegesisData.author_and_date}</span>
                        </p>
                      </div>

                      <Link
                        href={`/research?passage=${encodeURIComponent(exegesisData.reference)}`}
                        className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <span>Mở toàn trang Research</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Historical & Cultural Context */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Bối Cảnh Lịch Sử & Xã Hội:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {exegesisData.historical_context}
                      </p>
                    </div>

                    {/* Structure Outline (Roman Numerals) */}
                    {exegesisData.structure_outline && exegesisData.structure_outline.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                          <Layers className="w-3 h-3" /> Đề Cương Cấu Trúc Phân Đoạn (Outline):
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {exegesisData.structure_outline.map((item, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs">
                                  {item.section_title}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300">
                                  {item.verse_range}
                                </span>
                              </div>
                              <p className="text-slate-400 text-[11px] leading-relaxed">
                                {item.summary}
                              </p>
                              <div className="pt-1 border-t border-slate-800/80 text-[10px] text-amber-300">
                                <span className="font-semibold">Chân lý:</span> {item.key_truth}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keywords Strong's */}
                    {exegesisData.keywords && exegesisData.keywords.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Languages className="w-3 h-3" /> Căn Ngữ Trọng Tâm (Keywords):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {exegesisData.keywords.map((kw, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-0.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-white">{kw.word}</span>
                                {kw.strong_number && (
                                  <span className="font-mono text-cyan-300 font-bold">{kw.strong_number}</span>
                                )}
                              </div>
                              {kw.original_lemma && (
                                <span className="font-serif text-xs text-amber-200">{kw.original_lemma}</span>
                              )}
                              <span className="text-[10px] text-slate-400 line-clamp-1">{kw.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Theological Themes & Hermeneutical Takeaway */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                          Chủ Đề Thần Học Trọng Tâm:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {exegesisData.theological_themes.map((theme, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-800/50 text-[11px] text-purple-300 font-medium">
                              #{theme}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          Bài Học Cốt Lõi (Hermeneutical Takeaway):
                        </span>
                        <p className="text-slate-200 text-[11px] leading-relaxed">
                          {exegesisData.hermeneutical_takeaway}
                        </p>
                      </div>
                    </div>

                    {/* Scholarly Commentary Excerpts (275 books) */}
                    {exegesisData.scholarly_commentary_citations && exegesisData.scholarly_commentary_citations.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3" /> Trích Dẫn Chú Giải 275 Sách Thần Học:
                        </span>
                        <div className="flex flex-col gap-2">
                          {exegesisData.scholarly_commentary_citations.map((c, i) => (
                            <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-300 text-[11px]">{c.source_title}</span>
                                <span className="text-[10px] text-slate-400 font-sans">{c.author}</span>
                              </div>
                              <p className="text-slate-300 text-[11px] italic font-serif leading-relaxed">
                                &ldquo;{c.quote}&rdquo;
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reflection Questions */}
                    {exegesisData.reflection_questions && exegesisData.reflection_questions.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                          Câu Hỏi Suy Ngẫm Dưỡng Linh:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                          {exegesisData.reflection_questions.map((q, idx) => (
                            <li key={idx} className="leading-relaxed">{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500">
                    Bấm &ldquo;Giải Kinh Phân Đoạn 11 Chiều&rdquo; để khởi tạo phân tích chuyên sâu cho câu này.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GOSPEL HARMONY & CROSS-PASSAGE PARALLEL PASSAGES (§8, §18) */}
            {activeDrawerTab === "harmony" && (
              <div className="flex flex-col gap-4">
                {verseDetails?.harmony_event ? (
                  <div className="flex flex-col gap-3">
                    {/* Harmony Card Header */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900/80 to-indigo-950/50 border border-purple-500/40 flex flex-col gap-2 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {verseDetails.harmony_event.category}
                        </span>
                        <Link
                          href={`/explore?tab=harmony&eventId=${verseDetails.harmony_event.event_id}`}
                          className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <span>Mở Bảng Đối Chiếu Toàn Cảnh</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {verseDetails.harmony_event.title_vi}
                      </h4>
                      {verseDetails.harmony_event.summary && (
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {verseDetails.harmony_event.summary}
                        </p>
                      )}
                      {verseDetails.harmony_event.current_focus && (
                        <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800/60 text-xs text-purple-200">
                          <strong className="text-purple-300">Đặc thù phân đoạn hiện tại: </strong>
                          {verseDetails.harmony_event.current_focus}
                        </div>
                      )}
                    </div>

                    {/* Parallel Gospels List */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Các phân đoạn song song tương ứng ({verseDetails.harmony_event.parallels.length} bản văn):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {verseDetails.harmony_event.parallels.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            className={`p-3 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${
                              p.is_current
                                ? "bg-purple-950/50 border-purple-500/60 shadow-md ring-1 ring-purple-500/30"
                                : "bg-slate-900/60 border-slate-800 hover:border-purple-500/30"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                                <span>📖</span>
                                <span>{p.ref}</span>
                              </span>
                              {p.is_current ? (
                                <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/30">
                                  Đang xem
                                </span>
                              ) : (
                                <Link
                                  href={`/bible?ref=${encodeURIComponent(p.ref)}`}
                                  className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 underline"
                                >
                                  Đọc đoạn này →
                                </Link>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                              {p.theological_focus}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 text-center">
                    Câu này không nằm trong danh mục các sự kiện Tin Lành Đồng Quan (Gospel Harmony). Dưới đây là các liên chiếu thần học được phân loại của câu:
                  </div>
                )}

                {/* Cross References Classified (§18) */}
                {verseDetails?.cross_references && verseDetails.cross_references.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Mạng lưới liên chiếu thần học đã phân loại (§18):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {verseDetails.cross_references.map(cr => (
                        <div
                          key={cr.reference}
                          onClick={() => handleOpenCrossReference(cr.reference)}
                          className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 cursor-pointer text-xs flex flex-col gap-1.5 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-blue-400 flex items-center gap-1">
                              <span>⚓</span>
                              <span>{cr.reference}</span>
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                              cr.badge_color === 'purple' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              cr.badge_color === 'amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              cr.badge_color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              cr.badge_color === 'indigo' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                              cr.badge_color === 'blue' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {cr.connection_label || "Liên Chiếu Trực Tiếp"}
                            </span>
                          </div>
                          {cr.preview_text ? (
                            <p className="font-serif text-slate-300 italic line-clamp-2">
                              &ldquo;{cr.preview_text}&rdquo;
                            </p>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Nhấp để xem đoạn Kinh Thánh</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ACADEMIC CITATION SYSTEM (§38) */}
            {activeDrawerTab === "citations" && (
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-slate-200">
                      Trích dẫn học thuật tự động cho: <strong className="text-white">{verseDetails?.citations?.reference || `${currentBook?.name_vi} ${selectedVerse.chapter}:${selectedVerse.verse}`}</strong>
                    </span>
                  </div>
                  <Link
                    href="/library"
                    className="px-2.5 py-1 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span>Thư Viện Thần Học</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {verseDetails?.citations && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                    {/* SBL Style */}
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                          SBL Handbook of Style (Kinh Viện)
                        </span>
                        <button
                          type="button"
                          onClick={() => copyCitationText("sbl_verse", verseDetails.citations?.sbl || "")}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                        >
                          {copiedCitationKey === "sbl_verse" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCitationKey === "sbl_verse" ? "Đã chép!" : "Sao chép"}</span>
                        </button>
                      </div>
                      <p className="text-slate-300 font-serif leading-relaxed italic">
                        {verseDetails.citations.sbl}
                      </p>
                    </div>

                    {/* Chicago Style */}
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          Chicago / Turabian 9th
                        </span>
                        <button
                          type="button"
                          onClick={() => copyCitationText("chicago_verse", verseDetails.citations?.chicago || "")}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                        >
                          {copiedCitationKey === "chicago_verse" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCitationKey === "chicago_verse" ? "Đã chép!" : "Sao chép"}</span>
                        </button>
                      </div>
                      <p className="text-slate-300 font-serif leading-relaxed">
                        {verseDetails.citations.chicago}
                      </p>
                    </div>

                    {/* APA 7th */}
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                          APA 7th Edition
                        </span>
                        <button
                          type="button"
                          onClick={() => copyCitationText("apa_verse", verseDetails.citations?.apa || "")}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                        >
                          {copiedCitationKey === "apa_verse" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCitationKey === "apa_verse" ? "Đã chép!" : "Sao chép"}</span>
                        </button>
                      </div>
                      <p className="text-slate-300 font-sans leading-relaxed">
                        {verseDetails.citations.apa}
                      </p>
                    </div>

                    {/* BibTeX */}
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                          BibTeX (@misc)
                        </span>
                        <button
                          type="button"
                          onClick={() => copyCitationText("bibtex_verse", verseDetails.citations?.bibtex || "")}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                        >
                          {copiedCitationKey === "bibtex_verse" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCitationKey === "bibtex_verse" ? "Đã chép!" : "Sao chép"}</span>
                        </button>
                      </div>
                      <pre className="text-[10px] text-slate-400 font-mono whitespace-pre overflow-x-auto leading-relaxed">
                        {verseDetails.citations.bibtex}
                      </pre>
                    </div>

                    {/* Markdown Quote */}
                    <div className="col-span-1 md:col-span-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span className="truncate italic">
                        Markdown: {verseDetails.citations.markdown}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyCitationText("md_verse", verseDetails.citations?.markdown || "")}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium flex items-center gap-1 shrink-0 transition-colors"
                      >
                        {copiedCitationKey === "md_verse" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCitationKey === "md_verse" ? "Đã chép!" : "Chép Markdown"}</span>
                      </button>
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
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                                  window.speechSynthesis.cancel();
                                  const utt = new SpeechSynthesisUtterance(item.lemma);
                                  utt.lang = item.language === "greek" ? "el-GR" : "he-IL";
                                  utt.rate = 0.85;
                                  window.speechSynthesis.speak(utt);
                                }
                              }}
                              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
                              title="Nghe phát âm chuẩn"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <Link
                            href="/research"
                            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <span>Concordance</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-amber-200" dir={item.language === "hebrew" ? "rtl" : "ltr"}>
                            {item.lemma}
                          </span>
                          <span className="text-xs italic text-slate-400">
                            {item.transliteration} {item.pronunciation ? `[${item.pronunciation}]` : ""}
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

            {/* TAB: INTERLINEAR ORIGINAL LANGUAGE & EXEGESIS (§2.1, §49) */}
            {activeDrawerTab === "interlinear" && (
              <div className="flex flex-col gap-4">
                {interlinearLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                    <span className="text-xs font-medium">Đang phân tích từng từ nguyên ngữ {currentBook?.testament === "OT" ? "Hê-bơ-rơ" : "Hy Lạp"} & đối chiếu cổ bản...</span>
                  </div>
                ) : interlinearError ? (
                  <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
                    {interlinearError}
                  </div>
                ) : interlinearData ? (
                  <div className="flex flex-col gap-5">
                    {/* Header meta card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/70 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-base">
                          {interlinearData.original_language === "hebrew" ? "ע" : "Ω"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-amber-300">
                              {interlinearData.reference}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {interlinearData.original_language === "hebrew" ? "Hê-bơ-rơ Cựu Ước (Biblical Hebrew)" : "Hy Lạp Tân Ước (Koine Greek)"}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {interlinearData.reading_direction === "rtl" ? "Hướng đọc: Phải sang Trái (RTL)" : "Hướng đọc: Trái sang Phải (LTR)"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">
                            Phân tích từ-theo-từ gồm ngữ căn Strong, hình thái học (morphology), ngữ pháp cú pháp và các bản thảo chép tay cổ.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!interlinearData) return;
                            const md = `### Phân Tích Nguyên Ngữ Liên Dòng: ${interlinearData.reference}\n\n**Bản Dịch 1925:** ${interlinearData.vietnamese_1925_text}\n**KJV:** ${interlinearData.kjv_english_text}\n**Nguyên Ngữ:** ${interlinearData.original_language === "hebrew" ? "Biblical Hebrew" : "Koine Greek"}\n\n| # | Nguyên Văn | Phiên Âm | Strong | Từ Loại / Hình Thái | Nghĩa Việt | English |\n|---|---|---|---|---|---|---|\n` +
                              (interlinearData.tokens || []).map((t: any) => `| ${t.position} | ${t.original_text} | ${t.transliteration} | ${t.strong_number} | ${t.morphology_code} (${t.morphology_expanded || ""}) | ${t.vietnamese_gloss} | ${t.english_gloss} |`).join("\n") +
                              `\n\n**Ý Nghĩa Thần Học:** ${interlinearData.theological_insight || ""}`;
                            navigator.clipboard.writeText(md);
                            setCopiedInterlinear(true);
                            setTimeout(() => setCopiedInterlinear(false), 2000);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
                        >
                          {copiedInterlinear ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{copiedInterlinear ? "Đã chép Markdown!" : "Sao Chép Phân Tích"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Side-by-side Scripture Context */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          Bản Truyền Thống 1925 (Tiếng Việt)
                        </span>
                        <p className="text-sm font-serif text-slate-200 leading-relaxed">
                          {interlinearData.vietnamese_1925_text}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-2 md:pt-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                          King James Version (KJV 1611)
                        </span>
                        <p className="text-xs font-serif italic text-slate-300 leading-relaxed">
                          {interlinearData.kjv_english_text}
                        </p>
                      </div>
                    </div>

                    {/* Word-by-Word Interlinear Flow / Cards */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <span>📖</span> Dòng Từ Nguyên Ngữ Từng Chữ ({interlinearData.tokens?.length || 0} từ)
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {interlinearData.reading_direction === "rtl" ? "Trình bày theo thứ tự tiếng Hê-bơ-rơ (Phải sang Trái)" : "Trình bày theo thứ tự tiếng Hy Lạp (Trái sang Phải)"}
                        </span>
                      </div>

                      <div 
                        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 ${
                          interlinearData.reading_direction === "rtl" ? "direction-rtl" : ""
                        }`}
                        dir={interlinearData.reading_direction || "ltr"}
                      >
                        {(interlinearData.tokens || []).map((token: any) => (
                          <div
                            key={token.position}
                            className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between gap-2 shadow-sm text-left group"
                            dir="ltr"
                          >
                            {/* Card Top: Position & Pronounce button */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-slate-500">
                                #{token.position}
                              </span>
                              <div className="flex items-center gap-1">
                                {token.strong_number && (
                                  <Link
                                    href={`/research?tab=lexicon&search=${token.strong_number}`}
                                    className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                                    title="Tra cứu Strong trong Concordance"
                                  >
                                    {token.strong_number}
                                  </Link>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (typeof window !== "undefined" && "speechSynthesis" in window) {
                                      window.speechSynthesis.cancel();
                                      const utt = new SpeechSynthesisUtterance(token.original_text || token.lemma);
                                      utt.lang = interlinearData.original_language === "greek" ? "el-GR" : "he-IL";
                                      utt.rate = 0.85;
                                      window.speechSynthesis.speak(utt);
                                    }
                                  }}
                                  className="p-1 rounded text-slate-500 hover:text-amber-300 transition-colors"
                                  title="Nghe phát âm chuẩn"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Original Word */}
                            <div className="my-1 text-center">
                              <span
                                className={`block font-serif font-bold text-xl text-amber-200 group-hover:text-amber-100 transition-colors ${
                                  interlinearData.original_language === "hebrew" ? "text-2xl font-hebrew" : ""
                                }`}
                                dir={interlinearData.reading_direction || "ltr"}
                              >
                                {token.original_text}
                              </span>
                              <span className="block text-[11px] italic text-slate-400 mt-0.5">
                                {token.transliteration}
                              </span>
                            </div>

                            {/* Morphology & Grammar Badges */}
                            <div className="flex flex-col gap-1 border-t border-slate-800/80 pt-1.5">
                              <span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800 truncate" title={token.morphology_expanded || token.morphology_code}>
                                {token.morphology_code}
                              </span>
                              <div className="text-xs font-bold text-emerald-300 truncate" title={`Nghĩa tiếng Việt: ${token.vietnamese_gloss}`}>
                                {token.vietnamese_gloss}
                              </div>
                              <div className="text-[10px] text-slate-400 italic truncate" title={`English: ${token.english_gloss}`}>
                                {token.english_gloss}
                              </div>
                            </div>

                            {/* Definition Tooltip note */}
                            {token.lexicon_definition && (
                              <div className="text-[10px] text-slate-400 border-t border-slate-900 pt-1 line-clamp-2" title={token.lexicon_definition}>
                                {token.lexicon_definition}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Syntactic Structure Clause Analysis */}
                    {interlinearData.syntactic_structure && interlinearData.syntactic_structure.length > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                          <Network className="w-3.5 h-3.5" /> Phân Tích Cấu Trúc Cú Pháp &amp; Mệnh Đề (Syntactic Structure)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {interlinearData.syntactic_structure.map((clause: any, cIdx: number) => (
                            <div key={cIdx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-300">{clause.clause}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 font-mono">
                                  {clause.type}
                                </span>
                              </div>
                              <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                                <span className="text-slate-500">Chức năng: </span>{clause.theological_function || clause.function}
                              </p>
                              {clause.grammatical_elements && (
                                <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap gap-1">
                                  {Object.entries(clause.grammatical_elements).map(([k, v]: any) => (
                                    <span key={k} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">
                                      <b className="text-slate-400">{k}:</b> {String(v)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Theological Insight Panel */}
                    {interlinearData.theological_insight && (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 to-slate-900/70 border border-amber-500/30 flex flex-col gap-2 shadow-md">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Luận Điểm Giải Kinh Thần Học Nguyên Ngữ (Exegetical Insight)
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-serif">
                          {interlinearData.theological_insight}
                        </p>
                      </div>
                    )}

                    {/* Ancient Codex Manuscripts & Textual Variants */}
                    {interlinearData.codex_sources && interlinearData.codex_sources.length > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" /> Bằng Chứng Bản Thảo Chép Tay Cổ (Textual Witnesses &amp; Codices)
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {interlinearData.codex_sources.length} Bản cổ bản chứng thực
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                          {interlinearData.codex_sources.map((codex: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white truncate">{codex.name}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  {codex.siglum}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">Niên đại: {codex.date}</span>
                              <span className="text-[10px] text-slate-500 truncate">Lưu trữ: {codex.location}</span>
                              {codex.reading && (
                                <p className="text-[11px] text-purple-200 font-serif italic mt-1 border-t border-slate-800/80 pt-1">
                                  &ldquo;{codex.reading}&rdquo;
                                </p>
                              )}
                              {codex.notes && (
                                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                                  {codex.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                    Chọn một câu Kinh Thánh để tải phân tích nguyên ngữ liên dòng từng chữ.
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
                                  href={`/explore?tab=map&place=${encodeURIComponent(pl.name_vi)}`}
                                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                                >
                                  Bản đồ <MapPin className="w-2.5 h-2.5" />
                                </Link>
                              </div>
                              <span className="text-[10px] text-slate-400">Hiện tại: {pl.modern_name} ({pl.latitude.toFixed(2)}, {pl.longitude.toFixed(2)})</span>
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
                          <Calendar className="w-3.5 h-3.5" /> Sự kiện & Cột mốc Lịch sử:
                        </span>
                        <div className="flex flex-col gap-2">
                          {verseDetails.entities.events.map(ev => (
                            <div key={ev.slug} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs">{ev.title}</span>
                                <span className="text-[10px] text-amber-400/90 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                                  {ev.period}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300">{ev.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!verseDetails?.entities.people?.length && !verseDetails?.entities.places?.length && !verseDetails?.entities.events?.length && (
                      <div className="text-xs text-slate-400 py-6 text-center">
                        Không có thực thể đặc biệt được liên kết trực tiếp trong câu này.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PERSONAL STUDY NOTES */}
            {activeDrawerTab === "notes" && (
              <div className="flex flex-col gap-3">
                {/* Note creation form */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-400" /> Thêm ghi chú cho câu {selectedVerse.chapter}:{selectedVerse.verse}
                  </span>
                  <input
                    type="text"
                    placeholder="Tiêu đề bài học..."
                    value={newNoteTitle}
                    onChange={e => setNewNoteTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <textarea
                    rows={2}
                    placeholder="Nội dung suy ngẫm hoặc áp dụng cá nhân..."
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Thẻ (vd: đức tin, cầu nguyện)..."
                      value={newNoteTags}
                      onChange={e => setNewNoteTags(e.target.value)}
                      className="flex-1 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      disabled={noteSaving || !newNoteTitle.trim() || !newNoteContent.trim()}
                      onClick={handleCreateNote}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors"
                    >
                      {noteSaving ? "Đang lưu..." : "Lưu ghi chú"}
                    </button>
                  </div>
                </div>

                {/* List of existing notes */}
                {verseDetails?.user_notes && verseDetails.user_notes.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {verseDetails.user_notes.map(n => (
                      <div key={n.id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{n.title}</span>
                          <span className="text-[10px] text-slate-500">{new Date(n.updated_at).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap">{n.content}</p>
                        {n.tags && n.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {n.tags.map(t => (
                              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 text-center py-4">
                    Chưa có ghi chú nào cho câu này. Hãy bắt đầu viết suy ngẫm của bạn!
                  </div>
                )}
              </div>
            )}

            {/* TAB 8: MULTI-TRANSLATION ALIGNMENT TAB (§2.1, Horizon Item) */}
            {activeDrawerTab === "translations" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Languages className="w-4 h-4" />
                      <span>Đối Chiếu Đa Bản Dịch & Căn Chỉnh Ngữ Nghĩa</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      So sánh câu Kinh Thánh {currentBook?.name_vi} {currentChapter}:{selectedVerse?.verse} trên 4 bản dịch quy chuẩn
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => comparisonVerse && handleCopyAllTranslations(comparisonVerse)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {copiedComparisonId === "all" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedComparisonId === "all" ? "Đã Sao Chép!" : "Sao Chép Cả 4"}</span>
                  </button>
                </div>

                {comparisonLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                    <span className="text-xs">Đang tải và căn chỉnh các bản dịch Kinh Thánh...</span>
                  </div>
                ) : comparisonVerse?.translations ? (
                  <div className="flex flex-col gap-3">
                    {comparisonVerse.translations.map((tr: any) => (
                      <div
                        key={tr.id}
                        className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{tr.language === "vi" ? "🇻🇳" : tr.id === "kjv" ? "🇬🇧" : tr.id === "web" ? "🌐" : "🇺🇸"}</span>
                            <span className="text-xs font-bold text-white">{tr.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {tr.short_name} {tr.year ? `(${tr.year})` : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">{tr.word_count} từ</span>
                            <button
                              type="button"
                              onClick={() => handleCopySingleTranslation(tr, comparisonVerse.reference)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title="Sao chép bản dịch này"
                            >
                              {copiedComparisonId === tr.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <p className={`text-xs md:text-sm leading-relaxed text-slate-200 ${tr.language === "en" ? "font-serif italic text-slate-300" : "font-sans"}`}>
                          "{tr.text}"
                        </p>
                      </div>
                    ))}

                    {/* Original Language Keywords */}
                    {comparisonVerse.original_language?.matched_lexicon?.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <span>Nguyên Ngữ {comparisonVerse.original_language.language} Đối Ứng</span>
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {comparisonVerse.original_language.matched_lexicon.map((lex: any) => (
                            <div key={lex.strong_number} className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-amber-300 font-serif">{lex.lemma}</span>
                                <span className="font-mono text-[10px] text-slate-400">{lex.strong_number}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">{lex.transliteration} — {lex.definition}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 text-center py-6">
                    Không tìm thấy dữ liệu đối chiếu cho câu này.
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* MODAL 1: BOOK SELECTION MODAL */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Chọn Sách Kinh Thánh (66 Sách)
                </h2>
                <p className="text-xs text-slate-400">Bản Dịch Truyền Thống 1925</p>
              </div>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Canonical Books Tabs & Grid */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
              {/* OLD TESTAMENT (CỰU ƯỚC) */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 pb-2 mb-3 border-b border-slate-800/80 flex items-center justify-between">
                  <span>Cựu Ước (39 Sách)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Từ Sáng-thế Ký đến Ma-la-chi</span>
                </div>

                <div className="space-y-4">
                  {BOOK_CATEGORIES.OT.map(cat => {
                    const catBooks = books.filter(b => b.testament === "OT" && b.order >= cat.range[0] && b.order <= cat.range[1]);
                    return (
                      <div key={cat.title} className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-400">{cat.title}:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {catBooks.map(b => (
                            <button
                              key={b.code}
                              type="button"
                              onClick={() => selectBookAndChapter(b.code, 1)}
                              className={`p-2.5 rounded-xl text-left border transition-all text-xs font-medium flex flex-col gap-0.5 ${
                                currentBookCode.toLowerCase() === b.code.toLowerCase()
                                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30"
                                  : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800"
                              }`}
                            >
                              <span className="font-bold truncate">{b.name_vi}</span>
                              <span className="text-[10px] opacity-70">{b.total_chapters} đoạn</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NEW TESTAMENT (TÂN ƯỚC) */}
              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 mb-3 border-b border-slate-800/80 flex items-center justify-between">
                  <span>Tân Ước (27 Sách)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Từ Ma-thi-ơ đến Khải Huyền</span>
                </div>

                <div className="space-y-4">
                  {BOOK_CATEGORIES.NT.map(cat => {
                    const catBooks = books.filter(b => b.testament === "NT" && b.order >= cat.range[0] && b.order <= cat.range[1]);
                    return (
                      <div key={cat.title} className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-400">{cat.title}:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {catBooks.map(b => (
                            <button
                              key={b.code}
                              type="button"
                              onClick={() => selectBookAndChapter(b.code, 1)}
                              className={`p-2.5 rounded-xl text-left border transition-all text-xs font-medium flex flex-col gap-0.5 ${
                                currentBookCode.toLowerCase() === b.code.toLowerCase()
                                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30"
                                  : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800"
                              }`}
                            >
                              <span className="font-bold truncate">{b.name_vi}</span>
                              <span className="text-[10px] opacity-70">{b.total_chapters} đoạn</span>
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

      {/* MODAL 2: CHAPTER SELECTION MODAL */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-slate-800 rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  Chọn Đoạn — {currentBook?.name_vi}
                </h2>
                <p className="text-xs text-slate-400">Tổng cộng {currentBook?.total_chapters} đoạn</p>
              </div>
              <button
                type="button"
                onClick={() => setIsChapterModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5">
                {Array.from({ length: currentBook?.total_chapters || 1 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => selectBookAndChapter(currentBookCode, num)}
                    className={`py-3 rounded-2xl border text-sm font-bold transition-all ${
                      currentChapter === num
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30"
                        : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: READING SETTINGS & DISPLAY PREFERENCES (§2.1 & §2.2) */}
      {isOptionsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Tùy Chỉnh Chế Độ Đọc</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOptionsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-5 text-xs text-slate-200">
              {/* Option 1: View Mode */}
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-slate-400">Hình thức bố cục:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode("verse")}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                      viewMode === "verse"
                        ? "bg-blue-600/30 border-blue-500 text-blue-300 font-bold"
                        : "bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <AlignLeft className="w-4 h-4" />
                    <span>Từng câu riêng biệt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("paragraph")}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                      viewMode === "paragraph"
                        ? "bg-blue-600/30 border-blue-500 text-blue-300 font-bold"
                        : "bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <AlignJustify className="w-4 h-4" />
                    <span>Đoạn văn liên tục</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("parallel")}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                      viewMode === "parallel"
                        ? "bg-blue-600/30 border-blue-500 text-blue-300 font-bold"
                        : "bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Languages className="w-4 h-4 text-emerald-400" />
                    <span>Song song KJV (§2.1)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("interlinear")}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                      viewMode === "interlinear"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                        : "bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Liên dòng Strong (§31)</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Typography Font Family */}
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-slate-400">Kiểu chữ văn bản:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFontFamily("serif")}
                    className={`p-2.5 rounded-xl border font-serif text-sm transition-all ${
                      fontFamily === "serif"
                        ? "bg-blue-600/30 border-blue-500 text-blue-300 font-bold"
                        : "bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    Chữ Có Chân (Serif)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontFamily("sans")}
                    className={`p-2.5 rounded-xl border font-sans text-sm transition-all ${
                      fontFamily === "sans"
                        ? "bg-blue-600/30 border-blue-500 text-blue-300 font-bold"
                        : "bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    Hiện Đại (Sans-serif)
                  </button>
                </div>
              </div>

              {/* Option 3: Font Size */}
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-slate-400">Kích thước chữ:</span>
                <div className="grid grid-cols-4 gap-2">
                  {(["sm", "md", "lg", "xl"] as const).map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFontSize(size)}
                      className={`p-2 rounded-xl border font-bold text-center transition-all ${
                        fontSize === size
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {size === "sm" ? "16px" : size === "md" ? "18px" : size === "lg" ? "21px" : "25px"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 4: Theme Color Palette */}
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-slate-400">Chủ đề giao diện:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReaderTheme("midnight")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      readerTheme === "midnight"
                        ? "border-blue-500 bg-blue-950/40 text-blue-300 font-bold"
                        : "border-slate-800 bg-[#090d16] text-slate-400"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#090d16] border border-blue-500" />
                    <span className="text-[11px]">Đêm Navy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderTheme("sepia")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      readerTheme === "sepia"
                        ? "border-amber-500 bg-amber-950/40 text-amber-300 font-bold"
                        : "border-slate-800 bg-[#18140e] text-slate-400"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#18140e] border border-amber-500" />
                    <span className="text-[11px]">Giấy Da Cổ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderTheme("pure-black")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      readerTheme === "pure-black"
                        ? "border-slate-400 bg-slate-900 text-white font-bold"
                        : "border-slate-800 bg-black text-slate-400"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-black border border-white" />
                    <span className="text-[11px]">Đen OLED</span>
                  </button>
                </div>
              </div>

              {/* Option 5: Red Letter Words of Jesus Toggle */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Lời Chúa Giê-xu Chữ Đỏ (Red Letter)
                  </div>
                  <div className="text-[11px] text-slate-500">Làm nổi bật trực tiếp lời phán của Chúa Cứu Thế trong các sách Phúc Âm</div>
                </div>
                <input
                  type="checkbox"
                  checked={redLetter}
                  onChange={e => setRedLetter(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOptionsOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: INTERACTIVE CROSS-REFERENCE NETWORK VISUALIZER & REDEMPTIVE CHAIN MODAL (§18) */}
      {previewRef && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b1120] border border-blue-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>Mạng Lưới Tham Chiếu Chéo & Mạch Cứu Chuộc</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider font-semibold">
                        §18 Typology
                      </span>
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <span>Tâm điểm:</span>
                    <strong className="text-blue-300 font-serif text-xs">{previewRef}</strong>
                    {networkData?.matched_chain && (
                      <span className="hidden sm:inline-block text-[10px] text-amber-300/90 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        🔗 {networkData.matched_chain.title}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* View Mode Switcher & Close */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setNetworkViewMode("graph")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      networkViewMode === "graph"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mạng Lưới Trực Quan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNetworkViewMode("chain")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      networkViewMode === "chain"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mạch Cứu Chuộc</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNetworkViewMode("verses")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      networkViewMode === "verses"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Văn Bản</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewRef(null);
                    setPreviewData(null);
                    setNetworkData(null);
                    setSelectedNetworkNode(null);
                  }}
                  className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 text-xs">
              {networkLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="text-sm font-medium">Đang trích xuất mạng lưới tham chiếu và mạch cứu chuộc...</span>
                </div>
              ) : networkData ? (
                <>
                  {/* TAB 1: INTERACTIVE SVG GRAPH MODE */}
                  {networkViewMode === "graph" && (
                    <div className="flex flex-col gap-3">
                      {/* Filter Pills Bar & Stats */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 pl-1 pr-2">
                            <Filter className="w-3 h-3" /> Lọc liên kết:
                          </span>
                          <button
                            type="button"
                            onClick={() => setNetworkFilter("all")}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                              networkFilter === "all"
                                ? "bg-slate-700 text-white font-bold"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                          >
                            Tất cả ({networkData.nodes?.length || 0})
                          </button>
                          <button
                            type="button"
                            onClick={() => setNetworkFilter("quotation")}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                              networkFilter === "quotation"
                                ? "bg-amber-600 text-white font-bold"
                                : "text-amber-400 hover:bg-amber-950/40"
                            }`}
                          >
                            Trích Dẫn Cựu Ước ({networkData.stats?.quotation_count || 0})
                          </button>
                          <button
                            type="button"
                            onClick={() => setNetworkFilter("allusion")}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                              networkFilter === "allusion"
                                ? "bg-emerald-600 text-white font-bold"
                                : "text-emerald-400 hover:bg-emerald-950/40"
                            }`}
                          >
                            Hình Bóng Tiên Tri ({networkData.stats?.allusion_count || 0})
                          </button>
                          <button
                            type="button"
                            onClick={() => setNetworkFilter("parallel")}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                              networkFilter === "parallel"
                                ? "bg-purple-600 text-white font-bold"
                                : "text-purple-400 hover:bg-purple-950/40"
                            }`}
                          >
                            Ký Thuật Song Song ({networkData.stats?.parallel_count || 0})
                          </button>
                          <button
                            type="button"
                            onClick={() => setNetworkFilter("explicit")}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                              networkFilter === "explicit"
                                ? "bg-blue-600 text-white font-bold"
                                : "text-blue-400 hover:bg-blue-950/40"
                            }`}
                          >
                            Liên Chiếu Trực Tiếp ({networkData.stats?.explicit_count || 0})
                          </button>
                        </div>

                        {networkData.matched_chain && (
                          <button
                            type="button"
                            onClick={() => setNetworkViewMode("chain")}
                            className="px-2.5 py-1 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-[11px] font-semibold hover:bg-indigo-900/60 transition-colors flex items-center gap-1"
                          >
                            <GitBranch className="w-3 h-3 text-indigo-400" />
                            <span>Mạch: {networkData.matched_chain.title}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* SVG Canvas Area */}
                      <div className="relative w-full h-[320px] sm:h-[380px] bg-[#070b14] rounded-2xl border border-slate-800/80 overflow-hidden flex items-center justify-center shadow-inner">
                        {/* Legend Overlay */}
                        <div className="absolute top-2.5 left-3 z-10 flex flex-wrap gap-2 text-[10px] pointer-events-none">
                          <span className="flex items-center gap-1 text-amber-400 bg-black/60 px-2 py-0.5 rounded-lg border border-amber-500/20 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-amber-500" /> Cựu Ước (OT Type/Shadow)
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 bg-black/60 px-2 py-0.5 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Tân Ước (NT Antitype/Fulfillment)
                          </span>
                          <span className="flex items-center gap-1 text-blue-400 bg-black/60 px-2 py-0.5 rounded-lg border border-blue-500/20 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500" /> Tâm điểm hiện tại
                          </span>
                        </div>

                        {/* Interactive SVG Network */}
                        {(() => {
                          const nodes = networkData.nodes || [];
                          const edges = networkData.edges || [];
                          const root = networkData.root;

                          // Filter nodes according to networkFilter
                          let visibleNodes = nodes;
                          if (networkFilter !== "all") {
                            const matchingEdges = edges.filter((e: any) => e.connection_type === networkFilter);
                            const matchingIds = new Set<string>([root?.id]);
                            matchingEdges.forEach((e: any) => {
                              matchingIds.add(e.source);
                              matchingIds.add(e.target);
                            });
                            visibleNodes = nodes.filter((n: any) => matchingIds.has(n.id) || n.is_root);
                          }

                          const orbitNodes = visibleNodes.filter((n: any) => !n.is_root);
                          const totalOrbit = orbitNodes.length || 1;

                          // Compute coordinates
                          const nodeCoords: Record<string, { x: number; y: number }> = {};
                          nodeCoords[root?.id || "root"] = { x: 0, y: 0 };

                          orbitNodes.forEach((n: any, idx: number) => {
                            const angle = (idx / totalOrbit) * 2 * Math.PI - Math.PI / 2;
                            const radius = n.testament === "OT" ? 115 : 180;
                            nodeCoords[n.id] = {
                              x: Math.round(Math.cos(angle) * radius),
                              y: Math.round(Math.sin(angle) * radius)
                            };
                          });

                          return (
                            <svg
                              viewBox="-280 -210 560 420"
                              className="w-full h-full select-none"
                            >
                              <defs>
                                <radialGradient id="rootGlow" cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </radialGradient>
                                <radialGradient id="centerGrad" cx="30%" cy="30%" r="70%">
                                  <stop offset="0%" stopColor="#60a5fa" />
                                  <stop offset="100%" stopColor="#1e3a8a" />
                                </radialGradient>
                                <radialGradient id="otGrad" cx="30%" cy="30%" r="70%">
                                  <stop offset="0%" stopColor="#fbbf24" />
                                  <stop offset="100%" stopColor="#78350f" />
                                </radialGradient>
                                <radialGradient id="ntGrad" cx="30%" cy="30%" r="70%">
                                  <stop offset="0%" stopColor="#34d399" />
                                  <stop offset="100%" stopColor="#064e3b" />
                                </radialGradient>
                              </defs>

                              {/* Concentric Guide Orbits */}
                              <circle cx="0" cy="0" r="115" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                              <circle cx="0" cy="0" r="180" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

                              {/* Edges */}
                              {edges.map((e: any) => {
                                const p1 = nodeCoords[e.source];
                                const p2 = nodeCoords[e.target];
                                if (!p1 || !p2) return null;
                                const isAllusion = e.connection_type === "allusion";
                                const isQuotation = e.connection_type === "quotation";
                                const isParallel = e.connection_type === "parallel";
                                const strokeColor = isQuotation ? "#f59e0b" : isAllusion ? "#10b981" : isParallel ? "#a855f7" : "#3b82f6";
                                return (
                                  <line
                                    key={e.id}
                                    x1={p1.x}
                                    y1={p1.y}
                                    x2={p2.x}
                                    y2={p2.y}
                                    stroke={strokeColor}
                                    strokeWidth={isQuotation || isAllusion ? 2 : 1.2}
                                    strokeDasharray={isAllusion ? "4 3" : undefined}
                                    opacity={0.65}
                                  />
                                );
                              })}

                              {/* Central Root Pulse Halo */}
                              <circle cx="0" cy="0" r="48" fill="url(#rootGlow)" />
                              <circle cx="0" cy="0" r="38" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" strokeDasharray="3 3" />

                              {/* Central Root Node */}
                              <g
                                className="cursor-pointer transition-transform hover:scale-110"
                                onClick={() => setSelectedNetworkNode(root)}
                              >
                                <circle cx="0" cy="0" r="30" fill="url(#centerGrad)" stroke="#93c5fd" strokeWidth="2.5" />
                                <text
                                  x="0"
                                  y="-4"
                                  textAnchor="middle"
                                  fill="#ffffff"
                                  fontSize="9.5"
                                  fontWeight="bold"
                                  fontFamily="sans-serif"
                                >
                                  {root?.book?.slice(0, 10)}
                                </text>
                                <text
                                  x="0"
                                  y="8"
                                  textAnchor="middle"
                                  fill="#93c5fd"
                                  fontSize="9"
                                  fontFamily="sans-serif"
                                >
                                  {root?.chapter}:{root?.verse}
                                </text>
                              </g>

                              {/* Orbiting Connected Nodes */}
                              {orbitNodes.map((n: any) => {
                                const pt = nodeCoords[n.id];
                                if (!pt) return null;
                                const isSelected = selectedNetworkNode?.id === n.id;
                                const isOT = n.testament === "OT";
                                return (
                                  <g
                                    key={n.id}
                                    className="cursor-pointer transition-transform hover:scale-125"
                                    onClick={() => setSelectedNetworkNode(n)}
                                  >
                                    {isSelected && (
                                      <circle cx={pt.x} cy={pt.y} r="28" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />
                                    )}
                                    <circle
                                      cx={pt.x}
                                      cy={pt.y}
                                      r="20"
                                      fill={isOT ? "url(#otGrad)" : "url(#ntGrad)"}
                                      stroke={isOT ? "#fcd34d" : "#6ee7b7"}
                                      strokeWidth="2"
                                    />
                                    <text
                                      x={pt.x}
                                      y={pt.y + 3.5}
                                      textAnchor="middle"
                                      fill="#ffffff"
                                      fontSize="8.5"
                                      fontWeight="bold"
                                      fontFamily="sans-serif"
                                    >
                                      {n.reference?.slice(0, 11)}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          );
                        })()}
                      </div>

                      {/* Selected Node Inspector Bottom Card */}
                      {selectedNetworkNode && (
                        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2 shadow-sm animate-in fade-in duration-150">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white flex items-center gap-1.5">
                                <span>📖</span>
                                <span>{selectedNetworkNode.reference}</span>
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                selectedNetworkNode.testament === 'OT' 
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {selectedNetworkNode.testament === 'OT' ? 'Cựu Ước (OT)' : 'Tân Ước (NT)'}
                              </span>
                              {selectedNetworkNode.section_title && (
                                <span className="text-[11px] text-slate-400">
                                  § {selectedNetworkNode.section_title}
                                </span>
                              )}
                            </div>

                            {/* Actions on Selected Node */}
                            <div className="flex items-center gap-2">
                              {!selectedNetworkNode.is_root && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCrossReference(selectedNetworkNode.reference)}
                                  className="px-2.5 py-1 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all"
                                  title="Đặt câu này làm tâm điểm và mở rộng mạng lưới liên chiếu tiếp theo"
                                >
                                  <Compass className="w-3 h-3" />
                                  <span>Đặt làm tâm điểm</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const targetBook = books.find(b => b.name_vi.toLowerCase() === selectedNetworkNode.book.toLowerCase() || b.osis.toLowerCase() === selectedNetworkNode.book.toLowerCase());
                                  if (targetBook) {
                                    setCurrentBookCode(targetBook.code);
                                    setCurrentChapter(selectedNetworkNode.chapter);
                                    setPreviewRef(null);
                                    setPreviewData(null);
                                  }
                                }}
                                className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all shadow-sm"
                              >
                                <span>Chuyển tới chương này</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Scripture Text */}
                          <p className="font-serif text-slate-200 text-xs sm:text-sm leading-relaxed italic pt-1">
                            &ldquo;{selectedNetworkNode.text}&rdquo;
                          </p>

                          {/* Hermeneutical Rationale / Note */}
                          {(() => {
                            const edge = networkData.edges?.find(
                              (e: any) => e.target === selectedNetworkNode.id || e.source === selectedNetworkNode.id
                            );
                            if (!edge && !selectedNetworkNode.chain_role) return null;
                            return (
                              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
                                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-blue-300">Ý nghĩa liên kết: </span>
                                  <span>{selectedNetworkNode.chain_role || edge?.theological_note}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: REDEMPTIVE CHAINS FLOW MODE (§18) */}
                  {networkViewMode === "chain" && (
                    <div className="flex flex-col gap-4">
                      {/* Catalog of 8 Global Redemptive Chains */}
                      <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Khám phá 8 Đại Mạch Cứu Chuộc & Typology (§18):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {networkData.all_chains?.map((ch: any) => {
                            const isCurrent = networkData.matched_chain?.chain_id === ch.chain_id;
                            return (
                              <button
                                key={ch.chain_id}
                                type="button"
                                onClick={() => handleOpenCrossReference(previewRef, ch.chain_id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                  isCurrent
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold border border-indigo-500"
                                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                                }`}
                              >
                                <GitBranch className="w-3 h-3 text-indigo-300" />
                                <span>{ch.title}</span>
                                <span className="text-[10px] text-indigo-200/80">({ch.steps_count} bước)</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active Chain Details & Vertical Flow */}
                      {networkData.matched_chain ? (
                        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col gap-4">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400">
                                {networkData.matched_chain.theme}
                              </span>
                              <span className="text-[10px] text-indigo-300 bg-indigo-900/50 px-2 py-0.5 rounded-md border border-indigo-500/30">
                                Mạch Cứu Chuộc Đã Định Nghĩa
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-white pt-1">
                              {networkData.matched_chain.title}
                            </h4>
                            <p className="text-slate-300 text-xs pt-1 leading-relaxed">
                              {networkData.matched_chain.description}
                            </p>
                          </div>

                          {/* Progression Timeline Steps */}
                          <div className="flex flex-col gap-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-indigo-500/30">
                            {networkData.matched_chain.steps?.map((st: any, idx: number) => {
                              const isRootVerse = st.ref.includes(previewRef) || previewRef.includes(st.ref);
                              return (
                                <div
                                  key={idx}
                                  className={`relative pl-9 flex flex-col gap-1 p-3 rounded-2xl border transition-all ${
                                    isRootVerse
                                      ? "bg-blue-950/40 border-blue-500/60 shadow-md shadow-blue-500/10"
                                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                                  }`}
                                >
                                  {/* Step Circle Indicator */}
                                  <div className={`absolute left-2.5 top-3.5 w-3.5 h-3.5 rounded-full border-2 transform -translate-x-1/2 flex items-center justify-center ${
                                    isRootVerse ? "bg-blue-500 border-white" : "bg-slate-900 border-indigo-400"
                                  }`} />

                                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white text-xs">{st.ref}</span>
                                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                        st.testament === 'OT' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                                      }`}>
                                        {st.stage}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCrossReference(st.ref)}
                                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                                    >
                                      <span>Khảo sát câu này</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <p className="text-slate-300 text-xs italic font-serif leading-relaxed">
                                    &ldquo;{st.role}&rdquo;
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-slate-500">
                          Chọn một đại mạch cứu chuộc bên trên để theo dõi dòng chảy từ bóng mờ Cựu Ước đến sự ứng nghiệm Tân Ước.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: COMPLETE TEXT VERSES MODE */}
                  {networkViewMode === "verses" && (
                    <div className="flex flex-col gap-3">
                      {previewData?.verses && previewData.verses.length > 0 ? (
                        <div className="flex flex-col gap-2.5 font-serif leading-relaxed text-slate-200">
                          {previewData.verses.map((pv: any) => (
                            <div key={pv.global_id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                              <span className="text-xs font-sans font-bold text-blue-400 pt-0.5 min-w-[1.75rem]">
                                {pv.verse}
                              </span>
                              <div className="flex-1">
                                {pv.section_title && (
                                  <div className="text-[11px] font-sans font-semibold text-blue-300 pb-1">
                                    § {pv.section_title}
                                  </div>
                                )}
                                <p className="text-sm text-slate-200">{pv.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 text-center py-8">
                          Không thể tải nội dung câu tham chiếu. Bạn có thể mở tìm kiếm hoặc chuyển sách thủ công.
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  Không tìm thấy thông tin mạng lưới tham chiếu cho phân đoạn này.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-400">
                {networkData?.nodes?.length || 0} nút liên kết • Phân biệt rõ giữa văn bản, tiên tri & đối chiếu song song
              </span>
              <div className="flex items-center gap-2">
                {previewData?.verses && previewData.verses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigateToCrossReferenceChapter(previewData)}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Mở toàn bộ chương này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: EXPORT STUDY NOTEBOOK BUNDLE MODAL (§48, §50) */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-cyan-500/40 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-cyan-950/20">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="text-base font-bold text-white">Xuất Sổ Tay Nghiên Cứu Cá Nhân</h2>
                  <p className="text-xs text-slate-400">Định dạng Markdown tiêu chuẩn sẵn sàng sao chép hoặc tải về</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-xs">
              {exportLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                  <span>Đang tổng hợp dữ liệu ghi chú, bookmark và dự án nghiên cứu...</span>
                </div>
              ) : exportBundleData ? (
                <>
                  {/* Summary badges */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center flex flex-col gap-0.5">
                      <span className="text-xl font-bold text-cyan-400">{exportBundleData.summary.total_notes}</span>
                      <span className="text-[11px] text-slate-400">Ghi chú cá nhân</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center flex flex-col gap-0.5">
                      <span className="text-xl font-bold text-amber-400">{exportBundleData.summary.total_bookmarks}</span>
                      <span className="text-[11px] text-slate-400">Câu đánh dấu</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center flex flex-col gap-0.5">
                      <span className="text-xl font-bold text-indigo-400">{exportBundleData.summary.total_projects}</span>
                      <span className="text-[11px] text-slate-400">Dự án nghiên cứu</span>
                    </div>
                  </div>

                  {/* Markdown Preview Area */}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-slate-400">Bản xem trước tài liệu Markdown:</span>
                    <pre className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-60 whitespace-pre-wrap leading-relaxed">
                      {exportBundleData.markdown_bundle}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  Không thể tạo gói xuất dữ liệu. Vui lòng thử lại.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Lưu vào máy tính hoặc ứng dụng Obsidian / Notion
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMarkdownBundle}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {exportCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{exportCopied ? "Đã sao chép!" : "Sao chép Markdown"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMarkdownFile}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file .md</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: LIVE FULL-TEXT SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input Bar */}
            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-400" />
              <input
                type="text"
                autoFocus
                placeholder="Nhập từ khóa tra cứu (vd: 'yêu thương', 'đức tin', 'biển đỏ')..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
              >
                Tìm
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Container */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {searchLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span>Đang tìm kiếm trong 31,081 câu Kinh Thánh...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-400 px-1">
                    Tìm thấy {searchResults.length} kết quả phù hợp:
                  </span>
                  {searchResults.map(r => (
                    <div
                      key={r.global_id}
                      onClick={() => {
                        const targetBook = books.find(b => b.name_vi.toLowerCase() === r.book.toLowerCase());
                        if (targetBook) {
                          selectBookAndChapter(targetBook.code, r.chapter);
                        }
                        setIsSearchOpen(false);
                      }}
                      className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-800/60 cursor-pointer transition-all flex flex-col gap-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-400">
                          {r.book} {r.chapter}:{r.verse}
                        </span>
                        {r.section_title && (
                          <span className="text-[10px] text-slate-500">
                            {r.section_title}
                          </span>
                        )}
                      </div>
                      <p className="font-serif text-slate-200 line-clamp-2">
                        {r.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="text-xs text-slate-400 text-center py-12">
                  Không tìm thấy câu nào phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center py-12">
                  Nhập từ khóa và nhấn Enter để tìm kiếm toàn bộ 31,081 câu Kinh Thánh.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: MULTI-TRANSLATION COMPARATIVE ALIGNMENT MODAL (§2.1, Horizon Item) */}
      {isComparisonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-emerald-500/40 rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-emerald-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Đối Chiếu Đa Bản Dịch & Mạch Ngữ Nghĩa</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Multi-Version Alignment
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Phân đoạn: <span className="text-emerald-400 font-semibold">{comparisonVerse?.reference || `${currentBook?.name_vi} ${currentChapter}:${selectedVerse?.verse || 1}`}</span> • Đối chiếu trực tiếp 4 bản dịch quy chuẩn
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComparisonModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {comparisonLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                  <span className="text-sm font-medium">Đang đối chiếu văn phong và căn chỉnh nguyên ngữ...</span>
                </div>
              ) : comparisonVerse?.translations ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {comparisonVerse.translations.map((tr: any) => (
                      <div
                        key={tr.id}
                        className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{tr.language === "vi" ? "🇻🇳" : tr.id === "kjv" ? "🇬🇧" : tr.id === "web" ? "🌐" : "🇺🇸"}</span>
                            <div>
                              <div className="text-xs font-bold text-white">{tr.name}</div>
                              <div className="text-[10px] text-slate-400">{tr.language_label} • {tr.year ? `Năm ${tr.year}` : "Quy chuẩn"}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {tr.short_name}
                          </span>
                        </div>

                        <p className={`text-sm leading-relaxed text-slate-100 ${tr.language === "en" ? "font-serif italic text-slate-200" : "font-sans"}`}>
                          "{tr.text}"
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                          <span>{tr.word_count} từ ({tr.char_count} ký tự)</span>
                          <button
                            type="button"
                            onClick={() => handleCopySingleTranslation(tr, comparisonVerse.reference)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                          >
                            {copiedComparisonId === tr.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedComparisonId === tr.id ? "Đã chép" : "Sao chép"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Original Language Lexicon Anchor */}
                  {comparisonVerse.original_language?.matched_lexicon?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          <span>Nguyên Ngữ {comparisonVerse.original_language.language} & Khóa Từ Strong</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {comparisonVerse.original_language.testament === "OT" ? "Masoretic Hebrew" : "Majority / Textus Receptus Greek"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {comparisonVerse.original_language.matched_lexicon.map((lex: any) => (
                          <div key={lex.strong_number} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300 font-serif text-sm">{lex.lemma}</span>
                              <span className="font-mono text-[10px] text-amber-400/80 px-1.5 py-0.2 rounded bg-amber-500/10">{lex.strong_number}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 italic">{lex.transliteration} — {lex.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Không tìm thấy dữ liệu đối chiếu cho câu này.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Đối chiếu song song phục vụ dịch thuật, giải kinh và soạn thảo bài giảng chuyên sâu.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => comparisonVerse && handleCopyAllTranslations(comparisonVerse)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copiedComparisonId === "all" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedComparisonId === "all" ? "Đã Sao Chép!" : "Sao Chép Toàn Bộ 4 Bản"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsComparisonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
