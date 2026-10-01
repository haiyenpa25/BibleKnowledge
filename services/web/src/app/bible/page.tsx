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
  BrainCircuit
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

  // Cross-Reference Preview State
  const [previewRef, setPreviewRef] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<CrossRefPreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

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
  const [activeDrawerTab, setActiveDrawerTab] = useState<"insight" | "harmony" | "citations" | "lexicon" | "entities" | "notes">("insight");
  const [copiedCitationKey, setCopiedCitationKey] = useState<string | null>(null);

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

  // Load parallel chapter data when parallel or interlinear view is active (§2.1 & §31)
  useEffect(() => {
    if (viewMode !== "parallel" && viewMode !== "interlinear") return;

    let isMounted = true;
    async function loadParallel() {
      setParallelLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/bible/parallel-chapter?book=${currentBookCode}&chapter=${currentChapter}&target_translation=kjv`);
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
  }, [currentBookCode, currentChapter, viewMode, apiUrl]);

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

  // Persistent Bookmark Toggle
  async function toggleBookmark(verse: Verse) {
    if (!currentBook) return;
    const isBookmarked = bookmarkedVerses.includes(verse.verse_code);
    const scriptureRef = `${currentBook.name_vi} ${verse.chapter}:${verse.verse}`;

    if (isBookmarked) {
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

  // Cross-reference preview popover
  async function handleOpenCrossReference(ref: string) {
    setPreviewRef(ref);
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const res = await fetch(`${apiUrl}/api/bible/verse-range?ref=${encodeURIComponent(ref)}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewData(data);
      }
    } catch (e) {
      console.error("Failed to load cross-reference preview:", e);
    } finally {
      setPreviewLoading(false);
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
              title="Chế độ song song đối chiếu KJV"
            >
              <Languages className="w-3 h-3 text-emerald-400" />
              <span>Song Song KJV</span>
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
                {/* Column Headers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b border-slate-800 text-xs font-bold tracking-wider">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-blue-300">
                    <span className="flex items-center gap-1.5">
                      <span>🇻🇳</span> Bản Dịch Truyền Thống 1925 (Tiếng Việt)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Gốc 1925
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <span>🇬🇧</span> King James Version — KJV 1611 (English)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Kinh Điển
                    </span>
                  </div>
                </div>

                {parallelLoading ? (
                  <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                    <p className="text-sm font-medium">Đang chuẩn bị bản dịch đối chiếu song song KJV...</p>
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

                            {/* Right Column: English KJV */}
                            <div className="flex items-start gap-3 md:border-l md:border-slate-800/80 md:pl-4 pt-2 md:pt-0 border-t border-slate-800/60 md:border-t-0">
                              <span className="select-none text-xs font-sans font-semibold pt-1 min-w-[1.5rem] text-right text-emerald-400/80">
                                {v.verse}
                              </span>
                              <div className="flex-1 leading-relaxed font-serif text-slate-300 text-sm md:text-base italic">
                                {v.text_target || <span className="text-slate-600 font-sans text-xs">Đang tải câu đối chiếu...</span>}
                              </div>
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
          </div>

          {/* Tab Content Display */}
          <div className="max-h-64 overflow-y-auto pr-1">
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

                  <Link
                    href={`/study?ref=${encodeURIComponent(`${currentBook?.name_vi || ''} ${selectedVerse.chapter}:${selectedVerse.verse}`)}`}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300 flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Mở phân tích giải kinh sâu đoạn văn này"
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Phân Tích Giải Kinh</span>
                  </Link>

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

      {/* MODAL 4: CROSS-REFERENCE QUICK PREVIEW MODAL */}
      {previewRef && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-blue-500/40 rounded-3xl max-w-xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-blue-950/30">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold text-sm flex items-center gap-1.5">
                  ⚓ Tham Chiếu Chéo: {previewRef}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewRef(null);
                  setPreviewData(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 text-sm">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span>Đang tải phân đoạn đối chiếu...</span>
                </div>
              ) : previewData?.verses && previewData.verses.length > 0 ? (
                <div className="flex flex-col gap-3 font-serif leading-relaxed text-slate-200">
                  {previewData.verses.map(pv => (
                    <div key={pv.global_id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                      <span className="text-xs font-sans font-bold text-blue-400 pt-0.5 min-w-[1.5rem]">
                        {pv.verse}
                      </span>
                      <div className="flex-1">
                        {pv.section_title && (
                          <div className="text-[11px] font-sans font-semibold text-blue-300 pb-1">
                            § {pv.section_title}
                          </div>
                        )}
                        <p>{pv.text}</p>
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

            {/* Footer with direct navigate button */}
            {previewData?.verses && previewData.verses.length > 0 && (
              <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {previewData.verses.length} câu trong phân đoạn
                </span>
                <button
                  type="button"
                  onClick={() => navigateToCrossReferenceChapter(previewData)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Chuyển tới chương này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
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
    </div>
  );
}
