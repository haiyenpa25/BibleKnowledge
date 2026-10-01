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
  BookA,
  ShieldAlert,
  Clock,
  GitCommit,
  AlertTriangle,
  Scale,
  Columns3,
  ArrowRightLeft
} from "lucide-react";

// --- Context Study Interfaces (§15) ---
interface ContextDimension {
  dimension_key: string;
  dimension_title: string;
  dimension_icon: string;
  summary: string;
  detailed_analysis: string;
  key_scriptures: string[];
  scholarly_citations: string[];
}

interface ContextStudyData {
  subject_or_passage: string;
  scripture_anchor: string;
  historical_era: string;
  primary_takeaway: string;
  dimensions: ContextDimension[];
  hermeneutical_significance: string;
  related_theological_books: string[];
}

interface ContextPresetOption {
  key: string;
  title: string;
  passage_ref: string;
  era: string;
  brief: string;
}

// --- Passage Study Interfaces (ROADMAP1.md §13) ---
interface PassageVerseItem {
  verse: number;
  text: string;
  section_title?: string;
  cross_references: string[];
}

interface PassageOutlinePoint {
  section_title: string;
  verse_range: string;
  summary: string;
  key_truth: string;
}

interface PassageKeywordItem {
  word: string;
  strong_number?: string;
  original_lemma?: string;
  meaning: string;
}

interface PassageStudyData {
  reference: string;
  book_name: string;
  chapter_range: string;
  total_verses: number;
  verses: PassageVerseItem[];
  historical_context: string;
  literary_genre: string;
  author_and_date: string;
  people: string[];
  locations: string[];
  events: string[];
  structure_outline: PassageOutlinePoint[];
  keywords: PassageKeywordItem[];
  cross_references: string[];
  theological_themes: string[];
  reflection_questions: string[];
  scholarly_commentary_citations: Citation[];
  hermeneutical_takeaway: string;
}

interface PassagePresetItem {
  id: string;
  reference: string;
  title: string;
  theme: string;
  genre: string;
  brief: string;
}

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

interface AlternativeInterpretation {
  perspective_name: string;
  proponents: string;
  core_view: string;
  key_argument: string;
}

interface RelatedPassageItem {
  reference: string;
  relation_type: string;
  text_snippet: string;
  connection_note: string;
}

interface EpistemicGuardrails {
  direct_biblical_fact: string;
  theological_deduction: string;
  scholarly_uncertainty: string;
  guardrail_warning?: string;
}

interface CitedAnswer {
  summary: string;
  confidence_score?: number;
  epistemic_badges?: string[];
  bible_evidence: BibleEvidence[];
  related_passages?: RelatedPassageItem[];
  historical_context?: string;
  primary_interpretation?: string;
  alternative_interpretations?: AlternativeInterpretation[];
  theological_insights: StudyInsight[];
  citations: Citation[];
  epistemic_guardrails?: EpistemicGuardrails;
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
  turning_points?: string[];
  typological_significance?: string;
  strengths?: string[];
  weaknesses?: string[];
}

interface LexiconBrief {
  strong_number: string;
  language: string;
  lemma: string;
  transliteration: string;
  definition: string;
}

interface RedemptiveStage {
  stage: string;
  stage_name_vi: string;
  description: string;
  scripture_ref: string;
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
  redemptive_stages?: RedemptiveStage[];
  theological_distinctions?: string[];
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

// Multi-Passage Comparative Exegesis Interfaces (§48, §51)
interface PassageExegesisProfile {
  reference: string;
  book_code: string;
  book_name: string;
  testament: string;
  total_verses: number;
  verses_text: Array<{ verse: number; text: string }>;
  author: string;
  date_and_era: string;
  original_audience: string;
  literary_genre: string;
  core_theological_motif: string;
  key_strong_roots: Array<{
    strong_number: string;
    lemma: string;
    transliteration: string;
    definition: string;
    theological_significance: string;
  }>;
}

interface ComparativeDimensionPoint {
  dimension_title: string;
  category: string;
  details_by_passage: Record<string, string>;
  theological_synthesis: string;
}

interface LexiconRootOverlap {
  strong_number: string;
  language: string;
  lemma: string;
  transliteration: string;
  definition: string;
  theological_significance: string;
  present_in_passages: string[];
}

interface HomileticalOutlinePoint {
  point_number: number;
  title: string;
  subheading: string;
  exposition: string;
  scripture_links: string[];
  pastoral_application: string;
}

interface ComparativeMatrixData {
  request_passages: string[];
  focus_theme: string;
  comparative_lens: string;
  lens_title: string;
  executive_synthesis: string;
  profiles: PassageExegesisProfile[];
  comparative_dimensions: ComparativeDimensionPoint[];
  lexicon_roots_overlap: LexiconRootOverlap[];
  points_of_convergence: string[];
  points_of_divergence_or_nuance: string[];
  harmonization_analysis: string;
  scholarly_commentary_citations: Citation[];
  homiletical_sermon_outline: HomileticalOutlinePoint[];
  reflection_questions: string[];
  epistemic_guardrail: string;
}

interface ComparativePresetItem {
  id: string;
  title: string;
  passages: string[];
  focus_theme: string;
  comparative_lens: string;
  description: string;
  badge_label: string;
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
  related_words?: Array<{
    strong_number: string;
    lemma: string;
    transliteration: string;
    definition: string;
  }>;
  theological_summary?: string;
  distribution: {
    old_testament: number;
    new_testament: number;
    total_matches: number;
  };
  book_distribution?: Array<{
    book: string;
    count: number;
  }>;
  verses: ConcordanceVerse[];
}

interface MorphologyData {
  strong_number: string;
  language: string;
  lemma: string;
  transliteration: string;
  pronunciation?: string;
  part_of_speech: string;
  grammatical_category?: string;
  morphological_parsing?: Record<string, any>;
  definition: string;
  theological_significance?: string;
  exegetical_insight?: string;
  occurrences_count: number;
  key_scriptures: Array<{ reference: string; text?: string }>;
  related_lemmas: Array<{ strong_number: string; lemma: string; transliteration?: string; gloss?: string }>;
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

const SAMPLE_QUESTIONS = [
  "Tại sao Chúa Giê-xu chịu phép báp-tem trong Ma-thi-ơ 3?",
  "Ý nghĩa của Giao Ước Mới trong Hê-bơ-rơ 8 là gì?",
  "Phao-lô và Gia-cơ có mâu thuẫn về sự xưng công bình không?",
  "Biểu tượng Chiên Con Lễ Vượt Qua trong Xuất Ê-díp-tô Ký 12 chỉ về điều gì?",
  "Bối cảnh văn hóa của người Sa-ma-ri trong Giăng 4 là gì?"
];

export default function ResearchPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Active Research Mode Tab
  const [activeTab, setActiveTab] = useState<"agent" | "passage" | "context" | "lexicon" | "qa" | "character" | "theme" | "compare">("agent");

  // --- Tab: Multi-Passage Comparative Exegesis States (§48, §51) ---
  const [comparativePresets, setComparativePresets] = useState<ComparativePresetItem[]>([]);
  const [selectedComparePresetId, setSelectedComparePresetId] = useState<string>("synoptic_great_commission");
  const [comparePassagesInput, setComparePassagesInput] = useState<string[]>([
    "Ma-thi-ơ 28:18-20",
    "Mác 16:15-18",
    "Lu-ca 24:46-49"
  ]);
  const [compareNewPassageText, setCompareNewPassageText] = useState("");
  const [compareThemeInput, setCompareThemeInput] = useState("Thẩm Quyền & Mạng Lệnh Môn Đồ Hóa");
  const [compareLensInput, setCompareLensInput] = useState("synoptic_harmony");
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareData, setCompareData] = useState<ComparativeMatrixData | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [copiedCompareOutline, setCopiedCompareOutline] = useState(false);
  const [selectedCompareProfileRef, setSelectedCompareProfileRef] = useState<string | null>(null);

  // --- Tab: Passage Exegesis Study States (ROADMAP1.md §13) ---
  const [passagePresets, setPassagePresets] = useState<PassagePresetItem[]>([]);
  const [passageRefInput, setPassageRefInput] = useState("Ma-thi-ơ 14:22-33");
  const [passageLoading, setPassageLoading] = useState(false);
  const [passageData, setPassageData] = useState<PassageStudyData | null>(null);
  const [passageError, setPassageError] = useState<string | null>(null);
  const [copiedPassageText, setCopiedPassageText] = useState(false);

  // --- Tab 1: AI Agent Research States (§51) ---
  const [agentQuery, setAgentQuery] = useState(PRESET_AGENT_QUERIES[0]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentData, setAgentData] = useState<AgentResearchData | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);

  // --- Tab: Multi-Dimensional Context Study States (§15) ---
  const [contextPresets, setContextPresets] = useState<ContextPresetOption[]>([]);
  const [selectedContextPreset, setSelectedContextPreset] = useState("john-4");
  const [customContextInput, setCustomContextInput] = useState("");
  const [contextLoading, setContextLoading] = useState(false);
  const [contextData, setContextData] = useState<ContextStudyData | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [activeDimensionFilter, setActiveDimensionFilter] = useState<string>("all");

  // --- Tab 2: Strong's Lexicon & Interlinear States (§37, §49) ---
  const [lexiconSubMode, setLexiconSubMode] = useState<"dictionary" | "interlinear">("dictionary");
  const [interlinearRef, setInterlinearRef] = useState<string>("Giăng 1:1");
  const [interlinearData, setInterlinearData] = useState<any | null>(null);
  const [interlinearLoading, setInterlinearLoading] = useState<boolean>(false);
  const [interlinearError, setInterlinearError] = useState<string | null>(null);
  const [copiedInterlinearRef, setCopiedInterlinearRef] = useState<string | null>(null);
  const [lexiconList, setLexiconList] = useState<LexiconItem[]>([]);
  const [lexiconFilterLang, setLexiconFilterLang] = useState<"all" | "greek" | "hebrew">("all");
  const [lexiconSearch, setLexiconSearch] = useState("");
  const [lexiconLoading, setLexiconLoading] = useState(false);
  const [selectedLexiconItem, setSelectedLexiconItem] = useState<LexiconItem | null>(null);
  const [lexiconModalTab, setLexiconModalTab] = useState<"morphology" | "concordance">("morphology");
  const [morphologyData, setMorphologyData] = useState<MorphologyData | null>(null);
  const [morphologyLoading, setMorphologyLoading] = useState(false);
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

  // Load available themes & context presets on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [themeRes, presetRes, passPresetRes, compPresetRes] = await Promise.all([
          fetch(`${apiUrl}/api/rag/themes`),
          fetch(`${apiUrl}/api/rag/context-preset-options`),
          fetch(`${apiUrl}/api/rag/passage-presets`),
          fetch(`${apiUrl}/api/rag/comparative-presets`)
        ]);
        if (themeRes.ok) {
          const tData = await themeRes.json();
          setAvailableThemes(tData);
        }
        if (presetRes.ok) {
          const pData = await presetRes.json();
          setContextPresets(pData);
        }
        if (passPresetRes.ok) {
          const passData = await passPresetRes.json();
          setPassagePresets(passData);
        }
        if (compPresetRes.ok) {
          const compData = await compPresetRes.json();
          setComparativePresets(compData);
        }
      } catch (e) {
        console.error("Failed to load initial presets:", e);
      }
    }
    loadInitialData();

    // Check URL parameters (?q=... or ?tab=... or ?passage=... or ?compare=...)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlQ = params.get("q");
      const urlTab = params.get("tab");
      const urlPassage = params.get("passage") || params.get("ref");
      const urlCompare = params.get("compare");

      if (urlCompare && urlCompare.trim()) {
        const passList = urlCompare.split(",").map(s => s.trim()).filter(Boolean);
        if (passList.length >= 2) {
          setComparePassagesInput(passList);
          setActiveTab("compare");
          handleRunComparativeStudy(passList);
        }
      } else if (urlPassage && urlPassage.trim()) {
        setPassageRefInput(urlPassage.trim());
        setActiveTab("passage");
        handlePassageStudy(urlPassage.trim());
      } else if (urlTab && ["agent", "passage", "context", "lexicon", "qa", "character", "theme", "compare"].includes(urlTab)) {
        setActiveTab(urlTab as any);
        if (urlTab === "compare") {
          handleRunComparativeStudy();
        }
      }

      if (urlQ && urlQ.trim()) {
        setAgentQuery(urlQ.trim());
        setActiveTab("agent");
        handleRunAgentResearch(urlQ.trim());
      }
    }
  }, [apiUrl]);

  // Load Comparative Study when Compare tab is selected
  useEffect(() => {
    if (activeTab === "compare" && !compareData && !compareLoading) {
      handleRunComparativeStudy(comparePassagesInput, compareThemeInput, compareLensInput);
    }
  }, [activeTab]);

  const handleRunComparativeStudy = async (
    passagesToUse?: string[],
    themeToUse?: string,
    lensToUse?: string
  ) => {
    const list = passagesToUse || comparePassagesInput;
    const cleanList = list.filter(p => p.trim().length > 0);
    if (cleanList.length < 2) {
      setCompareError("Vui lòng cung cấp ít nhất 2 phân đoạn Kinh Thánh để thực hiện đối chiếu.");
      return;
    }
    setCompareLoading(true);
    setCompareError(null);
    try {
      const res = await fetch(`${apiUrl}/api/rag/comparative-study`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passages: cleanList,
          focus_theme: themeToUse || compareThemeInput,
          comparative_lens: lensToUse || compareLensInput
        })
      });
      if (res.ok) {
        const data: ComparativeMatrixData = await res.json();
        setCompareData(data);
        if (data.profiles && data.profiles.length > 0) {
          setSelectedCompareProfileRef(data.profiles[0].reference);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setCompareError(errJson.detail || "Không thể thực hiện đối chiếu các phân đoạn Kinh Thánh này.");
      }
    } catch (e: any) {
      setCompareError(e.message || "Lỗi kết nối máy chủ nghiên cứu so sánh đối chiếu.");
    } finally {
      setCompareLoading(false);
    }
  };

  const handleApplyComparePreset = (preset: ComparativePresetItem) => {
    setSelectedComparePresetId(preset.id);
    setComparePassagesInput(preset.passages);
    setCompareThemeInput(preset.focus_theme);
    setCompareLensInput(preset.comparative_lens);
    handleRunComparativeStudy(preset.passages, preset.focus_theme, preset.comparative_lens);
  };

  const handleAddComparePassage = () => {
    if (!compareNewPassageText.trim()) return;
    if (comparePassagesInput.length >= 4) {
      alert("Hệ thống hỗ trợ đối chiếu tối đa 4 phân đoạn cùng một lúc để đảm bảo độ sâu giải kinh.");
      return;
    }
    const updated = [...comparePassagesInput, compareNewPassageText.trim()];
    setComparePassagesInput(updated);
    setCompareNewPassageText("");
  };

  const handleRemoveComparePassage = (indexToRemove: number) => {
    if (comparePassagesInput.length <= 2) {
      alert("Cần duy trì tối thiểu 2 phân đoạn để đối chiếu so sánh.");
      return;
    }
    const updated = comparePassagesInput.filter((_, idx) => idx !== indexToRemove);
    setComparePassagesInput(updated);
  };

  const handleCopyCompareOutline = () => {
    if (!compareData || !compareData.homiletical_sermon_outline) return;
    const textToCopy = `DÀN BÀI GIẢNG / KHẢO LUẬN SO SÁNH: ${compareData.focus_theme}
Lăng Kính: ${compareData.lens_title}
Các Phân Đoạn: ${compareData.request_passages.join(" | ")}

` + compareData.homiletical_sermon_outline.map(pt => (
`Điểm ${pt.point_number}: ${pt.title}
- Luận đề: ${pt.subheading}
- Giải nghĩa: ${pt.exposition}
- Kinh Thánh: ${pt.scripture_links.join(", ")}
- Áp dụng mục vụ: ${pt.pastoral_application}
`)).join("\n") + `\n\nNguồn: BibleKnowledge Research Platform (§48)`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedCompareOutline(true);
    setTimeout(() => setCopiedCompareOutline(false), 2200);
  };


  // Load Passage Study when Passage tab is selected
  useEffect(() => {
    if (activeTab === "passage" && !passageData && !passageLoading) {
      handlePassageStudy(passageRefInput);
    }
  }, [activeTab]);

  const handlePassageStudy = async (targetRef?: string) => {
    const refToUse = targetRef || passageRefInput;
    if (!refToUse.trim()) return;
    setPassageLoading(true);
    setPassageError(null);
    try {
      const res = await fetch(`${apiUrl}/api/rag/passage-study`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: refToUse.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setPassageData(data);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setPassageError(errJson.detail || "Không thể phân tích phân đoạn Kinh Thánh này.");
      }
    } catch (e: any) {
      setPassageError(e.message || "Lỗi kết nối máy chủ nghiên cứu phân đoạn.");
    } finally {
      setPassageLoading(false);
    }
  };


  // Load Context Study when Context tab is selected
  useEffect(() => {
    if (activeTab === "context" && !contextData && !contextLoading) {
      handleContextStudy(selectedContextPreset);
    }
  }, [activeTab]);

  const handleContextStudy = async (subjectOrKey: string) => {
    setContextLoading(true);
    setContextError(null);
    try {
      const res = await fetch(`${apiUrl}/api/rag/context-study`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_or_passage: subjectOrKey,
          focus_dimension: "all"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setContextData(data);
      } else {
        setContextError("Không thể phân tích bối cảnh phân đoạn Kinh Thánh này.");
      }
    } catch (e: any) {
      setContextError(e.message || "Lỗi kết nối máy chủ phân tích bối cảnh.");
    } finally {
      setContextLoading(false);
    }
  };

  // Load Lexicon items or Interlinear study when Lexicon tab is selected
  useEffect(() => {
    if (activeTab === "lexicon") {
      if (lexiconSubMode === "dictionary" && lexiconList.length === 0) {
        fetchLexicon();
      } else if (lexiconSubMode === "interlinear" && !interlinearData && !interlinearLoading) {
        fetchInterlinearStudy(interlinearRef);
      }
    }
  }, [activeTab, lexiconSubMode]);

  async function fetchInterlinearStudy(refToFetch: string) {
    setInterlinearLoading(true);
    setInterlinearError(null);
    try {
      const res = await fetch(`${apiUrl}/api/bible/verse-interlinear?ref=${encodeURIComponent(refToFetch)}`);
      if (res.ok) {
        const data = await res.json();
        setInterlinearData(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setInterlinearError(err.detail || "Không thể tải dữ liệu liên dòng nguyên ngữ.");
      }
    } catch (e: any) {
      setInterlinearError(e.message || "Lỗi kết nối khi tải phân tích liên dòng.");
    } finally {
      setInterlinearLoading(false);
    }
  }

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

  // Fetch Lexicon Details (Morphology & Concordance)
  async function handleOpenLexiconDetail(item: LexiconItem, defaultTab: "morphology" | "concordance" = "morphology") {
    setSelectedLexiconItem(item);
    setLexiconModalTab(defaultTab);
    setMorphologyLoading(true);
    setMorphologyData(null);
    setConcordanceLoading(true);
    setConcordanceData(null);

    try {
      const mPromise = fetch(`${apiUrl}/api/rag/morphology?code=${encodeURIComponent(item.strong_number)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) setMorphologyData(d);
        })
        .catch((e) => console.error("Morphology error:", e))
        .finally(() => setMorphologyLoading(false));

      const cPromise = fetch(`${apiUrl}/api/bible/concordance?strong_number=${encodeURIComponent(item.strong_number)}&limit=25`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) setConcordanceData(d);
        })
        .catch((e) => console.error("Concordance error:", e))
        .finally(() => setConcordanceLoading(false));

      await Promise.allSettled([mPromise, cPromise]);
    } catch (e) {
      console.error("Lexicon detail error:", e);
    }
  }

  function handleOpenConcordance(strongNumber: string, item: LexiconItem) {
    handleOpenLexiconDetail(item, "concordance");
  }

  function handleLookupConcordance(strongNumber: string, lemma: string, definition: string) {
    const existing = lexiconList.find((l) => l.strong_number === strongNumber);
    if (existing) {
      handleOpenLexiconDetail(existing, "concordance");
    } else {
      const syntheticItem: LexiconItem = {
        strong_number: strongNumber,
        language: strongNumber.startsWith("H") ? "hebrew" : "greek",
        lemma: lemma,
        transliteration: "",
        pronunciation: "",
        part_of_speech: "",
        definition: definition,
        theological_significance: "",
        occurrences_count: 0,
        key_verses: []
      };
      handleOpenLexiconDetail(syntheticItem, "concordance");
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

        {/* Mode: Passage Study (§13) */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("passage");
            if (!passageData && !passageLoading) handlePassageStudy(passageRefInput);
          }}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
            activeTab === "passage"
              ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/40"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-200" />
          <span>Giải Kinh Phân Đoạn</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 uppercase tracking-wider">11 Chiều §13</span>
        </button>

        {/* Mode 2: Multi-Dimensional Context Study (§15) */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("context");
            if (!contextData && !contextLoading) handleContextStudy(selectedContextPreset);
          }}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
            activeTab === "context"
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Compass className="w-4 h-4 text-rose-200" />
          <span>Bối Cảnh Đa Chiều</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-400/20 text-rose-300 uppercase tracking-wider">6 Chiều §15</span>
        </button>

        {/* Mode 3: Strong's Lexicon & Concordance */}
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

        {/* Mode 8: Multi-Passage Comparative Exegesis (§48, §51) */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("compare");
            if (!compareData && !compareLoading) {
              handleRunComparativeStudy();
            }
          }}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
            activeTab === "compare"
              ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/30 border border-teal-400/40"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Scale className="w-4 h-4 text-teal-200" />
          <span>So Sánh Đối Chiếu Đa Đoạn</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal-400/20 text-teal-300 uppercase tracking-wider">Mới §48</span>
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
      {/* TAB: PASSAGE EXEGESIS STUDY (§13)                        */}
      {/* ======================================================== */}
      {activeTab === "passage" && (
        <div className="flex flex-col gap-6">
          {/* Header Banner & Preset Pills */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-orange-950/30 border border-amber-800/40 shadow-xl flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider">
                    Passage Exegesis Engine • ROADMAP1.md §13
                  </span>
                  <span className="text-xs text-slate-400">11 Lớp Phân Tích Chuyên Sâu</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-amber-400" />
                  Khảo Cứu &amp; Giải Kinh Phân Đoạn Toàn Diện
                </h2>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed mt-1">
                  Phân tích cấu trúc phân đoạn Kinh Thánh chi tiết: Văn bản nguyên ngữ • Bối cảnh lịch sử • Nhân vật • Địa danh • Đề cương giải kinh • Căn ngữ Strong&apos;s • Đối chiếu liên văn bản • Câu hỏi suy ngẫm • Chú giải 275 sách.
                </p>
              </div>

              <Link
                href="/bible"
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all self-start md:self-auto shrink-0"
              >
                <span>Mở Trong Trình Đọc</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Presets List */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Phân đoạn nền tảng tiêu biểu:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {(passagePresets.length > 0 ? passagePresets : [
                  { id: "mat-14", reference: "Ma-thi-ơ 14:22-33", title: "Chúa Giê-xu & Phi-e-rơ Đi Trên Biển", genre: "Tin Lành Tự Sự", brief: "Đức tin vượt qua bão tố" },
                  { id: "jhn-3", reference: "Giăng 3:1-16", title: "Đối Thoại Ban Đêm Với Ni-cô-đem", genre: "Đối Thoại Thần Học", brief: "Sự tái sinh & Tình yêu cứu chuộc" },
                  { id: "rom-8", reference: "Rô-ma 8:28-39", title: "Đắc Thắng Trong Đấng Christ", genre: "Thư Tín Luận Thuyết", brief: "Tình yêu không gì phân rẽ" },
                  { id: "gen-22", reference: "Sáng-thế Ký 22:1-19", title: "Áp-ra-ham Dâng Y-sác Trên Núi Mô-ri-a", genre: "Ký Thuật Tổ Phụ", brief: "Hình bóng Chiên Con chuộc tội" },
                  { id: "eph-2", reference: "Ê-phê-sô 2:1-10", title: "Sống Lại Nhờ Ân Điển Qua Đức Tin", genre: "Thư Tín Khuyên Răn", brief: "Kiệt tác của Đức Chúa Trời" },
                  { id: "psa-23", reference: "Thi Thiên 23:1-6", title: "Đức Giê-hô-va Là Đấng Chăn Giữ Tôi", genre: "Thi Ca Tín Thác", brief: "Bình an trong trũng bóng chết" }
                ]).map((preset) => {
                  const isSelected = passageRefInput.toLowerCase().includes(preset.reference.toLowerCase()) || preset.reference.toLowerCase().includes(passageRefInput.toLowerCase());
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setPassageRefInput(preset.reference);
                        handlePassageStudy(preset.reference);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500/60 shadow-lg shadow-amber-500/10 text-white"
                          : "glass-card border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">{preset.reference}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                          {preset.genre}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-200 line-clamp-1">{preset.title}</span>
                      <span className="text-[11px] text-slate-400 line-clamp-1">{preset.brief}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input Search Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePassageStudy();
              }}
              className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-800/80"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={passageRefInput}
                  onChange={(e) => setPassageRefInput(e.target.value)}
                  placeholder="Nhập bất kỳ sách, chương, câu... (VD: Ma-thi-ơ 14:22-33, Giăng 3:1-16, Rô-ma 8:28-39, Thi Thiên 23)"
                  className="w-full bg-slate-950/80 border border-slate-700 text-xs text-white rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={passageLoading}
                className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/30 shrink-0"
              >
                {passageLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang Giải Kinh...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Nghiên Cứu Phân Đoạn</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Loading or Error */}
          {passageLoading && (
            <div className="p-16 rounded-3xl glass-panel border border-slate-800 flex flex-col items-center justify-center gap-4 text-slate-400 shadow-xl">
              <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
              <div className="text-center">
                <h3 className="text-sm font-bold text-white">Đang tổng hợp 11 lớp nghiên cứu phân đoạn...</h3>
                <p className="text-xs text-slate-500 mt-1">Truy vấn văn bản Kinh Thánh • Bối cảnh lịch sử • Lập đề cương giải kinh • Tra cứu căn ngữ Strong&apos;s</p>
              </div>
            </div>
          )}

          {passageError && !passageLoading && (
            <div className="p-6 rounded-3xl bg-rose-950/30 border border-rose-800/50 flex items-start gap-3 text-xs text-rose-200 shadow-xl">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-rose-300">Không thể tải phân đoạn:</span>
                <p>{passageError}</p>
              </div>
            </div>
          )}

          {/* Result Content */}
          {passageData && !passageLoading && (
            <div className="flex flex-col gap-6">
              {/* Row 1: Exegetical Highlights Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Phân Đoạn &amp; Sách</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    {passageData.reference}
                  </span>
                  <span className="text-[11px] text-amber-300 font-medium">{passageData.chapter_range}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Thể Loại Văn Học</span>
                  <span className="text-sm font-bold text-white line-clamp-1">{passageData.literary_genre}</span>
                  <span className="text-[11px] text-slate-400">Quy chuẩn giải kinh</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Tác Giả &amp; Thời Kỳ</span>
                  <span className="text-sm font-bold text-white line-clamp-1">{passageData.author_and_date}</span>
                  <span className="text-[11px] text-slate-400">Chính kinh 66 sách</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Dung Lượng Phân Đoạn</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{passageData.total_verses} Câu Kinh Thánh</span>
                  <span className="text-[11px] text-slate-400">Bản dịch 1925 bảo chứng</span>
                </div>
              </div>

              {/* Row 2: Dual Grid: Scripture Text vs Context & Entities */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 7 cols: Canonical Scripture Text */}
                <div className="lg:col-span-7 rounded-3xl glass-panel border border-slate-800 p-6 flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">Văn Bản Kinh Thánh (Bản Dịch Truyền Thống 1925)</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const fullText = passageData.verses.map(v => `${v.verse}. ${v.text}`).join("\n");
                        navigator.clipboard.writeText(`${passageData.reference}\n${fullText}`);
                        setCopiedPassageText(true);
                        setTimeout(() => setCopiedPassageText(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      {copiedPassageText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPassageText ? "Đã sao chép" : "Sao chép"}</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[540px] overflow-y-auto pr-2 font-serif text-sm leading-relaxed">
                    {passageData.verses.map((v) => (
                      <div key={v.verse} className="p-2.5 rounded-xl hover:bg-slate-800/40 transition-colors">
                        {v.section_title && (
                          <div className="text-xs font-sans font-bold text-amber-400 mb-1.5 border-b border-slate-800 pb-1">
                            {v.section_title}
                          </div>
                        )}
                        <p className="text-slate-200">
                          <span className="font-sans font-bold text-xs text-amber-400/90 mr-2 bg-slate-800/60 px-1.5 py-0.5 rounded">
                            {v.verse}
                          </span>
                          {v.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right 5 cols: Historical Context & Entities */}
                <div className="lg:col-span-5 flex flex-col gap-5">
                  {/* Context Card */}
                  <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5 shadow-xl">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" /> Bối Cảnh Lịch Sử &amp; Thần Học
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {passageData.historical_context}
                    </p>
                  </div>

                  {/* Entities & Locations */}
                  <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 shadow-xl">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Nhân Vật &amp; Địa Danh Xuất Hiện
                    </span>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Nhân vật:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {passageData.people.map((p, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Địa danh:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {passageData.locations.map((loc, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                              {loc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Exegetical Outline & Structure */}
              <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-800 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Cấu Trúc Đề Cương Giải Kinh Phân Đoạn (Exegetical Outline)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {passageData.structure_outline.map((out, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between gap-2.5">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-amber-300">{out.section_title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            {out.verse_range}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{out.summary}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">Lẽ Thật Cốt Lõi:</span>
                        <p className="text-xs text-amber-100 italic leading-snug">{out.key_truth}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Keywords & Strong's Lexicon */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Từ Khóa Thần Học &amp; Căn Ngữ Nguyên Ngữ (Strong&apos;s Lexicon)</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {passageData.keywords.map((kw, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{kw.word}</span>
                        {kw.strong_number && (
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                            {kw.strong_number}
                          </span>
                        )}
                      </div>
                      {kw.original_lemma && (
                        <span className="text-[11px] font-serif text-cyan-300 italic">{kw.original_lemma}</span>
                      )}
                      <p className="text-[11px] text-slate-400 leading-snug mt-1">{kw.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: Cross-References & Themes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 shadow-xl">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRight className="w-4 h-4 text-indigo-400" /> Các Câu Đối Chiếu Liên Văn Bản (Cross-References)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {passageData.cross_references.map((cr, idx) => (
                      <Link
                        key={idx}
                        href={`/bible?ref=${encodeURIComponent(cr)}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/40 text-indigo-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <BookOpen className="w-3 h-3 text-indigo-400" />
                        <span>{cr}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 shadow-xl">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Chủ Đề Thần Học Trọng Tâm
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {passageData.theological_themes.map((th, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-medium">
                        {th}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 6: Devotional & Reflection Questions */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-indigo-950/20 border border-slate-800 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">Câu Hỏi Suy Ngẫm &amp; Tĩnh Nguyện Thực Hành</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {passageData.reflection_questions.map((rq, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{rq}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 7: Commentary Citations from 275 Books */}
              {passageData.scholarly_commentary_citations.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Library className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Trích Dẫn Chú Giải Từ Thư Viện 275 Sách Chuyên Khảo</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {passageData.scholarly_commentary_citations.map((c, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-emerald-300 block">{c.source_title}</span>
                          <span className="text-[10px] text-slate-400">{c.chapter}</span>
                          <p className="text-xs text-slate-300 italic leading-relaxed mt-2 border-l-2 border-emerald-500/40 pl-2.5">
                            &ldquo;{c.quote}&rdquo;
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Row 8: Hermeneutical Takeaway & Action Bridges */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                <div className="flex flex-col gap-1.5 max-w-2xl">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Kết Luận Giải Kinh (Hermeneutical Takeaway)
                  </span>
                  <p className="text-xs text-amber-100/90 leading-relaxed font-serif italic">
                    {passageData.hermeneutical_takeaway}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <Link
                    href={`/study?passage=${encodeURIComponent(passageData.reference)}`}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-600/20"
                  >
                    <span>Soạn Bài Giảng →</span>
                  </Link>
                  <Link
                    href="/learn?tab=memorize"
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <span>Học Thuộc Lòng Câu Gốc</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MULTI-DIMENSIONAL CONTEXT STUDY (§15) */}
      {/* ======================================================== */}
      {activeTab === "context" && (
        <div className="flex flex-col gap-6">
          {/* Header & Preset Selector */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-indigo-950/30 border border-rose-800/40 shadow-xl flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 tracking-wider">
                    Context Study Analyzer • §15
                  </span>
                  <span className="text-xs text-slate-400">Đa chiều: 6 Trục Ngữ Cảnh</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
                  <Compass className="w-6 h-6 text-rose-400" />
                  Phân Tích Bối Cảnh Lịch Sử - Văn Hóa Đa Chiều
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
                  Đánh giá toàn cảnh sự kiện và phân đoạn Kinh Thánh qua 6 lăng kính độc lập: Lịch sử, Văn hóa, Chính trị, Tôn giáo, Địa lý và Văn chương để bảo toàn ý nghĩa nguyên thủy của bản văn.
                </p>
              </div>
            </div>

            {/* Presets Row */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Các phân đoạn bối cảnh kinh điển:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { key: "john-4", label: "Giăng 4 — Sa-ma-ri", sub: "Người đàn bà bên giếng Gia-cốp", icon: "🍇" },
                  { key: "matthew-5-7", label: "Ma-thi-ơ 5-7 — Núi Ga-li-lê", sub: "Bài Giảng Trên Núi & Tám Phước", icon: "🏔️" },
                  { key: "philippians", label: "Phi-líp 1-4 — Ngục Tù La-mã", sub: "Carmen Christi & Sự Khiêm Nhường", icon: "🏛️" },
                  { key: "exodus-12", label: "Xuất Ê-díp-tô Ký 12 — Ai Cập", sub: "Đêm Lễ Vượt Qua Đầu Tiên", icon: "🐑" }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setSelectedContextPreset(item.key);
                      handleContextStudy(item.key);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                      selectedContextPreset === item.key && !customContextInput
                        ? "bg-rose-500/20 border-rose-500 text-white shadow-md shadow-rose-500/10"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">{item.label}</span>
                      <span className="text-[10px] text-slate-400 truncate">{item.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Passage Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customContextInput.trim()) {
                  handleContextStudy(customContextInput.trim());
                }
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-800/80"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={customContextInput}
                  onChange={(e) => setCustomContextInput(e.target.value)}
                  placeholder="Hoặc nhập phân đoạn/biến cố khác (ví dụ: '1 Sa-mu-ên 17 - Đa-vít và Gô-li-át', 'Sáng 22')..."
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
              <button
                type="submit"
                disabled={contextLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-rose-600/20 shrink-0"
              >
                {contextLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Phân Tích 6 Chiều</span>
              </button>
            </form>
          </div>

          {/* Loading or Error */}
          {contextLoading && (
            <div className="p-16 rounded-3xl glass-panel border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              <p className="text-sm font-semibold text-white">Đang phân tích 6 chiều bối cảnh Kinh Thánh...</p>
              <p className="text-xs text-slate-500">Truy xuất dữ liệu lịch sử, khảo cổ và đối chiếu 275 sách chuyên khảo.</p>
            </div>
          )}

          {contextError && (
            <div className="p-6 rounded-2xl bg-red-950/30 border border-red-800/50 text-red-200 text-xs">
              {contextError}
            </div>
          )}

          {/* Context Study Results */}
          {!contextLoading && contextData && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              {/* Executive Overview Banner */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {contextData.scripture_anchor}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {contextData.historical_era}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {contextData.subject_or_passage}
                    </h2>
                  </div>

                  <Link
                    href={`/bible?ref=${encodeURIComponent(contextData.scripture_anchor.split(';')[0])}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                    target="_blank"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Đọc Kinh Thánh 1925 <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>

                {/* Primary Takeaway */}
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/30 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Thông Điệp Cốt Lõi (Primary Takeaway)
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {contextData.primary_takeaway}
                  </p>
                </div>
              </div>

              {/* Dimension Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 whitespace-nowrap">Lọc góc nhìn:</span>
                {[
                  { id: "all", label: "Tất cả 6 Chiều" },
                  { id: "historical", label: "Lịch Sử (Historical)" },
                  { id: "cultural", label: "Văn Hóa (Cultural)" },
                  { id: "political", label: "Chính Trị (Political)" },
                  { id: "religious", label: "Tôn Giáo (Religious)" },
                  { id: "geographical", label: "Địa Lý (Geographical)" },
                  { id: "literary", label: "Văn Chương (Literary)" }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveDimensionFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all text-xs font-semibold ${
                      activeDimensionFilter === f.id
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm"
                        : "bg-slate-800/70 text-slate-400 hover:text-white border border-transparent"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* 6 Dimensions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contextData.dimensions
                  .filter((d) => activeDimensionFilter === "all" || d.dimension_key === activeDimensionFilter)
                  .map((dim) => {
                    const badgeStyles: Record<string, { bg: string; text: string; border: string }> = {
                      historical: { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/30" },
                      cultural: { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/30" },
                      political: { bg: "bg-red-500/10", text: "text-red-300", border: "border-red-500/30" },
                      religious: { bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-500/30" },
                      geographical: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/30" },
                      literary: { bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/30" }
                    };
                    const style = badgeStyles[dim.dimension_key] || { bg: "bg-slate-800/40", text: "text-slate-300", border: "border-slate-700" };

                    return (
                      <div
                        key={dim.dimension_key}
                        className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all ${style.bg} ${style.border}`}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${style.bg} ${style.text} ${style.border}`}>
                              {dim.dimension_title}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-mono">
                              §15.{dim.dimension_key}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white leading-snug">
                            {dim.summary}
                          </h4>

                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {dim.detailed_analysis}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 pt-3 border-t border-slate-800/60">
                          {/* Key scriptures */}
                          {dim.key_scriptures && dim.key_scriptures.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                              <span className="text-slate-400 font-medium">Câu gốc:</span>
                              {dim.key_scriptures.map((s, idx) => (
                                <Link
                                  key={idx}
                                  href={`/bible?ref=${encodeURIComponent(s.split(';')[0])}`}
                                  target="_blank"
                                  className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700/80 text-indigo-300 hover:text-white transition-colors"
                                >
                                  {s}
                                </Link>
                              ))}
                            </div>
                          )}

                          {/* Academic citations */}
                          {dim.scholarly_citations && dim.scholarly_citations.length > 0 && (
                            <div className="text-[10px] text-slate-400 flex items-start gap-1">
                              <BookOpen className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                              <span className="italic leading-normal">
                                Đối chiếu: {dim.scholarly_citations.join(" • ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Hermeneutical Significance */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  Ý Nghĩa Giải Kinh Học Thuật &amp; Ứng Dụng Thuộc Linh
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {contextData.hermeneutical_significance}
                </p>
              </div>

              {/* Related Theological Books from Library */}
              {contextData.related_theological_books && contextData.related_theological_books.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Library className="w-4 h-4 text-emerald-400" />
                    Tài Liệu Chuyên Khảo Khuyên Đọc (Thư Viện 275 Sách)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {contextData.related_theological_books.map((b, idx) => (
                      <Link
                        key={idx}
                        href={`/library?search=${encodeURIComponent(b.split('(')[0].trim())}`}
                        className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white transition-all flex flex-col justify-between gap-2 group"
                      >
                        <span className="font-semibold group-hover:text-emerald-300 leading-snug">
                          {b}
                        </span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                          Mở sách <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </Link>
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
          {/* Sub-mode Selector: Dictionary vs Word-by-word Interlinear Exegesis */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLexiconSubMode("dictionary")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  lexiconSubMode === "dictionary"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Languages className="w-4 h-4 text-cyan-300" />
                <span>Từ Điển Căn Ngữ Strong &amp; Concordance</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLexiconSubMode("interlinear");
                  if (!interlinearData && !interlinearLoading) {
                    fetchInterlinearStudy(interlinearRef);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  lexiconSubMode === "interlinear"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Layers className="w-4 h-4 text-amber-300" />
                <span>Khảo Cứu Nguyên Ngữ Liên Dòng Từng Chữ (§49)</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  31,081 câu
                </span>
              </button>
            </div>

            <span className="hidden sm:inline-block text-[11px] text-slate-400 pr-3">
              {lexiconSubMode === "dictionary" ? "Tra cứu mã số Strong Hy Lạp & Hê-bơ-rơ" : "Phân tích cú pháp, hình thái học & đối chiếu cổ bản"}
            </span>
          </div>

          {lexiconSubMode === "dictionary" && (
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

                  {/* Card Bottom: Occurrences & Action Buttons */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                      Xuất hiện: <strong className="text-white">{item.occurrences_count.toLocaleString()}</strong> lần
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenLexiconDetail(item, "morphology")}
                        className="px-2.5 py-1 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-600/30 text-xs font-bold text-purple-300 flex items-center gap-1 transition-colors"
                        title="Phân tích ngữ pháp & biến cách"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ngữ Pháp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenLexiconDetail(item, "concordance")}
                        className="px-2.5 py-1 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-600/30 text-xs font-bold text-cyan-300 flex items-center gap-1 transition-colors"
                        title="Đối chiếu các câu xuất hiện"
                      >
                        <BookA className="w-3.5 h-3.5" />
                        <span>Concordance</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {lexiconSubMode === "interlinear" && (
            <div className="flex flex-col gap-6">
              {/* Header & Interactive Passage Selector */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 flex flex-col gap-4 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <Layers className="w-4 h-4" /> Word-by-Word Interlinear Exegetical Parser (§2.1, §49)
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">
                      Khảo Cứu Nguyên Ngữ Liên Dòng Từng Chữ &amp; Cú Pháp
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Phân tích từ-theo-từ tiếng Hê-bơ-rơ (Cựu Ước) và Hy Lạp (Tân Ước) với mã Strong, phân loại ngữ pháp (Morphology) và đối chiếu cổ bản chép tay.
                    </p>
                  </div>

                  {interlinearData && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const md = `### Khảo Cứu Nguyên Ngữ Liên Dòng: ${interlinearData.reference}\n\n**Bản Truyền Thống 1925:** ${interlinearData.vietnamese_1925_text}\n**King James Version (KJV):** ${interlinearData.kjv_english_text}\n**Nguyên Ngữ:** ${interlinearData.original_language === "hebrew" ? "Biblical Hebrew" : "Koine Greek"}\n\n| # | Nguyên Văn | Phiên Âm | Strong | Từ Loại / Hình Thái | Nghĩa Việt | English |\n|---|---|---|---|---|---|---|\n` +
                            (interlinearData.tokens || []).map((t: any) => `| ${t.position} | ${t.original_text} | ${t.transliteration} | ${t.strong_number} | ${t.morphology_code} (${t.morphology_expanded || ""}) | ${t.vietnamese_gloss} | ${t.english_gloss} |`).join("\n") +
                            `\n\n**Ý Nghĩa Thần Học:** ${interlinearData.theological_insight || ""}`;
                          navigator.clipboard.writeText(md);
                          setCopiedInterlinearRef(interlinearData.reference);
                          setTimeout(() => setCopiedInterlinearRef(null), 2000);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
                      >
                        {copiedInterlinearRef === interlinearData?.reference ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copiedInterlinearRef === interlinearData?.reference ? "Đã chép Markdown!" : "Sao Chép Toàn Bộ"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Preset Fast Selector Buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    Các phân đoạn nguyên ngữ kinh điển tiêu biểu:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { ref: "Giăng 1:1", label: "Giăng 1:1", title: "En Arche En Ho Logos", lang: "Greek", focus: "Đạo thành nhục thể & Bản tính Thần thượng" },
                      { ref: "Sáng-thế Ký 1:1", label: "Sáng-thế 1:1", title: "Bereshit Bara Elohim", lang: "Hebrew", focus: "Sáng tạo từ hư vô & Đấng Tối Cao" },
                      { ref: "Giăng 3:16", label: "Giăng 3:16", title: "Houtos Gar Egapesen", lang: "Greek", focus: "Tình yêu Agapao & Con Độc Sanh" },
                      { ref: "Thi-thiên 23:1", label: "Thi-thiên 23:1", title: "Yahweh Roi Lo Echsar", lang: "Hebrew", focus: "Đức Giê-hô-va là Đấng chăn giữ tôi" },
                      { ref: "Rô-ma 8:28", label: "Rô-ma 8:28", title: "Panta Synergei Eis Agathon", lang: "Greek", focus: "Chúa tể tể trị & Hiệp lại làm ích" },
                      { ref: "Ê-phê-sô 2:8", label: "Ê-phê-sô 2:8", title: "Te Gar Chariti Este", lang: "Greek", focus: "Sự cứu chuộc bởi ân điển qua đức tin" },
                      { ref: "Ma-thi-ơ 28:19", label: "Ma-thi-ơ 28:19", title: "Poreuthentes Matheteusate", lang: "Greek", focus: "Đại Mạng Lệnh môn đồ hoá muôn dân" },
                      { ref: "Xuất Ê-díp-tô Ký 3:14", label: "Xuất 3:14", title: "Ehyeh Asher Ehyeh", lang: "Hebrew", focus: "Đấng Tự Hữu Hằng Hữu Tự Tại" }
                    ].map(p => (
                      <button
                        key={p.ref}
                        type="button"
                        onClick={() => {
                          setInterlinearRef(p.ref);
                          fetchInterlinearStudy(p.ref);
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all flex flex-col gap-0.5 ${
                          interlinearRef === p.ref
                            ? "bg-amber-500/20 border-amber-500/60 text-white shadow-md shadow-amber-500/10"
                            : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-amber-200">{p.label}</span>
                          <span className={`text-[9px] font-mono px-1 rounded ${p.lang === "Hebrew" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"}`}>
                            {p.lang}
                          </span>
                        </div>
                        <span className="text-[11px] font-serif italic text-slate-400 truncate">{p.title}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">{p.focus}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Passage Input Box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (interlinearRef.trim()) {
                      fetchInterlinearStudy(interlinearRef.trim());
                    }
                  }}
                  className="flex items-center gap-2 pt-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={interlinearRef}
                      onChange={(e) => setInterlinearRef(e.target.value)}
                      placeholder="Nhập bất kỳ câu Kinh Thánh nào (VD: Giăng 14:6, Rô-ma 12:1-2, Phi-líp 4:13)..."
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={interlinearLoading}
                    className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-1.5 shrink-0"
                  >
                    {interlinearLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                    <span>Khảo Cứu Liên Dòng</span>
                  </button>
                </form>
              </div>

              {/* Interlinear Results */}
              {interlinearLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-9 h-9 text-amber-400 animate-spin" />
                  <p className="text-sm font-medium text-slate-300">Đang truy xuất nguyên văn ngữ căn Strong, phân tích hình thái học & đối chiếu cổ bản...</p>
                </div>
              ) : interlinearError ? (
                <div className="p-6 rounded-3xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-sm">
                  {interlinearError}
                </div>
              ) : interlinearData ? (
                <div className="flex flex-col gap-6">
                  {/* Context Comparison Header */}
                  <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {interlinearData.reference}
                        </span>
                        <span className="text-xs font-bold text-slate-300 uppercase">
                          {interlinearData.testament === "OT" ? "Cựu Ước • Tiếng Hê-bơ-rơ (Hebrew)" : "Tân Ước • Tiếng Hy Lạp (Greek)"}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {interlinearData.reading_direction === "rtl" ? "Hướng đọc: Phải sang Trái (RTL)" : "Hướng đọc: Trái sang Phải (LTR)"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {interlinearData.tokens?.length || 0} từ ngữ căn phân tích
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          Bản Truyền Thống 1925
                        </span>
                        <p className="text-base font-serif text-slate-100 leading-relaxed mt-1">
                          {interlinearData.vietnamese_1925_text}
                        </p>
                      </div>
                      <div className="border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-2 md:pt-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                          King James Version (KJV 1611)
                        </span>
                        <p className="text-sm font-serif italic text-slate-300 leading-relaxed mt-1">
                          {interlinearData.kjv_english_text}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Word-by-Word Interlinear Cards Flow */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                        <span>📜</span> Phân Tích Dòng Từ Nguyên Ngữ Từng Chữ
                      </h3>
                      <span className="text-xs text-slate-400">
                        {interlinearData.reading_direction === "rtl" ? "Thứ tự đọc: Từ Phải sang Trái (Biblical Hebrew)" : "Thứ tự đọc: Từ Trái sang Phải (Koine Greek)"}
                      </span>
                    </div>

                    <div 
                      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl ${
                        interlinearData.reading_direction === "rtl" ? "direction-rtl" : ""
                      }`}
                      dir={interlinearData.reading_direction || "ltr"}
                    >
                      {(interlinearData.tokens || []).map((token: any) => (
                        <div
                          key={token.position}
                          className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between gap-2.5 shadow-md group text-left"
                          dir="ltr"
                        >
                          {/* Top: Position & Strong ID */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-500">
                              #{token.position}
                            </span>
                            <div className="flex items-center gap-1">
                              {token.strong_number && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenLexiconDetail({
                                      id: token.strong_number,
                                      strong_number: token.strong_number,
                                      language: interlinearData.original_language,
                                      lemma: token.lemma,
                                      transliteration: token.transliteration,
                                      pronunciation: token.pronunciation_audio || "",
                                      part_of_speech: token.part_of_speech || "",
                                      definition: token.lexicon_definition || token.vietnamese_gloss,
                                      theological_significance: "",
                                      occurrences_count: 0,
                                      key_verses: []
                                    });
                                  }}
                                  className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/30 transition-colors"
                                  title="Mở bảng tra cứu chi tiết Strong Morphology & Concordance"
                                >
                                  {token.strong_number}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => playPronunciation(token.original_text || token.lemma, interlinearData.original_language)}
                                className="p-1 rounded text-slate-500 hover:text-amber-300 transition-colors"
                                title="Nghe phát âm chuẩn"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Word in Original Alphabet */}
                          <div className="my-1 text-center">
                            <span
                              className={`block font-serif font-bold text-2xl text-amber-200 group-hover:text-amber-100 transition-colors ${
                                interlinearData.original_language === "hebrew" ? "text-3xl font-hebrew" : ""
                              }`}
                              dir={interlinearData.reading_direction || "ltr"}
                            >
                              {token.original_text}
                            </span>
                            <span className="block text-xs italic text-slate-400 mt-1 font-sans">
                              {token.transliteration}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              căn: <b className="text-slate-400">{token.lemma}</b>
                            </span>
                          </div>

                          {/* Morphology & Gloss */}
                          <div className="flex flex-col gap-1 border-t border-slate-800/80 pt-2 text-xs">
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800 truncate" title={token.morphology_expanded || token.morphology_code}>
                              {token.morphology_code}
                            </span>
                            <div className="font-bold text-emerald-300 truncate" title={`Nghĩa tiếng Việt: ${token.vietnamese_gloss}`}>
                              {token.vietnamese_gloss}
                            </div>
                            <div className="text-[11px] text-slate-400 italic truncate" title={`English: ${token.english_gloss}`}>
                              {token.english_gloss}
                            </div>
                          </div>

                          {/* Definition tooltip */}
                          {token.lexicon_definition && (
                            <div className="text-[10px] text-slate-400 border-t border-slate-900 pt-1 line-clamp-2 leading-snug" title={token.lexicon_definition}>
                              {token.lexicon_definition}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Syntactic Structure Clause Analysis */}
                  {interlinearData.syntactic_structure && interlinearData.syntactic_structure.length > 0 && (
                    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                          <Network className="w-4 h-4" /> Cấu Trúc Cú Pháp &amp; Phân Tích Mệnh Đề (Syntactic Structure)
                        </h4>
                        <span className="text-xs text-slate-400">
                          {interlinearData.syntactic_structure.length} Mệnh đề ngữ pháp
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {interlinearData.syntactic_structure.map((clause: any, cIdx: number) => (
                          <div key={cIdx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-bold text-sm text-amber-200">{clause.clause}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-500/20">
                                {clause.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              <b className="text-slate-400">Ý nghĩa cú pháp: </b>{clause.theological_function || clause.function}
                            </p>
                            {clause.grammatical_elements && (
                              <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-1.5 pt-1 border-t border-slate-900">
                                {Object.entries(clause.grammatical_elements).map(([k, v]: any) => (
                                  <span key={k} className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800/60">
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
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900/80 to-slate-900 border border-amber-500/30 flex flex-col gap-2.5 shadow-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" /> Luận Điểm Giải Kinh Thần Học Từ Nguyên Ngữ (Exegetical Insight)
                      </span>
                      <p className="text-sm text-slate-200 leading-relaxed font-serif">
                        {interlinearData.theological_insight}
                      </p>
                    </div>
                  )}

                  {/* Ancient Codex Manuscripts Evidence */}
                  {interlinearData.codex_sources && interlinearData.codex_sources.length > 0 && (
                    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" /> Bằng Chứng Cổ Bản Chép Tay &amp; Phê Bình Văn Bản (Textual Witnesses &amp; Codices)
                        </h4>
                        <span className="text-xs text-slate-400">
                          {interlinearData.codex_sources.length} Cổ bản đối chiếu
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                        {interlinearData.codex_sources.map((codex: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white truncate">{codex.name}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {codex.siglum}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">Niên đại: {codex.date}</span>
                            <span className="text-[11px] text-slate-500 truncate">Lưu trữ: {codex.location}</span>
                            {codex.reading && (
                              <p className="text-xs text-purple-200 font-serif italic mt-1 border-t border-slate-800/80 pt-1.5">
                                &ldquo;{codex.reading}&rdquo;
                              </p>
                            )}
                            {codex.notes && (
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-3 leading-snug">
                                {codex.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Lexicon Detail Modal (Morphology & Concordance) */}
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
                      setMorphologyData(null);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Subnav Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950/70 px-6 pt-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLexiconModalTab("morphology")}
                    className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                      lexiconModalTab === "morphology"
                        ? "border-purple-500 text-purple-300"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Phân Tích Ngữ Pháp & Căn Tự (Morphology)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLexiconModalTab("concordance")}
                    className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                      lexiconModalTab === "concordance"
                        ? "border-cyan-500 text-cyan-300"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BookA className="w-3.5 h-3.5" />
                    <span>Đối Chiếu Xuất Hiện (Concordance)</span>
                    {concordanceData?.distribution?.total_matches ? (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
                        {concordanceData.distribution.total_matches}
                      </span>
                    ) : null}
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex flex-col gap-6">
                  {/* TAB A: MORPHOLOGICAL EXEGESIS */}
                  {lexiconModalTab === "morphology" && (
                    <div className="flex flex-col gap-6">
                      {morphologyLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                          <p className="text-xs text-slate-400">Đang truy vấn mô hình hình thái học & biến cách nguyên ngữ...</p>
                        </div>
                      ) : morphologyData ? (
                        <div className="flex flex-col gap-6">
                          {/* Overview Badges */}
                          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                                {morphologyData.part_of_speech}
                              </span>
                              {morphologyData.grammatical_category && (
                                <span className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                                  {morphologyData.grammatical_category}
                                </span>
                              )}
                              <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                                {morphologyData.occurrences_count} lần xuất hiện
                              </span>
                            </div>
                            {morphologyData.pronunciation && (
                              <button
                                type="button"
                                onClick={() => playPronunciation(morphologyData.lemma, morphologyData.language)}
                                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                                <span>Phát âm: &ldquo;{morphologyData.pronunciation}&rdquo;</span>
                              </button>
                            )}
                          </div>

                          {/* Morphological Parsing Card / Table */}
                          {morphologyData.morphological_parsing && (
                            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
                              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                                <Languages className="w-4 h-4 text-purple-400" />
                                <span>Hình Thái Học & Hệ Thống Biến Cách (Morphological Paradigms)</span>
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(morphologyData.morphological_parsing).map(([k, v]) => {
                                  if (k === 'case_paradigm' || k === 'binyan_stems') return null;
                                  return (
                                    <div key={k} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1">
                                      <span className="text-[10px] uppercase font-bold text-slate-400">
                                        {k.replace(/_/g, ' ')}
                                      </span>
                                      <span className="text-xs text-slate-200 font-medium">
                                        {typeof v === 'string' ? v : JSON.stringify(v)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Case Paradigm if Greek */}
                              {morphologyData.morphological_parsing.case_paradigm && (
                                <div className="mt-2 pt-3 border-t border-slate-800 flex flex-col gap-2">
                                  <span className="text-[11px] font-bold text-cyan-300">Biến Cách Danh Từ (Case Inflections):</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(morphologyData.morphological_parsing.case_paradigm).map(([cKey, cVal]) => (
                                      <div key={cKey} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col gap-0.5">
                                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{cKey.replace(/_/g, ' ')}</span>
                                        <span className="font-serif text-slate-200">{String(cVal)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Binyan Stems if Hebrew */}
                              {morphologyData.morphological_parsing.binyan_stems && (
                                <div className="mt-2 pt-3 border-t border-slate-800 flex flex-col gap-2">
                                  <span className="text-[11px] font-bold text-amber-300">Các Thể Động Từ Tiếng Hê-bơ-rơ (Binyanim):</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(morphologyData.morphological_parsing.binyan_stems).map(([bKey, bVal]) => (
                                      <div key={bKey} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col gap-0.5">
                                        <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">{bKey.replace(/_/g, ' ')}</span>
                                        <span className="font-serif text-slate-200">{String(bVal)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Exegetical Insight & Theological Significance */}
                          {(morphologyData.theological_significance || morphologyData.exegetical_insight) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {morphologyData.theological_significance && (
                                <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex flex-col gap-2">
                                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" /> Tầm Quan Trọng Thần Học
                                  </span>
                                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                                    {morphologyData.theological_significance}
                                  </p>
                                </div>
                              )}
                              {morphologyData.exegetical_insight && (
                                <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col gap-2">
                                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Góc Nhìn Giải Kinh (Exegesis)
                                  </span>
                                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                                    {morphologyData.exegetical_insight}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Key Anchor Scriptures */}
                          {morphologyData.key_scriptures && morphologyData.key_scriptures.length > 0 && (
                            <div className="flex flex-col gap-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                Các Phân Đoạn Nền Tảng (Key Scriptures)
                              </h4>
                              <div className="flex flex-col gap-2.5">
                                {morphologyData.key_scriptures.map((ks, ksIdx) => (
                                  <div key={ksIdx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs text-blue-400">📖 {ks.reference}</span>
                                      <Link
                                        href={`/bible?book=${encodeURIComponent(ks.reference.split(" ")[0])}`}
                                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                                      >
                                        <span>Đọc trong ngữ cảnh</span>
                                        <ChevronRight className="w-3 h-3" />
                                      </Link>
                                    </div>
                                    {ks.text && (
                                      <p className="text-xs font-serif text-slate-200 leading-relaxed italic">
                                        &ldquo;{ks.text}&rdquo;
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Related Lemmas */}
                          {morphologyData.related_lemmas && morphologyData.related_lemmas.length > 0 && (
                            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-2.5">
                              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" /> Các Căn Ngữ Liên Quan Trọng Yếu:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {morphologyData.related_lemmas.map((rl) => (
                                  <div
                                    key={rl.strong_number}
                                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-0.5"
                                  >
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-mono font-bold text-purple-400">{rl.strong_number}</span>
                                      <span className="text-slate-500 italic">{rl.transliteration}</span>
                                    </div>
                                    <span className="font-serif text-sm font-bold text-white">{rl.lemma}</span>
                                    <span className="text-[10px] text-slate-400 line-clamp-1">{rl.gloss}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-500 text-xs">
                          Không có dữ liệu hình thái học cho mục này.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB B: CONCORDANCE OCCURRENCES */}
                  {lexiconModalTab === "concordance" && (
                    <>
                      {concordanceLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                          <p className="text-xs text-slate-400">Đang truy xuất 31,081 câu Kinh Thánh để đối chiếu Concordance...</p>
                        </div>
                      ) : concordanceData ? (
                        <div className="flex flex-col gap-6">
                          {/* Theological Semantic Summary (§14) */}
                          {concordanceData.theological_summary && (
                            <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col gap-2 shadow-md">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                                  Ý Nghĩa Thần Học Toàn Cảnh (Theological Semantic Range §14)
                                </span>
                              </div>
                              <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
                                {concordanceData.theological_summary}
                              </p>
                            </div>
                          )}

                          {/* Related Strong Roots Cluster (§14) */}
                          {concordanceData.related_words && concordanceData.related_words.length > 0 && (
                            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2.5">
                              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" /> Các Căn Ngữ Liên Hệ Trọng Yếu (Related Roots):
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {concordanceData.related_words.map((rw) => (
                                  <button
                                    key={rw.strong_number}
                                    type="button"
                                    onClick={() => {
                                      handleLookupConcordance(rw.strong_number, rw.lemma, rw.definition);
                                    }}
                                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all flex flex-col gap-0.5 group"
                                  >
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
                                        {rw.strong_number}
                                      </span>
                                      <span className="text-slate-500 italic">{rw.transliteration}</span>
                                    </div>
                                    <span className="font-serif text-sm font-bold text-white group-hover:text-cyan-200">
                                      {rw.lemma}
                                    </span>
                                    <span className="text-[10px] text-slate-400 line-clamp-1">{rw.definition}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Distribution Stat & Book Breakdown */}
                          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 text-cyan-400" />
                                <div>
                                  <span className="text-xs font-bold text-slate-200">Phân Phối Toàn Cảnh Trong Kinh Thánh</span>
                                  <p className="text-[11px] text-slate-400">Từ khóa đối chiếu: &ldquo;{concordanceData.clean_keyword}&rdquo;</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
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

                            {/* Top Books Distribution */}
                            {concordanceData.book_distribution && concordanceData.book_distribution.length > 0 && (
                              <div className="flex flex-col gap-2 pt-3 border-t border-slate-800/80">
                                <span className="text-[11px] text-slate-400 font-medium">Xuất hiện nhiều nhất trong các sách:</span>
                                <div className="flex flex-wrap gap-2">
                                  {concordanceData.book_distribution.map((b, bIdx) => (
                                    <span
                                      key={bIdx}
                                      className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
                                    >
                                      <span className="text-cyan-400 font-bold">•</span>
                                      <span>{b.book}:</span>
                                      <span className="font-mono text-cyan-300 font-bold">{b.count} câu</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
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
                    </>
                  )}
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

          {/* Q&A Result — Full §19 AI Answer Structure & §39 Guardrails */}
          {qaAnswer && !qaLoading && (
            <article className="flex flex-col gap-6 animate-in fade-in duration-500">
              {/* Header Badges & Confidence */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/40 flex flex-col gap-4 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        Kết Luận Nghiên Cứu Thần Học Có Căn Cứ
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Cấu trúc câu trả lời chuẩn mực (§19) • Kiểm định Hermeneutical Guardrails (§39)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="px-3 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Độ tin cậy: {qaAnswer.confidence_score ? `${(qaAnswer.confidence_score * 100).toFixed(0)}%` : "96%"}</span>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 font-mono border border-slate-700">
                      {qaAnswer.model}
                    </span>
                  </div>
                </div>

                {/* Epistemic Badges (§39) */}
                {qaAnswer.epistemic_badges && qaAnswer.epistemic_badges.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {qaAnswer.epistemic_badges.map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        className="px-2.5 py-0.5 rounded-lg bg-cyan-950/40 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* 1. Executive Answer (ANSWER) */}
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5" /> 1. Câu Trả Lời Trực Tiếp (Answer Summary):
                  </span>
                  <p className="text-sm md:text-base text-slate-100 leading-relaxed font-sans font-medium bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                    {qaAnswer.summary}
                  </p>
                </div>
              </div>

              {/* 2. Direct Bible Evidence (BIBLE EVIDENCE) */}
              {qaAnswer.bible_evidence && qaAnswer.bible_evidence.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> 2. Bằng Chứng Kinh Thánh Trực Tiếp (Bible Evidence)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qaAnswer.bible_evidence.map((be, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2 hover:border-blue-500/40 transition-colors">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-300 flex items-center gap-1.5">
                            📖 {be.reference}
                          </span>
                          <Link
                            href={`/bible?ref=${encodeURIComponent(be.reference)}`}
                            target="_blank"
                            className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                          >
                            Mở Reader <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                        <p className="text-xs font-serif text-slate-200 italic leading-relaxed">
                          &ldquo;{be.text}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Related Passages & Cross-References (§19) */}
              {qaAnswer.related_passages && qaAnswer.related_passages.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <SplitSquareVertical className="w-4 h-4" /> 3. Các Phân Đoạn Đối Chiếu &amp; Song Hành (Related Passages)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {qaAnswer.related_passages.map((rp, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 flex flex-col justify-between gap-2.5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-indigo-300">{rp.reference}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              {rp.relation_type}
                            </span>
                          </div>
                          <p className="text-[11px] font-serif italic text-slate-300 leading-relaxed">
                            &ldquo;{rp.text_snippet}&rdquo;
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans border-t border-slate-800/80 pt-2 leading-relaxed">
                          {rp.connection_note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Historical & Literary Context (§19) */}
              {qaAnswer.historical_context && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" /> 4. Bối Cảnh Lịch Sử &amp; Văn Chương (Historical / Study Context)
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                    {qaAnswer.historical_context}
                  </p>
                </div>
              )}

              {/* 5. Sound Canonical Interpretation (§19) */}
              {qaAnswer.primary_interpretation && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" /> 5. Diễn Giải Thần Học Chính Yếu (Sound Interpretation)
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                    {qaAnswer.primary_interpretation}
                  </p>
                </div>
              )}

              {/* 6. Alternative Theological Interpretations (§19) */}
              {qaAnswer.alternative_interpretations && qaAnswer.alternative_interpretations.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-rose-400" /> 6. Các Trường Phái Diễn Giải Thần Học Bổ Khuyết (Alternative Interpretations)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {qaAnswer.alternative_interpretations.map((alt, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3">
                        <div className="flex flex-col gap-2">
                          <span className="font-bold text-xs text-rose-300 leading-snug">
                            {alt.perspective_name}
                          </span>
                          <span className="text-[10px] text-slate-400 italic">
                            Đại biểu: {alt.proponents}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {alt.core_view}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                          <span className="text-rose-400 font-semibold">Căn cứ: </span>
                          {alt.key_argument}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Strict Epistemic Guardrails (§39) */}
              {qaAnswer.epistemic_guardrails && (
                <div className="p-6 rounded-3xl bg-slate-950/90 border border-amber-500/30 flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" /> 7. Phân Định Nhận Thức Luận &amp; Hermeneutical Guardrails (§39)
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Chống Ảo Giác AI (Anti-Hallucination)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* 7.1 Direct Scripture Fact */}
                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        🟢 Dữ Kiện Văn Bản Trực Tiếp
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {qaAnswer.epistemic_guardrails.direct_biblical_fact}
                      </p>
                    </div>

                    {/* 7.2 Theological Deduction */}
                    <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                        🔵 Suy Luận Thần Học Hệ Thống
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {qaAnswer.epistemic_guardrails.theological_deduction}
                      </p>
                    </div>

                    {/* 7.3 Scholarly Uncertainty */}
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        🟡 Giới Hạn &amp; Điểm Chưa Khẳng Định
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {qaAnswer.epistemic_guardrails.scholarly_uncertainty}
                      </p>
                    </div>
                  </div>

                  {qaAnswer.epistemic_guardrails.guardrail_warning && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
                      ⚠️ {qaAnswer.epistemic_guardrails.guardrail_warning}
                    </div>
                  )}
                </div>
              )}

              {/* 8. Theological Citations from Monograph Library (SOURCES) */}
              {qaAnswer.citations && qaAnswer.citations.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Library className="w-4 h-4" /> 8. Trích Dẫn Từ Thư Viện 275 Sách Chuyên Khảo (Sources)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {qaAnswer.citations.map((c, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-xs text-emerald-300 leading-snug">{c.source_title}</span>
                          <span className="text-[10px] text-slate-400">{c.chapter}</span>
                          <p className="text-[11px] text-slate-300 italic leading-snug mt-1">&ldquo;{c.quote}&rdquo;</p>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                          <Link
                            href={`/library?search=${encodeURIComponent(c.source_title)}`}
                            className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                          >
                            Đọc trong Library <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => copyCitation(c.quote)}
                            className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedQuote === c.quote ? "Đã chép" : "Chép"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. Further Study Questions (FURTHER STUDY) */}
              {qaAnswer.further_study_questions && qaAnswer.further_study_questions.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-cyan-400" /> Câu Hỏi Suy Ngẫm Sâu Hơn &amp; Ứng Dụng Thuộc Linh
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {qaAnswer.further_study_questions.map((qItem, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{qItem}</span>
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

              {/* Typological Significance to Christ (§16) */}
              {characterData.typological_significance && (
                <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-900/90 border border-amber-500/40 shadow-xl flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Ý Nghĩa Tiên Trưng Đấng Christ (Typological Significance to Christ §16)
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
                    {characterData.typological_significance}
                  </p>
                </div>
              )}

              {/* Decisive Turning Points (§16) */}
              {characterData.turning_points && characterData.turning_points.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                    <GitCommit className="w-4 h-4" /> Các Bước Ngoặt Quyết Định &amp; Tiếng Gọi (Decisive Turning Points §16)
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {characterData.turning_points.map((tp, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-mono text-xs font-bold shrink-0 mt-0.5">
                          Bước {idx + 1}
                        </span>
                        <span className="text-xs text-slate-200 font-sans leading-relaxed">
                          {tp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Human Weaknesses (§16) */}
              {((characterData.strengths && characterData.strengths.length > 0) || (characterData.weaknesses && characterData.weaknesses.length > 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="p-6 rounded-3xl bg-slate-900/60 border border-emerald-500/20 flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Đức Tính Nổi Bật &amp; Đức Tin Kiên Định
                    </h3>
                    <div className="flex flex-col gap-2">
                      {characterData.strengths?.map((s, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-emerald-200/90 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-6 rounded-3xl bg-slate-900/60 border border-rose-500/20 flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Giới Hạn Xác Thịt &amp; Thách Thức Được Biến Đổi
                    </h3>
                    <div className="flex flex-col gap-2">
                      {characterData.weaknesses?.map((w, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-rose-200/90 flex items-start gap-2">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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

              {/* 6-Stage Redemptive Revelation Arc (§17) */}
              {themeData.redemptive_stages && themeData.redemptive_stages.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Tiến Trình Mạc Khải Cứu Chuộc 6 Giai Đoạn (Redemptive-Historical Arc §17)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {themeData.redemptive_stages.map((stg, sIdx) => (
                      <div key={sIdx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/30 transition-colors flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                            Giai đoạn {sIdx + 1}
                          </span>
                          <span className="text-[11px] font-mono text-cyan-400">{stg.scripture_ref}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100">{stg.stage_name_vi}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{stg.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Theological Distinctions & Guardrails (§17) */}
              {themeData.theological_distinctions && themeData.theological_distinctions.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-purple-500/20 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Quy Chuẩn Phân Định &amp; Cảnh Giác Giáo Lý (Theological Guardrails §17)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {themeData.theological_distinctions.map((td, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-purple-200/90 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{td}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      {/* ======================================================== */}
      {/* TAB 8: MULTI-PASSAGE COMPARATIVE EXEGESIS (§48, §51)     */}
      {/* ======================================================== */}
      {activeTab === "compare" && (
        <div className="flex flex-col gap-8">
          {/* Hero & Overview Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-teal-950/50 via-slate-900/60 to-emerald-950/40 border border-teal-500/30 flex flex-col gap-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                <Scale className="w-4 h-4" /> Multi-Passage Comparative Exegesis Matrix &bull; §48 &bull; §51
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                Đối Chiếu Đồng Quan &bull; 6 Lăng Kính Thần Học
              </span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                So Sánh Đối Chiếu Đa Đoạn &amp; Khảo Luận Đồng Quan
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans max-w-4xl">
                Nền tảng giải kinh đối chiếu đồng bộ 2 đến 4 phân đoạn Kinh Thánh: Trích xuất bản văn nguyên thủy 1925, 
                phân tích bối cảnh lịch sử của từng trước giả, căn ngữ Hy Lạp / Hê-bơ-rơ tương đồng, điểm đồng quy giáo lý, 
                sự khác biệt nhấn mạnh, sự hòa hợp cứu rỗi và dàn ý bài giảng mục vụ 3 điểm.
              </p>
            </div>
          </div>

          {/* Curated Foundations & Presets Bar */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Bộ Đề Đối Chiếu Mẫu Nổi Bật (8 Presets §48)
              </span>
              <span className="text-[11px] text-slate-400">Chọn đề mục để nạp nhanh phân đoạn và lăng kính</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {comparativePresets.map((preset) => {
                const isSelected = selectedComparePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyComparePreset(preset)}
                    className={`p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? "bg-teal-950/60 border-teal-400 text-white shadow-lg shadow-teal-900/30 ring-1 ring-teal-400/50"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/20">
                          {preset.badge_label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {preset.passages.length} đoạn
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {preset.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[10px] font-mono text-teal-300/80">
                      {preset.passages.map((p, pIdx) => (
                        <span key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Configuration & Query Bar */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col gap-5 shadow-xl">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Các phân đoạn đang đối chiếu (2 – 4 phân đoạn)</span>
                <span className="text-[11px] font-normal text-slate-400">Nhấn &ldquo;x&rdquo; để bỏ hoặc nhập thêm bên dưới</span>
              </label>

              {/* Passage Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {comparePassagesInput.map((pRef, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-950/70 border border-teal-500/40 text-teal-200 text-xs font-medium shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                    <span>{pRef}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveComparePassage(idx)}
                      title="Bỏ phân đoạn này"
                      className="w-4 h-4 rounded-full hover:bg-teal-800/60 text-teal-400 hover:text-white flex items-center justify-center text-[10px] transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                ))}

                {/* Add new passage inline */}
                {comparePassagesInput.length < 4 && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={compareNewPassageText}
                      onChange={(e) => setCompareNewPassageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddComparePassage();
                        }
                      }}
                      placeholder="Thêm phân đoạn (ví dụ: Công-vụ 1:8)..."
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 w-60"
                    />
                    <button
                      type="button"
                      onClick={handleAddComparePassage}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-colors"
                    >
                      + Thêm
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Theme & Lens Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">
                  Chủ đề thần học trọng tâm (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={compareThemeInput}
                  onChange={(e) => setCompareThemeInput(e.target.value)}
                  placeholder="Ví dụ: Đại Mạng Lệnh Môn Đồ Hóa, Đức Tin & Việc Làm..."
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">
                  Lăng kính nghiên cứu đối chiếu (Comparative Lens)
                </label>
                <select
                  value={compareLensInput}
                  onChange={(e) => setCompareLensInput(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
                >
                  <option value="synoptic_harmony">Phúc Âm Đồng Quan &amp; Hòa Hợp Tự Sự</option>
                  <option value="covenant_fulfillment">Tiến Trình Thần Học Giao Ước (Lời Hứa &amp; Ứng Nghiệm)</option>
                  <option value="theological_synthesis">Tổng Hợp Giáo Lý Tương Hỗ (Phao-lô &amp; Gia-cơ)</option>
                  <option value="typology_redemption">Biểu Tượng Tiên Tri (Typology Cựu &bull; Tân Ước)</option>
                  <option value="christological_roots">Kitô Học: Tiền Hữu, Nhập Thể &amp; Tối Thượng</option>
                  <option value="messianic_prophecy">Ứng Nghiệm Tiên Tri Đấng Mê-si-a</option>
                </select>
              </div>
            </div>

            {/* Execute Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Văn bản đối chiếu trực tiếp từ 31,081 câu Kinh Thánh 1925
              </span>

              <button
                type="button"
                onClick={() => handleRunComparativeStudy()}
                disabled={compareLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50"
              >
                {compareLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang giải kinh đối chiếu...</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4" />
                    <span>Chạy Đối Chiếu Thần Học</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {compareError && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{compareError}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {compareLoading && !compareData && (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/60 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
              <p className="text-xs">Đang truy vấn nguyên văn Kinh Thánh và phân tích đối chiếu đa tầng...</p>
            </div>
          )}

          {/* Results Display */}
          {compareData && (
            <div className="flex flex-col gap-8">
              {/* Executive Synthesis Card */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-teal-500/30 flex flex-col gap-3 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                      Tổng Luận Đối Chiếu
                    </span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="text-xs font-semibold text-white">
                      {compareData.focus_theme}
                    </span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {compareData.lens_title}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
                  {compareData.executive_synthesis}
                </p>
              </div>

              {/* Synchronous Multi-Column Passage Viewer */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Columns3 className="w-4 h-4 text-teal-400" />
                    <span>Đối Chiếu Song Song Bản Văn Kinh Thánh ({compareData.profiles.length} Phân Đoạn)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">Bản Dịch Truyền Thống 1925</span>
                </div>

                <div className={`grid grid-cols-1 ${
                  compareData.profiles.length === 2 
                    ? "md:grid-cols-2" 
                    : compareData.profiles.length === 3 
                    ? "md:grid-cols-3" 
                    : "md:grid-cols-2 lg:grid-cols-4"
                } gap-4`}>
                  {compareData.profiles.map((profile, pIdx) => (
                    <div 
                      key={pIdx}
                      className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-colors flex flex-col justify-between gap-4 shadow-lg"
                    >
                      {/* Passage Header */}
                      <div className="flex flex-col gap-2 pb-3 border-b border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            profile.testament === "OT"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}>
                            {profile.testament === "OT" ? "Cựu Ước" : "Tân Ước"}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {profile.total_verses} câu
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white">
                          {profile.reference}
                        </h4>
                        <div className="text-[11px] text-slate-400 flex flex-col gap-0.5">
                          <span><strong>Trước giả:</strong> {profile.author}</span>
                          <span><strong>Thời điểm:</strong> {profile.date_and_era}</span>
                          <span><strong>Độc giả:</strong> {profile.original_audience}</span>
                          <span><strong>Thể loại:</strong> {profile.literary_genre}</span>
                        </div>
                      </div>

                      {/* Verses Scrollbox */}
                      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 text-xs font-serif leading-relaxed text-slate-200">
                        {profile.verses_text && profile.verses_text.length > 0 ? (
                          profile.verses_text.map((v, vIdx) => (
                            <div key={vIdx} className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                              <span className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-500/30">
                                {v.verse}
                              </span>
                              <p className="italic text-slate-300">
                                {v.text}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-xs italic">Không có câu hiển thị.</p>
                        )}
                      </div>

                      {/* Core Theological Motif & Strong's Lexicon Roots */}
                      <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px]">
                          <span className="font-bold text-teal-300 block mb-0.5">Trọng tâm mạc khải:</span>
                          <span className="text-slate-300">{profile.core_theological_motif}</span>
                        </div>

                        {profile.key_strong_roots && profile.key_strong_roots.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {profile.key_strong_roots.map((root, rIdx) => (
                              <span
                                key={rIdx}
                                title={`${root.definition}: ${root.theological_significance}`}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-500/20"
                              >
                                {root.strong_number} &bull; {root.lemma}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-Dimensional Comparative Exegesis Matrix Table */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-teal-400" />
                    <span>Ma Trận Đối Chiếu Chi Tiết (5 Chiều Kích Giải Kinh)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Phân định minh bạch giữa các bản văn</span>
                </div>

                <div className="flex flex-col gap-4">
                  {compareData.comparative_dimensions.map((dim, dIdx) => (
                    <div 
                      key={dIdx}
                      className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3 shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-teal-400" />
                          <span>{dim.dimension_title}</span>
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase font-mono">
                          {dim.category}
                        </span>
                      </div>

                      {/* Columns per passage */}
                      <div className={`grid grid-cols-1 ${
                        compareData.profiles.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
                      } gap-3`}>
                        {Object.entries(dim.details_by_passage).map(([pRef, pText], entryIdx) => (
                          <div 
                            key={entryIdx}
                            className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1 text-xs"
                          >
                            <span className="font-bold text-teal-300 text-[11px] font-mono">
                              {pRef}
                            </span>
                            <p className="text-slate-300 leading-relaxed font-sans">
                              {pText}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Synthesis */}
                      <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/20 text-xs text-teal-200 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-teal-400 mt-0.5" />
                        <p className="leading-relaxed">
                          <strong>Tổng hợp thần học:</strong> {dim.theological_synthesis}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lexicon Roots Overlap (Strong's Concordance) */}
              {compareData.lexicon_roots_overlap && compareData.lexicon_roots_overlap.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Languages className="w-4 h-4 text-cyan-400" />
                      <span>Căn Ngữ Nguyên Văn Đối Chiếu (Strong&apos;s Greek &amp; Hebrew Roots)</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">Mạch nguồn nguyên ngữ kết nối các phân đoạn</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {compareData.lexicon_roots_overlap.map((lr, lIdx) => (
                      <div 
                        key={lIdx}
                        className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between gap-3 shadow-md"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                              {lr.strong_number}
                            </span>
                            <span className="text-[10px] uppercase text-slate-400 font-bold">
                              {lr.language}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-white font-serif">
                            {lr.lemma} <span className="text-xs text-cyan-300 font-sans font-normal">({lr.transliteration})</span>
                          </div>
                          <div className="text-xs text-slate-300 mt-1 font-sans">
                            {lr.definition}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                          <p className="line-clamp-3">{lr.theological_significance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Points of Convergence vs Nuance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Convergence (Đồng quy) */}
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 flex flex-col gap-3 shadow-lg">
                  <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Điểm Đồng Quy Thần Học (Convergence)</span>
                  </h4>
                  <ul className="flex flex-col gap-2 text-xs text-slate-200 leading-relaxed font-sans">
                    {compareData.points_of_convergence.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Nuance & Distinctives (Khác biệt sắc thái) */}
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 flex flex-col gap-3 shadow-lg">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Sắc Thái Độc Đáo &amp; Bổ Khuyết (Nuance &amp; Emphases)</span>
                  </h4>
                  <ul className="flex flex-col gap-2 text-xs text-slate-200 leading-relaxed font-sans">
                    {compareData.points_of_divergence_or_nuance.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Harmonization & Redemptive Analysis Box */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-teal-950/30 via-slate-900/70 to-indigo-950/30 border border-teal-500/30 flex flex-col gap-3 shadow-xl">
                <h4 className="text-sm font-bold text-teal-300 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-teal-400" />
                  <span>Sự Hòa Hợp Trong Lịch Sử Cứu Rỗi (Redemptive Harmonization)</span>
                </h4>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
                  {compareData.harmonization_analysis}
                </p>
              </div>

              {/* Homiletical Preaching Outline (3 Points) */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-400" />
                      <span>Dàn Ý Bài Giảng / Khảo Luận Mục Vụ (Homiletical Outline)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Gợi ý 3 luận điểm giảng luận và học Kinh Thánh liên kết các phân đoạn
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCompareOutline}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    {copiedCompareOutline ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép dàn bài</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {compareData.homiletical_sermon_outline.map((pt) => (
                    <div 
                      key={pt.point_number}
                      className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2.5 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-teal-300">
                          Điểm {pt.point_number}: {pt.title}
                        </h4>
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                          {pt.scripture_links.map((sLink, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                              {sLink}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-slate-400 italic">
                        &ldquo;{pt.subheading}&rdquo;
                      </p>

                      <p className="text-slate-200 leading-relaxed font-sans">
                        {pt.exposition}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-emerald-300 text-[11px] flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                        <p className="leading-relaxed">
                          <strong>Ứng dụng mục vụ:</strong> {pt.pastoral_application}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scholarly Commentary Citations from 275 Books */}
              {compareData.scholarly_commentary_citations && compareData.scholarly_commentary_citations.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Library className="w-3.5 h-3.5 text-teal-400" />
                    <span>Trích dẫn từ 275 Bộ Sách Thần Học &amp; Chú Giải</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {compareData.scholarly_commentary_citations.map((cite, cIdx) => (
                      <div 
                        key={cIdx}
                        className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-2 text-xs"
                      >
                        <blockquote className="text-slate-300 italic leading-relaxed font-serif">
                          &ldquo;{cite.quote}&rdquo;
                        </blockquote>
                        <div className="text-[11px] text-teal-300 font-semibold pt-2 border-t border-slate-800/80">
                          &mdash; {cite.source_title} ({cite.chapter})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Reflection Questions */}
              {compareData.reflection_questions && compareData.reflection_questions.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-teal-400" />
                    <span>Câu Hỏi Suy Ngẫm &amp; Thảo Luận Nhóm Nhỏ</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-200">
                    {compareData.reflection_questions.map((q, qIdx) => (
                      <div 
                        key={qIdx}
                        className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                          {qIdx + 1}
                        </span>
                        <p className="leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Epistemic Guardrail Banner */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-teal-500/30 text-[11px] text-slate-400 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{compareData.epistemic_guardrail}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
