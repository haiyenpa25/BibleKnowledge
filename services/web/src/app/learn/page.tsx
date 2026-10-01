"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  ChevronRight,
  ChevronLeft, 
  ArrowLeft,
  Flame,
  Award,
  BookOpen,
  BrainCircuit,
  Loader2,
  Calendar,
  Zap,
  Repeat,
  ArrowUp,
  ArrowDown,
  Clock,
  Shuffle,
  Check,
  Undo2,
  Volume2,
  Compass,
  MapPin,
  Globe,
  Navigation,
  Crosshair,
  Link2,
  Activity,
  BarChart3,
  Target,
  ShieldCheck,
  Download,
  Copy,
  FileText,
  Trophy,
  UserCheck,
  X,
  Star,
  BookmarkCheck,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  ListChecks,
  AlertCircle
} from "lucide-react";

interface MemorizeVerseItem {
  id: string;
  reference: string;
  text: string;
  category: string;
  difficulty: number;
  xp_reward: number;
  core_doctrine: string;
  audio_anchor: string;
  words: string[];
  total_words: number;
  level1_blank_indices: number[];
  level2_blank_indices: number[];
  level3_blank_indices: number[];
  mastery_stars: number;
  review_count: number;
  last_practiced: string | null;
}

interface RecordMemorizePracticeResponse {
  verse_id: string;
  stars_awarded: number;
  xp_earned: number;
  total_xp: number;
  streak: number;
  message: string;
}

interface ReadingDayItem {
  day: number;
  title: string;
  passages: string[];
  primary_book: string;
  primary_chapter: number;
  golden_verse: string;
  devotional_prompt: string;
  is_completed?: boolean;
}

interface ReadingPlanSummary {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  total_days: number;
  difficulty: string;
  icon: string;
  badge_name: string;
  recommended_for: string;
  description: string;
  completed_count: number;
  completion_percentage: number;
  current_day: number;
  streak: number;
  last_read_date: string | null;
}

interface ReadingPlanDetail extends ReadingPlanSummary {
  days: ReadingDayItem[];
}

interface ChallengePackQuestionItem {
  id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string;
  scripture_reference: string;
  points: number;
}

interface ChallengePackItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  icon_name: string;
  badge_label: string;
  description: string;
  target_doctrine: string;
  estimated_minutes: number;
  difficulty_level: string;
  total_questions: number;
  passing_score: number;
  questions: ChallengePackQuestionItem[];
}

interface FlashcardExportModalData {
  format: "anki" | "csv" | "json";
  filename: string;
  card_count: number;
  content: string;
}

interface TopicMasteryItem {
  topic_key: string;
  topic_name: string;
  icon: string;
  mastery_percentage: number;
  status: string;
  recommended_focus: string;
}

interface DueFlashcardItem {
  id: string;
  card_type: string;
  front_text: string;
  back_text: string;
  difficulty_level: number;
  interval_days: number;
  is_due: boolean;
}

interface AdaptiveAnalyticsData {
  user_identifier: string;
  total_score: number;
  daily_streak: number;
  level_title: string;
  retention_rate_pct: number;
  memory_stability_days: number;
  total_due_flashcards: number;
  total_cards_mastered: number;
  total_quizzes_completed: number;
  total_flashcards_reviewed: number;
  topic_masteries: TopicMasteryItem[];
  weakness_summary: string;
  adaptive_recommendations: string[];
  due_cards: DueFlashcardItem[];
}

interface MatchPair {
  id: string;
  left_text: string;
  left_subtext?: string;
  right_text: string;
  right_subtext?: string;
  scripture: string;
  explanation: string;
}

interface MatchChallenge {
  id: string;
  title: string;
  topic: string;
  difficulty: number;
  description: string;
  pairs: MatchPair[];
}

interface WhoAmIClue {
  order: number;
  text: string;
  difficulty_label: string;
  points: number;
}

interface WhoAmIQuestion {
  id: string;
  case_number?: number;
  codename?: string;
  era?: string;
  category?: string;
  difficulty?: number;
  clues: WhoAmIClue[];
  options: string[];
  suspect_options?: string[];
  correct_option: number;
  correct_name: string;
  character_slug: string;
  title_or_role: string;
  scripture_reference: string;
  golden_scripture_ref?: string;
  verse_text?: string;
  theological_significance?: string;
  christological_typology?: string;
  explanation: string;
  era_or_testament: string;
}

interface QuizQuestion {
  id: string;
  question_type: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation?: string;
  scripture_reference?: string;
  difficulty: number;
}

interface Flashcard {
  id: string;
  card_type: string;
  front_text: string;
  back_text: string;
  difficulty_level: number;
  repetition_count: number;
  interval_days: number;
  next_review_at: string;
}

interface UserProfile {
  user_identifier: string;
  total_score: number;
  daily_streak: number;
  level_title: string;
  total_quizzes_completed: number;
  total_flashcards_reviewed: number;
  mastery_by_topic: Record<string, number>;
}

interface FillInBlankWord {
  text: string;
  is_blank: boolean;
  blank_index?: number;
}

interface FillInBlankItem {
  id: string;
  reference: string;
  full_text: string;
  display_segments: FillInBlankWord[];
  blank_answers: string[];
  word_bank: string[];
  topic: string;
  difficulty: number;
}

interface TimelineEventItem {
  slug: string;
  title: string;
  correct_order: number;
  period: string;
  approximate_date: string;
  scripture?: string;
  description: string;
  verse_text?: string;
  theological_significance?: string;
}

interface TimelineChallenge {
  id: string;
  era_title: string;
  category: string;
  description: string;
  events: TimelineEventItem[];
  narrative_explanation: string;
  theological_summary?: string;
  xp_reward?: number;
}

interface TimelineSlotFeedback {
  slug: string;
  title: string;
  submitted_position: number;
  correct_position: number;
  is_correct_position: boolean;
  approximate_date: string;
  period: string;
  scripture?: string;
  verse_text?: string;
  theological_significance?: string;
}

interface TimelineVerifyResult {
  challenge_id: string;
  is_all_correct: boolean;
  correct_slots_count: number;
  total_slots_count: number;
  accuracy_percentage: number;
  xp_awarded: number;
  streak_bonus: number;
  feedback_slots: TimelineSlotFeedback[];
  chronological_narrative: string;
  theological_significance: string;
}


interface GeoOption {
  id: string;
  name: string;
  name_vn: string;
  latitude: number;
  longitude: number;
  svg_x: number;
  svg_y: number;
  is_correct: boolean;
}

interface GeoChallengeItem {
  id: string;
  category: string;
  question: string;
  clue: string;
  scripture_ref: string;
  verse_text: string;
  target_lat: number;
  target_lng: number;
  target_svg_x: number;
  target_svg_y: number;
  options: GeoOption[];
  archaeological_context: string;
  theological_significance: string;
  correct_option_id: string;
}

interface GeoVerifyResponse {
  is_correct: boolean;
  correct_option_id: string;
  correct_name: string;
  explanation: string;
  archaeological_context: string;
  theological_significance: string;
  xp_earned: number;
  total_xp: number;
  streak: number;
  message: string;
}

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<"quiz" | "who_am_i" | "true_false" | "match" | "adaptive" | "flashcards" | "fill_in_blank" | "timeline" | "challenge_packs" | "generator" | "memorize" | "reading_plans" | "geo">("quiz");


  // Biblical Geography & Spatial Cartography State (§3, §9, §46)
  const [geoChallenges, setGeoChallenges] = useState<GeoChallengeItem[]>([]);
  const [currentGeoIndex, setCurrentGeoIndex] = useState(0);
  const [geoCategoryFilter, setGeoCategoryFilter] = useState<string>("all");
  const [selectedGeoOption, setSelectedGeoOption] = useState<string | null>(null);
  const [geoSubmitted, setGeoSubmitted] = useState(false);
  const [geoResult, setGeoResult] = useState<GeoVerifyResponse | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoSubmitting, setGeoSubmitting] = useState(false);
  const [geoScore, setGeoScore] = useState(0);
  const [geoStreak, setGeoStreak] = useState(0);
  const [hoveredGeoPin, setHoveredGeoPin] = useState<string | null>(null);

  // Scripture Memorization State (§3, §4)
  const [memorizeVerses, setMemorizeVerses] = useState<MemorizeVerseItem[]>([]);
  const [selectedMemorizeVerse, setSelectedMemorizeVerse] = useState<MemorizeVerseItem | null>(null);
  const [memorizeCategoryFilter, setMemorizeCategoryFilter] = useState<string>("all");
  const [memorizeLevel, setMemorizeLevel] = useState<1 | 2 | 3>(1);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [userTypedWords, setUserTypedWords] = useState<Record<number, string>>({});
  const [memorizeChecked, setMemorizeChecked] = useState(false);
  const [memorizeScorePct, setMemorizeScorePct] = useState(0);
  const [memorizeResult, setMemorizeResult] = useState<RecordMemorizePracticeResponse | null>(null);
  const [loadingMemorize, setLoadingMemorize] = useState(false);
  const [memorizeSubmitting, setMemorizeSubmitting] = useState(false);
  const [speakingVerseId, setSpeakingVerseId] = useState<string | null>(null);

  // Bible Reading Plans State (§3, §46)
  const [readingPlans, setReadingPlans] = useState<ReadingPlanSummary[]>([]);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<ReadingPlanDetail | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("plan_1_year");
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingPlanDetail, setLoadingPlanDetail] = useState(false);
  const [togglingDay, setTogglingDay] = useState<number | null>(null);
  const [planFilterCategory, setPlanFilterCategory] = useState<string>("all");
  const [planSearch, setPlanSearch] = useState<string>("");

  // Challenge Packs State (§46)
  const [challengePacks, setChallengePacks] = useState<ChallengePackItem[]>([]);
  const [selectedPack, setSelectedPack] = useState<ChallengePackItem | null>(null);
  const [packAnswers, setPackAnswers] = useState<Record<string, number>>({});
  const [packSubmitted, setPackSubmitted] = useState(false);
  const [packResult, setPackResult] = useState<any>(null);
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [submittingPack, setSubmittingPack] = useState(false);

  // Flashcards Export Modal State (§4, §50)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"anki" | "csv" | "json">("anki");
  const [exportCardType, setExportCardType] = useState<string>("all");
  const [exportData, setExportData] = useState<FlashcardExportModalData | null>(null);
  const [loadingExport, setLoadingExport] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  // Adaptive Learning Analytics State (§5)
  const [adaptiveData, setAdaptiveData] = useState<AdaptiveAnalyticsData | null>(null);
  const [adaptiveLoading, setAdaptiveLoading] = useState(false);

  // Match Game Mode State (§3)
  const [matchChallenges, setMatchChallenges] = useState<MatchChallenge[]>([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchLeftItems, setMatchLeftItems] = useState<Array<{ id: string; text: string; subtext?: string }>>([]);
  const [matchRightItems, setMatchRightItems] = useState<Array<{ id: string; text: string; subtext?: string; pairId: string }>>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [mismatchEffect, setMismatchEffect] = useState(false);
  const [matchFinished, setMatchFinished] = useState(false);
  const [matchRoundScore, setMatchRoundScore] = useState(0);
  const [lastMatchedPair, setLastMatchedPair] = useState<MatchPair | null>(null);

  // User Profile Gamification State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Quiz State
  const [quizList, setQuizList] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [quizFinished, setQuizFinished] = useState(false);

  // Who Am I? State (§3)
  const [whoAmIList, setWhoAmIList] = useState<WhoAmIQuestion[]>([]);
  const [whoAmIIndex, setWhoAmIIndex] = useState(0);
  const [revealedCluesCount, setRevealedCluesCount] = useState(1);
  const [whoAmISelected, setWhoAmISelected] = useState<number | null>(null);
  const [whoAmIAnswered, setWhoAmIAnswered] = useState(false);
  const [whoAmILoading, setWhoAmILoading] = useState(false);
  const [whoAmIEraFilter, setWhoAmIEraFilter] = useState<string>("all");
  const [whoAmISolvedCases, setWhoAmISolvedCases] = useState<Set<string>>(new Set());
  const [whoAmIBriefingSpeaking, setWhoAmIBriefingSpeaking] = useState(false);
  const [whoAmIVerifyResult, setWhoAmIVerifyResult] = useState<any>(null);

  // True / False State (§3)
  const [tfQuestions, setTfQuestions] = useState<QuizQuestion[]>([]);
  const [tfIndex, setTfIndex] = useState(0);
  const [tfSelectedOption, setTfSelectedOption] = useState<number | null>(null);
  const [tfIsAnswered, setTfIsAnswered] = useState(false);
  const [tfScore, setTfScore] = useState(0);
  const [tfStreak, setTfStreak] = useState(0);
  const [tfTimer, setTfTimer] = useState(15);
  const [tfTimerActive, setTfTimerActive] = useState(false);
  const [tfFinished, setTfFinished] = useState(false);
  const [loadingTF, setLoadingTF] = useState(false);

  // Flashcards State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardFilter, setCardFilter] = useState<string>("all");
  const [reviewCount, setReviewCount] = useState(0);

  // Fill in the Blank State (§3)
  const [fibList, setFibList] = useState<FillInBlankItem[]>([]);
  const [fibIndex, setFibIndex] = useState(0);
  const [fibAnswers, setFibAnswers] = useState<Record<number, string>>({});
  const [fibLoading, setFibLoading] = useState(false);
  const [fibChecked, setFibChecked] = useState(false);
  const [fibIsCorrect, setFibIsCorrect] = useState(false);

  // Timeline Order State (§3, §6, §44, §46)
  const [timelineChallenges, setTimelineChallenges] = useState<TimelineChallenge[]>([]);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);
  const [userEventOrder, setUserEventOrder] = useState<TimelineEventItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineChecked, setTimelineChecked] = useState(false);
  const [timelineIsCorrect, setTimelineIsCorrect] = useState(false);
  const [timelineCategoryFilter, setTimelineCategoryFilter] = useState<string>("all");
  const [timelineVerifyResult, setTimelineVerifyResult] = useState<TimelineVerifyResult | null>(null);
  const [timelineVerifying, setTimelineVerifying] = useState<boolean>(false);
  const [expandedVerseSlug, setExpandedVerseSlug] = useState<string | null>(null);

  // AI Generator State
  const [genTarget, setGenTarget] = useState("Giăng 3:1-16");
  const [genType, setGenType] = useState<"quiz" | "flashcards">("quiz");
  const [genSubtype, setGenSubtype] = useState("multiple_choice");
  const [genCount, setGenCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Initial load
  useEffect(() => {
    fetchProfile();
    fetchQuiz();
    fetchWhoAmI();
    fetchFlashcards();
    fetchFib();
    fetchTimelineChallenges();
    fetchAdaptiveAnalytics();
  }, [apiUrl]);

  useEffect(() => {
    if (activeTab === "adaptive") {
      fetchAdaptiveAnalytics();
    }
    if (activeTab === "challenge_packs" && challengePacks.length === 0) {
      fetchChallengePacks();
    }
    if (activeTab === "geo" && geoChallenges.length === 0) {
      fetchGeoChallenges();
    }
  }, [activeTab]);


  // --- Biblical Geography & Spatial Cartography Handlers (§3, §9, §46) ---
  const fetchGeoChallenges = async (category?: string) => {
    setGeoLoading(true);
    setCurrentGeoIndex(0);
    setSelectedGeoOption(null);
    setGeoSubmitted(false);
    setGeoResult(null);
    try {
      let url = `${apiUrl}/api/learn/geo-challenges`;
      if (category && category !== "all") {
        url += `?category=${encodeURIComponent(category)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data: GeoChallengeItem[] = await res.json();
        setGeoChallenges(data);
      }
    } catch (err) {
      console.error("Failed to fetch geo challenges:", err);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSelectGeoOption = (optionId: string) => {
    if (geoSubmitted) return;
    setSelectedGeoOption(optionId);
  };

  const handleVerifyGeoChallenge = async () => {
    const filtered = geoCategoryFilter === "all"
      ? geoChallenges
      : geoChallenges.filter((c) => c.category === geoCategoryFilter);
    const currentQ = filtered[currentGeoIndex];
    if (!currentQ || !selectedGeoOption || geoSubmitted) return;

    setGeoSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/learn/geo-challenges/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_id: currentQ.id,
          selected_option_id: selectedGeoOption
        })
      });
      if (res.ok) {
        const data: GeoVerifyResponse = await res.json();
        setGeoResult(data);
        setGeoSubmitted(true);
        if (data.is_correct) {
          setGeoScore((prev) => prev + data.xp_earned);
          setGeoStreak((prev) => prev + 1);
        } else {
          setGeoStreak(0);
        }
        fetchProfile();
      }
    } catch (err) {
      console.error("Failed to verify geo challenge:", err);
    } finally {
      setGeoSubmitting(false);
    }
  };

  const handleNextGeoChallenge = () => {
    const filtered = geoCategoryFilter === "all"
      ? geoChallenges
      : geoChallenges.filter((c) => c.category === geoCategoryFilter);

    if (currentGeoIndex + 1 < filtered.length) {
      setCurrentGeoIndex((prev) => prev + 1);
      setSelectedGeoOption(null);
      setGeoSubmitted(false);
      setGeoResult(null);
      setHoveredGeoPin(null);
    } else {
      fetchGeoChallenges(geoCategoryFilter);
    }
  };

  // Fetch Challenge Packs (§46)
  const fetchChallengePacks = async () => {
    setLoadingPacks(true);
    try {
      const res = await fetch(`${apiUrl}/api/learn/challenge-packs`);
      if (res.ok) {
        const data = await res.json();
        setChallengePacks(data);
      }
    } catch (e) {
      console.error("Failed to load challenge packs:", e);
    } finally {
      setLoadingPacks(false);
    }
  };

  const handleSelectPack = (pack: ChallengePackItem) => {
    setSelectedPack(pack);
    setPackAnswers({});
    setPackSubmitted(false);
    setPackResult(null);
  };

  const handleSubmitPack = async (packId: string) => {
    if (!selectedPack) return;
    setSubmittingPack(true);
    try {
      const res = await fetch(`${apiUrl}/api/learn/challenge-packs/${packId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: packAnswers })
      });
      if (res.ok) {
        const data = await res.json();
        setPackResult(data);
        setPackSubmitted(true);
        if (data.passed) {
          setScore((prev) => prev + (data.correct_count * 20));
          fetchProfile();
        }
      }
    } catch (e) {
      console.error("Failed to submit pack:", e);
    } finally {
      setSubmittingPack(false);
    }
  };

  // Flashcards Export Handlers (§4, §50)
  const openExportModal = (initialFormat: "anki" | "csv" | "json" = "anki") => {
    setExportFormat(initialFormat);
    setIsExportModalOpen(true);
    loadExportData(initialFormat, exportCardType);
  };

  const loadExportData = async (fmt: "anki" | "csv" | "json", cardType: string) => {
    setLoadingExport(true);
    setCopiedExport(false);
    try {
      let url = `${apiUrl}/api/learn/flashcards/export?format=${fmt}`;
      if (cardType && cardType !== "all") {
        url += `&card_type=${encodeURIComponent(cardType)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data: FlashcardExportModalData = await res.json();
        setExportData(data);
      }
    } catch (e) {
      console.error("Failed to load export data:", e);
    } finally {
      setLoadingExport(false);
    }
  };

  const handleDownloadFile = () => {
    if (!exportData) return;
    const blob = new Blob([exportData.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyExport = () => {
    if (!exportData) return;
    navigator.clipboard.writeText(exportData.content);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  // ===========================================================================
  // Scripture Memorization Handlers (§3, §4)
  // ===========================================================================
  const fetchMemorizeVerses = async (category?: string) => {
    setLoadingMemorize(true);
    try {
      let url = `${apiUrl}/api/learn/memorize-verses`;
      const cat = category !== undefined ? category : memorizeCategoryFilter;
      if (cat && cat !== "all") {
        url += `?category=${encodeURIComponent(cat)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMemorizeVerses(data);
        if (data.length > 0 && !selectedMemorizeVerse) {
          handleSelectMemorizeVerse(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch memorize verses:", err);
    } finally {
      setLoadingMemorize(false);
    }
  };

  const handleSelectMemorizeVerse = (verse: MemorizeVerseItem) => {
    setSelectedMemorizeVerse(verse);
    setRevealedHints(new Set());
    setUserTypedWords({});
    setMemorizeChecked(false);
    setMemorizeScorePct(0);
    setMemorizeResult(null);
  };

  const handleToggleHint = (index: number) => {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSpeechSpeak = (textToSpeak: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingVerseId === id) {
      window.speechSynthesis.cancel();
      setSpeakingVerseId(null);
    } else {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(textToSpeak);
      utt.lang = "vi-VN";
      utt.rate = 0.9;
      utt.onend = () => setSpeakingVerseId(null);
      utt.onerror = () => setSpeakingVerseId(null);
      window.speechSynthesis.speak(utt);
      setSpeakingVerseId(id);
    }
  };

  const handleCheckMemorize = async () => {
    if (!selectedMemorizeVerse) return;
    setMemorizeSubmitting(true);

    const blankIndices = memorizeLevel === 1 
      ? selectedMemorizeVerse.level1_blank_indices 
      : (memorizeLevel === 2 ? selectedMemorizeVerse.level2_blank_indices : selectedMemorizeVerse.level3_blank_indices);

    let correctCount = 0;
    const totalBlanks = blankIndices.length;

    blankIndices.forEach((idx) => {
      const expected = (selectedMemorizeVerse.words[idx] || "").replace(/[.,;!?:"]/g, "").trim().toLowerCase();
      const entered = (userTypedWords[idx] || "").replace(/[.,;!?:"]/g, "").trim().toLowerCase();
      if (entered === expected) {
        correctCount++;
      }
    });

    const calculatedPct = totalBlanks > 0 ? Math.round((correctCount / totalBlanks) * 100) : 100;
    setMemorizeScorePct(calculatedPct);
    setMemorizeChecked(true);

    try {
      const res = await fetch(`${apiUrl}/api/learn/memorize-verses/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verse_id: selectedMemorizeVerse.id,
          accuracy_percent: calculatedPct,
          level_tested: memorizeLevel
        })
      });
      if (res.ok) {
        const resData: RecordMemorizePracticeResponse = await res.json();
        setMemorizeResult(resData);
        fetchProfile();
        // Update local item
        setMemorizeVerses((prev) =>
          prev.map((v) =>
            v.id === selectedMemorizeVerse.id
              ? { ...v, mastery_stars: Math.max(v.mastery_stars, resData.stars_awarded), review_count: v.review_count + 1 }
              : v
          )
        );
      }
    } catch (err) {
      console.error("Failed to record memorize practice:", err);
    } finally {
      setMemorizeSubmitting(false);
    }
  };

  // ===========================================================================
  // Bible Reading Plans Handlers (§3, §46)
  // ===========================================================================
  const fetchReadingPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch(`${apiUrl}/api/bible/reading-plans`);
      if (res.ok) {
        const data = await res.json();
        setReadingPlans(data);
        if (data.length > 0 && !selectedPlanDetail) {
          fetchPlanDetail(selectedPlanId || data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reading plans:", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchPlanDetail = async (planId: string) => {
    setLoadingPlanDetail(true);
    setSelectedPlanId(planId);
    try {
      const res = await fetch(`${apiUrl}/api/bible/reading-plans/${planId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPlanDetail(data);
      }
    } catch (err) {
      console.error("Failed to fetch reading plan detail:", err);
    } finally {
      setLoadingPlanDetail(false);
    }
  };

  const handleTogglePlanDay = async (planId: string, day: number) => {
    setTogglingDay(day);
    try {
      const res = await fetch(`${apiUrl}/api/bible/reading-plans/${planId}/toggle-day`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day })
      });
      if (res.ok) {
        const data = await res.json();
        // Update local plan detail
        setSelectedPlanDetail((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            completed_count: data.completed_count,
            completion_percentage: data.completion_percentage,
            current_day: data.current_day,
            streak: data.streak,
            days: prev.days.map((d) => (d.day === day ? { ...d, is_completed: data.is_completed } : d))
          };
        });
        // Update plans summary list
        setReadingPlans((prev) =>
          prev.map((p) =>
            p.id === planId
              ? { ...p, completed_count: data.completed_count, completion_percentage: data.completion_percentage, current_day: data.current_day, streak: data.streak }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle plan day:", err);
    } finally {
      setTogglingDay(null);
    }
  };

  // Fetch Quiz Questions
  const fetchQuiz = async (type?: string) => {
    setLoadingQuiz(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizFinished(false);

    try {
      let url = `${apiUrl}/api/learn/quiz?limit=10`;
      if (type && type !== "all") {
        url += `&question_type=${encodeURIComponent(type)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setQuizList(data);
      }
    } catch (err) {
      console.error("Failed to fetch quiz:", err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Fetch Flashcards
  const fetchFlashcards = async (type?: string) => {
    setLoadingCards(true);
    setCardIndex(0);
    setIsFlipped(false);

    try {
      let url = `${apiUrl}/api/learn/flashcards?limit=60`;
      if (type && type !== "all") {
        url += `&card_type=${encodeURIComponent(type)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFlashcards(data);
      }
    } catch (err) {
      console.error("Failed to fetch flashcards:", err);
    } finally {
      setLoadingCards(false);
    }
  };

  // Fetch User Profile
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/learn/profile`);
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  // Fetch Adaptive Learning & Spaced Repetition Analytics (§5)
  const fetchAdaptiveAnalytics = async () => {
    setAdaptiveLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/learn/adaptive-analytics`);
      if (res.ok) {
        const data = await res.json();
        setAdaptiveData(data);
      }
    } catch (err) {
      console.error("Failed to fetch adaptive analytics:", err);
    } finally {
      setAdaptiveLoading(false);
    }
  };

  // Fetch Fill in the Blank challenges
  const fetchFib = async () => {
    setFibLoading(true);
    setFibIndex(0);
    setFibAnswers({});
    setFibChecked(false);
    setFibIsCorrect(false);
    try {
      const res = await fetch(`${apiUrl}/api/learn/fill-in-blank`);
      if (res.ok) {
        const data = await res.json();
        setFibList(data);
      }
    } catch (err) {
      console.error("Failed to fetch fill in blank:", err);
    } finally {
      setFibLoading(false);
    }
  };

  // Fetch Timeline challenges with Era Filter (§3, §6, §44)
  const fetchTimelineChallenges = async (cat?: string) => {
    setTimelineLoading(true);
    setCurrentTimelineIndex(0);
    setTimelineChecked(false);
    setTimelineIsCorrect(false);
    setTimelineVerifyResult(null);
    setExpandedVerseSlug(null);
    try {
      const c = cat !== undefined ? cat : timelineCategoryFilter;
      let url = `${apiUrl}/api/learn/timeline-challenge`;
      if (c && c !== "all") {
        url += `?category=${encodeURIComponent(c)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data: TimelineChallenge[] = await res.json();
        setTimelineChallenges(data);
        if (data.length > 0) {
          setUserEventOrder(data[0].events);
        }
      }
    } catch (err) {
      console.error("Failed to fetch timeline challenges:", err);
    } finally {
      setTimelineLoading(false);
    }
  };

  // Fetch True / False Questions (§3)
  const fetchTrueFalse = async () => {
    setLoadingTF(true);
    setTfIndex(0);
    setTfSelectedOption(null);
    setTfIsAnswered(false);
    setTfFinished(false);
    setTfScore(0);
    setTfStreak(0);
    setTfTimer(15);
    setTfTimerActive(true);

    try {
      const res = await fetch(`${apiUrl}/api/learn/quiz?question_type=true_false&limit=15`);
      if (res.ok) {
        const data = await res.json();
        setTfQuestions(data);
      }
    } catch (err) {
      console.error("Failed to fetch true_false questions:", err);
    } finally {
      setLoadingTF(false);
    }
  };

  // Timer Countdown Effect for True/False Lightning Mode
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (activeTab === "true_false" && tfTimerActive && !tfIsAnswered && !tfFinished && tfQuestions.length > 0) {
      timerId = setInterval(() => {
        setTfTimer((prev) => {
          if (prev <= 1) {
            handleTfAnswer(-1); // Timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [activeTab, tfTimerActive, tfIsAnswered, tfFinished, tfQuestions.length, tfIndex]);

  // Handle True / False Answer Selection
  const handleTfAnswer = async (selected: number) => {
    if (tfIsAnswered) return;
    setTfTimerActive(false);
    setTfSelectedOption(selected);
    setTfIsAnswered(true);

    const currentQ = tfQuestions[tfIndex];
    if (!currentQ) return;

    const isCorrect = selected === currentQ.correct_option;
    if (isCorrect) {
      const timeBonus = Math.max(0, tfTimer * 5);
      const points = 100 + timeBonus;
      setTfScore((prev) => prev + points);
      setTfStreak((prev) => prev + 1);

      // Submit score to profile
      try {
        await fetch(`${apiUrl}/api/learn/profile/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ points: points, quiz_completed: false })
        });
        fetchProfile();
      } catch (err) {
        console.error("Failed to submit score:", err);
      }
    } else {
      setTfStreak(0);
    }
  };

  const handleNextTfQuestion = () => {
    if (tfIndex + 1 < tfQuestions.length) {
      setTfIndex((prev) => prev + 1);
      setTfSelectedOption(null);
      setTfIsAnswered(false);
      setTfTimer(15);
      setTfTimerActive(true);
    } else {
      setTfFinished(true);
      setTfTimerActive(false);
      fetch(`${apiUrl}/api/learn/profile/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: 50, quiz_completed: true })
      }).then(() => fetchProfile());
    }
  };

  // Helper to setup a round of match challenge with randomized right column
  const setupMatchRound = (challenge: MatchChallenge) => {
    const lefts = challenge.pairs.map((p) => ({
      id: p.id,
      text: p.left_text,
      subtext: p.left_subtext
    }));

    const rights = challenge.pairs.map((p) => ({
      id: `r-${p.id}`,
      pairId: p.id,
      text: p.right_text,
      subtext: p.right_subtext
    }));

    const shuffledRights = [...rights].sort(() => Math.random() - 0.5);

    setMatchLeftItems(lefts);
    setMatchRightItems(shuffledRights);
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setMatchedPairIds([]);
    setMismatchEffect(false);
    setMatchFinished(false);
    setLastMatchedPair(null);
  };

  // Fetch Match Challenges
  const fetchMatchChallenges = async () => {
    setMatchLoading(true);
    setMatchIndex(0);
    setMatchRoundScore(0);
    try {
      const res = await fetch(`${apiUrl}/api/learn/match-challenges`);
      if (res.ok) {
        const data: MatchChallenge[] = await res.json();
        setMatchChallenges(data);
        if (data.length > 0) {
          setupMatchRound(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch match challenges:", err);
    } finally {
      setMatchLoading(false);
    }
  };

  // Handle Match Selection
  const handleSelectLeft = (leftId: string) => {
    if (matchedPairIds.includes(leftId) || mismatchEffect) return;
    setSelectedLeftId(leftId);

    if (selectedRightId) {
      checkMatch(leftId, selectedRightId);
    }
  };

  const handleSelectRight = (rightId: string, pairId: string) => {
    if (matchedPairIds.includes(pairId) || mismatchEffect) return;
    setSelectedRightId(rightId);

    if (selectedLeftId) {
      checkMatch(selectedLeftId, rightId);
    }
  };

  const checkMatch = async (leftId: string, rightId: string) => {
    const rightItem = matchRightItems.find((r) => r.id === rightId);
    if (!rightItem) return;

    const currentChallenge = matchChallenges[matchIndex];
    const isCorrect = leftId === rightItem.pairId;

    if (isCorrect) {
      const newMatched = [...matchedPairIds, leftId];
      setMatchedPairIds(newMatched);
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setMatchRoundScore((prev) => prev + 150);

      const pairDetail = currentChallenge?.pairs.find((p) => p.id === leftId);
      if (pairDetail) {
        setLastMatchedPair(pairDetail);
      }

      if (currentChallenge && newMatched.length >= currentChallenge.pairs.length) {
        setMatchFinished(true);
        try {
          await fetch(`${apiUrl}/api/learn/profile/score`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ points: 250, quiz_completed: true })
          });
          fetchProfile();
        } catch (err) {
          console.error("Failed to submit match score:", err);
        }
      }
    } else {
      setMismatchEffect(true);
      setTimeout(() => {
        setSelectedLeftId(null);
        setSelectedRightId(null);
        setMismatchEffect(false);
      }, 700);
    }
  };

  const handleNextMatchChallenge = () => {
    if (matchIndex + 1 < matchChallenges.length) {
      const nextIdx = matchIndex + 1;
      setMatchIndex(nextIdx);
      setupMatchRound(matchChallenges[nextIdx]);
    } else {
      fetchMatchChallenges();
    }
  };

  // Handle Quiz Option Selection
  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === quizList[currentIndex].correct_option;
    if (isCorrect) {
      setScore((prev) => prev + 20);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  // Handle Next Quiz Question
  const handleNextQuiz = async () => {
    if (currentIndex + 1 < quizList.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      try {
        const correctCount = Math.round(score / 20);
        await fetch(`${apiUrl}/api/learn/quiz/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correct_count: correctCount,
            total_questions: quizList.length,
            topic: "Gospels"
          })
        });
        fetchProfile();
      } catch (err) {
        console.error("Failed to submit score:", err);
      }
    }
  };

  // Handle Flashcard SM-2 Review
  const handleReviewCard = async (rating: number) => {
    if (!flashcards[cardIndex]) return;
    const currentCardId = flashcards[cardIndex].id;

    try {
      await fetch(`${apiUrl}/api/learn/flashcards/${currentCardId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating })
      });
      setReviewCount((prev) => prev + 1);
      fetchProfile();
    } catch (err) {
      console.error("Failed to submit review:", err);
    }

    if (cardIndex + 1 < flashcards.length) {
      setCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      fetchFlashcards(cardFilter);
    }
  };


  // Keyboard Shortcuts for Flashcards SM-2 Review
  useEffect(() => {
    if (activeTab !== "flashcards" || flashcards.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (cardIndex > 0) {
          setCardIndex((prev) => prev - 1);
          setIsFlipped(false);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (cardIndex + 1 < flashcards.length) {
          setCardIndex((prev) => prev + 1);
          setIsFlipped(false);
        }
      } else if (isFlipped) {
        if (e.key === "1") {
          e.preventDefault();
          handleReviewCard(1);
        } else if (e.key === "2") {
          e.preventDefault();
          handleReviewCard(2);
        } else if (e.key === "3") {
          e.preventDefault();
          handleReviewCard(3);
        } else if (e.key === "4") {
          e.preventDefault();
          handleReviewCard(4);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, flashcards, cardIndex, isFlipped]);

  // --- Fill in the Blank Handlers ---
  const currentFib = fibList[fibIndex];

  const handleTileClick = (word: string) => {
    if (fibChecked || !currentFib) return;
    const blankCount = currentFib.blank_answers.length;
    for (let i = 0; i < blankCount; i++) {
      if (!fibAnswers[i]) {
        setFibAnswers((prev) => ({ ...prev, [i]: word }));
        break;
      }
    }
  };

  const handleRemoveFilledWord = (blankIdx: number) => {
    if (fibChecked) return;
    setFibAnswers((prev) => {
      const copy = { ...prev };
      delete copy[blankIdx];
      return copy;
    });
  };

  const handleCheckFib = async () => {
    if (!currentFib) return;
    const isAllCorrect = currentFib.blank_answers.every(
      (ans, idx) => (fibAnswers[idx] || "").trim().toLowerCase() === ans.trim().toLowerCase()
    );

    setFibIsCorrect(isAllCorrect);
    setFibChecked(true);

    if (isAllCorrect) {
      setScore((prev) => prev + 30);
      setStreak((prev) => prev + 1);
      try {
        await fetch(`${apiUrl}/api/learn/quiz/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correct_count: 1,
            total_questions: 1,
            topic: "MemoryVerses"
          })
        });
        fetchProfile();
      } catch (err) {
        console.error("Failed to submit score:", err);
      }
    }
  };

  const handleNextFib = () => {
    if (fibIndex + 1 < fibList.length) {
      setFibIndex((prev) => prev + 1);
      setFibAnswers({});
      setFibChecked(false);
      setFibIsCorrect(false);
    } else {
      fetchFib();
    }
  };

  // --- Timeline Challenge Handlers ---
  const currentTimeline = timelineChallenges[currentTimelineIndex];

  const handleMoveEvent = (idx: number, direction: "up" | "down") => {
    if (timelineChecked) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= userEventOrder.length) return;

    const reordered = [...userEventOrder];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setUserEventOrder(reordered);
  };

  const handleCheckTimeline = async () => {
    if (!currentTimeline || timelineVerifying) return;
    setTimelineVerifying(true);
    try {
      const submittedSlugs = userEventOrder.map((e) => e.slug);
      const res = await fetch(`${apiUrl}/api/learn/timeline-challenge/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_id: currentTimeline.id,
          submitted_slug_order: submittedSlugs,
          user_identifier: "local_user"
        })
      });
      if (res.ok) {
        const data: TimelineVerifyResult = await res.json();
        setTimelineVerifyResult(data);
        setTimelineChecked(true);
        setTimelineIsCorrect(data.is_all_correct);
        if (data.xp_awarded > 0) {
          setScore((prev) => prev + data.xp_awarded);
          if (data.is_all_correct) {
            setStreak((prev) => prev + 1);
          }
          fetchProfile();
        }
      }
    } catch (err) {
      console.error("Failed to verify timeline challenge:", err);
    } finally {
      setTimelineVerifying(false);
    }
  };

  const handleNextTimeline = () => {
    if (currentTimelineIndex + 1 < timelineChallenges.length) {
      const nextIdx = currentTimelineIndex + 1;
      setCurrentTimelineIndex(nextIdx);
      setUserEventOrder(timelineChallenges[nextIdx].events);
      setTimelineChecked(false);
      setTimelineIsCorrect(false);
      setTimelineVerifyResult(null);
      setExpandedVerseSlug(null);
    } else {
      fetchTimelineChallenges(timelineCategoryFilter);
    }
  };

  // --- Who Am I? Handlers (§3) ---
  const currentWhoAmI = whoAmIList[whoAmIIndex];

  const fetchWhoAmI = async () => {
    setWhoAmILoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/learn/who-am-i`);
      if (res.ok) {
        const data = await res.json();
        setWhoAmIList(data);
        setWhoAmIIndex(0);
        setRevealedCluesCount(1);
        setWhoAmISelected(null);
        setWhoAmIAnswered(false);
      }
    } catch (err) {
      console.error("Failed to load Who Am I challenges:", err);
    } finally {
      setWhoAmILoading(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "vi-VN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRevealNextClue = () => {
    if (!currentWhoAmI) return;
    if (revealedCluesCount < currentWhoAmI.clues.length) {
      const nextCount = revealedCluesCount + 1;
      setRevealedCluesCount(nextCount);
      const newlyRevealed = currentWhoAmI.clues[nextCount - 1];
      if (newlyRevealed) {
        speakText(`Gợi ý ${newlyRevealed.order}: ${newlyRevealed.text}`);
      }
    }
  };

  const toggleWhoAmIAudioBriefing = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (whoAmIBriefingSpeaking) {
      window.speechSynthesis.cancel();
      setWhoAmIBriefingSpeaking(false);
      return;
    }
    if (!currentWhoAmI) return;
    const briefingText = `${currentWhoAmI.codename || currentWhoAmI.correct_name}. Kỷ nguyên ${currentWhoAmI.era_or_testament}. ` +
      currentWhoAmI.clues.slice(0, revealedCluesCount).map(c => `Gợi ý ${c.order}: ${c.text}`).join(". ");
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(briefingText);
    utt.lang = "vi-VN";
    utt.rate = 0.92;
    utt.onend = () => setWhoAmIBriefingSpeaking(false);
    utt.onerror = () => setWhoAmIBriefingSpeaking(false);
    setWhoAmIBriefingSpeaking(true);
    window.speechSynthesis.speak(utt);
  };

  const handleSelectWhoAmIOption = async (optionIdx: number) => {
    if (whoAmIAnswered || !currentWhoAmI) return;
    setWhoAmISelected(optionIdx);
    setWhoAmIAnswered(true);

    const chosenSuspect = currentWhoAmI.options[optionIdx] || "";
    try {
      const res = await fetch(`${apiUrl}/api/learn/who-am-i/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: currentWhoAmI.id,
          chosen_suspect: chosenSuspect,
          clues_unlocked: revealedCluesCount,
          user_identifier: "local_user"
        })
      });
      if (res.ok) {
        const verifyData = await res.json();
        setWhoAmIVerifyResult(verifyData);
        if (verifyData.is_correct) {
          setScore((prev) => prev + verifyData.score_awarded);
          setStreak(verifyData.streak_days);
          setWhoAmISolvedCases((prev) => new Set(prev).add(currentWhoAmI.id));
        } else {
          setStreak(0);
        }
      } else {
        const isCorrect = optionIdx === currentWhoAmI.correct_option;
        if (isCorrect) {
          setScore((prev) => prev + (currentWhoAmI.clues[revealedCluesCount - 1]?.points || 25));
          setStreak((prev) => prev + 1);
          setWhoAmISolvedCases((prev) => new Set(prev).add(currentWhoAmI.id));
        } else {
          setStreak(0);
        }
      }
      fetchProfile();
    } catch (err) {
      console.error("Failed to verify WhoAmI:", err);
    }
  };

  const handleNextWhoAmI = () => {
    setWhoAmIVerifyResult(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setWhoAmIBriefingSpeaking(false);
    }
    if (whoAmIIndex + 1 < whoAmIList.length) {
      setWhoAmIIndex((prev) => prev + 1);
      setRevealedCluesCount(1);
      setWhoAmISelected(null);
      setWhoAmIAnswered(false);
    } else {
      setWhoAmIIndex(0);
      setRevealedCluesCount(1);
      setWhoAmISelected(null);
      setWhoAmIAnswered(false);
    }
  };

  // AI Generator Handler
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenError(null);
    setGenSuccessMsg(null);

    try {
      if (genType === "quiz") {
        const res = await fetch(`${apiUrl}/api/learn/quiz/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scripture_ref: genTarget,
            count: genCount,
            question_type: genSubtype
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Không thể tạo câu hỏi trắc nghiệm.");
        }
        const newQuestions: QuizQuestion[] = await res.json();
        setGenSuccessMsg(`Đã tạo thành công ${newQuestions.length} câu hỏi mới vào kho câu hỏi!`);
        fetchQuiz();
      } else {
        const res = await fetch(`${apiUrl}/api/learn/flashcards/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: genTarget,
            card_type: genSubtype,
            count: genCount
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Không thể tạo thẻ ghi nhớ.");
        }
        const newCards: Flashcard[] = await res.json();
        setGenSuccessMsg(`Đã tạo thành công ${newCards.length} thẻ ghi nhớ mới!`);
        fetchFlashcards();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định khi gọi AI.";
      setGenError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQ = quizList[currentIndex];
  const currentCard = flashcards[cardIndex];

  return (
    <main className="min-h-screen px-4 py-8 md:px-12 lg:px-20 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Top Header */}
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
              <GraduationCap className="w-6 h-6 text-amber-400" />
              Không Gian Học Tập &amp; Rèn Luyện (Learn Layer)
            </h1>
            <p className="text-xs text-slate-400">
              Trắc nghiệm tương tác &bull; Flashcards SM-2 &bull; Điền khuyết câu gốc &bull; Xếp trật tự niên đại &bull; AI Generator
            </p>
          </div>
        </div>

        {/* Gamified Live Score Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Award className="w-4 h-4" />
            <span>{score} Điểm</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <Flame className="w-4 h-4" />
            <span>Chuỗi: {streak}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Repeat className="w-4 h-4" />
            <span>Ôn thẻ: {reviewCount}</span>
          </div>
        </div>
      </header>

      {/* User Mastery & Gamification Banner */}
      <section className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-blue-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg shadow-amber-500/20">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Cấp độ môn đồ</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {userProfile?.total_score || 0} XP
              </span>
            </div>
            <h2 className="text-base font-bold text-white">
              {userProfile?.level_title || "Môn Đồ Bước Đầu"}
            </h2>
          </div>
        </div>

        {/* Gamified Metrics & Mastery breakdown */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="text-slate-400">Chuỗi: </span>
            <span className="font-bold text-rose-400">{userProfile?.daily_streak || 1} ngày</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Quiz: </span>
            <span className="font-bold text-white">{userProfile?.total_quizzes_completed || 0}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Repeat className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">Thẻ: </span>
            <span className="font-bold text-white">{userProfile?.total_flashcards_reviewed || 0}</span>
          </div>

          {/* Topic Mastery Progress Pills */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 pl-2 border-l border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Thành thạo:</span>
            <span className="px-2 py-0.5 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-300 font-semibold">
              Phúc Âm {userProfile?.mastery_by_topic?.Gospels || 75}%
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 font-semibold">
              Thư Tín {userProfile?.mastery_by_topic?.Pauline || 80}%
            </span>
          </div>
        </div>
      </section>

      {/* Mode Navigation Tabs (5 Game Modes §3) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs md:text-sm">
        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "quiz"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Trắc Nghiệm ABCD
        </button>

        <button
          onClick={() => {
            setActiveTab("who_am_i");
            if (whoAmIList.length === 0) fetchWhoAmI();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "who_am_i"
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <UserCheck className="w-4 h-4 text-rose-300" />
          <span>Tôi Là Ai? (Who Am I?)</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-400/20 text-rose-300 font-bold">Hot §3</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("true_false");
            if (tfQuestions.length === 0) fetchTrueFalse();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "true_false"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300 fill-amber-400" />
          <span>Đúng / Sai Phản Xạ</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/30 text-amber-200 font-bold">15s Mới §3</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("match");
            if (matchChallenges.length === 0) fetchMatchChallenges();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "match"
              ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Link2 className="w-4 h-4 text-teal-300" />
          <span>Ghép Đôi (Match)</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 font-bold">Mới §3</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("adaptive");
            fetchAdaptiveAnalytics();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "adaptive"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Activity className="w-4 h-4 text-violet-300" />
          <span>Học Thích Nghi & Ghi Nhớ</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-400/20 text-violet-300 font-bold">SM-2 §5</span>
        </button>

        <button
          onClick={() => setActiveTab("flashcards")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "flashcards"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Layers className="w-4 h-4" /> Flashcards (SM-2)
        </button>

        <button
          onClick={() => {
            setActiveTab("fill_in_blank");
            if (fibList.length === 0) fetchFib();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "fill_in_blank"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-200" />
          <span>Điền Khuyết Câu Gốc</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300">Mới §3</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("timeline");
            if (timelineChallenges.length === 0) fetchTimelineChallenges();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "timeline"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Clock className="w-4 h-4 text-purple-200" />
          <span>Sắp Xếp Niên Đại</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-400/20 text-purple-300">Mới §3</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("challenge_packs");
            if (challengePacks.length === 0) fetchChallengePacks();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "challenge_packs"
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>Gói Thử Thách (Packs)</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-400/20 text-rose-300 font-bold">Hot §46</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("memorize");
            if (memorizeVerses.length === 0) fetchMemorizeVerses();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "memorize"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Award className="w-4 h-4 text-amber-900 fill-amber-400" />
          <span>Học Thuộc Lòng (§3, §4)</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/30 text-amber-950 font-black">Mới §3, §4</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("reading_plans");
            if (readingPlans.length === 0) fetchReadingPlans();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "reading_plans"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-200" />
          <span>Lịch Đọc Kinh Thánh (§3, §46)</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold">Lộ Trình §46</span>
        </button>


        <button
          onClick={() => {
            setActiveTab("geo");
            if (geoChallenges.length === 0) fetchGeoChallenges();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "geo"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Compass className="w-4 h-4 text-cyan-300" />
          <span>Địa Lý & Không Gian (§3, §9)</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-bold">Mới §3, §9</span>
        </button>

        <button
          onClick={() => setActiveTab("generator")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "generator"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Sparkles className="w-4 h-4" /> Tạo Bộ Đề Bằng AI
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 1. QUIZ MODE                                                          */}
      {/* ===================================================================== */}
      {activeTab === "quiz" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 whitespace-nowrap">Chế độ đố:</span>
            {[
              { id: "all", label: "Tất cả thể loại" },
              { id: "multiple_choice", label: "Trắc nghiệm ABCD" },
              { id: "who_am_i", label: "Tôi Là Ai? (Who Am I)" },
              { id: "true_false", label: "Đúng / Sai" },
              { id: "verse_challenge", label: "Thử Thách Câu Gốc" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilterType(f.id);
                  fetchQuiz(f.id);
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  filterType === f.id
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loadingQuiz ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-sm">Đang nạp câu hỏi trắc nghiệm...</p>
            </div>
          ) : quizFinished ? (
            <div className="p-10 rounded-3xl glass-panel border border-slate-700 text-center flex flex-col items-center gap-5 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Award className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Hoàn Thành Bài Thi!</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Bạn đã xuất sắc ghi được <span className="text-amber-400 font-bold">{score} điểm</span>.
                </p>
              </div>
              <button
                onClick={() => fetchQuiz(filterType)}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all"
              >
                Làm Lại Bộ Đề Khác
              </button>
            </div>
          ) : currentQ ? (
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-700/60 flex flex-col gap-6">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="uppercase tracking-wider font-semibold text-amber-400">
                  Câu hỏi {currentIndex + 1} / {quizList.length}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {currentQ.question_type === "who_am_i" ? "👤 Tôi Là Ai?" : currentQ.question_type === "true_false" ? "⚖️ Đúng / Sai" : "📖 Trắc Nghiệm"}
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                {currentQ.question_text}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200";
                  if (isAnswered) {
                    if (idx === currentQ.correct_option) {
                      btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold";
                    } else if (idx === selectedOption) {
                      btnStyle = "bg-rose-950/80 border-rose-500 text-rose-200 line-through";
                    } else {
                      btnStyle = "bg-slate-900/40 border-slate-800 text-slate-500 opacity-60";
                    }
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`p-4 rounded-2xl border text-left text-sm flex items-center justify-between transition-all ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correct_option && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correct_option && (
                        <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Giải thích lời Chúa:
                    </span>
                    {currentQ.scripture_reference && (
                      <span className="text-[11px] font-medium text-blue-400">
                        📖 {currentQ.scripture_reference}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {currentQ.explanation || "Đáp án đã được đối chiếu theo văn bản Kinh Thánh chuẩn mực."}
                  </p>
                  <button
                    onClick={handleNextQuiz}
                    className="self-end mt-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>{currentIndex + 1 < quizList.length ? "Câu Kế Tiếp" : "Xem Kết Quả"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">Chưa có câu hỏi nào.</div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1.5. WHO AM I? (TÔI LÀ AI? - MULTI-CLUE CHARACTER RIDDLE §3)          */}
      {/* ===================================================================== */}
      {/* 1.2 "WHO AM I?" BIBLICAL CHARACTER MYSTERY & CLUE DEDUCTION ENGINE     */}
      {/* ===================================================================== */}
      {activeTab === "who_am_i" && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
          {/* Era Category Filter Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
              {[
                { id: "all", label: "Tất Cả (16 Hồ Sơ)" },
                { id: "old_testament", label: "📜 Cựu Ước (8)" },
                { id: "new_testament", label: "✝️ Tân Ước (8)" },
                { id: "Patriarchs & Exodus", label: "Tổ Phụ & Xuất Hành" },
                { id: "Kings & Kingdom", label: "Vương Quốc" },
                { id: "Prophets", label: "Tiên Tri" },
                { id: "Gospels & Apostles", label: "Phúc Âm & Sứ Đồ" },
                { id: "Early Church", label: "Hội Thánh Đầu Tiên" }
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setWhoAmIEraFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    whoAmIEraFilter === filter.id
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 ml-auto">
              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-800/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Đã Phá Án: {whoAmISolvedCases.size} / {whoAmIList.length}</span>
              </span>
            </div>
          </div>

          {/* Quick Case Carousel / Navigator */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs scrollbar-thin">
            {whoAmIList
              .filter(item => {
                if (whoAmIEraFilter === "all") return true;
                if (whoAmIEraFilter === "old_testament") return item.era === "old_testament";
                if (whoAmIEraFilter === "new_testament") return item.era === "new_testament";
                return item.category?.toLowerCase() === whoAmIEraFilter.toLowerCase();
              })
              .map((item) => {
                const actualIndex = whoAmIList.findIndex(x => x.id === item.id);
                const isSelected = actualIndex === whoAmIIndex;
                const isSolved = whoAmISolvedCases.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setWhoAmIIndex(actualIndex);
                      setRevealedCluesCount(1);
                      setWhoAmISelected(null);
                      setWhoAmIAnswered(false);
                      setWhoAmIVerifyResult(null);
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                        setWhoAmIBriefingSpeaking(false);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all whitespace-nowrap ${
                      isSelected
                        ? "bg-rose-950/80 border-rose-500 text-rose-200 font-bold shadow-lg shadow-rose-950/50 scale-[1.02]"
                        : isSolved
                        ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:border-emerald-600"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSolved ? "bg-emerald-500 text-slate-950" : isSelected ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"
                    }`}>
                      {isSolved ? "✓" : (item.case_number || actualIndex + 1)}
                    </span>
                    <span>{item.codename ? item.codename.split(":")[1]?.trim() || item.codename : `Hồ Sơ #${actualIndex + 1}`}</span>
                  </button>
                );
              })}
          </div>

          {whoAmILoading ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              <p className="text-sm">Đang tải hồ sơ điều tra nhân vật bí ẩn...</p>
            </div>
          ) : currentWhoAmI ? (
            <div className="flex flex-col gap-6">
              {/* Header Status Bar with Confidential Dossier Stamp */}
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800 shadow-lg">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                    HỒ SƠ MẬT #{String(currentWhoAmI.case_number || whoAmIIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold text-white">
                    {currentWhoAmI.codename || `Hồ Sơ Điều Tra: ${currentWhoAmI.correct_name}`}
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-amber-400 font-medium">{currentWhoAmI.era_or_testament}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleWhoAmIAudioBriefing}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      whoAmIBriefingSpeaking
                        ? "bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-600/40"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{whoAmIBriefingSpeaking ? "Đang Thuyết Minh..." : "Thuyết Minh Audio"}</span>
                  </button>

                  <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/40 shadow-inner">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{currentWhoAmI.clues[revealedCluesCount - 1]?.points || 25} XP</span>
                  </div>
                </div>
              </div>

              {/* Detective Case Board & Clue Deck */}
              <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-700/60 flex flex-col gap-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-2xl relative overflow-hidden">
                {/* Board Title Banner */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white tracking-wide">
                        {currentWhoAmI.codename || "Danh Tính Nhân Vật: Tôi Là Ai?"}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Đọc kỹ các manh mối được mở dần. Đoán sớm nhận điểm tối đa (+100 XP)!
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950/60 border border-rose-800/50 px-3 py-1 rounded-xl">
                      Đã mở {revealedCluesCount} / {currentWhoAmI.clues.length} Manh Mối
                    </span>
                  </div>
                </div>

                {/* Progressive Clues Deck */}
                <div className="flex flex-col gap-4">
                  {currentWhoAmI.clues.map((clue, cIdx) => {
                    const isRevealed = cIdx < revealedCluesCount;
                    return (
                      <div
                        key={clue.order || cIdx}
                        className={`p-5 rounded-2xl border transition-all ${
                          isRevealed
                            ? "bg-slate-900/90 border-slate-700/80 shadow-md"
                            : "bg-slate-950/40 border-slate-800/40 opacity-40 select-none"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isRevealed
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : "bg-slate-800 text-slate-500"
                            }`}>
                              {clue.order || cIdx + 1}
                            </span>
                            <span className={`font-bold ${isRevealed ? "text-rose-300" : "text-slate-500"}`}>
                              {clue.title || `Manh Mối ${clue.order}: ${clue.difficulty_label || ''}`}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                              Trị giá: {clue.points || clue.xp_value || 25} XP
                            </span>
                          </div>

                          {isRevealed && (
                            <button
                              type="button"
                              onClick={() => speakText(`Gợi ý ${clue.order}: ${clue.text || clue.clue_text}`)}
                              title="Nghe manh mối này"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {isRevealed ? (
                          <p className="text-sm md:text-base text-slate-200 font-serif leading-relaxed italic pl-8">
                            &ldquo;{clue.text || clue.clue_text}&rdquo;
                          </p>
                        ) : (
                          <div className="flex items-center gap-2 pl-8 py-2 text-xs text-slate-500 italic">
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Manh mối mật cấp độ {cIdx + 1} đang được niêm phong...</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Unlock Next Clue Action */}
                {!whoAmIAnswered && revealedCluesCount < currentWhoAmI.clues.length && (
                  <button
                    type="button"
                    onClick={handleRevealNextClue}
                    className="self-center px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2.5 transition-all shadow-lg hover:shadow-slate-800/50 group"
                  >
                    <Eye className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>
                      Mở Niêm Phong Manh Mối {revealedCluesCount + 1} (Điểm thưởng sẽ là {currentWhoAmI.clues[revealedCluesCount]?.points || 25} XP)
                    </span>
                  </button>
                )}

                {/* Suspect Lineup (Options) */}
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Hàng ngũ nghi can — Hãy chọn nhân vật bạn nhận diện:</span>
                    <span className="text-[11px] text-amber-400/90 font-mono">
                      Cơ hội nhận +{currentWhoAmI.clues[revealedCluesCount - 1]?.points || 25} XP
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {currentWhoAmI.options.map((opt, idx) => {
                      let btnStyle = "bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-200 hover:border-slate-700";
                      if (whoAmIAnswered) {
                        if (idx === currentWhoAmI.correct_option) {
                          btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-950/50";
                        } else if (idx === whoAmISelected) {
                          btnStyle = "bg-rose-950/80 border-rose-500 text-rose-200 line-through opacity-80";
                        } else {
                          btnStyle = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-40";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectWhoAmIOption(idx)}
                          disabled={whoAmIAnswered}
                          className={`p-4 rounded-2xl border text-left text-sm flex items-center justify-between transition-all group ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-xs font-black text-slate-300 group-hover:text-white">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-semibold tracking-wide">{opt}</span>
                          </div>
                          {whoAmIAnswered && idx === currentWhoAmI.correct_option && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-bounce" />
                          )}
                          {whoAmIAnswered && idx === whoAmISelected && idx !== currentWhoAmI.correct_option && (
                            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Post-Deduction Debrief Resolution Panel */}
                {whoAmIAnswered && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 border border-slate-700/80 flex flex-col gap-4 mt-2 animate-in fade-in zoom-in-95 shadow-xl">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className={`text-xs uppercase font-extrabold px-2.5 py-1 rounded-lg ${
                            whoAmISelected === currentWhoAmI.correct_option
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          }`}>
                            {whoAmISelected === currentWhoAmI.correct_option ? "🎉 PHÁ ÁN THÀNH CÔNG!" : "❌ CHƯA CHÍNH XÁC"}
                          </span>
                          <span className="text-xs text-amber-400 font-medium">
                            👑 {currentWhoAmI.title_or_role}
                          </span>
                        </div>
                        <h4 className="text-2xl font-black text-white tracking-wide mt-1">
                          {currentWhoAmI.correct_name}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={handleNextWhoAmI}
                        className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-600/30 hover:scale-[1.02] flex-shrink-0"
                      >
                        <span>{whoAmIIndex + 1 < whoAmIList.length ? "Hồ Sơ Tiếp Theo" : "Khởi Động Lại Từ Đầu"}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Authentic 1925 Golden Scripture Verse Box */}
                    {(currentWhoAmI.verse_text || whoAmIVerifyResult?.verse_text) && (
                      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 flex flex-col gap-1.5 shadow-inner">
                        <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Câu Gốc Định Mệnh (BTT 1925): {currentWhoAmI.golden_scripture_ref || currentWhoAmI.scripture_reference}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => speakText(currentWhoAmI.verse_text || whoAmIVerifyResult?.verse_text || "")}
                            title="Nghe câu gốc"
                            className="p-1 rounded text-amber-300 hover:text-white hover:bg-amber-900/40 transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-serif italic text-amber-100/90 leading-relaxed">
                          &ldquo;{currentWhoAmI.verse_text || whoAmIVerifyResult?.verse_text}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Christological Typology & Redemptive Lesson Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1 text-xs">
                        <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                          <span>✝️</span> Hình Bóng Đấng Christ (Typology)
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {currentWhoAmI.christological_typology || "Nhân vật biểu trưng cho sự cứu rỗi, lòng thương xót và chương trình cứu chuộc của Đấng Mê-si."}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1 text-xs">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5">
                          <span>🕊️</span> Ý Nghĩa Thần Học Cứu Chuộc
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {currentWhoAmI.theological_significance || currentWhoAmI.explanation}
                        </p>
                      </div>
                    </div>

                    {/* Links to Reader & Explore Graph */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                      <Link
                        href={`/bible?ref=${encodeURIComponent(currentWhoAmI.golden_scripture_ref || currentWhoAmI.scripture_reference)}`}
                        className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Đọc Kinh Thánh: {currentWhoAmI.golden_scripture_ref || currentWhoAmI.scripture_reference} →</span>
                      </Link>

                      <Link
                        href="/explore"
                        className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Mở trên Bản Đồ Tri Thức & Atlas →</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">Chưa có hồ sơ phá án nào.</div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1.5 TRUE / FALSE LIGHTNING CHALLENGE (§3 Phản Xạ 15s)                 */}
      {/* ===================================================================== */}
      {activeTab === "true_false" && (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
          {/* Top Status & Speedometer Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-slate-800 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Tiến trình:</span>
              <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg">
                {tfQuestions.length > 0 ? `${tfIndex + 1} / ${tfQuestions.length}` : "0 / 0"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* 15s Countdown Clock */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all ${
                  tfTimer <= 3
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse font-extrabold"
                    : tfTimer <= 7
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{tfTimer}s</span>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 font-semibold">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>{tfStreak} chuỗi</span>
              </div>

              {/* Total Score */}
              <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{tfScore} đ</span>
              </div>
            </div>
          </div>

          {loadingTF ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-sm font-medium">Đang nạp bộ câu hỏi phản xạ Đúng / Sai...</p>
            </div>
          ) : tfFinished ? (
            /* Finished Summary Card */
            <div className="p-8 md:p-12 rounded-3xl glass-panel border border-amber-500/30 text-center flex flex-col items-center gap-5 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">Thử Thách Hoàn Thành!</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Bạn đã hoàn thành chặng thi phản xạ Đúng / Sai trong thời hạn 15 giây.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-2">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Tổng điểm tích lũy</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">+{tfScore} đ</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Tổng số câu hỏi</div>
                  <div className="text-2xl font-black text-blue-400 mt-1">{tfQuestions.length} câu</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={fetchTrueFalse}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  <RotateCw className="w-4 h-4" /> Chơi Lại Vòng Mới
                </button>
                <Link
                  href="/bible"
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <BookOpen className="w-4 h-4" /> Đọc Lại Kinh Thánh
                </Link>
              </div>
            </div>
          ) : tfQuestions.length > 0 && tfQuestions[tfIndex] ? (
            /* Active Question Card */
            (() => {
              const currentQ = tfQuestions[tfIndex];
              const isCorrect = tfSelectedOption === currentQ.correct_option;

              return (
                <div className="flex flex-col gap-6">
                  {/* Timer Progress Line */}
                  <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        tfTimer <= 3 ? "bg-rose-500" : tfTimer <= 7 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${(tfTimer / 15) * 100}%` }}
                    />
                  </div>

                  {/* Statement Box */}
                  <div className="p-8 md:p-10 rounded-3xl glass-panel border border-slate-700/80 flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Khẳng Định Kinh Thánh (§3 Phản Xạ Nhanh)</span>
                    </div>

                    <p className="font-serif text-lg md:text-2xl text-slate-100 leading-relaxed max-w-2xl py-2">
                      &ldquo;{currentQ.question_text}&rdquo;
                    </p>

                    <span className="text-xs text-slate-400">
                      Hãy quyết định trong vòng 15 giây: Khẳng định trên là <strong className="text-emerald-400">ĐÚNG</strong> hay <strong className="text-rose-400">SAI</strong>?
                    </span>
                  </div>

                  {/* Dual Action Buttons: ĐÚNG vs SAI */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* BUTTON ĐÚNG (Index 0) */}
                    <button
                      type="button"
                      disabled={tfIsAnswered}
                      onClick={() => handleTfAnswer(0)}
                      className={`py-6 px-4 md:px-8 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-center gap-3 font-extrabold text-lg md:text-xl transition-all ${
                        !tfIsAnswered
                          ? "bg-emerald-950/20 border-emerald-600/40 text-emerald-300 hover:bg-emerald-600 hover:text-white hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-950/40"
                          : currentQ.correct_option === 0
                          ? "bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-500/30 scale-[1.02]"
                          : tfSelectedOption === 0
                          ? "bg-rose-600 text-white border-rose-400 ring-4 ring-rose-500/30"
                          : "bg-slate-900/40 border-slate-800 text-slate-500 opacity-50"
                      }`}
                    >
                      <CheckCircle2 className="w-7 h-7 flex-shrink-0" />
                      <span>ĐÚNG (TRUE)</span>
                    </button>

                    {/* BUTTON SAI (Index 1) */}
                    <button
                      type="button"
                      disabled={tfIsAnswered}
                      onClick={() => handleTfAnswer(1)}
                      className={`py-6 px-4 md:px-8 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-center gap-3 font-extrabold text-lg md:text-xl transition-all ${
                        !tfIsAnswered
                          ? "bg-rose-950/20 border-rose-600/40 text-rose-300 hover:bg-rose-600 hover:text-white hover:scale-[1.02] active:scale-95 shadow-lg shadow-rose-950/40"
                          : currentQ.correct_option === 1
                          ? "bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-500/30 scale-[1.02]"
                          : tfSelectedOption === 1
                          ? "bg-rose-600 text-white border-rose-400 ring-4 ring-rose-500/30"
                          : "bg-slate-900/40 border-slate-800 text-slate-500 opacity-50"
                      }`}
                    >
                      <XCircle className="w-7 h-7 flex-shrink-0" />
                      <span>SAI (FALSE)</span>
                    </button>
                  </div>

                  {/* Real-time Feedback & Scripture Reference Card */}
                  {tfIsAnswered && (
                    <div className="p-6 rounded-2xl glass-panel border border-slate-700 flex flex-col gap-4 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs uppercase font-extrabold px-3 py-1 rounded-lg ${
                              isCorrect
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : tfSelectedOption === -1
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            }`}
                          >
                            {isCorrect
                              ? `Chính Xác! +${100 + Math.max(0, tfTimer * 5)} Điểm (Tốc độ: +${tfTimer * 5}đ)`
                              : tfSelectedOption === -1
                              ? "Hết Giờ (0 Điểm)"
                              : `Chưa Đúng (Đáp án đúng là: ${currentQ.correct_option === 0 ? "ĐÚNG" : "SAI"})`}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleNextTfQuestion}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20 flex-shrink-0"
                        >
                          <span>{tfIndex + 1 < tfQuestions.length ? "Câu Tiếp Theo" : "Xem Tổng Kết"}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-sm text-slate-200 leading-relaxed font-sans pt-2 border-t border-slate-800">
                        <strong className="text-amber-300">Giải nghĩa thần học: </strong>
                        {currentQ.explanation}
                      </div>

                      {currentQ.scripture_reference && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                          <Link
                            href={`/bible?ref=${encodeURIComponent(currentQ.scripture_reference)}`}
                            className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Kinh Thánh tham chiếu: {currentQ.scripture_reference} →</span>
                          </Link>

                          <span className="text-slate-500 text-[11px]">Bản dịch Truyền Thống 1925</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="p-12 text-center text-slate-500">
              Không tìm thấy câu hỏi Đúng / Sai nào. Vui lòng thử lại.
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1.75 MATCH GAME MODE (§3 Nối Cặp / Ghép Đôi Thực Thể)                */}
      {/* ===================================================================== */}
      {activeTab === "match" && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
          {/* Header Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-slate-800 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Chủ đề:</span>
              <span className="font-bold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-xl border border-teal-500/20">
                {matchChallenges[matchIndex]?.title || "Ghép Đôi Thực Thể"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Progress Count */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 font-semibold text-slate-300">
                <Link2 className="w-3.5 h-3.5 text-teal-400" />
                <span>
                  {matchedPairIds.length} / {matchChallenges[matchIndex]?.pairs.length || 5} cặp
                </span>
              </div>

              {/* Round Score */}
              <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>+{matchRoundScore} đ</span>
              </div>
            </div>
          </div>

          {matchLoading ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
              <p className="text-sm font-medium">Đang chuẩn bị bộ thẻ ghép đôi Kinh Thánh...</p>
            </div>
          ) : matchFinished ? (
            /* Round Finished Victory Card */
            <div className="p-8 md:p-12 rounded-3xl glass-panel border border-teal-500/30 text-center flex flex-col items-center gap-5 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/40">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">Xuất Sắc! Hoàn Thành Vòng Ghép Đôi!</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-lg">
                  Bạn đã nối chính xác tất cả {matchChallenges[matchIndex]?.pairs.length || 5} cặp nhân vật và biến cố lịch sử Kinh Thánh.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-2">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Điểm thưởng vòng này</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">+{matchRoundScore + 250} đ</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Tổng số cặp hoàn thành</div>
                  <div className="text-2xl font-black text-teal-400 mt-1">
                    {matchedPairIds.length} / {matchChallenges[matchIndex]?.pairs.length || 5}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleNextMatchChallenge}
                  className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-teal-600/30"
                >
                  <span>{matchIndex + 1 < matchChallenges.length ? "Vòng Thử Thách Tiếp Theo" : "Chơi Lại Từ Đầu"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <Link
                  href="/explore"
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <Compass className="w-4 h-4" /> Mở Đồ Thị Tri Thức
                </Link>
              </div>
            </div>
          ) : matchChallenges.length > 0 && matchChallenges[matchIndex] ? (
            /* Interactive Match Game Board */
            <div className="flex flex-col gap-6">
              {/* Progress Line */}
              <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                  style={{
                    width: `${(matchedPairIds.length / (matchChallenges[matchIndex].pairs.length || 5)) * 100}%`
                  }}
                />
              </div>

              {/* Instructions */}
              <div className="text-center text-xs text-slate-400">
                Nhấp chọn một mục ở cột <strong className="text-teal-300">Bên Trái</strong>, sau đó chọn mục tương ứng ở cột <strong className="text-emerald-300">Bên Phải</strong> để ghép đôi.
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Column A: Left Items */}
                <div className="flex flex-col gap-3">
                  <div className="text-xs uppercase font-bold tracking-wider text-teal-400 px-2 flex items-center gap-1.5">
                    <span>Cột A: Thực Thể / Nhân Vật</span>
                  </div>
                  {matchLeftItems.map((item) => {
                    const isMatched = matchedPairIds.includes(item.id);
                    const isSelected = selectedLeftId === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isMatched}
                        onClick={() => handleSelectLeft(item.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                          isMatched
                            ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 cursor-default opacity-85 shadow-sm"
                            : isSelected
                            ? "bg-teal-600 text-white border-teal-300 ring-4 ring-teal-500/30 scale-[1.02] shadow-lg shadow-teal-600/30 font-semibold"
                            : mismatchEffect && isSelected
                            ? "bg-rose-900/60 border-rose-500 text-white"
                            : "bg-slate-900/80 border-slate-800 text-slate-200 hover:border-teal-500/50 hover:bg-slate-800/80"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm md:text-base">{item.text}</div>
                          {item.subtext && (
                            <div className={`text-[11px] mt-0.5 ${isSelected ? "text-teal-100" : "text-teal-400"}`}>
                              {item.subtext}
                            </div>
                          )}
                        </div>
                        {isMatched ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <div
                            className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${
                              isSelected ? "border-white bg-white" : "border-slate-600"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Column B: Right Items (Shuffled) */}
                <div className="flex flex-col gap-3">
                  <div className="text-xs uppercase font-bold tracking-wider text-emerald-400 px-2 flex items-center gap-1.5">
                    <span>Cột B: Biến Cố / Địa Danh / Câu Gốc</span>
                  </div>
                  {matchRightItems.map((item) => {
                    const isMatched = matchedPairIds.includes(item.pairId);
                    const isSelected = selectedRightId === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isMatched}
                        onClick={() => handleSelectRight(item.id, item.pairId)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                          isMatched
                            ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 cursor-default opacity-85 shadow-sm"
                            : isSelected
                            ? "bg-teal-600 text-white border-teal-300 ring-4 ring-teal-500/30 scale-[1.02] shadow-lg shadow-teal-600/30 font-semibold"
                            : mismatchEffect && isSelected
                            ? "bg-rose-900/60 border-rose-500 text-white"
                            : "bg-slate-900/80 border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800/80"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="text-xs md:text-sm font-medium leading-relaxed">{item.text}</div>
                          {item.subtext && (
                            <div className={`text-[11px] mt-0.5 font-serif italic ${isSelected ? "text-teal-100" : "text-slate-400"}`}>
                              {item.subtext}
                            </div>
                          )}
                        </div>
                        {isMatched ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <div
                            className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${
                              isSelected ? "border-white bg-white" : "border-slate-600"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Theological Explanation when Pair is Matched */}
              {lastMatchedPair && (
                <div className="p-5 rounded-2xl glass-panel border border-emerald-500/40 flex flex-col gap-2.5 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Đã ghép đúng: {lastMatchedPair.left_text} ↔ {lastMatchedPair.right_text}</span>
                    </span>
                    <Link
                      href={`/bible?ref=${encodeURIComponent(lastMatchedPair.scripture)}`}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{lastMatchedPair.scripture} →</span>
                    </Link>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans pt-1 border-t border-slate-800">
                    {lastMatchedPair.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              Không tìm thấy thử thách nối cặp nào. Vui lòng thử lại.
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* ADAPTIVE LEARNING & MEMORY MASTERY DASHBOARD (§5)                     */}
      {/* ===================================================================== */}
      {activeTab === "adaptive" && (
        <div className="flex flex-col gap-6">
          {/* Header Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-violet-950/40 via-slate-900 to-indigo-950/40 border border-violet-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 tracking-wider">
                  Adaptive Learning System • §5
                </span>
                <span className="text-xs text-slate-400">Thuật toán lặp lại ngắt quãng SM-2</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-violet-400" />
                Hệ Thống Học Thích Nghi & Bản Đồ Ghi Nhớ
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Phân tích độ ổn định của trí nhớ (Memory Stability), phát hiện điểm kiến thức còn hổng và tự động điều phối hàng đợi ôn tập cá nhân hóa nhằm đánh bại đường cong quên lãng (Forgetting Curve).
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAdaptiveAnalytics}
              disabled={adaptiveLoading}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-violet-600/20 shrink-0 self-start md:self-auto"
            >
              {adaptiveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
              <span>Làm Mới Phân Tích</span>
            </button>
          </div>

          {adaptiveLoading && !adaptiveData ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              <p className="text-xs font-semibold text-white">Đang tổng hợp dữ liệu học tập thích nghi...</p>
            </div>
          ) : adaptiveData ? (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              {/* 4 Core Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Retention Rate */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Tỷ Lệ Giữ Lại Trí Nhớ
                    </span>
                    <BrainCircuit className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{adaptiveData.retention_rate_pct}%</span>
                    <span className="text-xs text-emerald-400 font-semibold font-mono">Đạt chuẩn</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                      style={{ width: `${adaptiveData.retention_rate_pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Ước tính từ độ chính xác câu trả lời</span>
                </div>

                {/* 2. Memory Stability Days */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Độ Bền Vững Trí Nhớ
                    </span>
                    <Clock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{adaptiveData.memory_stability_days}</span>
                    <span className="text-xs text-cyan-400 font-semibold font-mono">ngày TB</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${Math.min(100, adaptiveData.memory_stability_days * 20)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Khoảng thời gian kiến thức lưu trữ tốt</span>
                </div>

                {/* 3. Due Flashcards Today */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Thẻ Cần Ôn Hôm Nay
                    </span>
                    <Target className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-300">{adaptiveData.total_due_flashcards}</span>
                    <span className="text-xs text-amber-400 font-semibold font-mono">thẻ SM-2</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("flashcards")}
                    className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                  >
                    <span>Ôn tập ngay</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* 4. Mastered Cards */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Thẻ Đã Thành Thục
                    </span>
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-violet-300">{adaptiveData.total_cards_mastered}</span>
                    <span className="text-xs text-slate-400 font-mono">/ {adaptiveData.total_flashcards_reviewed + 10} thẻ</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${Math.min(100, (adaptiveData.total_cards_mastered / 10) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Chu kỳ lặp lại $\ge$ 4 ngày</span>
                </div>
              </div>

              {/* Weakness Diagnosis Alert Banner */}
              <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-800/40 flex items-start gap-3.5 text-xs text-violet-200">
                <BarChart3 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-violet-300 text-sm">Chẩn Đoán Năng Lực & Điểm Cần Củng Cố</span>
                  <p className="text-xs text-violet-200/90 leading-relaxed font-sans">
                    {adaptiveData.weakness_summary}
                  </p>
                </div>
              </div>

              {/* Biblical Corpus Mastery Matrix (6 Divisions) */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-400" />
                      Ma Trận Độ Thành Thạo 6 Phân Vùng Kinh Thánh
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Dựa trên lịch sử làm bài & lặp lại</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {adaptiveData.topic_masteries.map((topic) => {
                    const statusColors: Record<string, { bg: string; text: string; border: string; bar: string }> = {
                      "Vững vàng": { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/30", bar: "bg-emerald-500" },
                      "Khá": { bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-500/30", bar: "bg-blue-500" },
                      "Cần củng cố": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/30", bar: "bg-amber-500" },
                      "Khởi đầu": { bg: "bg-rose-500/10", text: "text-rose-300", border: "border-rose-500/30", bar: "bg-rose-500" }
                    };
                    const sc = statusColors[topic.status] || { bg: "bg-slate-800", text: "text-slate-300", border: "border-slate-700", bar: "bg-slate-500" };

                    return (
                      <div
                        key={topic.topic_key}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-3 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-white text-xs sm:text-sm">{topic.topic_name}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{topic.recommended_focus}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${sc.bg} ${sc.text} ${sc.border}`}>
                            {topic.status}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 text-[11px]">Độ thuần thục</span>
                            <span className="font-bold text-white font-mono">{topic.mastery_percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${sc.bar} rounded-full transition-all`} style={{ width: `${topic.mastery_percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Adaptive Actionable Recommendations */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Đề Xuất Lộ Trình Ôn Tập Thông Minh Thích Ứng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {adaptiveData.adaptive_recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-amber-500/30">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed font-sans">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Due Flashcards Queue */}
              {adaptiveData.due_cards && adaptiveData.due_cards.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      Hàng Đợi Thẻ Cần Kích Hoạt Lại Trí Nhớ Hôm Nay
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("flashcards")}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      Mở giao diện lật thẻ <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {adaptiveData.due_cards.map((card) => (
                      <div
                        key={card.id}
                        className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                            {card.card_type}
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono">
                            Độ khó: {card.difficulty_level}/5
                          </span>
                        </div>
                        <p className="text-xs text-white font-medium line-clamp-2 leading-relaxed">
                          {card.front_text}
                        </p>
                        <div className="text-[11px] text-slate-400 line-clamp-2 italic pt-1.5 border-t border-slate-800/80">
                          {card.back_text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. FLASHCARDS MODE (SM-2 Spaced Repetition & 5 Canonical Types §4, §5) */}
      {/* ===================================================================== */}
      {activeTab === "flashcards" && (
        <div className="flex flex-col gap-6 items-center">
          {/* Top Filter and Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full pb-1 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
              <span className="text-slate-400 whitespace-nowrap font-medium">Lọc loại thẻ:</span>
              {[
                { id: "all", label: "Tất Cả Thể Loại", icon: "✨" },
                { id: "person", label: "Nhân Vật", icon: "👤" },
                { id: "verse", label: "Câu Gốc", icon: "📖" },
                { id: "event", label: "Biến Cố", icon: "⚡" },
                { id: "timeline", label: "Niên Đại (§4)", icon: "⏳" },
                { id: "word", label: "Căn Từ Gốc", icon: "🔤" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setCardFilter(f.id);
                    fetchFlashcards(f.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    cardFilter === f.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 border border-slate-700/50"
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => openExportModal("anki")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 font-semibold transition-all shadow-sm shrink-0"
              title="Xuất thẻ ra định dạng Anki TSV, CSV hoặc JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất Thẻ Anki / CSV / JSON (§4, §50)</span>
            </button>
          </div>

          {loadingCards ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-4 text-slate-400 w-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              <p className="text-sm">Đang tải bộ thẻ học lặp lại ngắt quãng SM-2...</p>
            </div>
          ) : currentCard ? (
            <div className="w-full max-w-2xl flex flex-col gap-5">
              {/* Card Meta Bar */}
              <div className="flex justify-between items-center text-xs text-slate-400 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">Thẻ {cardIndex + 1} / {flashcards.length}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${
                    currentCard.card_type === "person"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : currentCard.card_type === "verse"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : currentCard.card_type === "event"
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      : currentCard.card_type === "timeline"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                      : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                  }`}>
                    {currentCard.card_type === "person" && "👤 Thẻ Nhân Vật"}
                    {currentCard.card_type === "verse" && "📖 Thẻ Câu Gốc"}
                    {currentCard.card_type === "event" && "⚡ Thẻ Biến Cố"}
                    {currentCard.card_type === "timeline" && "⏳ So Sánh Niên Đại (§4)"}
                    {currentCard.card_type === "word" && "🔤 Căn Từ Ngữ Gốc"}
                    {!["person", "verse", "event", "timeline", "word"].includes(currentCard.card_type) && "✨ Thần Học"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeechSpeak(isFlipped ? currentCard.back_text : currentCard.front_text, currentCard.id);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
                    title="Nghe phát âm nội dung thẻ"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px]">{speakingVerseId === currentCard.id ? "Đang đọc..." : "Nghe"}</span>
                  </button>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-blue-400 font-mono text-[11px]">
                    Chu kỳ: {currentCard.interval_days} ngày
                  </span>
                </div>
              </div>

              {/* 3D Flip Flashcard Interactive Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`min-h-[300px] p-8 rounded-3xl cursor-pointer select-none transition-all duration-300 flex flex-col justify-between items-center text-center shadow-2xl border relative overflow-hidden group ${
                  isFlipped
                    ? "bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border-blue-500/60 shadow-blue-950/30"
                    : "bg-slate-900/90 border-slate-700/80 hover:border-blue-500/40 hover:bg-slate-850"
                }`}
              >
                {/* Decorative Top Pill */}
                <div className="flex items-center justify-between w-full text-[11px] uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-800/80 pb-3">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isFlipped ? "Mặt Sau • Lời Giải & Minh Chứng" : "Mặt Trước • Thử Thách Ghi Nhớ"}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Bấm [Space] hoặc nhấp để lật</span>
                </div>

                {/* Card Content Body */}
                <div className="my-auto py-6 w-full text-left">
                  {isFlipped ? (
                    <div className="flex flex-col gap-2.5 text-sm sm:text-base text-slate-100 font-sans leading-relaxed">
                      {currentCard.back_text.split('\n').map((line, idx) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <div key={idx} className="h-1.5" />;
                        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('⏳')) {
                          return (
                            <div key={idx} className="flex items-start gap-2 text-slate-200">
                              <span className="text-blue-400 shrink-0 mt-0.5">•</span>
                              <span className="leading-relaxed">{trimmed.replace(/^[•-⏳]s*/, '')}</span>
                            </div>
                          );
                        }
                        if (trimmed.startsWith('📖')) {
                          return (
                            <div key={idx} className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 font-serif italic my-1 leading-relaxed">
                              {trimmed}
                            </div>
                          );
                        }
                        return (
                          <p key={idx} className="leading-relaxed text-slate-300">
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-lg sm:text-xl font-bold text-white leading-relaxed font-sans">
                        {currentCard.front_text}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Flip Indicator */}
                <div className="w-full flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                  <span className="font-mono text-[10px]">Độ khó: {currentCard.difficulty_level}/5</span>
                  <span className="flex items-center gap-1.5 text-cyan-400 group-hover:text-cyan-300 font-semibold transition-colors">
                    <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>{isFlipped ? "Lật lại mặt trước" : "Lật xem đáp án"}</span>
                  </span>
                  <span className="font-mono text-[10px]">Ôn: {currentCard.repetition_count} lần</span>
                </div>
              </div>

              {/* Navigation and Flip Controls */}
              <div className="flex items-center justify-between gap-3 px-2">
                <button
                  type="button"
                  disabled={cardIndex === 0}
                  onClick={() => {
                    if (cardIndex > 0) {
                      setCardIndex((prev) => prev - 1);
                      setIsFlipped(false);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Thẻ Trước (←)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 flex items-center gap-1.5 border border-cyan-500/30 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? "Mặt Trước" : "Lật Thẻ (Space)"}</span>
                </button>

                <button
                  type="button"
                  disabled={cardIndex + 1 >= flashcards.length}
                  onClick={() => {
                    if (cardIndex + 1 < flashcards.length) {
                      setCardIndex((prev) => prev + 1);
                      setIsFlipped(false);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <span>Thẻ Sau (→)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* SM-2 Review Quality Rating Bar (Visible when card is flipped) */}
              {isFlipped && (
                <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Đánh giá mức độ ghi nhớ (Thuật toán SM-2):</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Bấm phím 1, 2, 3, hoặc 4</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleReviewCard(1)}
                      className="py-3 px-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-200 text-xs font-bold flex flex-col items-center gap-1 transition-all shadow-sm group"
                    >
                      <span className="group-hover:scale-110 transition-transform">Lại (Again)</span>
                      <span className="text-[10px] opacity-75 font-normal">Ôn lại: 1 ngày [1]</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewCard(2)}
                      className="py-3 px-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800/60 text-amber-200 text-xs font-bold flex flex-col items-center gap-1 transition-all shadow-sm group"
                    >
                      <span className="group-hover:scale-110 transition-transform">Khó (Hard)</span>
                      <span className="text-[10px] opacity-75 font-normal">Ôn lại: 2 ngày [2]</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewCard(3)}
                      className="py-3 px-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800/60 text-blue-200 text-xs font-bold flex flex-col items-center gap-1 transition-all shadow-sm group"
                    >
                      <span className="group-hover:scale-110 transition-transform">Tốt (Good)</span>
                      <span className="text-[10px] opacity-75 font-normal">Ôn lại: 4 ngày [3]</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewCard(4)}
                      className="py-3 px-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-200 text-xs font-bold flex flex-col items-center gap-1 transition-all shadow-sm group"
                    >
                      <span className="group-hover:scale-110 transition-transform">Dễ (Easy)</span>
                      <span className="text-[10px] opacity-75 font-normal">Ôn lại: 7 ngày [4]</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 rounded-3xl glass-panel text-center flex flex-col items-center gap-4 max-w-md">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Đã Hoàn Thành Phiên Ôn Tập!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tất cả các thẻ trong thể loại này đã được ôn tập theo thuật toán SM-2. Hãy quay lại vào ngày mai hoặc chọn thể loại khác để tiếp tục.
              </p>
              <button
                type="button"
                onClick={() => fetchFlashcards(cardFilter)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all"
              >
                <RotateCw className="w-4 h-4" />
                <span>Ôn Lại Bộ Thẻ Này</span>
              </button>
            </div>
          )}
        </div>
      )}{/* ===================================================================== */}
      {/* 3. FILL IN THE BLANK MODE (Điền Khuyết Câu Gốc - §3)                  */}
      {/* ===================================================================== */}
      {activeTab === "fill_in_blank" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-4 h-4" /> Scripture Memory &bull; Điền Khuyết Câu Gốc (§3)
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Thử Thách Thuộc Lòng Câu Kinh Thánh Trọng Tâm
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Nhấn chọn các từ trong ngân hàng từ vựng để điền vào các vị trí còn trống
              </p>
            </div>
            {currentFib && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-800 text-emerald-300 border border-slate-700">
                  Câu {fibIndex + 1} / {fibList.length}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {currentFib.topic}
                </span>
              </div>
            )}
          </div>

          {fibLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs text-slate-400">Đang nạp thử thách câu gốc...</p>
            </div>
          ) : currentFib ? (
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-700 flex flex-col gap-6 shadow-2xl">
              {/* Scripture Reference Title */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-base font-bold text-blue-400 flex items-center gap-1.5">
                  📖 {currentFib.reference}
                </span>
                <button
                  type="button"
                  onClick={() => setFibAnswers({})}
                  disabled={fibChecked}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Xóa hết để điền lại</span>
                </button>
              </div>

              {/* Segmented Verse Container with Blanks */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 leading-loose text-base md:text-lg font-serif text-slate-200">
                {currentFib.display_segments.map((seg, idx) => {
                  if (!seg.is_blank) {
                    return <span key={idx}>{seg.text}</span>;
                  }
                  const bIdx = seg.blank_index ?? 0;
                  const filledWord = fibAnswers[bIdx];
                  const isWrong = fibChecked && filledWord?.trim().toLowerCase() !== currentFib.blank_answers[bIdx]?.trim().toLowerCase();
                  const isRight = fibChecked && filledWord?.trim().toLowerCase() === currentFib.blank_answers[bIdx]?.trim().toLowerCase();

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRemoveFilledWord(bIdx)}
                      className={`inline-flex items-center justify-center mx-1 px-3 py-0.5 rounded-xl border text-sm font-sans font-bold transition-all ${
                        isRight
                          ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                          : isWrong
                          ? "bg-rose-950/80 border-rose-500 text-rose-200"
                          : filledWord
                          ? "bg-slate-800 border-amber-500/60 text-amber-300 shadow-md"
                          : "bg-slate-900/60 border-dashed border-slate-600 text-slate-500 min-w-[90px]"
                      }`}
                    >
                      {filledWord || `[ Ô ${bIdx + 1} ]`}
                    </button>
                  );
                })}
              </div>

              {/* Scrambled Word Bank */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ngân hàng từ ngữ (Nhấn để điền):
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {currentFib.word_bank.map((wbWord, idx) => {
                    const isUsed = Object.values(fibAnswers).includes(wbWord);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTileClick(wbWord)}
                        disabled={isUsed || fibChecked}
                        className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-bold transition-all shadow-md ${
                          isUsed
                            ? "bg-slate-900 border border-slate-800 text-slate-600 opacity-40 cursor-not-allowed"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 hover:border-amber-400 hover:scale-105"
                        }`}
                      >
                        {wbWord}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Validation & Feedback */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                {fibChecked ? (
                  <div className="flex items-center gap-2">
                    {fibIsCorrect ? (
                      <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        Chính xác tuyệt đối! (+30 XP)
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                        <XCircle className="w-5 h-5 text-rose-400" />
                        Chưa hoàn toàn chính xác, hãy xem lại các ô đỏ!
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">
                    Điền hết các ô trống rồi nhấn kiểm tra
                  </span>
                )}

                <div className="flex items-center gap-3">
                  {!fibChecked ? (
                    <button
                      type="button"
                      onClick={handleCheckFib}
                      disabled={Object.keys(fibAnswers).length < currentFib.blank_answers.length}
                      className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs md:text-sm shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      Kiểm Tra Đáp Án
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextFib}
                      className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
                    >
                      <span>{fibIndex + 1 < fibList.length ? "Câu Kế Tiếp" : "Lặp Lại Bộ Đề"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">Chưa có dữ liệu câu gốc.</div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. TIMELINE ORDER MODE (Interactive Biblical Chronology §3, §6, §44, §46) */}
      {/* ===================================================================== */}
      {activeTab === "timeline" && (
        <div className="flex flex-col gap-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4 text-purple-400 animate-spin-slow" /> Chronological Timeline &bull; Thử Thách Sắp Xếp Niên Đại (§3, §6, §44)
              </div>
              <h2 className="text-xl font-bold text-white">
                Niên Biểu Lịch Sử Cứu Chuộc &amp; Trật Tự Biến Cố
              </h2>
              <p className="text-xs text-slate-300">
                Sử dụng các phím mũi tên Lên (↑) / Xuống (↓) để tái lập trình tự thời gian chính xác từ lúc ban đầu đến khi hoàn tất.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {currentTimeline && (
                <span className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono shadow-sm">
                  Thử Thách {currentTimelineIndex + 1} / {timelineChallenges.length}
                </span>
              )}
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                <Trophy className="w-3.5 h-3.5" />
                <span>+{currentTimeline?.xp_reward || 50} XP</span>
              </div>
            </div>
          </div>

          {/* Era Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 whitespace-nowrap font-medium text-[11px]">Kỷ nguyên:</span>
            {[
              { id: "all", label: "Tất Cả (10 Màn)", icon: "✨" },
              { id: "All Eras", label: "Toàn Cảnh Cứu Rỗi", icon: "🌐" },
              { id: "Old Testament", label: "Cựu Ước & Tổ Phụ", icon: "📜" },
              { id: "Kingdom", label: "Vương Quốc Thống Nhất", icon: "👑" },
              { id: "Exile", label: "Lưu Đày & Hồi Hương", icon: "🏛️" },
              { id: "Gospels", label: "Cuộc Đời Chúa Giê-xu", icon: "✝️" },
              { id: "Early Church", label: "Hội Thánh & Khải Huyền", icon: "🕊️" }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setTimelineCategoryFilter(f.id);
                  fetchTimelineChallenges(f.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  timelineCategoryFilter === f.id
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 border border-slate-700/50"
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {timelineLoading ? (
            <div className="py-24 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-xs text-slate-400">Đang nạp dữ liệu biến cố &amp; trích xuất Lời Chúa 1925...</p>
            </div>
          ) : currentTimeline ? (
            <div className="flex flex-col gap-6">
              {/* Challenge Overview Card */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {currentTimeline.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {userEventOrder.length} Biến cố cần sắp xếp
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {currentTimeline.era_title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {currentTimeline.description}
                  </p>
                </div>

                {currentTimeline.theological_summary && (
                  <div className="shrink-0 p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs max-w-xs hidden xl:flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Trọng Tâm Cứu Chuộc:
                    </span>
                    <p className="text-[11px] leading-relaxed line-clamp-3">
                      {currentTimeline.theological_summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Reorderable Events List */}
              <div className="flex flex-col gap-3">
                {userEventOrder.map((ev, idx) => {
                  const slotFeedback = timelineVerifyResult?.feedback_slots.find(f => f.slug === ev.slug);
                  const isPosCorrect = slotFeedback ? slotFeedback.is_correct_position : false;
                  const isVerseOpen = expandedVerseSlug === ev.slug;

                  return (
                    <div
                      key={ev.slug}
                      className={`p-5 rounded-3xl border transition-all flex flex-col gap-3 shadow-md ${
                        timelineChecked
                          ? isPosCorrect
                            ? "bg-emerald-950/30 border-emerald-500/60 shadow-emerald-950/20"
                            : "bg-rose-950/20 border-rose-500/50 shadow-rose-950/20"
                          : "bg-slate-900/90 border-slate-700/80 hover:border-slate-600 hover:bg-slate-850"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          {/* Slot Position Badge */}
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold font-mono text-sm shrink-0 border ${
                            timelineChecked
                              ? isPosCorrect
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                : "bg-rose-500/20 border-rose-500/50 text-rose-300"
                              : "bg-purple-500/20 border-purple-500/40 text-purple-300"
                          }`}>
                            #{idx + 1}
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm sm:text-base font-bold text-white">
                                {ev.title}
                              </h4>
                              {timelineChecked && (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  isPosCorrect
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                }`}>
                                  {isPosCorrect ? "✓ Vị trí chuẩn" : `Sai vị trí (Đúng: #${slotFeedback?.correct_position})`}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 font-medium text-[11px]">
                                {ev.period}
                              </span>
                              {ev.scripture && (
                                <Link
                                  href={`/bible?passage=${encodeURIComponent(ev.scripture)}`}
                                  className="text-blue-400 hover:text-blue-300 font-mono text-[11px] flex items-center gap-1 hover:underline"
                                  title="Đọc câu Kinh Thánh này trong Bible Reader"
                                >
                                  <span>📖 {ev.scripture}</span>
                                </Link>
                              )}
                              {timelineChecked && ev.approximate_date && (
                                <span className="font-mono text-cyan-300 font-bold text-[11px] bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                                  ⏳ {ev.approximate_date}
                                </span>
                              )}
                            </div>

                            {ev.description && (
                              <p className="text-xs text-slate-300 leading-relaxed mt-1 font-sans">
                                {ev.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Reorder Buttons & Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {ev.verse_text && (
                            <button
                              type="button"
                              onClick={() => setExpandedVerseSlug(isVerseOpen ? null : ev.slug)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors border ${
                                isVerseOpen
                                  ? "bg-amber-600/30 border-amber-500 text-amber-200"
                                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
                              }`}
                              title="Xem trích đoạn Lời Chúa nguyên văn bản dịch 1925"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden sm:inline">{isVerseOpen ? "Ẩn Câu Gốc" : "Lời Chúa"}</span>
                            </button>
                          )}

                          <Link
                            href="/explore?tab=map"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors border border-slate-700/60 hidden sm:flex items-center gap-1 text-xs"
                            title="Xem vị trí biến cố này trên Bản Đồ Atlas Địa Lý (§9)"
                          >
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Atlas</span>
                          </Link>

                          {!timelineChecked && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveEvent(idx, "up")}
                                disabled={idx === 0}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                                title="Di chuyển lên trước trong niên biểu"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveEvent(idx, "down")}
                                disabled={idx === userEventOrder.length - 1}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                                title="Di chuyển xuống sau trong niên biểu"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expandable Authentic 1925 Verse Snippet */}
                      {isVerseOpen && ev.verse_text && (
                        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs font-serif italic leading-relaxed animate-in fade-in">
                          <span className="font-sans font-bold text-amber-400 not-italic text-[10px] block mb-1">
                            📖 Bản Dịch Truyền Thống 1925 ({ev.scripture}):
                          </span>
                          "{ev.verse_text}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Controls & Narrative Exegesis Section */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {timelineChecked && timelineVerifyResult ? (
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border ${
                        timelineIsCorrect
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : "bg-amber-500/20 border-amber-500/40 text-amber-400"
                      }`}>
                        {timelineVerifyResult.accuracy_percentage}%
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${timelineIsCorrect ? "text-emerald-400" : "text-amber-400"}`}>
                          {timelineIsCorrect
                            ? "Xuất sắc! Đúng hoàn toàn trình tự lịch sử cứu chuộc!"
                            : `Đúng ${timelineVerifyResult.correct_slots_count} / ${timelineVerifyResult.total_slots_count} vị trí biến cố`}
                        </span>
                        <span className="text-xs text-slate-400">
                          +{timelineVerifyResult.xp_awarded} XP được cộng vào tài khoản học tập
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Sắp xếp hoàn tất theo trật tự lịch sử rồi bấm kiểm tra để nhận điểm kinh nghiệm XP.
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    {!timelineChecked ? (
                      <button
                        type="button"
                        onClick={handleCheckTimeline}
                        disabled={timelineVerifying}
                        className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {timelineVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                        <span>Kiểm Tra Niên Đại (§3)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextTimeline}
                        className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                      >
                        <span>{currentTimelineIndex + 1 < timelineChallenges.length ? "Thử Thách Tiếp Theo" : "Chơi Lại Từ Đầu"}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Exegetical Narrative Flow & Audio Synthesis */}
                {timelineChecked && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 flex flex-col gap-3 mt-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-purple-400" /> Luận Đề Dòng Chảy Lịch Sử Cứu Chuộc:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSpeechSpeak(
                          `${currentTimeline.era_title}. ${currentTimeline.narrative_explanation}`,
                          currentTimeline.id
                        )}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors border border-slate-800"
                        title="Nghe thuyết minh dòng thời gian"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{speakingVerseId === currentTimeline.id ? "Đang đọc..." : "Nghe Thuyết Minh"}</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                      {currentTimeline.narrative_explanation}
                    </p>

                    {currentTimeline.theological_summary && (
                      <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 font-sans">
                        <strong className="text-purple-300">Ý nghĩa thần học giao ước:</strong> {currentTimeline.theological_summary}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 rounded-3xl glass-panel text-center text-slate-500">
              Chưa có dữ liệu niên đại theo kỷ nguyên này.
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. AI GENERATOR MODE                                                  */}
      {/* ===================================================================== */}
      {activeTab === "generator" && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-700/60 flex flex-col gap-6 max-w-2xl mx-auto w-full">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              Khởi Tạo Bài Học &amp; Câu Hỏi Bằng AI
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Sử dụng mô hình ngôn ngữ lớn Qwen 3B chạy cục bộ để tạo câu hỏi trắc nghiệm hoặc Flashcards từ bất kỳ phân đoạn Kinh Thánh nào.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Loại tài liệu cần tạo:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setGenType("quiz");
                    setGenSubtype("multiple_choice");
                  }}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    genType === "quiz"
                      ? "bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30"
                      : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" /> Câu Hỏi Trắc Nghiệm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGenType("flashcards");
                    setGenSubtype("verse");
                  }}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    genType === "flashcards"
                      ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30"
                      : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-4 h-4" /> Thẻ Ghi Nhớ (Flashcard)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {genType === "quiz" ? "Phân đoạn Kinh Thánh:" : "Chủ đề / Nhân vật / Giáo lý:"}
              </label>
              <input
                type="text"
                value={genTarget}
                onChange={(e) => setGenTarget(e.target.value)}
                placeholder={genType === "quiz" ? "Ví dụ: Giăng 3:1-16 hoặc Sáng-thế Ký 1" : "Ví dụ: Sứ đồ Phi-e-rơ hoặc Ân Điển"}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Thể loại con:</label>
                {genType === "quiz" ? (
                  <select
                    value={genSubtype}
                    onChange={(e) => setGenSubtype(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="multiple_choice">Trắc nghiệm ABCD</option>
                    <option value="who_am_i">Tôi Là Ai? (Who Am I)</option>
                    <option value="true_false">Đúng / Sai</option>
                  </select>
                ) : (
                  <select
                    value={genSubtype}
                    onChange={(e) => setGenSubtype(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="verse">Câu gốc (Verse)</option>
                    <option value="person">Nhân vật (Person)</option>
                    <option value="word">Từ ngữ gốc (Word)</option>
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Số lượng tạo (1-5):</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={genCount}
                  onChange={(e) => setGenCount(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !genTarget.trim()}
              className="mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Qwen 3B Đang Suy Nghĩ &amp; Khởi Tạo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bắt Đầu Khởi Tạo Với AI</span>
                </>
              )}
            </button>
          </form>

          {genSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{genSuccessMsg}</span>
            </div>
          )}

          {genError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{genError}</span>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 9. SPECIALIZED CHALLENGE PACKS (§46)                                 */}
      {/* ===================================================================== */}
      {activeTab === "challenge_packs" && (
        <div className="flex flex-col gap-6">
          {/* Header banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-amber-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-rose-600/30">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Học Tập Chuyên Sâu • §46</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono font-bold">
                    Thưởng +20 XP / câu đúng
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-extrabold text-white">
                  Gói Thử Thách Kinh Thánh Chuyên Đề (Challenge Packs)
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  {challengePacks.length || 8} chuyên đề khảo cứu trọng tâm &amp; mùa lễ phụng vụ • Đạt 80% để mở khóa Huy Hiệu Danh Dự cá nhân
                </p>
              </div>
            </div>

            {selectedPack && (
              <button
                onClick={() => {
                  setSelectedPack(null);
                  setPackAnswers({});
                  setPackSubmitted(false);
                  setPackResult(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Xem Tất Cả Gói</span>
              </button>
            )}
          </div>

          {loadingPacks ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              <p className="text-sm">Đang tải các gói thử thách chuyên đề...</p>
            </div>
          ) : !selectedPack ? (
            /* List of 5 Packs */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {challengePacks.map((pack) => (
                <div
                  key={pack.id}
                  className="rounded-3xl glass-panel border border-slate-800 hover:border-rose-500/50 p-6 flex flex-col justify-between gap-5 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20 group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {pack.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        ~{pack.estimated_minutes} phút
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors flex items-center gap-2">
                        {pack.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1 font-serif">
                        {pack.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Phân đoạn trọng tâm:</span>
                        <span className="text-slate-200 font-medium">{pack.target_doctrine}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Huy hiệu đạt được:</span>
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {pack.badge_label}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Quy mô &amp; Điểm qua:</span>
                        <span className="text-emerald-400 font-medium">{pack.total_questions} câu ({pack.passing_score}% để đỗ)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPack(pack)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition-all"
                  >
                    <span>Bắt Đầu Thử Thách</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Selected Pack Active Test & Grading */
            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
              {/* Active Pack Info */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                    {selectedPack.category} &bull; Độ khó: {selectedPack.difficulty_level}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {selectedPack.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedPack.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-slate-400">Đã trả lời:</div>
                  <div className="text-sm font-bold text-white font-mono">
                    {Object.keys(packAnswers).length} / {selectedPack.questions.length}
                  </div>
                </div>
              </div>

              {/* Result Banner if submitted */}
              {packSubmitted && packResult && (
                <div
                  className={`p-6 rounded-3xl border flex flex-col gap-3 shadow-xl animate-in fade-in ${
                    packResult.passed
                      ? "bg-gradient-to-br from-emerald-950/60 via-slate-900 to-emerald-950/30 border-emerald-500/50"
                      : "bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border-amber-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ${
                        packResult.passed
                          ? "bg-emerald-500 text-slate-950 shadow-emerald-500/30"
                          : "bg-amber-500 text-slate-950 shadow-amber-500/30"
                      }`}
                    >
                      {packResult.passed ? <Trophy className="w-6 h-6" /> : "📖"}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400">Kết quả đánh giá AI:</div>
                      <div className="text-xl font-extrabold text-white flex items-center gap-2">
                        <span>Đạt {packResult.score_percentage}%</span>
                        <span className="text-xs font-medium text-slate-300">
                          ({packResult.correct_count}/{packResult.total_questions} câu chuẩn xác)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans pt-1">
                    {packResult.feedback_message}
                  </p>

                  {packResult.badge_earned && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300 font-semibold">
                      <Award className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>Huy Hiệu Vinh Dự Mới Mở Khóa: &ldquo;{packResult.badge_earned}&rdquo;</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setPackAnswers({});
                        setPackSubmitted(false);
                        setPackResult(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Thử Sức Lại Gói Này</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPack(null);
                        setPackAnswers({});
                        setPackSubmitted(false);
                        setPackResult(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Chọn Gói Thử Thách Khác</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="flex flex-col gap-5">
                {selectedPack.questions.map((q, qIdx) => {
                  const chosenOpt = packAnswers[q.id];
                  const detail = packResult?.results_detail?.find((d: any) => d.question_id === q.id);

                  return (
                    <div
                      key={q.id}
                      className={`p-6 rounded-3xl glass-panel border transition-all ${
                        packSubmitted
                          ? detail?.is_correct
                            ? "border-emerald-500/60 bg-emerald-950/10"
                            : "border-rose-500/60 bg-rose-950/10"
                          : "border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-bold font-mono">
                          {qIdx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/bible?ref=${encodeURIComponent(q.scripture_reference)}`}
                            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono font-medium"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>{q.scripture_reference}</span>
                          </Link>
                          {packSubmitted && (
                            detail?.is_correct ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Đúng (+20 XP)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Chưa đúng
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm md:text-base font-bold text-white mb-4 leading-relaxed">
                        {q.question_text}
                      </h4>

                      {/* Options */}
                      <div className="grid grid-cols-1 gap-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = chosenOpt === optIdx;
                          const isCorrect = q.correct_option === optIdx;

                          let btnStyle = "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white";
                          if (packSubmitted) {
                            if (isCorrect) {
                              btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold";
                            } else if (isSelected && !isCorrect) {
                              btnStyle = "bg-rose-950/60 border-rose-500 text-rose-200";
                            } else {
                              btnStyle = "bg-slate-900/40 border-slate-800/40 text-slate-500";
                            }
                          } else if (isSelected) {
                            btnStyle = "bg-rose-950/40 border-rose-500 text-white font-semibold ring-1 ring-rose-500";
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={packSubmitted}
                              onClick={() => setPackAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                              className={`p-3.5 rounded-2xl border text-left text-xs md:text-sm flex items-center justify-between transition-all ${btnStyle}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-bold shrink-0">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {packSubmitted && isCorrect && (
                                <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                              {packSubmitted && isSelected && !isCorrect && (
                                <X className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation if submitted */}
                      {packSubmitted && (
                        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex flex-col gap-1 animate-in fade-in">
                          <span className="font-bold text-amber-300 flex items-center gap-1">
                            💡 Luận Giải Thần Học &amp; Căn Cứ:
                          </span>
                          <p className="font-serif text-slate-300">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              {!packSubmitted && (
                <div className="flex justify-end pt-2">
                  <button
                    disabled={submittingPack || Object.keys(packAnswers).length === 0}
                    onClick={() => handleSubmitPack(selectedPack.id)}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-40 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-rose-600/30 transition-all"
                  >
                    {submittingPack ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang Chấm Điểm Thử Thách...</span>
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 text-amber-300" />
                        <span>Nộp Bài Thử Thách ({Object.keys(packAnswers).length}/{selectedPack.questions.length} câu)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. SCRIPTURE MEMORIZATION TAB (§3, §4)                                */}
      {/* ===================================================================== */}
      {activeTab === "memorize" && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          {/* Header & Subtitle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Thử Thách Trí Nhớ (§3, §4)
                </span>
                <span className="text-xs text-slate-400">
                  Phương pháp Che Chữ Lũy Tiến (Word Occlusion) & Lắng Nghe
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">
                Học Thuộc Lòng Câu Kinh Thánh Nền Tảng
              </h2>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: "all", label: "Tất cả chủ đề" },
                { id: "Tình Yêu & Sự Cứu Chuộc", label: "Tình Yêu & Cứu Chuộc" },
                { id: "Sự Quan Phòng & Bình An", label: "Quan Phòng & Bình An" },
                { id: "Sức Mạnh & Sự Đắc Thắng", label: "Sức Mạnh & Đắc Thắng" },
                { id: "Ân Điển & Đức Tin", label: "Ân Điển & Đức Tin" },
                { id: "Đại Mạng Lệnh & Sứ Mạng", label: "Đại Mạng Lệnh" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setMemorizeCategoryFilter(cat.id);
                    fetchMemorizeVerses(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    memorizeCategoryFilter === cat.id
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {loadingMemorize ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-sm">Đang tải kho câu Kinh Thánh ghi nhớ...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: List of Verses (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Kho câu gốc ({memorizeVerses.length} câu)</span>
                  <span>Nhấn để chọn và luyện tập</span>
                </div>

                <div className="flex flex-col gap-3 max-h-[700px] overflow-y-auto pr-1">
                  {memorizeVerses.map((v) => {
                    const isSelected = selectedMemorizeVerse?.id === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => handleSelectMemorizeVerse(v)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 relative group ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10"
                            : "glass-panel border-slate-800 hover:border-slate-700 bg-slate-900/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                            {v.reference}
                          </span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3.5 h-3.5 ${
                                  starIdx <= v.mastery_stars
                                    ? "text-amber-400 fill-amber-400 drop-shadow"
                                    : "text-slate-700"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-amber-400/90">
                          {v.category}
                        </span>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {v.text}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                          <span>Đã ôn: {v.review_count} lần</span>
                          <span className="font-mono text-amber-400 font-bold">+{v.xp_reward} XP</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Memorization Playground (7 cols) */}
              <div className="lg:col-span-7">
                {selectedMemorizeVerse ? (
                  <div className="rounded-3xl glass-panel border border-slate-700 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {selectedMemorizeVerse.core_doctrine}
                          </span>
                          <span className="text-xs text-slate-400">
                            Cấp độ: {selectedMemorizeVerse.difficulty === 1 ? "Căn Bản" : selectedMemorizeVerse.difficulty === 2 ? "Trung Bình" : "Thử Thách Cao"}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-white">
                          {selectedMemorizeVerse.reference}
                        </h3>
                      </div>

                      {/* TTS Audio Narration Button */}
                      <button
                        onClick={() => handleSpeechSpeak(selectedMemorizeVerse.text, selectedMemorizeVerse.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                          speakingVerseId === selectedMemorizeVerse.id
                            ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 animate-pulse font-bold"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                        }`}
                      >
                        <Volume2 className="w-4 h-4 text-amber-300" />
                        <span>{speakingVerseId === selectedMemorizeVerse.id ? "Đang Đọc Mẫu..." : "Nghe Đọc Mẫu"}</span>
                      </button>
                    </div>

                    {/* Occlusion Level Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                      <span className="text-slate-400 font-medium">Chế độ che chữ (Occlusion):</span>
                      <div className="flex items-center gap-1.5">
                        {[
                          { lvl: 1 as const, label: "Mức 1 (Ẩn 25%)", desc: "Dễ" },
                          { lvl: 2 as const, label: "Mức 2 (Ẩn 50%)", desc: "Vừa" },
                          { lvl: 3 as const, label: "Mức 3 (Ẩn 100%)", desc: "Khó" }
                        ].map((item) => (
                          <button
                            key={item.lvl}
                            onClick={() => {
                              setMemorizeLevel(item.lvl);
                              setRevealedHints(new Set());
                              setMemorizeChecked(false);
                              setMemorizeResult(null);
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                              memorizeLevel === item.lvl
                                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Word Occlusion Interactive Canvas */}
                    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap gap-2.5 items-center leading-loose select-none">
                      {selectedMemorizeVerse.words.map((word, wIdx) => {
                        const isBlank = memorizeLevel === 1 
                          ? selectedMemorizeVerse.level1_blank_indices.includes(wIdx)
                          : (memorizeLevel === 2 
                              ? selectedMemorizeVerse.level2_blank_indices.includes(wIdx)
                              : selectedMemorizeVerse.level3_blank_indices.includes(wIdx));

                        if (!isBlank) {
                          return (
                            <span key={wIdx} className="text-base text-slate-200 font-serif">
                              {word}
                            </span>
                          );
                        }

                        const cleanWord = word.replace(/[.,;!?:"]/g, "");
                        const punctuation = word.slice(cleanWord.length);
                        const isHintRevealed = revealedHints.has(wIdx);
                        const typed = userTypedWords[wIdx] || "";
                        const isCorrect = typed.trim().toLowerCase() === cleanWord.toLowerCase();

                        return (
                          <div key={wIdx} className="inline-flex items-center gap-1 relative my-1">
                            <div className="relative">
                              <input
                                type="text"
                                value={typed}
                                placeholder={isHintRevealed ? cleanWord.slice(0, 2) + "..." : "______"}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setUserTypedWords((prev) => ({ ...prev, [wIdx]: val }));
                                }}
                                className={`w-28 sm:w-32 px-2.5 py-1 text-xs text-center rounded-lg border font-mono transition-all outline-none ${
                                  memorizeChecked
                                    ? isCorrect
                                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold"
                                      : "bg-rose-950/60 border-rose-500 text-rose-300 font-bold"
                                    : "bg-slate-950 border-slate-700 text-amber-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                                }`}
                              />
                              {/* Clickable hint icon */}
                              <button
                                type="button"
                                title="Xem gợi ý chữ cái đầu"
                                onClick={() => handleToggleHint(wIdx)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 p-0.5"
                              >
                                {isHintRevealed ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3" />}
                              </button>
                            </div>
                            {punctuation && <span className="text-slate-400 font-serif">{punctuation}</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Result Banner if Checked */}
                    {memorizeChecked && (
                      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200 ${
                        memorizeScorePct >= 80 
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200" 
                          : "bg-amber-950/40 border-amber-500/40 text-amber-200"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-6 h-6 ${
                                  memorizeResult && s <= memorizeResult.stars_awarded
                                    ? "text-amber-400 fill-amber-400 drop-shadow-md animate-bounce"
                                    : "text-slate-700"
                                }`}
                              />
                            ))}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white">
                              Độ chính xác: {memorizeScorePct}%
                            </h4>
                            <p className="text-xs text-slate-300">
                              {memorizeResult?.message || "Hoàn thành phiên luyện tập!"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setUserTypedWords({});
                              setRevealedHints(new Set());
                              setMemorizeChecked(false);
                              setMemorizeResult(null);
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Luyện Lại</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <div className="text-xs text-slate-400">
                        Mẹo: Nhấn vào biểu tượng con mắt để xem chữ cái gợi ý đầu tiên.
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setUserTypedWords({});
                            setRevealedHints(new Set());
                            setMemorizeChecked(false);
                            setMemorizeResult(null);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                        >
                          Xóa Trắng
                        </button>

                        <button
                          type="button"
                          disabled={memorizeSubmitting}
                          onClick={handleCheckMemorize}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                        >
                          {memorizeSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Đang Đánh Giá...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-slate-950" />
                              <span>Kiểm Tra Hoàn Thành</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-16 rounded-3xl glass-panel text-center text-slate-500 text-sm">
                    Hãy chọn một câu Kinh Thánh ở cột bên trái để bắt đầu luyện trí nhớ.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 9. BIBLE READING PLANS TAB (§3, §46)                                  */}
      {/* ===================================================================== */}
      {activeTab === "reading_plans" && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Lộ Trình Đọc Có Hướng Dẫn (§3, §46)
                </span>
                <span className="text-xs text-slate-400">
                  Kỷ Luật Tâm Linh & Theo Dõi Tiến Độ Hằng Ngày
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">
                Kế Hoạch Đọc Kinh Thánh
              </h2>
            </div>

            {/* Plan Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: "all", label: "Tất cả kế hoạch" },
                { id: "Mùa Lễ & Phụng Vụ", label: "Mùa Lễ & Phụng Vụ" },
                { id: "Lịch Sử & Giáo Lý", label: "Lịch Sử & Giáo Lý" },
                { id: "Toàn Kinh Thánh", label: "Toàn Kinh Thánh" },
                { id: "Tân Ước", label: "Tân Ước" },
                { id: "Khôn Ngoan & Thơ Ca", label: "Khôn Ngoan & Thi Ca" },
                { id: "Phúc Âm & Biên Niên", label: "Phúc Âm" },
                { id: "Thư Tín & Giáo Lý", label: "Thư Tín" }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setPlanFilterCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    planFilterCategory === c.id
                      ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {loadingPlans ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm">Đang tải các kế hoạch đọc Kinh Thánh...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Plan Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {readingPlans
                  .filter((p) => planFilterCategory === "all" || p.category === planFilterCategory)
                  .map((plan) => {
                    const isSelected = selectedPlanDetail?.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => fetchPlanDetail(plan.id)}
                        className={`p-6 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between gap-5 relative group ${
                          isSelected
                            ? "bg-emerald-950/20 border-emerald-500/60 shadow-xl shadow-emerald-950/30"
                            : "glass-panel border-slate-800 hover:border-slate-700 bg-slate-900/40"
                        }`}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              {plan.category}
                            </span>
                            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{plan.total_days} ngày</span>
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                            {plan.title}
                          </h3>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {plan.description}
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex flex-col gap-2 pt-3 border-t border-slate-800">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">Tiến độ: {plan.completed_count}/{plan.total_days} ngày</span>
                            <span className="text-emerald-400 font-bold font-mono">{plan.completion_percentage}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                              style={{ width: `${plan.completion_percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Selected Plan Details & Day-by-Day Checklist */}
              {selectedPlanDetail && (
                <div className="rounded-3xl glass-panel border border-slate-700 p-6 sm:p-8 flex flex-col gap-8 shadow-2xl">
                  {/* Plan Headline */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {selectedPlanDetail.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          Mục tiêu: {selectedPlanDetail.recommended_for}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white">
                        {selectedPlanDetail.title}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {selectedPlanDetail.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400">Chuỗi chuyên cần</span>
                        <span className="text-lg font-black text-amber-400 flex items-center gap-1">
                          <Flame className="w-4 h-4 fill-amber-400" />
                          <span>{selectedPlanDetail.streak} ngày</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Today Card (Highlighted Prompt) */}
                  {(() => {
                    const todayDayNum = selectedPlanDetail.current_day || 1;
                    const todayDayInfo = selectedPlanDetail.days.find((d) => d.day === todayDayNum) || selectedPlanDetail.days[0];
                    if (!todayDayInfo) return null;

                    return (
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-500/40 flex flex-col gap-4 shadow-xl">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20">
                            Phân Đoạn Đọc Hôm Nay (Ngày {todayDayInfo.day})
                          </span>
                          <span className="text-xs font-semibold text-emerald-300">
                            {todayDayInfo.is_completed ? "✔ Đã đọc xong" : "Chưa hoàn thành"}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <h4 className="text-xl font-extrabold text-white">
                            {todayDayInfo.title}
                          </h4>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {todayDayInfo.passages.map((ps, pIdx) => (
                              <span key={pIdx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-emerald-300 font-mono font-medium">
                                📖 {ps}
                              </span>
                            ))}
                          </div>
                        </div>

                        {todayDayInfo.golden_verse && (
                          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs italic text-slate-300 font-serif">
                            "{todayDayInfo.golden_verse}"
                          </div>
                        )}

                        {todayDayInfo.devotional_prompt && (
                          <p className="text-xs text-slate-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span><strong>Suy ngẫm:</strong> {todayDayInfo.devotional_prompt}</span>
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 flex-wrap gap-3">
                          <Link
                            href={`/bible?book=${todayDayInfo.primary_book}&chapter=${todayDayInfo.primary_chapter}`}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Mở Trong Trình Đọc Kinh Thánh (1-Click)</span>
                          </Link>

                          <button
                            type="button"
                            disabled={togglingDay === todayDayInfo.day}
                            onClick={() => handleTogglePlanDay(selectedPlanDetail.id, todayDayInfo.day)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                              todayDayInfo.is_completed
                                ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                                : "bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500/30"
                            }`}
                          >
                            {togglingDay === todayDayInfo.day ? (
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                            ) : todayDayInfo.is_completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-emerald-400" />
                            )}
                            <span>{todayDayInfo.is_completed ? "Đánh dấu Chưa Hoàn Thành" : "Đánh Dấu Đã Đọc Xong"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Day-by-Day Grid Checklist */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-emerald-400" />
                        <span>Danh Sách Lộ Trình Từng Ngày ({selectedPlanDetail.days.length} ngày)</span>
                      </h4>

                      <input
                        type="text"
                        placeholder="Tìm kiếm phân đoạn hoặc ngày..."
                        value={planSearch}
                        onChange={(e) => setPlanSearch(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-500 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
                      {selectedPlanDetail.days
                        .filter((d) => {
                          if (!planSearch) return true;
                          const s = planSearch.toLowerCase();
                          return (
                            d.title.toLowerCase().includes(s) ||
                            d.day.toString() === s ||
                            d.passages.some((p) => p.toLowerCase().includes(s))
                          );
                        })
                        .map((dayItem) => {
                          const isCurrent = selectedPlanDetail.current_day === dayItem.day;
                          return (
                            <div
                              key={dayItem.day}
                              className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all ${
                                dayItem.is_completed
                                  ? "bg-emerald-950/20 border-emerald-800/40"
                                  : isCurrent
                                  ? "bg-slate-900 border-amber-500/50 shadow-md shadow-amber-500/10"
                                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-bold ${isCurrent ? "text-amber-400" : "text-slate-300"}`}>
                                  Ngày {dayItem.day}
                                </span>
                                <button
                                  type="button"
                                  disabled={togglingDay === dayItem.day}
                                  onClick={() => handleTogglePlanDay(selectedPlanDetail.id, dayItem.day)}
                                  className="text-slate-400 hover:text-emerald-400 transition-colors p-0.5"
                                >
                                  {dayItem.is_completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <div className="w-4 h-4 rounded border border-slate-600 hover:border-emerald-400" />
                                  )}
                                </button>
                              </div>

                              <p className="text-xs text-slate-300 line-clamp-1 font-medium">
                                {dayItem.title}
                              </p>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                                <span className="text-emerald-400 truncate max-w-[70%] font-mono">
                                  {dayItem.passages[0] || ""}
                                </span>
                                <Link
                                  href={`/bible?book=${dayItem.primary_book}&chapter=${dayItem.primary_chapter}`}
                                  className="text-slate-400 hover:text-white font-semibold flex items-center gap-0.5"
                                >
                                  <span>Đọc</span>
                                  <ChevronRight className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {/* ===================================================================== */}
      {/* 13. BIBLICAL GEOGRAPHY & SPATIAL CARTOGRAPHY CHALLENGE (§3, §9, §46)   */}
      {/* ===================================================================== */}
      {activeTab === "geo" && (() => {
        const filteredList = geoCategoryFilter === "all"
          ? geoChallenges
          : geoChallenges.filter((c) => c.category === geoCategoryFilter);
        const currentQ = filteredList[currentGeoIndex];
        const selectedOpt = currentQ?.options.find((o) => o.id === selectedGeoOption);
        const correctOpt = currentQ?.options.find((o) => o.id === currentQ.correct_option_id);

        return (
          <div className="flex flex-col gap-6">
            {/* Top Control Bar: Category Filters & Gamification Readouts */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border border-cyan-500/20 bg-slate-900/60">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" /> Thời kỳ:
                </span>
                {[
                  { id: "all", label: "Tất Cả Niên Đại" },
                  { id: "Patriarchs", label: "Thời Kỳ Tổ Phụ" },
                  { id: "Exodus", label: "Hành Trình Xuất Hành" },
                  { id: "Kingdom", label: "Thời Kỳ Vương Quốc" },
                  { id: "Exile", label: "Lưu Đày & Hồi Hương" },
                  { id: "Gospels", label: "Thời Kỳ Tin Lành" },
                  { id: "Apostles", label: "Thời Kỳ Các Sứ Đồ" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setGeoCategoryFilter(cat.id);
                      setCurrentGeoIndex(0);
                      setSelectedGeoOption(null);
                      setGeoSubmitted(false);
                      setGeoResult(null);
                      fetchGeoChallenges(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      geoCategoryFilter === cat.id
                        ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Badges: Score, Streak, Question Index */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>+{geoScore} XP</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
                  <Flame className={`w-4 h-4 text-rose-400 ${geoStreak > 0 ? "animate-pulse" : ""}`} />
                  <span>{geoStreak} Chuỗi</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
                  {filteredList.length > 0 ? `${currentGeoIndex + 1} / ${filteredList.length}` : "0 / 0"}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            {geoLoading ? (
              <div className="p-20 rounded-3xl glass-panel flex flex-col items-center justify-center gap-4 text-slate-400 border border-slate-800">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
                <p className="text-sm">Đang tải bản đồ tọa độ và dữ liệu địa lý cổ...</p>
              </div>
            ) : !currentQ ? (
              <div className="p-16 rounded-3xl glass-panel border border-slate-800 text-center flex flex-col items-center gap-4">
                <Compass className="w-12 h-12 text-slate-600" />
                <h3 className="text-lg font-bold text-white">Không Có Thử Thách Cho Thời Kỳ Này</h3>
                <p className="text-sm text-slate-400 max-w-md">Vui lòng chọn thời kỳ khác hoặc bấm "Tất Cả Niên Đại" để tiếp tục trải nghiệm.</p>
                <button
                  onClick={() => {
                    setGeoCategoryFilter("all");
                    fetchGeoChallenges("all");
                  }}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                >
                  Tất Cả Niên Đại
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN (lg:col-span-7): Interactive SVG Vector Biblical Map */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-2xl">
                    {/* SVG Map Canvas */}
                    <svg
                      viewBox="0 0 900 600"
                      className="w-full h-auto max-h-[620px] bg-slate-950 select-none block"
                      style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.7))" }}
                    >
                      <defs>
                        {/* Map Grid Pattern */}
                        <pattern id="ancientGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2 4" />
                        </pattern>

                        {/* Radial Illumination */}
                        <radialGradient id="centerGlow" cx="50%" cy="50%" r="60%">
                          <stop offset="0%" stopColor="#082f49" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
                        </radialGradient>

                        {/* Pin Shadows & Glow Filters */}
                        <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#06b6d4" floodOpacity="0.8" />
                        </filter>
                        <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#10b981" floodOpacity="0.9" />
                        </filter>
                        <filter id="glowRose" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f43f5e" floodOpacity="0.8" />
                        </filter>
                      </defs>

                      {/* Deep Background Canvas */}
                      <rect width="900" height="600" fill="#030712" />
                      <rect width="900" height="600" fill="url(#centerGlow)" />
                      <rect width="900" height="600" fill="url(#ancientGrid)" opacity="0.7" />

                      {/* Topographical / Water Bodies */}
                      {/* 1. Mediterranean Sea (Biển Địa Trung Hải / Biển Lớn) */}
                      <path
                        d="M 0,0 L 340,0 Q 300,120 270,200 Q 230,280 270,360 Q 310,410 380,450 L 0,450 Z"
                        fill="#0c2340"
                        fillOpacity="0.65"
                        stroke="#1e3a5f"
                        strokeWidth="1.5"
                      />
                      <text x="70" y="210" fill="#38bdf8" fontSize="13" fontWeight="bold" letterSpacing="4" opacity="0.35" transform="rotate(-30 70 210)">
                        BIỂN ĐỊA TRUNG HẢI (BIỂN LỚN)
                      </text>

                      {/* 2. Sea of Galilee (Biển Hồ Ga-li-lê / Ti-bê-ri-át) */}
                      <ellipse cx="450" cy="165" rx="14" ry="20" fill="#0284c7" fillOpacity="0.6" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="472" y="168" fill="#7dd3fc" fontSize="10" fontWeight="bold" opacity="0.8">
                        Hồ Ga-li-lê
                      </text>

                      {/* 3. Dead Sea (Biển Chết / Biển Muối) */}
                      <ellipse cx="456" cy="340" rx="15" ry="48" fill="#0369a1" fillOpacity="0.65" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="478" y="345" fill="#7dd3fc" fontSize="10" fontWeight="bold" opacity="0.8">
                        Biển Chết (Biển Muối)
                      </text>

                      {/* 4. Jordan River (Sông Giô-đanh) */}
                      <path
                        d="M 450,185 Q 448,225 453,255 Q 449,275 455,292"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                      <text x="408" y="240" fill="#38bdf8" fontSize="9" fontStyle="italic" opacity="0.7">
                        S. Giô-đanh
                      </text>

                      {/* 5. Gulf of Suez & Gulf of Aqaba (Bán Đảo Si-na-i) */}
                      <path
                        d="M 320,600 L 335,500 Q 345,475 365,510 L 380,600 Z"
                        fill="#0c2340"
                        fillOpacity="0.5"
                        stroke="#1e3a5f"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M 445,600 L 452,525 Q 458,505 466,525 L 475,600 Z"
                        fill="#0c2340"
                        fillOpacity="0.5"
                        stroke="#1e3a5f"
                        strokeWidth="1.2"
                      />
                      <text x="365" y="585" fill="#7dd3fc" fontSize="10" letterSpacing="2" opacity="0.5">
                        BÁN ĐẢO SI-NA-I
                      </text>

                      {/* Regional Watermark Labels */}
                      <text x="420" y="275" fill="#94a3b8" fontSize="11" fontWeight="bold" letterSpacing="3" opacity="0.3">
                        XỨ CANAAN / ISRAEL
                      </text>
                      <text x="140" y="515" fill="#94a3b8" fontSize="11" fontWeight="bold" letterSpacing="3" opacity="0.3">
                        AI CẬP (GOSHEN)
                      </text>
                      <text x="710" y="140" fill="#94a3b8" fontSize="11" fontWeight="bold" letterSpacing="3" opacity="0.3">
                        LƯỠNG HÀ (MESOPOTAMIA)
                      </text>
                      <text x="730" y="380" fill="#94a3b8" fontSize="11" fontWeight="bold" letterSpacing="3" opacity="0.3">
                        BABYLON & UR
                      </text>
                      <text x="530" y="90" fill="#94a3b8" fontSize="11" fontWeight="bold" letterSpacing="3" opacity="0.3">
                        SYRIA & DAMASCUS
                      </text>
                      <text x="250" y="65" fill="#94a3b8" fontSize="11" fontWeight="bold" letterSpacing="3" opacity="0.3">
                        TIỂU Á (ASIA MINOR)
                      </text>

                      {/* Coordinate Lat/Lng Lines */}
                      <text x="865" y="100" fill="#475569" fontSize="9" fontFamily="monospace">36°N</text>
                      <text x="865" y="250" fill="#475569" fontSize="9" fontFamily="monospace">33°N</text>
                      <text x="865" y="420" fill="#475569" fontSize="9" fontFamily="monospace">30°N</text>
                      <text x="865" y="570" fill="#475569" fontSize="9" fontFamily="monospace">27°N</text>

                      {/* Compass Rose (Hoa Tiêu Hướng Bắc) at Top Right */}
                      <g transform="translate(820, 60)" opacity="0.75">
                        <circle cx="0" cy="0" r="24" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" />
                        <polygon points="0,-22 5,-5 22,0 5,5 0,22 -5,5 -22,0 -5,-5" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.8" />
                        <polygon points="0,-22 4,-5 0,0" fill="#38bdf8" />
                        <text x="0" y="-26" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">N</text>
                      </g>

                      {/* Trajectory / Connection Arc if Submitted and Incorrect */}
                      {geoSubmitted && selectedOpt && !selectedOpt.is_correct && correctOpt && (
                        <g>
                          <line
                            x1={selectedOpt.svg_x}
                            y1={selectedOpt.svg_y}
                            x2={correctOpt.svg_x}
                            y2={correctOpt.svg_y}
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                            strokeDasharray="5 5"
                            opacity="0.8"
                          />
                        </g>
                      )}

                      {/* Interactive Option Pins */}
                      {currentQ.options.map((opt, idx) => {
                        const optLetter = ["A", "B", "C", "D"][idx] || "?";
                        const isSelected = selectedGeoOption === opt.id;
                        const isHovered = hoveredGeoPin === opt.id;
                        const isCorrectPin = opt.is_correct;

                        let ringColor = isSelected ? "#06b6d4" : isHovered ? "#38bdf8" : "#64748b";
                        let innerFill = isSelected ? "#083344" : "#1e293b";
                        let textColor = isSelected ? "#e0f2fe" : "#cbd5e1";
                        let filterAttr = isSelected ? "url(#glowCyan)" : undefined;

                        if (geoSubmitted) {
                          if (isCorrectPin) {
                            ringColor = "#10b981";
                            innerFill = "#064e3b";
                            textColor = "#ecfdf5";
                            filterAttr = "url(#glowGreen)";
                          } else if (isSelected && !isCorrectPin) {
                            ringColor = "#f43f5e";
                            innerFill = "#881337";
                            textColor = "#ffe4e6";
                            filterAttr = "url(#glowRose)";
                          } else {
                            ringColor = "#475569";
                            innerFill = "#0f172a";
                            textColor = "#64748b";
                            filterAttr = undefined;
                          }
                        }

                        return (
                          <g
                            key={opt.id}
                            className="cursor-pointer transition-all duration-300"
                            onClick={() => handleSelectGeoOption(opt.id)}
                            onMouseEnter={() => setHoveredGeoPin(opt.id)}
                            onMouseLeave={() => setHoveredGeoPin(null)}
                          >
                            {/* Pulse Wave on Selected Pin */}
                            {isSelected && !geoSubmitted && (
                              <circle
                                cx={opt.svg_x}
                                cy={opt.svg_y}
                                r="22"
                                fill="#06b6d4"
                                opacity="0.25"
                                className="animate-ping"
                              />
                            )}

                            {/* Sonar Beacon on Correct Pin when Submitted */}
                            {geoSubmitted && isCorrectPin && (
                              <g>
                                <circle
                                  cx={opt.svg_x}
                                  cy={opt.svg_y}
                                  r="26"
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="2"
                                  strokeDasharray="3 3"
                                  className="animate-spin"
                                />
                                <circle
                                  cx={opt.svg_x}
                                  cy={opt.svg_y}
                                  r="20"
                                  fill="#10b981"
                                  opacity="0.2"
                                  className="animate-ping"
                                />
                              </g>
                            )}

                            {/* Outer Pin Body Ring */}
                            <circle
                              cx={opt.svg_x}
                              cy={opt.svg_y}
                              r={isSelected || (geoSubmitted && isCorrectPin) ? 17 : 14}
                              fill={innerFill}
                              stroke={ringColor}
                              strokeWidth={isSelected || (geoSubmitted && isCorrectPin) ? 3 : 2}
                              filter={filterAttr}
                            />

                            {/* Option Letter Icon */}
                            <text
                              x={opt.svg_x}
                              y={opt.svg_y + 4}
                              fill={textColor}
                              fontSize={isSelected || (geoSubmitted && isCorrectPin) ? "12" : "11"}
                              fontWeight="bold"
                              textAnchor="middle"
                              fontFamily="sans-serif"
                            >
                              {optLetter}
                            </text>

                            {/* Location Label Pill Below Pin */}
                            <g transform={`translate(${opt.svg_x}, ${opt.svg_y + 24})`}>
                              <rect
                                x="-60"
                                y="-10"
                                width="120"
                                height="20"
                                rx="6"
                                fill="#090d16"
                                fillOpacity="0.85"
                                stroke={ringColor}
                                strokeWidth="0.8"
                              />
                              <text
                                x="0"
                                y="3"
                                fill={textColor}
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                                fontFamily="sans-serif"
                              >
                                {opt.name_vn}
                              </text>
                            </g>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Bottom Map Legend Bar */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Chiếu Tọa Độ Lồi (Equirectangular WGS84)</span>
                        </span>
                        <span className="hidden sm:inline text-slate-500">|</span>
                        <span className="hidden sm:inline text-slate-400">
                          {selectedOpt ? `Đã chọn: ${selectedOpt.name_vn} (${selectedOpt.latitude.toFixed(2)}°N, ${selectedOpt.longitude.toFixed(2)}°E)` : "Nhấp vào 1 trong 4 điểm A, B, C, D trên bản đồ"}
                        </span>
                      </div>
                      <Link
                        href="/explore?tab=map"
                        target="_blank"
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Bản đồ 3D</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (lg:col-span-5): Deductive Question, Golden Verse, Option Cards & Exegesis */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {/* Question & Scripture Card */}
                  <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 bg-slate-900/70 flex flex-col gap-4">
                    {/* Category & Reference Header */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        <span>{currentQ.category}</span>
                      </span>
                      <Link
                        href={`/bible?passage=${encodeURIComponent(currentQ.scripture_ref)}`}
                        target="_blank"
                        className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>{currentQ.scripture_ref}</span>
                      </Link>
                    </div>

                    {/* Question Prompt */}
                    <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                      {currentQ.question}
                    </h2>

                    {/* Clue Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                      <Crosshair className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong className="text-cyan-300">Gợi ý địa lý: </strong>
                        <span>{currentQ.clue}</span>
                      </div>
                    </div>

                    {/* Authentic 1925 Vietnamese Scripture Verse Card */}
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2 relative">
                      <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          <span>Kinh Văn Bản Dịch Truyền Thống 1925</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSpeechSpeak(currentQ.verse_text, currentQ.id)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{speakingVerseId === currentQ.id ? "Đang đọc..." : "Nghe"}</span>
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-amber-100/90 italic font-serif leading-relaxed">
                        "{currentQ.verse_text}"
                      </p>
                    </div>

                    {/* 4 Interactive Option Cards */}
                    <div className="flex flex-col gap-2.5 pt-1">
                      <span className="text-xs font-semibold text-slate-400">Chọn địa danh tương ứng trên bản đồ:</span>
                      {currentQ.options.map((opt, idx) => {
                        const optLetter = ["A", "B", "C", "D"][idx] || "?";
                        const isSelected = selectedGeoOption === opt.id;
                        const isCorrectOpt = opt.is_correct;

                        let cardStyle = "bg-slate-950/70 border-slate-800 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800/50";
                        if (isSelected && !geoSubmitted) {
                          cardStyle = "bg-cyan-950/50 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 font-semibold";
                        }
                        if (geoSubmitted) {
                          if (isCorrectOpt) {
                            cardStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-500/20";
                          } else if (isSelected && !isCorrectOpt) {
                            cardStyle = "bg-rose-950/80 border-rose-500 text-rose-200 line-through opacity-80";
                          } else {
                            cardStyle = "bg-slate-950/40 border-slate-900 text-slate-500 opacity-60";
                          }
                        }

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={geoSubmitted}
                            onClick={() => handleSelectGeoOption(opt.id)}
                            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${cardStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                isSelected ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300"
                              }`}>
                                {optLetter}
                              </span>
                              <div>
                                <div className="text-xs sm:text-sm font-semibold">{opt.name_vn}</div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {opt.name} ({opt.latitude.toFixed(2)}°N, {opt.longitude.toFixed(2)}°E)
                                </div>
                              </div>
                            </div>

                            {/* Status Icon */}
                            {geoSubmitted ? (
                              isCorrectOpt ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              ) : isSelected && !isCorrectOpt ? (
                                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                              ) : null
                            ) : isSelected ? (
                              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    {/* Verification / Next Actions */}
                    {!geoSubmitted ? (
                      <button
                        type="button"
                        disabled={!selectedGeoOption || geoSubmitting}
                        onClick={handleVerifyGeoChallenge}
                        className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                          selectedGeoOption && !geoSubmitting
                            ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30 cursor-pointer"
                            : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                        }`}
                      >
                        {geoSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                            <span>Đang Đối Chiếu Tọa Độ Khảo Cổ...</span>
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4" />
                            <span>Xác Nhận Tọa Độ Này (+100 XP)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex flex-col gap-4 animate-in fade-in">
                        {/* Result Notification Banner */}
                        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                          geoResult?.is_correct
                            ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-200"
                            : "bg-rose-950/60 border-rose-500/60 text-rose-200"
                        }`}>
                          <div className="flex items-center gap-3">
                            {geoResult?.is_correct ? (
                              <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
                            )}
                            <div>
                              <p className="text-xs sm:text-sm font-bold">
                                {geoResult?.is_correct ? "Định Vị Chính Xác Tuyệt Đối!" : "Chưa Đúng Tọa Độ!"}
                              </p>
                              <p className="text-xs opacity-90">{geoResult?.message}</p>
                            </div>
                          </div>
                          {geoResult?.is_correct && (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs shrink-0">
                              +{geoResult.xp_earned} XP
                            </span>
                          )}
                        </div>

                        {/* Archaeological Context Card */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5 text-xs">
                          <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Bối Cảnh Khảo Cổ Học:</span>
                          </span>
                          <p className="text-slate-300 leading-relaxed">
                            {geoResult?.archaeological_context || currentQ.archaeological_context}
                          </p>
                        </div>

                        {/* Theological Significance Card */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5 text-xs">
                          <span className="font-bold text-amber-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Ý Nghĩa Thần Học & Giao Ước:</span>
                          </span>
                          <p className="text-slate-300 leading-relaxed">
                            {geoResult?.theological_significance || currentQ.theological_significance}
                          </p>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between gap-3 pt-2">
                          <Link
                            href="/explore?tab=map"
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                            <span>Xem Trên Bản Đồ 3D</span>
                          </Link>

                          <button
                            type="button"
                            onClick={handleNextGeoChallenge}
                            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
                          >
                            <span>Thử Thách Tiếp Theo</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ===================================================================== */}
      {/* FLASHCARDS EXPORT MODAL (§4, §50)                                     */}
      {/* ===================================================================== */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Xuất Bộ Thẻ Ghi Nhớ (Export Flashcards)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hỗ trợ Anki Deck (.txt), Bảng tính CSV (.csv) và Dữ liệu JSON chuẩn (§4, §50)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter and Format Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Format Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                {[
                  { id: "anki", label: "Anki (.txt / .tsv)" },
                  { id: "csv", label: "CSV (.csv)" },
                  { id: "json", label: "JSON (.json)" }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => {
                      const f = fmt.id as "anki" | "csv" | "json";
                      setExportFormat(f);
                      loadExportData(f, exportCardType);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      exportFormat === fmt.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <select
                value={exportCardType}
                onChange={(e) => {
                  setExportCardType(e.target.value);
                  loadExportData(exportFormat, e.target.value);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Tất cả các thẻ</option>
                <option value="person">Thẻ nhân vật</option>
                <option value="verse">Thẻ câu gốc</option>
                <option value="event">Thẻ biến cố cứu chuộc</option>
                <option value="timeline">Thẻ so sánh niên đại (§4)</option>
                <option value="word">Thẻ từ ngữ gốc</option>
              </select>
            </div>

            {/* Format Description Banner */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {exportFormat === "anki" && "Định dạng Tab-Separated Values (TSV) chuẩn hóa cho Anki Desktop & Mobile, hỗ trợ ngắt dòng HTML <br>."}
                {exportFormat === "csv" && "Định dạng bảng tính chuẩn RFC 4180, mở trực tiếp bằng Microsoft Excel, Google Sheets, Apple Numbers hoặc Notion."}
                {exportFormat === "json" && "Định dạng JSON cấu trúc đầy đủ, phù hợp cho lập trình viên, tích hợp API hoặc sao lưu dữ liệu cá nhân."}
              </span>
            </div>

            {/* Content Preview Box */}
            <div className="relative">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1.5 px-1">
                <span>Bản xem trước ({exportData?.card_count || 0} thẻ):</span>
                <span className="font-mono text-[11px] text-slate-500">{exportData?.filename}</span>
              </div>
              {loadingExport ? (
                <div className="h-48 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
                  Đang khởi tạo tệp xuất...
                </div>
              ) : (
                <pre className="h-48 rounded-2xl bg-slate-950 border border-slate-800 p-4 text-[11px] font-mono text-slate-300 overflow-x-auto overflow-y-auto whitespace-pre leading-relaxed select-all">
                  {exportData?.content || "Không có dữ liệu thẻ để hiển thị."}
                </pre>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCopyExport}
                disabled={!exportData}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedExport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedExport ? "Đã Sao Chép!" : "Sao Chép Vào Bộ Nhớ"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFile}
                disabled={!exportData}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Tải Tệp Về Máy ({exportData?.filename || "export"})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
