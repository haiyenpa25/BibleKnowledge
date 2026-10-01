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
  ArrowLeft,
  Flame,
  Award,
  BookOpen,
  BrainCircuit,
  Loader2,
  Calendar,
  Zap,
  Repeat
} from "lucide-react";

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

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<"quiz" | "flashcards" | "generator">("quiz");

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

  // Flashcards State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardFilter, setCardFilter] = useState<string>("all");
  const [reviewCount, setReviewCount] = useState(0);

  // AI Generator State
  const [genTarget, setGenTarget] = useState("Giăng 3:1-16");
  const [genType, setGenType] = useState<"quiz" | "flashcards">("quiz");
  const [genSubtype, setGenSubtype] = useState("multiple_choice");
  const [genCount, setGenCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
      let url = `${apiUrl}/api/learn/flashcards?limit=30`;
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

  useEffect(() => {
    fetchQuiz();
    fetchFlashcards();
    fetchProfile();
  }, [apiUrl]);

  // Quiz Handling
  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const currentQ = quizList[currentIndex];
    if (index === currentQ.correct_option) {
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIndex + 1 < quizList.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      // Auto submit quiz score to user profile
      try {
        const res = await fetch(`${apiUrl}/api/learn/quiz/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correct_count: Math.max(1, Math.round(score / 10)),
            total_questions: quizList.length,
            topic: filterType === "all" ? "Gospels" : "Pauline"
          })
        });
        if (res.ok) {
          const updatedProf = await res.json();
          setUserProfile(updatedProf);
        }
      } catch (e) {
        console.error("Failed to submit quiz score:", e);
      }
    }
  };

  const handleRestartQuiz = () => {
    setScore(0);
    setStreak(0);
    fetchQuiz(filterType);
    fetchProfile();
  };

  // Flashcard Review Handling (SM-2)
  const handleReviewRating = async (rating: number) => {
    if (flashcards.length === 0) return;
    const currentCard = flashcards[cardIndex];

    try {
      await fetch(`${apiUrl}/api/learn/flashcards/${currentCard.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating })
      });
      setReviewCount((c) => c + 1);

      // Move to next card
      if (cardIndex + 1 < flashcards.length) {
        setCardIndex((i) => i + 1);
        setIsFlipped(false);
      } else {
        // Refresh cards
        fetchFlashcards(cardFilter);
      }
    } catch (err) {
      console.error("Failed to submit card review:", err);
    }
  };

  // AI Generator Submit
  const handleGenerateAI = async () => {
    if (!genTarget.trim()) return;
    setIsGenerating(true);
    setGenSuccessMsg(null);
    setGenError(null);

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
              Không Gian Học Tập (Learn Layer)
            </h1>
            <p className="text-xs text-slate-400">
              Trắc nghiệm tương tác • Đố vui nhân vật • Thẻ lặp lại ngắt quãng (SM-2) • AI Quiz Engine
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

      {/* User Mastery & Gamification Banner (ROADMAP1 Sections 5, 46) */}
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
            <span className="font-bold text-rose-400">{userProfile?.daily_streak || 1} ngày liên tục</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Quiz đã giải: </span>
            <span className="font-bold text-white">{userProfile?.total_quizzes_completed || 0}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Repeat className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">Thẻ đã ôn: </span>
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
            <span className="px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-semibold">
              Ngũ Kinh {userProfile?.mastery_by_topic?.Pentateuch || 50}%
            </span>
          </div>
        </div>
      </section>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "quiz"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Thử Thách Trắc Nghiệm
        </button>
        <button
          onClick={() => setActiveTab("flashcards")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "flashcards"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Layers className="w-4 h-4" /> Thẻ Ghi Nhớ (Flashcards)
        </button>
        <button
          onClick={() => setActiveTab("generator")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "generator"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Sparkles className="w-4 h-4" /> Tạo Bộ Đề Bằng AI
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 1. QUIZ MODE */}
      {/* ===================================================================== */}
      {activeTab === "quiz" && (
        <div className="flex flex-col gap-6">
          {/* Question Sub-Filter Chips */}
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
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-sm">Đang nạp câu hỏi trắc nghiệm từ kho tàng Kinh Thánh...</p>
            </div>
          ) : quizFinished ? (
            /* Quiz Results Finished Screen */
            <div className="p-10 rounded-3xl glass-panel border border-slate-700/60 flex flex-col items-center text-center gap-6 max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <Award className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Hoàn Thành Thử Thách!</h3>
                <p className="text-slate-300 text-sm mt-1">
                  Bạn đã xuất sắc vượt qua toàn bộ {quizList.length} câu hỏi trắc nghiệm.
                </p>
              </div>
              <div className="flex items-center gap-6 py-4 px-8 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-amber-400">{score}</span>
                  <span className="text-xs text-slate-400 uppercase">Tổng Điểm</span>
                </div>
                <div className="w-px h-8 bg-slate-800"></div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-rose-400">{streak}</span>
                  <span className="text-xs text-slate-400 uppercase">Chuỗi Kỷ Lục</span>
                </div>
              </div>
              <button
                onClick={handleRestartQuiz}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" /> Bắt Đầu Lượt Mới
              </button>
            </div>
          ) : currentQ ? (
            /* Active Question Card */
            <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-700/60 flex flex-col gap-6 relative overflow-hidden">
              {/* Question Meta Bar */}
              <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                    {currentQ.question_type === "who_am_i" ? "🕵️ Đố Nhân Vật" : currentQ.question_type === "verse_challenge" ? "📜 Thuộc Câu Gốc" : "Trắc Nghiệm"}
                  </span>
                  <span>Câu {currentIndex + 1} / {quizList.length}</span>
                </div>
                {currentQ.scripture_reference && (
                  <Link 
                    href={`/bible?ref=${encodeURIComponent(currentQ.scripture_reference)}`}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{currentQ.scripture_reference}</span>
                  </Link>
                )}
              </div>

              {/* Question Text */}
              <div className="flex flex-col gap-2">
                {currentQ.question_type === "who_am_i" && (
                  <div className="text-xs font-semibold text-amber-300/80 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Manh mối nhân vật
                  </div>
                )}
                <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                  {currentQ.question_text}
                </h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  let btnStyle = "bg-slate-900/60 border-slate-700/80 hover:bg-slate-800/80 hover:border-slate-600 text-slate-200";

                  if (isAnswered) {
                    if (optIdx === currentQ.correct_option) {
                      btnStyle = "bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-md shadow-emerald-900/20";
                    } else if (selectedOption === optIdx) {
                      btnStyle = "bg-rose-950/70 border-rose-500/80 text-rose-200";
                    } else {
                      btnStyle = "opacity-40 bg-slate-900/40 border-slate-800 text-slate-400";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-4 rounded-2xl border text-left text-sm md:text-base font-medium transition-all flex items-start gap-3 ${btnStyle}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0 mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1 leading-snug">{opt}</span>
                      {isAnswered && optIdx === currentQ.correct_option && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      )}
                      {isAnswered && selectedOption === optIdx && optIdx !== currentQ.correct_option && (
                        <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Answer Explanation & Next Action */}
              {isAnswered && (
                <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-4">
                  <div className={`p-4 rounded-2xl border text-xs md:text-sm flex flex-col gap-1.5 ${
                    selectedOption === currentQ.correct_option
                      ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-200"
                      : "bg-amber-950/30 border-amber-800/50 text-amber-200"
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {selectedOption === currentQ.correct_option ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Chính Xác! +10 Điểm</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>Chưa Đúng! Đáp án đúng là {String.fromCharCode(65 + currentQ.correct_option)}</span>
                        </>
                      )}
                    </div>
                    {currentQ.explanation && (
                      <p className="text-slate-300 leading-relaxed pt-1">
                        {currentQ.explanation}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2"
                    >
                      <span>Câu Tiếp Theo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Không có câu hỏi nào trong danh mục này.</div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. FLASHCARDS MODE (SM-2 Spaced Repetition) */}
      {/* ===================================================================== */}
      {activeTab === "flashcards" && (
        <div className="flex flex-col gap-6">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 whitespace-nowrap">Danh mục thẻ:</span>
            {[
              { id: "all", label: "Tất cả" },
              { id: "person", label: "Nhân vật (Person)" },
              { id: "verse", label: "Câu gốc (Verse)" },
              { id: "event", label: "Biến cố (Event)" },
              { id: "word", label: "Giáo lý / Từ ngữ (Doctrine)" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setCardFilter(f.id);
                  fetchFlashcards(f.id);
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  cardFilter === f.id
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-medium"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loadingCards ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm">Đang tải thẻ ghi nhớ và lịch lặp lại ngắt quãng...</p>
            </div>
          ) : currentCard ? (
            <div className="flex flex-col items-center gap-6">
              {/* Card Meta Indicator */}
              <div className="w-full flex justify-between items-center text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
                    {currentCard.card_type}
                  </span>
                  <span>Thẻ {cardIndex + 1} / {flashcards.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Chu kỳ: {currentCard.interval_days} ngày • Đã ôn: {currentCard.repetition_count} lần</span>
                </div>
              </div>

              {/* 3D Flip Card Container */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-xl h-80 perspective-1000 cursor-pointer select-none group"
              >
                <div 
                  className={`relative w-full h-full duration-500 transform-style-preserve-3d transition-transform ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  {/* FRONT SIDE */}
                  <div className="absolute inset-0 backface-hidden p-8 rounded-3xl glass-panel border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 flex flex-col justify-between items-center text-center shadow-xl">
                    <div className="w-full flex justify-end">
                      <span className="text-[11px] text-blue-400/80 font-mono tracking-wider uppercase">
                        Mặt Trước (Front)
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 my-auto">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                        <Layers className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-extrabold text-white leading-snug">
                        {currentCard.front_text}
                      </h3>
                    </div>

                    <div className="text-xs text-slate-400 group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5" />
                      Nhấp thẻ để xem lời giải
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 rounded-3xl glass-panel border border-blue-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex flex-col justify-between shadow-xl overflow-y-auto">
                    <div className="w-full flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-[11px] text-emerald-400/90 font-mono tracking-wider uppercase">
                        Mặt Sau (Đáp Án Chi Tiết)
                      </span>
                      <span className="text-xs text-slate-500">Nhấp để lật lại</span>
                    </div>

                    <div className="my-auto py-2">
                      <p className="text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line font-serif">
                        {currentCard.back_text}
                      </p>
                    </div>

                    <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span>Độ khó ban đầu: Cấp {currentCard.difficulty_level}</span>
                      <span className="text-blue-400">Thuật toán SM-2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SM-2 Spaced Repetition Rating Buttons */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <span className="text-xs text-slate-400">Đánh giá khả năng ghi nhớ của bạn:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
                  <button
                    onClick={() => handleReviewRating(1)}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
                  >
                    <span>🔴 Quên Hết (Again)</span>
                    <span className="text-[10px] text-rose-400/70 font-normal">Ôn lại: 1 ngày</span>
                  </button>

                  <button
                    onClick={() => handleReviewRating(2)}
                    className="px-4 py-2.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
                  >
                    <span>🟠 Khá Khó (Hard)</span>
                    <span className="text-[10px] text-amber-400/70 font-normal">Giãn kỳ chậm</span>
                  </button>

                  <button
                    onClick={() => handleReviewRating(3)}
                    className="px-4 py-2.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
                  >
                    <span>🔵 Tốt (Good)</span>
                    <span className="text-[10px] text-blue-400/70 font-normal">Chu kỳ chuẩn</span>
                  </button>

                  <button
                    onClick={() => handleReviewRating(4)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
                  >
                    <span>🟢 Rất Dễ (Easy)</span>
                    <span className="text-[10px] text-emerald-400/70 font-normal">Tăng vọt thời gian</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Bạn đã hoàn thành toàn bộ thẻ cần ôn tập hôm nay!</div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. AI GENERATOR MODE */}
      {/* ===================================================================== */}
      {activeTab === "generator" && (
        <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-700/60 flex flex-col gap-6 max-w-2xl mx-auto w-full">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
              Công Cụ Sinh Câu Hỏi & Thẻ Học Tự Động Bằng AI
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sử dụng mô hình Qwen chạy trên GPU local để đọc phân đoạn Kinh Thánh và tạo bộ đề chuẩn xác.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Target Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">
                Nhập phân đoạn Kinh Thánh hoặc chủ đề:
              </label>
              <input
                type="text"
                value={genTarget}
                onChange={(e) => setGenTarget(e.target.value)}
                placeholder="Ví dụ: Giăng 3:1-16, Sáng-thế Ký 1, hoặc Sứ đồ Phi-e-rơ"
                className="bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Mục đích tạo:</label>
                <select
                  value={genType}
                  onChange={(e) => {
                    const val = e.target.value as "quiz" | "flashcards";
                    setGenType(val);
                    setGenSubtype(val === "quiz" ? "multiple_choice" : "person");
                  }}
                  className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="quiz">Trắc Nghiệm (Quiz)</option>
                  <option value="flashcards">Thẻ Ghi Nhớ (Flashcards)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Phân loại cụ thể:</label>
                {genType === "quiz" ? (
                  <select
                    value={genSubtype}
                    onChange={(e) => setGenSubtype(e.target.value)}
                    className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="multiple_choice">Trắc nghiệm 4 lựa chọn (ABCD)</option>
                    <option value="who_am_i">Đố nhân vật (Who Am I?)</option>
                    <option value="true_false">Đúng / Sai</option>
                  </select>
                ) : (
                  <select
                    value={genSubtype}
                    onChange={(e) => setGenSubtype(e.target.value)}
                    className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="person">Thẻ Nhân Vật (Person)</option>
                    <option value="verse">Thẻ Câu Gốc (Verse)</option>
                    <option value="event">Thẻ Biến Cố (Event)</option>
                    <option value="word">Thẻ Giáo Lý / Từ Ngữ</option>
                  </select>
                )}
              </div>
            </div>

            {/* Count Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Số lượng tạo (1-5 câu):</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setGenCount(cnt)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                      genCount === cnt
                        ? "bg-emerald-600 text-white font-bold"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cnt} câu
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="mt-2 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Qwen AI đang biên soạn dữ liệu thần học...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo Ngay Bằng AI →</span>
                </>
              )}
            </button>

            {/* Feedback Banners */}
            {genSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{genSuccessMsg} Bạn có thể chuyển sang tab tương ứng để làm bài ngay!</span>
              </div>
            )}
            {genError && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>{genError}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
