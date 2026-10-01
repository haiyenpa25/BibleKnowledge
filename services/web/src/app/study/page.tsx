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
  X
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
  const [activeTab, setActiveTab] = useState<"lexicon" | "passage" | "notes" | "projects">("projects");

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
  const [exportingFlashcards, setExportingFlashcards] = useState(false);
  const [projectMessage, setProjectMessage] = useState<string | null>(null);

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

  useEffect(() => {
    fetchLexicon();
    fetchNotes();
    fetchProjects();
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
              Dự án nghiên cứu chuyên đề • Từ điển Strong Hy Lạp/Hê-bơ-rơ • Phân tích giải kinh • Sổ tay cá nhân
            </p>
          </div>
        </div>

        {/* Tab Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "projects"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
            }`}
          >
            <FolderGit2 className="w-4 h-4" /> Dự Án Nghiên Cứu ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab("lexicon")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "lexicon"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
            }`}
          >
            <Languages className="w-4 h-4" /> Từ Điển Nguyên Ngữ
          </button>
          <button
            onClick={() => setActiveTab("passage")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "passage"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Phân Tích Đoạn Văn
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "notes"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" /> Sổ Tay Ghi Chú ({notes.length})
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
                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        {generatingOutline ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>Lập Dàn Ý Bằng AI</span>
                      </button>

                      {/* Export Flashcards Button */}
                      <button
                        type="button"
                        disabled={exportingFlashcards}
                        onClick={() => handleExportFlashcards(selectedProject.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        {exportingFlashcards ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        <span>Xuất Thành Flashcard</span>
                      </button>
                    </div>
                  </div>

                  {projectMessage && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{projectMessage}</span>
                    </div>
                  )}

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {selectedProject.description}
                  </p>

                  {/* Section 1: Pinned Scriptures */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Các Phân Đoạn Kinh Thánh Đã Ghim ({selectedProject.pinned_verses?.length || 0}):
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedProject.pinned_verses?.map((v, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-blue-300">⚓ {v.reference}</span>
                            <Link href="/bible" className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5">
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
                        Chưa có dàn ý. Hãy bấm &quot;Lập Dàn Ý Bằng AI&quot; ở trên để mô hình tự động kiến tạo.
                      </div>
                    )}
                  </div>

                  {/* Section 4: Study Questions */}
                  {selectedProject.study_questions && selectedProject.study_questions.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> Câu Hỏi Nghiên Cứu &amp; Suy Ngẫm:
                      </span>
                      <ul className="list-disc list-inside text-xs text-slate-300 flex flex-col gap-1 pl-2">
                        {selectedProject.study_questions.map((q, i) => (
                          <li key={i} className="leading-relaxed">{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
      {/* 2. STRONG LEXICON (ORIGINAL LANGUAGES) */}
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
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase text-blue-400 tracking-wider">
                    {passageResult.reference} • Kinh Thánh 1925
                  </span>
                  <button
                    type="button"
                    onClick={handleSavePassageToNotes}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Lưu Vào Sổ Tay
                  </button>
                </div>
                <p className="text-sm font-serif text-slate-200 italic leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  &ldquo;{passageResult.passage_text}&rdquo;
                </p>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Bối cảnh văn học &amp; lịch sử:</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{passageResult.literary_context}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Cấu Trúc Bố Cục Đoạn Văn
                  </h3>
                  <div className="flex flex-col gap-2">
                    {passageResult.structural_outline.map((sec, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col gap-0.5">
                        <span className="font-bold text-white">{sec.section}</span>
                        <span className="text-slate-400 text-[11px]">{sec.theme}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Các Chủ Đề Thần Học Then Chốt
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {passageResult.theological_themes.map((th, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200">
                        ✨ {th}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
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
    </main>
  );
}
