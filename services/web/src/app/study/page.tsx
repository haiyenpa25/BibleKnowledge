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
  ChevronRight,
  FolderGit2,
  FolderPlus,
  Users,
  Check,
  Zap,
  HelpCircle,
  X,
  Download,
  Copy,
  Printer,
  FileDown,
  Scroll,
  Share2,
  MonitorPlay,
  ChevronLeft
} from "lucide-react";

interface ExpositoryPoint {
  point_number: number;
  title: string;
  scripture_ref: string;
  verse_text: string;
  original_language_key?: string;
  exposition: string;
  illustration?: string;
}

interface ExpositoryCitation {
  source_title: string;
  author?: string;
  quote: string;
}

interface SermonBuilderResult {
  passage_ref: string;
  title: string;
  key_verse: string;
  key_verse_text: string;
  big_idea: string;
  introduction_and_hook: string;
  historical_context: string;
  points: ExpositoryPoint[];
  practical_applications: string[];
  conclusion_and_call: string;
  theological_citations: ExpositoryCitation[];
  markdown_manuscript: string;
  saved_project_id?: string;
}

interface SermonPreset {
  id: string;
  passage_ref: string;
  title: string;
  theme: string;
  audience: string;
  summary: string;
}

interface StudyBundleData {
  summary: {
    total_notes: number;
    total_bookmarks: number;
    total_projects: number;
  };
  markdown_bundle: string;
}

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

interface PassageCitation {
  source_title: string;
  chapter_title: string;
  section_heading?: string;
  quote: string;
}

interface PassageStudyResult {
  reference: string;
  passage_text: string;
  literary_context: string;
  theological_themes: string[];
  structural_outline: Array<{ section: string; theme: string }>;
  original_language_insights: string;
  application_questions: string[];
  theological_citations?: PassageCitation[];
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

interface ProjectNote {
  id: string;
  project_id: string;
  title: string;
  content: string;
  created_at: string;
}

interface StudyProject {
  id: string;
  title: string;
  description: string;
  category: string;
  pinned_verses: Array<{ reference: string; text: string }>;
  pinned_entities: Array<{ type: string; slug: string; name: string }>;
  study_questions: string[];
  ai_outline: Array<{ section: string; content: string }>;
  created_at: string;
  updated_at: string;
}

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState<"projects" | "sermon" | "lexicon" | "passage" | "notes">("projects");

  // Sermon Builder State (§50)
  const [sermonPresets, setSermonPresets] = useState<SermonPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset-romans-8");
  const [sermonPassageRef, setSermonPassageRef] = useState<string>("Rô-ma 8:31-39");
  const [sermonAudience, setSermonAudience] = useState<string>("Hội Thánh Chúa Nhật");
  const [sermonTheme, setSermonTheme] = useState<string>("");
  const [sermonResult, setSermonResult] = useState<SermonBuilderResult | null>(null);
  const [loadingSermon, setLoadingSermon] = useState<boolean>(false);
  const [sermonError, setSermonError] = useState<string | null>(null);
  const [copiedSermon, setCopiedSermon] = useState<boolean>(false);
  const [savedSermonMsg, setSavedSermonMsg] = useState<string | null>(null);

  // Study Bundle Export Modal State (§50)
  const [isBundleModalOpen, setIsBundleModalOpen] = useState<boolean>(false);
  const [bundleData, setBundleData] = useState<StudyBundleData | null>(null);
  const [loadingBundle, setLoadingBundle] = useState<boolean>(false);
  const [copiedBundle, setCopiedBundle] = useState<boolean>(false);

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

  // Projects State
  const [projects, setProjects] = useState<StudyProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<StudyProject | null>(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectCategory, setNewProjectCategory] = useState("theology");
  const [savingProject, setSavingProject] = useState(false);
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [exportingFlashcards, setExportingFlashcards] = useState(false);
  const [projectMessage, setProjectMessage] = useState<string | null>(null);
  const [projectSummary, setProjectSummary] = useState<string | null>(null);

  // Project Specific Notes & Pinning State (§50)
  const [projectNotes, setProjectNotes] = useState<ProjectNote[]>([]);
  const [loadingProjectNotes, setLoadingProjectNotes] = useState(false);
  const [pinVerseInput, setPinVerseInput] = useState("");
  const [pinningVerse, setPinningVerse] = useState(false);
  const [newProjectNoteTitle, setNewProjectNoteTitle] = useState("");
  const [newProjectNoteContent, setNewProjectNoteContent] = useState("");
  const [savingProjectNote, setSavingProjectNote] = useState(false);

  // Entity Pinning State (§50)
  const [pinEntityName, setPinEntityName] = useState("");
  const [pinEntityType, setPinEntityType] = useState<"person" | "place" | "event" | "topic">("person");
  const [pinningEntity, setPinningEntity] = useState(false);

  // Slide Deck Presentation Mode State (§50)
  const [isSlideDeckOpen, setIsSlideDeckOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [copiedSlides, setCopiedSlides] = useState(false);

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

  // Fetch Projects
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch(`${apiUrl}/api/study/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch Sermon Presets
  const fetchSermonPresets = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/study/sermon-presets`);
      if (res.ok) {
        const data = await res.json();
        setSermonPresets(data);
      }
    } catch (err) {
      console.error("Failed to fetch sermon presets:", err);
    }
  };

  useEffect(() => {
    fetchLexicon();
    fetchNotes();
    fetchProjects();
    fetchSermonPresets();
  }, [apiUrl]);

  // Build Sermon
  const handleBuildSermon = async (overrideRef?: string, overrideAudience?: string, overrideTheme?: string, saveProj: boolean = false) => {
    const targetRef = overrideRef || sermonPassageRef;
    if (!targetRef.trim()) return;
    setLoadingSermon(true);
    setSermonError(null);
    setSavedSermonMsg(null);

    try {
      const res = await fetch(`${apiUrl}/api/study/sermon-builder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage_ref: targetRef.trim(),
          audience: overrideAudience || sermonAudience,
          theme_topic: overrideTheme !== undefined ? overrideTheme : sermonTheme,
          save_as_project: saveProj
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Không thể khởi tạo đề cương bài giảng.");
      }

      const data: SermonBuilderResult = await res.json();
      setSermonResult(data);
      if (saveProj && data.saved_project_id) {
        setSavedSermonMsg("Đã lưu bản thảo bài giảng thành dự án nghiên cứu mới!");
        fetchProjects();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi gọi AI soạn bài giảng.";
      setSermonError(msg);
    } finally {
      setLoadingSermon(false);
    }
  };

  // Select Preset
  const handleSelectPreset = (p: SermonPreset) => {
    setSelectedPresetId(p.id);
    setSermonPassageRef(p.passage_ref);
    setSermonAudience(p.audience);
    setSermonTheme(p.title);
    handleBuildSermon(p.passage_ref, p.audience, p.title, false);
  };

  // Copy Sermon
  const handleCopySermon = () => {
    if (!sermonResult) return;
    navigator.clipboard.writeText(sermonResult.markdown_manuscript);
    setCopiedSermon(true);
    setTimeout(() => setCopiedSermon(false), 2500);
  };

  // Download Sermon Markdown
  const handleDownloadSermon = () => {
    if (!sermonResult) return;
    const blob = new Blob([sermonResult.markdown_manuscript], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanName = (sermonResult.title || "Bai_Giang").replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, "_");
    link.download = `${cleanName}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Print Sermon
  const handlePrintSermon = () => {
    window.print();
  };

  // Generate Slide Deck Markdown (Marp / Slidev format)
  const generateSlideDeckMarkdown = () => {
    if (!sermonResult) return "";
    let md = `---
marp: true
theme: gaia
_class: lead
paginate: true
backgroundColor: #0f172a
color: #f8fafc
---

# ${sermonResult.title}
### ${sermonResult.passage_ref}

**Câu Gốc:** "${sermonResult.key_verse_text}" (${sermonResult.key_verse})  
*Đối tượng:* ${sermonAudience}  
*Soạn bởi:* BibleKnowledge Expository Engine (§50)

---

# Ý Niệm Cốt Lõi (Big Idea)

> "${sermonResult.big_idea}"

### Bối Cảnh Lịch Sử & Thần Học
${sermonResult.historical_context}

### Dẫn Nhập
${sermonResult.introduction_and_hook}
`;

    sermonResult.points.forEach((pt, i) => {
      md += `\n---\n\n# Luận Điểm ${i + 1}: ${pt.title}\n\n`;
      md += `**Kinh Thánh:** *${pt.scripture_ref}*\n\n`;
      md += `> "${pt.verse_text}"\n\n`;
      if (pt.original_language_key) {
        md += `*Nguyên văn Hy Lạp / Hê-bơ-rơ:* \`${pt.original_language_key}\`\n\n`;
      }
      md += `### Giải Nghĩa:\n${pt.exposition}\n\n`;
      if (pt.illustration) {
        md += `💡 **Minh Họa:** ${pt.illustration}\n\n`;
      }
    });

    md += `\n---\n\n# Ứng Dụng Đời Sống Thực Tế\n\n`;
    sermonResult.practical_applications.forEach((app, i) => {
      md += `${i + 1}. ${app}\n`;
    });

    md += `\n---\n\n# Kết Luận & Lời Kêu Gọi\n\n`;
    md += `${sermonResult.conclusion_and_call}\n\n`;
    if (sermonResult.theological_citations?.length > 0) {
      md += `\n---\n\n### Tài Liệu & Chú Giải Tham Khảo\n\n`;
      sermonResult.theological_citations.forEach((c) => {
        md += `- **${c.source_title}** ${c.author ? `(${c.author})` : ""}: "${c.quote}"\n`;
      });
    }

    return md;
  };

  const handleCopySlideDeck = () => {
    const md = generateSlideDeckMarkdown();
    if (!md) return;
    navigator.clipboard.writeText(md);
    setCopiedSlides(true);
    setTimeout(() => setCopiedSlides(false), 2500);
  };

  const handleDownloadSlideDeck = () => {
    const md = generateSlideDeckMarkdown();
    if (!md) return;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanName = (sermonResult?.title || "Bai_Giang").replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, "_");
    link.download = `${cleanName}_SlideDeck.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalSlides = sermonResult ? 3 + (sermonResult.points?.length || 0) : 0;

  useEffect(() => {
    if (!isSlideDeckOpen || !sermonResult) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        setIsSlideDeckOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSlideDeckOpen, totalSlides, sermonResult]);

  // Open Bundle Export
  const handleOpenBundleExport = async () => {
    setIsBundleModalOpen(true);
    setLoadingBundle(true);
    try {
      const res = await fetch(`${apiUrl}/api/study/export-bundle`);
      if (res.ok) {
        const data = await res.json();
        setBundleData(data);
      }
    } catch (err) {
      console.error("Failed to fetch study bundle:", err);
    } finally {
      setLoadingBundle(false);
    }
  };

  // Download Bundle File
  const handleDownloadBundle = () => {
    if (!bundleData) return;
    const blob = new Blob([bundleData.markdown_bundle], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `So_Tay_Nghien_Cuu_Kinh_Thanh_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy Bundle
  const handleCopyBundle = () => {
    if (!bundleData) return;
    navigator.clipboard.writeText(bundleData.markdown_bundle);
    setCopiedBundle(true);
    setTimeout(() => setCopiedBundle(false), 2500);
  };

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

  // Save Passage Study to Personal Notes
  const handleSavePassageToNotes = async () => {
    if (!passageResult) return;
    try {
      const outlineText = passageResult.structural_outline?.map((o) => `${o.section}: ${o.theme}`).join("\n") || "";
      const content = `### Bối Cảnh Lịch Sử & Thần Học\n${passageResult.literary_context}\n\n### Dàn Ý Phân Đoạn\n${outlineText}\n\n### Từ Ngữ Gốc Hy Lạp / Hê-bơ-rơ\n${passageResult.original_language_insights}`;
      const res = await fetch(`${apiUrl}/api/study/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Khảo Luận: ${passageResult.reference}`,
          scripture_ref: passageResult.reference,
          content,
          tags: ["passage_study", "exegesis", ...(passageResult.theological_themes || [])]
        })
      });
      if (res.ok) {
        fetchNotes();
        setNoteSuccess("Đã lưu khảo luận đoạn văn vào sổ tay cá nhân!");
        setTimeout(() => setNoteSuccess(null), 3000);
      }
    } catch (e) {
      console.error("Failed to save passage study note:", e);
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

  // Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    setSavingProject(true);

    try {
      const res = await fetch(`${apiUrl}/api/study/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProjectTitle.trim(),
          description: newProjectDesc.trim(),
          category: newProjectCategory,
          pinned_verses: [],
          pinned_entities: [],
          study_questions: []
        })
      });

      if (res.ok) {
        const created = await res.json();
        setNewProjectTitle("");
        setNewProjectDesc("");
        setIsCreateProjectOpen(false);
        fetchProjects();
        setSelectedProject(created);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProject(false);
    }
  };

  // Generate Project Outline with Ollama
  const handleGenerateOutline = async (projectId: string) => {
    setGeneratingOutline(true);
    setProjectMessage(null);
    try {
      const res = await fetch(`${apiUrl}/api/study/projects/${projectId}/generate-outline`, {
        method: "POST"
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedProject(updated);
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        setProjectMessage("Đã lập dàn ý nghiên cứu AI thành công!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingOutline(false);
    }
  };

  // Export Project to Flashcards
  const handleExportFlashcards = async (projectId: string) => {
    setExportingFlashcards(true);
    setProjectMessage(null);
    try {
      const res = await fetch(`${apiUrl}/api/study/projects/${projectId}/export-flashcards`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setProjectMessage(data.message || "Đã xuất thẻ ghi nhớ thành công!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExportingFlashcards(false);
    }
  };

  // Fetch Project Notes (§50)
  const fetchProjectNotes = async (projectId: string) => {
    setLoadingProjectNotes(true);
    try {
      const res = await fetch(`${apiUrl}/api/study/projects/${projectId}/notes`);
      if (res.ok) {
        const data = await res.json();
        setProjectNotes(data);
      }
    } catch (err) {
      console.error("Failed to fetch project notes:", err);
    } finally {
      setLoadingProjectNotes(false);
    }
  };

  // Add Project Note (§50)
  const handleCreateProjectNote = async (projectId: string) => {
    if (!newProjectNoteTitle.trim() || !newProjectNoteContent.trim()) return;
    setSavingProjectNote(true);
    try {
      const res = await fetch(`${apiUrl}/api/study/projects/${projectId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProjectNoteTitle.trim(),
          content: newProjectNoteContent.trim()
        })
      });
      if (res.ok) {
        setNewProjectNoteTitle("");
        setNewProjectNoteContent("");
        fetchProjectNotes(projectId);
        setProjectMessage("Đã lưu ghi chú nghiên cứu vào dự án!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProjectNote(false);
    }
  };

  // Delete Project Note (§50)
  const handleDeleteProjectNote = async (projectId: string, noteId: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/study/projects/${projectId}/notes/${noteId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchProjectNotes(projectId);
        setProjectMessage("Đã gỡ ghi chú khỏi dự án.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pin Verse to Project (§50)
  const handlePinVerse = async (projectId: string) => {
    if (!pinVerseInput.trim()) return;
    setPinningVerse(true);
    setProjectMessage(null);
    try {
      const res = await fetch(`${apiUrl}/api/study/projects/${projectId}/pin-verse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: pinVerseInput.trim() })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedProject(updated);
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        setPinVerseInput("");
        setProjectMessage(`Đã ghim thành công phân đoạn: ${pinVerseInput.trim()}!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPinningVerse(false);
    }
  };

  // Pin Entity to Project (§50)
  const handlePinEntity = async (projectId: string, type: string, slug: string, name: string) => {
    if (!name.trim() || !slug.trim()) return;
    setPinningEntity(true);
    setProjectMessage(null);
    try {
      const res = await fetch(`${apiUrl}/api/study/projects/${projectId}/pin-entity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, slug, name: name.trim() })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedProject(updated);
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        setPinEntityName("");
        setProjectMessage(`Đã ghim thực thể "${name.trim()}" vào dự án thành công!`);
        setTimeout(() => setProjectMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to pin entity:", err);
    } finally {
      setPinningEntity(false);
    }
  };

  // Generate Questions with AI (§50)
  const handleGenerateQuestions = async (projectId: string) => {
    setGeneratingQuestions(true);
    setProjectMessage(null);
    try {
      const res = await fetch(`${apiUrl}/api/study/projects/${projectId}/generate-questions`, {
        method: "POST"
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedProject(updated);
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        setProjectMessage("Đã kiến tạo câu hỏi nghiên cứu AI thành công!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Generate Summary with AI (§50)
  const handleGenerateSummary = async (projectId: string) => {
    setGeneratingSummary(true);
    setProjectMessage(null);
    try {
      const res = await fetch(`${apiUrl}/api/study/projects/${projectId}/generate-summary`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setProjectSummary(data.summary);
        setProjectMessage("Đã tổng hợp nghiên cứu thần học AI thành công!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Sync Project Notes on selected project change
  useEffect(() => {
    if (selectedProject?.id) {
      fetchProjectNotes(selectedProject.id);
      setProjectSummary(null);
    }
  }, [selectedProject?.id]);

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
              Dự án nghiên cứu chuyên đề • Soạn bài giảng giải kinh • Từ điển Strong Hy Lạp/Hê-bơ-rơ • Sổ tay cá nhân
            </p>
          </div>
        </div>

        {/* Action Controls & Tab Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Workspace Bundle Exporter (§48, §50) */}
          <button
            onClick={handleOpenBundleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600/30 to-amber-700/20 hover:from-amber-600/40 hover:to-amber-700/30 text-amber-300 border border-amber-500/40 shadow-sm transition-all hover:scale-105 mr-1"
            title="Xuất toàn bộ ghi chú, câu đánh dấu và dự án nghiên cứu thành tệp Markdown"
          >
            <FileDown className="w-4 h-4 text-amber-400" /> Xuất Sổ Tay (.MD)
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "projects"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
            }`}
          >
            <FolderGit2 className="w-4 h-4" /> Dự Án ({projects.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("sermon");
              if (!sermonResult && sermonPresets.length > 0) {
                handleSelectPreset(sermonPresets[0]);
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "sermon"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Soạn Bài Giảng (§50)
          </button>
          <button
            onClick={() => setActiveTab("lexicon")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "lexicon"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
            }`}
          >
            <Languages className="w-4 h-4" /> Từ Điển Strong
          </button>
          <button
            onClick={() => setActiveTab("passage")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "passage"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Giải Kinh Đoạn Văn
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "notes"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" /> Sổ Tay ({notes.length})
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 1. STUDY PROJECTS WORKSPACE (ROADMAP1 Section 50) */}
      {/* ===================================================================== */}
      {activeTab === "projects" && (
        <div className="flex flex-col gap-6">
          {/* Top Bar with Project Creation Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-amber-400" /> Không Gian Dự Án Nghiên Cứu Chuyên Sâu
              </h2>
              <p className="text-xs text-slate-400">
                Tập hợp câu Kinh Thánh ghim, mạng lưới thực thể, dàn ý nghiên cứu AI và xuất thành thẻ Flashcards.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateProjectOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-600/30"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Tạo Dự Án Mới</span>
            </button>
          </div>

          {/* Grid Layout: Left Column = Project List, Right Column = Project Detail Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Project Cards */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Các dự án đang tiến hành ({projects.length}):
              </span>
              {loadingProjects ? (
                <div className="p-8 text-center text-xs text-slate-400">Đang tải danh sách dự án...</div>
              ) : projects.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                  Chưa có dự án nào. Hãy bấm &quot;Tạo Dự Án Mới&quot; để bắt đầu.
                </div>
              ) : (
                projects.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProject(proj)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 ${
                      selectedProject?.id === proj.id
                        ? "bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/40"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-400">
                        {proj.category === "person" ? "Nhân vật" : proj.category === "theology" ? "Thần học" : "Đoạn văn"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(proj.updated_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white line-clamp-1">{proj.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{proj.description}</p>
                    
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                      <span>⚓ {proj.pinned_verses?.length || 0} câu ghim</span>
                      <span>🌐 {proj.pinned_entities?.length || 0} thực thể</span>
                      <span>📑 {proj.ai_outline?.length || 0} phân đoạn</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right: Selected Project Detail Workspace */}
            <div className="lg:col-span-2">
              {selectedProject ? (
                <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-6 shadow-2xl">
                  {/* Workspace Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-800 gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                        Không gian nghiên cứu • {selectedProject.category}
                      </span>
                      <h2 className="text-2xl font-bold text-white">{selectedProject.title}</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* AI Generate Outline Button */}
                      <button
                        type="button"
                        disabled={generatingOutline}
                        onClick={() => handleGenerateOutline(selectedProject.id)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        title="AI tự động phân tích và lập dàn ý 3 phân đoạn"
                      >
                        {generatingOutline ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                        <span>Lập Dàn Ý AI</span>
                      </button>

                      {/* AI Generate Questions Button */}
                      <button
                        type="button"
                        disabled={generatingQuestions}
                        onClick={() => handleGenerateQuestions(selectedProject.id)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        title="AI tự động tạo 4 câu hỏi suy ngẫm sâu sắc"
                      >
                        {generatingQuestions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />}
                        <span>Tạo Câu Hỏi AI</span>
                      </button>

                      {/* AI Generate Summary Button */}
                      <button
                        type="button"
                        disabled={generatingSummary}
                        onClick={() => handleGenerateSummary(selectedProject.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        title="AI tổng hợp bản luận giải nghiên cứu toàn cảnh"
                      >
                        {generatingSummary ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5 text-amber-400" />}
                        <span>Tổng Hợp AI</span>
                      </button>

                      {/* Export Flashcards Button */}
                      <button
                        type="button"
                        disabled={exportingFlashcards}
                        onClick={() => handleExportFlashcards(selectedProject.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        title="Xuất các câu và dàn ý thành Flashcards SM-2"
                      >
                        {exportingFlashcards ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>Xuất Flashcard</span>
                      </button>

                      {/* Convert to Sermon Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const firstV = selectedProject.pinned_verses?.[0]?.reference || selectedProject.title;
                          setSermonPassageRef(firstV);
                          setSermonTheme(selectedProject.title);
                          setActiveTab("sermon");
                          handleBuildSermon(firstV, sermonAudience, selectedProject.title, false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        title="Tạo đề cương bài giảng giải kinh từ dự án này"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        <span>Soạn Bài Giảng</span>
                      </button>
                    </div>
                  </div>

                  {projectMessage && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{projectMessage}</span>
                    </div>
                  )}

                  {/* AI Research Executive Synthesis (§50) */}
                  {projectSummary && (
                    <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/40 flex flex-col gap-2.5 shadow-lg animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" /> Bản Tổng Hợp Nghiên Cứu Thần Học Toàn Cảnh (AI Synthesis):
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                          Qwen2.5 Grounded
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                        {projectSummary}
                      </p>
                    </div>
                  )}

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {selectedProject.description}
                  </p>

                  {/* Quick Pin Verse Input (§50) */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePinVerse(selectedProject.id);
                    }}
                    className="flex flex-col sm:flex-row gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800"
                  >
                    <div className="relative flex-1">
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={pinVerseInput}
                        onChange={(e) => setPinVerseInput(e.target.value)}
                        placeholder="Ghim thêm câu Kinh Thánh (ví dụ: Rô-ma 8:28, Giăng 14:6, Thi-thiên 23:1...)"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={pinningVerse || !pinVerseInput.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20 shrink-0"
                    >
                      {pinningVerse ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Ghim Lời Chúa</span>
                    </button>
                  </form>

                  {/* Quick Pin Entity Input (§50) */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!pinEntityName.trim()) return;
                      const slug = pinEntityName.trim().toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/g, '-');
                      handlePinEntity(selectedProject.id, pinEntityType, slug, pinEntityName.trim());
                    }}
                    className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800"
                  >
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={pinEntityType}
                        onChange={(e) => setPinEntityType(e.target.value as any)}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-400 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 shrink-0"
                      >
                        <option value="person">👤 Nhân vật</option>
                        <option value="place">📍 Địa danh</option>
                        <option value="event">📜 Sự kiện</option>
                        <option value="topic">🕊️ Chủ đề</option>
                      </select>
                      <div className="relative flex-1">
                        <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={pinEntityName}
                          onChange={(e) => setPinEntityName(e.target.value)}
                          placeholder="Ghim nhân vật, địa danh, sự kiện hoặc chủ đề thần học..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={pinningEntity || !pinEntityName.trim()}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 shrink-0"
                      >
                        {pinningEntity ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>Ghim Thực Thể</span>
                      </button>
                    </div>
                    {/* Quick Entity Suggestion Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
                      <span className="text-slate-500 shrink-0">Gợi ý nhanh:</span>
                      {[
                        { name: "Chúa Giê-xu", slug: "chua-gie-xu", type: "person" },
                        { name: "Phi-e-rơ", slug: "phi-e-ro", type: "person" },
                        { name: "Phao-lô", slug: "phao-lo", type: "person" },
                        { name: "Đa-vít", slug: "da-vit", type: "person" },
                        { name: "Giê-ru-sa-lem", slug: "gie-ru-sa-lem", type: "place" },
                        { name: "Bết-lê-hem", slug: "bet-le-hem", type: "place" },
                        { name: "Thập Tự Giá & Phục Sinh", slug: "su-chuoc-toi-thap-tu-gia", type: "event" },
                        { name: "Ân Điển & Đức Tin", slug: "an-dien-va-duc-tin", type: "topic" }
                      ].map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handlePinEntity(selectedProject.id, sug.type, sug.slug, sug.name)}
                          className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 whitespace-nowrap transition-colors"
                        >
                          + {sug.name}
                        </button>
                      ))}
                    </div>
                  </form>

                  {/* Section 1: Pinned Scriptures */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Các Phân Đoạn Kinh Thánh Đã Ghim ({selectedProject.pinned_verses?.length || 0}):
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedProject.pinned_verses?.map((v, i) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1.5 hover:border-blue-500/40 transition-colors">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-blue-300">⚓ {v.reference}</span>
                            <Link
                              href={`/bible?ref=${encodeURIComponent(v.reference)}`}
                              target="_blank"
                              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                            >
                              Mở trong Reader <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                          <p className="font-serif text-slate-300 italic text-xs leading-relaxed">
                            &ldquo;{v.text}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Pinned Entities */}
                  {selectedProject.pinned_entities && selectedProject.pinned_entities.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Mạng Lưới Thực Thể Liên Kết:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.pinned_entities.map((ent, i) => (
                          <Link
                            key={i}
                            href={`/explore?tab=${ent.type === 'place' ? 'map' : ent.type === 'event' ? 'timeline' : 'graph'}`}
                            className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 hover:border-emerald-500/40 transition-colors"
                          >
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{ent.name}</span>
                            <span className="text-[10px] text-slate-500 uppercase">({ent.type})</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 3: AI Study Outline */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Dàn Ý Nghiên Cứu Thần Học (Study Outline):
                    </span>
                    {selectedProject.ai_outline && selectedProject.ai_outline.length > 0 ? (
                      <div className="flex flex-col gap-2.5">
                        {selectedProject.ai_outline.map((sec, i) => (
                          <div key={i} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs flex flex-col gap-1">
                            <h4 className="font-bold text-amber-300">{sec.section}</h4>
                            <p className="text-slate-300 leading-relaxed font-sans">{sec.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                        Chưa có dàn ý. Hãy bấm &quot;Lập Dàn Ý AI&quot; ở trên để mô hình tự động kiến tạo.
                      </div>
                    )}
                  </div>

                  {/* Section 4: Study Questions Checklist (§50) */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> Câu Hỏi Nghiên Cứu &amp; Khảo Luận ({selectedProject.study_questions?.length || 0}):
                      </span>
                      {selectedProject.study_questions?.length === 0 && (
                        <button
                          type="button"
                          onClick={() => handleGenerateQuestions(selectedProject.id)}
                          className="text-[11px] text-cyan-400 hover:underline"
                        >
                          Tạo câu hỏi ngay
                        </button>
                      )}
                    </div>
                    {selectedProject.study_questions && selectedProject.study_questions.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {selectedProject.study_questions.map((q, i) => (
                          <div key={i} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200">
                            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed font-sans">{q}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                        Chưa có câu hỏi nghiên cứu. Bấm &quot;Tạo Câu Hỏi AI&quot; để tạo tự động.
                      </div>
                    )}
                  </div>

                  {/* Section 5: Project Specific Notes (§50) */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Ghi Chú Riêng Trong Dự Án ({projectNotes.length}):
                      </span>
                    </div>

                    {/* Inline Create Note Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCreateProjectNote(selectedProject.id);
                      }}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5"
                    >
                      <input
                        type="text"
                        value={newProjectNoteTitle}
                        onChange={(e) => setNewProjectNoteTitle(e.target.value)}
                        placeholder="Tiêu đề ghi chú nghiên cứu..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans font-semibold"
                      />
                      <textarea
                        value={newProjectNoteContent}
                        onChange={(e) => setNewProjectNoteContent(e.target.value)}
                        placeholder="Nội dung suy ngẫm, kết luận giải kinh hoặc phát hiện thần học..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={savingProjectNote || !newProjectNoteTitle.trim() || !newProjectNoteContent.trim()}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          {savingProjectNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>Lưu Ghi Chú Vào Dự Án</span>
                        </button>
                      </div>
                    </form>

                    {/* Notes List */}
                    {loadingProjectNotes ? (
                      <div className="p-4 text-center text-xs text-slate-500">Đang tải ghi chú...</div>
                    ) : projectNotes.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                        Chưa có ghi chú nào trong dự án này. Viết ghi chú đầu tiên ở trên.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {projectNotes.map((pn) => (
                          <div key={pn.id} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-2">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-xs text-emerald-300 line-clamp-1">{pn.title}</h5>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(pn.created_at).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                                {pn.content}
                              </p>
                            </div>
                            <div className="flex justify-end pt-1 border-t border-slate-900">
                              <button
                                type="button"
                                onClick={() => handleDeleteProjectNote(selectedProject.id, pn.id)}
                                className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Xóa ghi chú</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
                  Chọn một dự án ở cột bên trái để mở không gian nghiên cứu.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. EXPOSITORY PREACHING & SERMON BUILDER (§50) */}
      {/* ===================================================================== */}
      {activeTab === "sermon" && (
        <div className="flex flex-col gap-6">
          {/* Top Banner / Introduction */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900/60 p-5 rounded-3xl border border-rose-900/40 shadow-xl">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Expository Homiletics Engine §50
                </span>
                <span className="text-xs text-slate-400">• Chuẩn 66 Sách Chính Kinh 1925</span>
              </div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Công Cụ Soạn Bài Giảng & Bài Dạy Giải Kinh
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Thiết kế cấu trúc bài giảng giải kinh chuẩn mực: Câu gốc, Ý niệm cốt lõi (Big Idea), Dẫn nhập bối cảnh lịch sử, 
                các luận điểm phân tích nguyên văn Hy Lạp/Hê-bơ-rơ, minh họa thực tế, ứng dụng và trích dẫn tài liệu thần học.
              </p>
            </div>
            {sermonResult && (
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentSlideIndex(0);
                    setIsSlideDeckOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
                  title="Mở chế độ trình chiếu Slide toàn màn hình"
                >
                  <MonitorPlay className="w-3.5 h-3.5" />
                  <span>Trình Chiếu Slide</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySermon}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 shadow-sm"
                  title="Sao chép toàn bộ bản thảo định dạng Markdown"
                >
                  {copiedSermon ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedSermon ? "Đã Sao Chép!" : "Sao Chép MD"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSermon}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/30"
                  title="Tải tệp Markdown (.md) về máy"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Tệp .MD</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintSermon}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all border border-slate-700"
                  title="In bản thảo bài giảng hoặc xuất PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In</span>
                </button>
              </div>
            )}
          </div>

          {/* Classical Blueprints Carousel / Preset Cards */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Scroll className="w-4 h-4 text-amber-400" /> Mẫu Giảng Giải Kinh Kinh Điển (Chọn để tải ngay đề cương):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {sermonPresets.map((p) => {
                const isSelected = selectedPresetId === p.id && sermonResult?.passage_ref === p.passage_ref;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 text-left ${
                      isSelected
                        ? "bg-rose-950/40 border-rose-500/70 shadow-lg shadow-rose-950/50"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          {p.passage_ref}
                        </span>
                        <span className="text-[10px] text-slate-400">{p.audience}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 mt-1">{p.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.summary}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-amber-400 font-medium">
                      <span>{p.theme}</span>
                      <span className="text-slate-500">Xem ngay →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Input Form */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Phân đoạn Kinh Thánh (Passage Reference) *
                </label>
                <input
                  type="text"
                  value={sermonPassageRef}
                  onChange={(e) => setSermonPassageRef(e.target.value)}
                  placeholder="Ví dụ: Rô-ma 8:31-39, Giăng 15:1-8, Thi-thiên 23..."
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" /> Đối tượng người nghe (Audience)
                </label>
                <select
                  value={sermonAudience}
                  onChange={(e) => setSermonAudience(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                >
                  <option value="Hội Thánh Chúa Nhật">Hội Thánh Chúa Nhật (Toàn thể)</option>
                  <option value="Ban Thanh Niên & Tráng Niên">Ban Thanh Niên & Tráng Niên</option>
                  <option value="Lớp Học Kinh Thánh & Điểm Nhóm">Lớp Học Kinh Thánh & Điểm Nhóm</option>
                  <option value="Ban Phụ Nữ / Tráng Niên">Ban Phụ Nữ / Tráng Niên</option>
                  <option value="Hội Thảo Thần Học & Mục Vụ">Hội Thảo Thần Học & Mục Vụ</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Chủ đề / Tiêu đề gợi ý (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={sermonTheme}
                  onChange={(e) => setSermonTheme(e.target.value)}
                  placeholder="Để trống để AI tự động trích xuất theo bối cảnh..."
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>💡 Gợi ý nhanh:</span>
                <button
                  type="button"
                  onClick={() => { setSermonPassageRef("Rô-ma 8:31-39"); setSermonTheme("Đắc Thắng Vượt Trội"); }}
                  className="underline text-rose-400 hover:text-rose-300"
                >
                  Rô-ma 8:31-39
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => { setSermonPassageRef("Giăng 15:1-8"); setSermonTheme("Cứ Ở Trong Gốc Nho"); }}
                  className="underline text-blue-400 hover:text-blue-300"
                >
                  Giăng 15:1-8
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => { setSermonPassageRef("Thi-thiên 23:1-6"); setSermonTheme("Đấng Chăn Giữ Tôi"); }}
                  className="underline text-amber-400 hover:text-amber-300"
                >
                  Thi-thiên 23
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => { setSermonPassageRef("Gia-cơ 1:2-12"); setSermonTheme("Đức Tin Trưởng Thành"); }}
                  className="underline text-emerald-400 hover:text-emerald-300"
                >
                  Gia-cơ 1:2-12
                </button>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={loadingSermon || !sermonPassageRef.trim()}
                  onClick={() => handleBuildSermon(sermonPassageRef, sermonAudience, sermonTheme, false)}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30 disabled:opacity-50"
                >
                  {loadingSermon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                  <span>{loadingSermon ? "Đang Khảo Luận Giải Kinh..." : "Lập Đề Cương Bài Giảng"}</span>
                </button>
              </div>
            </div>

            {sermonError && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <X className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{sermonError}</span>
              </div>
            )}
            {savedSermonMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{savedSermonMsg}</span>
              </div>
            )}
          </div>

          {/* Results: Expository Sermon Display */}
          {sermonResult && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              {/* Big Idea & Key Verse Hero */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900 border border-rose-500/40 shadow-xl flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30">
                      Ý Niệm Cốt Lõi (The Big Idea)
                    </span>
                    <h3 className="text-lg md:text-xl font-black text-white mt-1">
                      {sermonResult.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBuildSermon(sermonPassageRef, sermonAudience, sermonTheme, true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                      title="Lưu bản thảo này vào danh sách Dự Án Nghiên Cứu"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lưu Vào Dự Án</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-rose-500/30 text-rose-200 text-xs md:text-sm font-serif italic leading-relaxed">
                  &ldquo;{sermonResult.big_idea}&rdquo;
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Câu gốc trọng tâm:</span>
                    <span className="font-bold text-amber-400">{sermonResult.key_verse}</span>
                  </div>
                  <p className="text-slate-300 italic font-serif line-clamp-1">
                    &ldquo;{sermonResult.key_verse_text}&rdquo;
                  </p>
                </div>
              </div>

              {/* Section I: Introduction & Historical Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Dẫn Nhập & Cầu Nối Cảm Xúc (Introduction & Hook)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {sermonResult.introduction_and_hook}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Bối Cảnh Lịch Sử & Thần Học (Occasion & Setting)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {sermonResult.historical_context}
                  </p>
                </div>
              </div>

              {/* Section II: Expository Points */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" /> Các Luận Điểm Giảng Giải Chi Tiết ({sermonResult.points.length} Điểm):
                  </h4>
                  <span className="text-[10px] text-slate-400">Phân tích văn mạch & ngữ nghĩa nguyên ngữ</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {sermonResult.points.map((pt) => (
                    <div
                      key={pt.point_number}
                      className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3.5 shadow-md hover:border-slate-700 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                            {pt.point_number}
                          </span>
                          <h5 className="text-sm font-bold text-white">{pt.title}</h5>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                            {pt.scripture_ref}
                          </span>
                          {pt.original_language_key && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
                              {pt.original_language_key}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scripture Verse Text */}
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 font-serif italic leading-relaxed">
                        &ldquo;{pt.verse_text}&rdquo;
                      </div>

                      {/* Exposition */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Giải Kinh:</span>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">
                          {pt.exposition}
                        </p>
                      </div>

                      {/* Real Life Illustration */}
                      {pt.illustration && (
                        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200 flex items-start gap-2">
                          <span className="font-bold text-[10px] uppercase text-amber-400 shrink-0 mt-0.5">Minh Họa:</span>
                          <span className="font-sans leading-relaxed">{pt.illustration}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section III: Practical Applications & Spiritual Call */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Practical Applications */}
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ứng Dụng Thực Tiễn Cho Đời Sống Cơ Đốc
                  </h4>
                  <div className="flex flex-col gap-2">
                    {sermonResult.practical_applications.map((app, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200">
                        <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed font-sans">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conclusion & Call */}
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-rose-400" /> Kết Luận & Lời Kêu Gọi Đáp Ứng
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line p-3.5 rounded-2xl bg-black/30 border border-slate-800/80">
                      {sermonResult.conclusion_and_call}
                    </p>
                  </div>

                  {/* Commentary Citations */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Trích dẫn học thuật từ 275 sách giải kinh:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {sermonResult.theological_citations.slice(0, 2).map((cit, i) => (
                        <div key={i} className="text-[11px] text-slate-400 leading-relaxed">
                          <span className="text-slate-200 font-semibold">• {cit.source_title} ({cit.author}): </span>
                          <span className="italic">{cit.quote}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. STRONG LEXICON (ORIGINAL LANGUAGES) */}
      {/* ===================================================================== */}
      {activeTab === "lexicon" && (
        <div className="flex flex-col gap-6">
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
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    langFilter === f.id
                      ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLexicon}
                onChange={(e) => {
                  setSearchLexicon(e.target.value);
                  fetchLexicon(langFilter, e.target.value);
                }}
                placeholder="Tìm lemma, định nghĩa, phiên âm..."
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-full sm:w-64"
              />
            </div>
          </div>

          {loadingLexicon ? (
            <div className="p-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span>Đang tra cứu từ điển ngữ căn Strong...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lexiconList.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col gap-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
                      {item.strong_number}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      {item.language === "greek" ? "Hy Lạp" : "Hê-bơ-rơ"} • {item.occurrences_count} lần
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-amber-200" dir={item.language === "hebrew" ? "rtl" : "ltr"}>
                      {item.lemma}
                    </span>
                    <span className="text-xs text-slate-400 italic">
                      {item.transliteration} ({item.pronunciation})
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-snug">{item.definition}</p>

                  {item.theological_significance && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                      <span className="text-amber-400 font-semibold">Ý nghĩa thần học: </span>
                      {item.theological_significance}
                    </div>
                  )}

                  {item.key_verses && item.key_verses.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.key_verses.map((kv) => (
                        <Link
                          key={kv}
                          href={`/bible`}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 hover:underline"
                        >
                          ⚓ {kv}
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
      {/* 3. PASSAGE EXEGESIS STUDY */}
      {/* ===================================================================== */}
      {activeTab === "passage" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Nhập phân đoạn Kinh Thánh để phân tích chuyên sâu
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={passageRef}
                onChange={(e) => setPassageRef(e.target.value)}
                placeholder="Ví dụ: Giăng 3:16-21 hoặc Rô-ma 8:28-39..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                disabled={loadingPassage || !passageRef.trim()}
                onClick={handlePassageStudy}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {loadingPassage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Phân Tích Giải Kinh</span>
              </button>
            </div>
          </div>

          {loadingPassage && (
            <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <div className="text-sm font-bold text-white">Đang phân tích cấu trúc &amp; thần học đoạn văn...</div>
              <p className="text-xs text-slate-400">Trích xuất văn cảnh, cấu trúc phân đoạn và ứng dụng đời sống.</p>
            </div>
          )}

          {passageError && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs">
              {passageError}
            </div>
          )}

          {passageResult && (
            <article className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase text-blue-400 tracking-wider">
                    {passageResult.reference} • Bản Truyền Thống 1925
                  </span>
                  <button
                    type="button"
                    onClick={handleSavePassageToNotes}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Lưu Vào Sổ Tay
                  </button>
                </div>
                
                {/* Passage Text (Verses) */}
                <div className="text-sm font-serif text-slate-200 italic leading-relaxed bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
                  {passageResult.passage_text.split("\n").map((line, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>

                {/* Literary & Historical Context */}
                <div className="flex flex-col gap-2 pt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> Bối cảnh văn học &amp; lịch sử cứu chuộc:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
                    {passageResult.literary_context}
                  </p>
                </div>
              </div>

              {/* Grid 1: Outline & Themes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 shadow-lg">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Cấu Trúc Bố Cục Đoạn Văn
                  </h3>
                  <div className="flex flex-col gap-2">
                    {passageResult.structural_outline.map((sec, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col gap-1">
                        <span className="font-bold text-amber-300">{sec.section}</span>
                        <span className="text-slate-300 text-[11px] leading-relaxed">{sec.theme}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 shadow-lg">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Các Chủ Đề Thần Học Then Chốt
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {passageResult.theological_themes.map((th, i) => (
                      <span key={i} className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">✨</span>
                        <span>{th}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Original Language Insights */}
              {passageResult.original_language_insights && (
                <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                      <Languages className="w-4 h-4 text-purple-400" /> Khảo Sát Ngữ Căn Nguyên Ngữ (Hy Lạp / Hê-bơ-rơ)
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Nguyên Ngữ &amp; Strong&apos;s
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/30 text-xs text-purple-100/90 leading-relaxed font-sans">
                    {passageResult.original_language_insights}
                  </div>
                </div>
              )}

              {/* Theological Commentary Citations */}
              {passageResult.theological_citations && passageResult.theological_citations.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col gap-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                      <BookMarked className="w-4 h-4 text-cyan-400" /> Trích Dẫn Chú Giải Thần Học (Hệ Thống 275 Tác Phẩm)
                    </h3>
                    <Link href="/library" className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1">
                      Tra cứu thư viện <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {passageResult.theological_citations.map((cite, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-300 line-clamp-1">📚 {cite.source_title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                          <span>{cite.chapter_title}</span>
                          {cite.section_heading && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500">{cite.section_heading}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-cyan-500/50 pl-3 pt-0.5">
                          &ldquo;{cite.quote}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application & Reflection Questions */}
              {passageResult.application_questions && passageResult.application_questions.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col gap-4 shadow-lg">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" /> Câu Hỏi Suy Ngẫm &amp; Ứng Dụng Đời Sống
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {passageResult.application_questions.map((q, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0 border border-amber-500/30">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed pt-0.5">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. PERSONAL STUDY NOTES */}
      {/* ===================================================================== */}
      {activeTab === "notes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Thêm Ghi Chú Cá Nhân Mới
            </h2>
            <form onSubmit={handleCreateNote} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-medium">Tiêu đề ghi chú *</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Bài học về đức tin trong cơn bão"
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-medium">Câu Kinh Thánh liên quan</label>
                <input
                  type="text"
                  value={newRef}
                  onChange={(e) => setNewRef(e.target.value)}
                  placeholder="Ví dụ: Ma-thi-ơ 14:28-31"
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-medium">Nội dung ghi chú *</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Nhập suy ngẫm thuộc linh, bài học thực tế..."
                  className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-medium">Thẻ phân loại (ngăn cách dấu phẩy)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="ductin, phero, galile"
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingNote}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 mt-1"
              >
                {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Lưu Ghi Chú</span>
              </button>

              {noteSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs">
                  {noteSuccess}
                </div>
              )}
            </form>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Danh sách ghi chú ({notes.length}):
            </span>
            {loadingNotes ? (
              <div className="p-8 text-center text-xs text-slate-400">Đang tải ghi chú...</div>
            ) : notes.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                Chưa có ghi chú nào. Hãy thêm ghi chú đầu tiên ở bảng bên trái!
              </div>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{n.title}</h4>
                      {n.scripture_ref && (
                        <span className="text-[10px] text-blue-400 font-mono">⚓ {n.scripture_ref}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(n.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Xóa ghi chú"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {n.content}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>{new Date(n.created_at).toLocaleDateString("vi-VN")}</span>
                    {n.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {n.tags.map((t, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Study Project */}
      {isCreateProjectOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 max-w-lg w-full rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-amber-400" /> Tạo Dự Án Nghiên Cứu Mới
              </h3>
              <button 
                type="button"
                onClick={() => setIsCreateProjectOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300 font-medium">Tên dự án / đề tài *</label>
                <input
                  required
                  type="text"
                  value={newProjectTitle}
                  onChange={e => setNewProjectTitle(e.target.value)}
                  placeholder="Ví dụ: Đời Sống Cầu Nguyện Của Chúa Giê-xu"
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300 font-medium">Thể loại nghiên cứu</label>
                <select
                  value={newProjectCategory}
                  onChange={e => setNewProjectCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="theology">Thần học & Giáo lý</option>
                  <option value="person">Nhân vật Kinh Thánh</option>
                  <option value="passage">Khảo luận Đoạn văn</option>
                  <option value="book_study">Nghiên cứu Sách</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300 font-medium">Mô tả mục tiêu dự án</label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  placeholder="Mục đích nghiên cứu, trọng tâm suy ngẫm..."
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingProject || !newProjectTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-amber-600/30"
                >
                  {savingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Tạo Dự Án</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Study Workspace Bundle Export (§48, §50) */}
      {isBundleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 max-w-2xl w-full rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Xuất Sổ Tay & Không Gian Nghiên Cứu (.MD)</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsBundleModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingBundle ? (
              <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span>Đang tổng hợp toàn bộ ghi chú cá nhân, các câu đánh dấu và đề cương dự án nghiên cứu...</span>
              </div>
            ) : bundleData ? (
              <div className="flex flex-col gap-4">
                {/* Metric Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Ghi Chú Cá Nhân</span>
                    <p className="text-base font-bold text-emerald-400">{bundleData.summary.total_notes}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Câu Đã Đánh Dấu</span>
                    <p className="text-base font-bold text-blue-400">{bundleData.summary.total_bookmarks}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Dự Án Nghiên Cứu</span>
                    <p className="text-base font-bold text-amber-400">{bundleData.summary.total_projects}</p>
                  </div>
                </div>

                {/* Markdown Preview Box */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-300">Xem trước văn bản Markdown tổng hợp:</span>
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-slate-800 max-h-60 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
                    {bundleData.markdown_bundle}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCopyBundle}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                  >
                    {copiedBundle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBundle ? "Đã Sao Chép!" : "Sao Chép Markdown"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadBundle}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Tệp Markdown (.md)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-rose-400">Không thể tải dữ liệu nghiên cứu.</div>
            )}
          </div>
        </div>
      )}
      {/* Modal: Slide Deck Presentation Mode (§50) */}
      {isSlideDeckOpen && sermonResult && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-in fade-in">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <MonitorPlay className="w-3.5 h-3.5 text-purple-400" />
                <span>Trình Chiếu Slide Bài Giảng • §50</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                Slide {currentSlideIndex + 1} / {totalSlides}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySlideDeck}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
                title="Sao chép toàn bộ Slide Deck dưới định dạng Marp / Slidev Markdown"
              >
                {copiedSlides ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedSlides ? "Đã Sao Chép!" : "Sao Chép MD Slide"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSlideDeck}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
                title="Tải tệp trình chiếu Slide Deck (.md)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Slide .MD</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSlideDeckOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Đóng trình chiếu (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Slide Display Frame */}
          <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center my-4">
            <div className="w-full min-h-[26rem] md:min-h-[32rem] p-8 md:p-14 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col justify-between transition-all">
              {/* SLIDE 0: TITLE SLIDE */}
              {currentSlideIndex === 0 && (
                <div className="flex flex-col justify-center h-full gap-6 my-auto text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[11px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      BÀI GIẢNG GIẢI KINH • EXPOSITORY HOMILETICS
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                    {sermonResult.title}
                  </h1>
                  <span className="text-lg md:text-2xl font-bold text-amber-400 font-serif">
                    {sermonResult.passage_ref}
                  </span>
                  <blockquote className="p-4 md:p-6 rounded-2xl bg-black/40 border border-slate-800 max-w-3xl mx-auto italic text-slate-300 text-sm md:text-base leading-relaxed">
                    &ldquo;{sermonResult.key_verse_text}&rdquo;
                    <span className="block mt-2 font-bold text-amber-300/90 not-italic text-xs">
                      — {sermonResult.key_verse}
                    </span>
                  </blockquote>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                    <span>Thính giả: <strong className="text-slate-200">{sermonAudience}</strong></span>
                    <span>•</span>
                    <span>Kinh Thánh: <strong className="text-slate-200">Bản Truyền Thống 1925</strong></span>
                  </div>
                </div>
              )}

              {/* SLIDE 1: BIG IDEA & CONTEXT */}
              {currentSlideIndex === 1 && (
                <div className="flex flex-col justify-center h-full gap-6 my-auto">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Ý NIỆM CỐT LÕI (BIG IDEA)
                  </span>
                  <div className="p-6 rounded-3xl bg-rose-950/30 border border-rose-800/40">
                    <blockquote className="text-xl md:text-2xl font-serif text-rose-100 font-bold leading-relaxed italic">
                      &ldquo;{sermonResult.big_idea}&rdquo;
                    </blockquote>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 flex flex-col gap-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                        🏛️ Bối Cảnh Lịch Sử &amp; Thần Học
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {sermonResult.historical_context}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 flex flex-col gap-2">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                        🎣 Lời Mở Đầu &amp; Dẫn Nhập
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {sermonResult.introduction_and_hook}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDES 2 .. (1 + points.length): EXPOSITORY POINTS */}
              {currentSlideIndex >= 2 && currentSlideIndex < 2 + (sermonResult.points?.length || 0) && (
                (() => {
                  const ptIndex = currentSlideIndex - 2;
                  const pt = sermonResult.points[ptIndex];
                  if (!pt) return null;
                  return (
                    <div className="flex flex-col justify-center h-full gap-5 my-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Luận Điểm {ptIndex + 1} / {sermonResult.points.length}
                        </span>
                        <span className="text-sm font-bold text-amber-400 font-serif">
                          {pt.scripture_ref}
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                        {pt.title}
                      </h2>

                      {/* Scripture Anchor */}
                      <blockquote className="p-4 rounded-2xl bg-amber-950/20 border-l-4 border-amber-500 pl-4 italic text-slate-300 text-xs md:text-sm leading-relaxed">
                        &ldquo;{pt.verse_text}&rdquo;
                      </blockquote>

                      {/* Greek / Hebrew Original Language Insight */}
                      {pt.original_language_key && (
                        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-300 flex items-center gap-2">
                          <Languages className="w-4 h-4 text-blue-400 shrink-0" />
                          <span><strong>Khảo sát nguyên văn gốc:</strong> {pt.original_language_key}</span>
                        </div>
                      )}

                      {/* Exposition Text */}
                      <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Giải Nghĩa Trực Diện Phân Đoạn:
                        </h4>
                        <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
                          {pt.exposition}
                        </p>
                      </div>

                      {/* Practical Illustration */}
                      {pt.illustration && (
                        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200 flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-emerald-300">Minh họa thực tế: </span>
                            <span className="text-emerald-200/90">{pt.illustration}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {/* SLIDE: PRACTICAL APPLICATIONS */}
              {currentSlideIndex === 2 + (sermonResult.points?.length || 0) && (
                <div className="flex flex-col justify-center h-full gap-6 my-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ÁP DỤNG THỰC HÀNH
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                    Ứng Dụng Đời Sống Cơ Đốc
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
                    {sermonResult.practical_applications.map((app, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-black/40 border border-slate-800 flex items-start gap-3 text-xs md:text-sm text-slate-200"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed font-sans">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SLIDE: CONCLUSION & CALL */}
              {currentSlideIndex === 3 + (sermonResult.points?.length || 0) && (
                <div className="flex flex-col justify-center h-full gap-6 my-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      KẾT LUẬN &amp; LỜI KÊU GỌI
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                    Cam Kết Đức Tin &amp; Bước Theo Chúa
                  </h2>

                  <div className="p-6 md:p-8 rounded-3xl bg-amber-950/30 border border-amber-800/40">
                    <p className="text-sm md:text-base text-slate-200 leading-relaxed font-serif whitespace-pre-line">
                      {sermonResult.conclusion_and_call}
                    </p>
                  </div>

                  {sermonResult.theological_citations && sermonResult.theological_citations.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      <span>Chú giải thần học tham chiếu: </span>
                      {sermonResult.theological_citations.map((c, i) => (
                        <span key={i} className="text-slate-300 font-semibold mr-3">
                          • {c.source_title} {c.author ? `(${c.author})` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation & Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
            <span className="text-xs text-slate-500">
              Mẹo: Dùng phím mũi tên <strong>← →</strong> hoặc <strong>Phím cách</strong> để chuyển slide • <strong>Esc</strong> để thoát
            </span>

            {/* Slide Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlideIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlideIndex === i ? "w-6 bg-purple-500" : "w-2 bg-slate-700 hover:bg-slate-500"
                  }`}
                  title={`Chuyển đến Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Next / Prev Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>
              <button
                type="button"
                disabled={currentSlideIndex === totalSlides - 1}
                onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, totalSlides - 1))}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-md shadow-purple-600/30"
              >
                <span>Tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
