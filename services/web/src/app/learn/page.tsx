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
  Repeat,
  ArrowUp,
  ArrowDown,
  Clock,
  Shuffle,
  Check,
  Undo2,
  Volume2,
  AlertCircle,
  UserCheck,
  Eye,
  Compass,
  Link2
} from "lucide-react";

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
  clues: WhoAmIClue[];
  options: string[];
  correct_option: number;
  correct_name: string;
  character_slug: string;
  title_or_role: string;
  scripture_reference: string;
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
}

interface TimelineChallenge {
  id: string;
  era_title: string;
  description: string;
  events: TimelineEventItem[];
  narrative_explanation: string;
}

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<"quiz" | "who_am_i" | "true_false" | "match" | "flashcards" | "fill_in_blank" | "timeline" | "generator">("quiz");

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

  // Timeline Order State (§3)
  const [timelineChallenges, setTimelineChallenges] = useState<TimelineChallenge[]>([]);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);
  const [userEventOrder, setUserEventOrder] = useState<TimelineEventItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineChecked, setTimelineChecked] = useState(false);
  const [timelineIsCorrect, setTimelineIsCorrect] = useState(false);

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
  }, [apiUrl]);

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

  // Fetch Timeline challenges
  const fetchTimelineChallenges = async () => {
    setTimelineLoading(true);
    setCurrentTimelineIndex(0);
    setTimelineChecked(false);
    setTimelineIsCorrect(false);
    try {
      const res = await fetch(`${apiUrl}/api/learn/timeline-challenge`);
      if (res.ok) {
        const data = await res.json();
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
    let inOrder = true;
    for (let i = 0; i < userEventOrder.length - 1; i++) {
      if (userEventOrder[i].correct_order > userEventOrder[i + 1].correct_order) {
        inOrder = false;
        break;
      }
    }
    setTimelineIsCorrect(inOrder);
    setTimelineChecked(true);

    if (inOrder) {
      setScore((prev) => prev + 50);
      setStreak((prev) => prev + 1);
      try {
        await fetch(`${apiUrl}/api/learn/quiz/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correct_count: 1,
            total_questions: 1,
            topic: "History"
          })
        });
        fetchProfile();
      } catch (err) {
        console.error("Failed to submit score:", err);
      }
    }
  };

  const handleNextTimeline = () => {
    if (currentTimelineIndex + 1 < timelineChallenges.length) {
      const nextIdx = currentTimelineIndex + 1;
      setCurrentTimelineIndex(nextIdx);
      setUserEventOrder(timelineChallenges[nextIdx].events);
      setTimelineChecked(false);
      setTimelineIsCorrect(false);
    } else {
      fetchTimelineChallenges();
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

  const handleSelectWhoAmIOption = async (optionIdx: number) => {
    if (whoAmIAnswered || !currentWhoAmI) return;
    setWhoAmISelected(optionIdx);
    setWhoAmIAnswered(true);

    const isCorrect = optionIdx === currentWhoAmI.correct_option;
    if (isCorrect) {
      const currentClue = currentWhoAmI.clues[revealedCluesCount - 1];
      const earned = currentClue ? currentClue.points : 20;
      setScore((prev) => prev + earned);
      setStreak((prev) => prev + 1);

      try {
        await fetch(`${apiUrl}/api/learn/quiz/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correct_count: 1,
            total_questions: 1,
            topic: "WhoAmI"
          })
        });
        fetchProfile();
      } catch (err) {
        console.error("Failed to submit score:", err);
      }
    } else {
      setStreak(0);
    }
  };

  const handleNextWhoAmI = () => {
    if (whoAmIIndex + 1 < whoAmIList.length) {
      setWhoAmIIndex((prev) => prev + 1);
      setRevealedCluesCount(1);
      setWhoAmISelected(null);
      setWhoAmIAnswered(false);
    } else {
      fetchWhoAmI();
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
      {activeTab === "who_am_i" && (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
          {whoAmILoading ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              <p className="text-sm">Đang nạp các câu đố nhân vật bí ẩn...</p>
            </div>
          ) : currentWhoAmI ? (
            <div className="flex flex-col gap-6">
              {/* Header Status Bar */}
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="font-semibold text-white">Câu Đố {whoAmIIndex + 1} / {whoAmIList.length}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-amber-400 font-medium">{currentWhoAmI.era_or_testament}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-800/40">
                  <Award className="w-3.5 h-3.5" />
                  <span>+{currentWhoAmI.clues[revealedCluesCount - 1]?.points || 20} XP</span>
                </div>
              </div>

              {/* Riddle Clues Card Deck */}
              <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-700/60 flex flex-col gap-5 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-rose-400" />
                    <h3 className="text-base font-extrabold text-white">
                      Danh Tính Bí Ẩn: Tôi Là Ai?
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Đã mở {revealedCluesCount} / {currentWhoAmI.clues.length} gợi ý
                  </span>
                </div>

                {/* Progressive Clues */}
                <div className="flex flex-col gap-3.5">
                  {currentWhoAmI.clues.slice(0, revealedCluesCount).map((clue) => (
                    <div
                      key={clue.order}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2 transition-all animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center font-bold text-[10px]">
                            {clue.order}
                          </span>
                          <span className="font-semibold text-rose-300">Gợi Ý {clue.order}: {clue.difficulty_label}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => speakText(`Gợi ý ${clue.order}: ${clue.text}`)}
                          title="Đọc to gợi ý này"
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm md:text-base text-slate-200 font-serif leading-relaxed italic pl-7">
                        &ldquo;{clue.text}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>

                {/* Unlock Next Clue Action */}
                {!whoAmIAnswered && revealedCluesCount < currentWhoAmI.clues.length && (
                  <button
                    type="button"
                    onClick={handleRevealNextClue}
                    className="self-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md group"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Mở Thêm Gợi Ý {revealedCluesCount + 1} (Điểm giảm xuống {currentWhoAmI.clues[revealedCluesCount]?.points}đ)</span>
                  </button>
                )}

                {/* 4 Candidate Options Grid */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                  <span className="text-xs text-slate-400 font-medium">Chọn nhân vật bạn đoán:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentWhoAmI.options.map((opt, idx) => {
                      let btnStyle = "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-200 hover:border-slate-700";
                      if (whoAmIAnswered) {
                        if (idx === currentWhoAmI.correct_option) {
                          btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-950/40";
                        } else if (idx === whoAmISelected) {
                          btnStyle = "bg-rose-950/80 border-rose-500 text-rose-200 line-through";
                        } else {
                          btnStyle = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectWhoAmIOption(idx)}
                          disabled={whoAmIAnswered}
                          className={`p-3.5 rounded-2xl border text-left text-sm flex items-center justify-between transition-all ${btnStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-xs font-bold text-slate-300">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-medium">{opt}</span>
                          </div>
                          {whoAmIAnswered && idx === currentWhoAmI.correct_option && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          )}
                          {whoAmIAnswered && idx === whoAmISelected && idx !== currentWhoAmI.correct_option && (
                            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Identity Revealed & Explanation Card */}
                {whoAmIAnswered && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-rose-950/30 border border-slate-700/80 flex flex-col gap-3 mt-2 animate-in fade-in zoom-in-95">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                            whoAmISelected === currentWhoAmI.correct_option
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          }`}>
                            {whoAmISelected === currentWhoAmI.correct_option ? "Chính xác tuyệt vời!" : "Chưa chính xác"}
                          </span>
                          <span className="text-xs text-amber-400 font-medium">
                            👑 {currentWhoAmI.title_or_role}
                          </span>
                        </div>
                        <h4 className="text-xl font-extrabold text-white mt-1">
                          {currentWhoAmI.correct_name}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={handleNextWhoAmI}
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-600/30 flex-shrink-0"
                      >
                        <span>{whoAmIIndex + 1 < whoAmIList.length ? "Câu Đố Tiếp Theo" : "Chơi Lại Từ Đầu"}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1 border-t border-slate-800">
                      {currentWhoAmI.explanation}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                      <Link
                        href={`/bible?ref=${encodeURIComponent(currentWhoAmI.scripture_reference)}`}
                        className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Kinh Thánh: {currentWhoAmI.scripture_reference} →</span>
                      </Link>

                      <Link
                        href="/explore"
                        className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Mở trên Đồ Thị Tri Thức →</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">Chưa có câu đố nào.</div>
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
      {/* 2. FLASHCARDS MODE (SM-2 Spaced Repetition)                          */}
      {/* ===================================================================== */}
      {activeTab === "flashcards" && (
        <div className="flex flex-col gap-6 items-center">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs self-start">
            <span className="text-slate-400 whitespace-nowrap">Lọc loại thẻ:</span>
            {[
              { id: "all", label: "Tất cả" },
              { id: "person", label: "Nhân vật" },
              { id: "verse", label: "Câu gốc" },
              { id: "word", label: "Từ ngữ gốc" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setCardFilter(f.id);
                  fetchFlashcards(f.id);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
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
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-4 text-slate-400 w-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              <p className="text-sm">Đang tải thẻ học lặp lại ngắt quãng...</p>
            </div>
          ) : currentCard ? (
            <div className="w-full max-w-xl flex flex-col gap-5">
              <div className="flex justify-between items-center text-xs text-slate-400 px-1">
                <span>Thẻ {cardIndex + 1} / {flashcards.length}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-blue-400 font-mono text-[11px]">
                  Khoảng cách: {currentCard.interval_days} ngày
                </span>
              </div>

              {/* Flashcard container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`min-h-[260px] p-8 rounded-3xl cursor-pointer select-none transition-all duration-300 flex flex-col justify-between items-center text-center shadow-xl border ${
                  isFlipped
                    ? "bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border-blue-500/50"
                    : "bg-slate-900/90 border-slate-700/80 hover:border-slate-600"
                }`}
              >
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  {isFlipped ? "✨ Mặt Sau • Lời Giải & Câu Gốc" : "❓ Mặt Trước • Câu Hỏi / Khái Niệm"}
                </div>

                <div className="my-auto py-4">
                  <p className="text-base md:text-lg font-bold text-white leading-relaxed font-sans">
                    {isFlipped ? currentCard.back_text : currentCard.front_text}
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> Nhấn để lật thẻ
                </div>
              </div>

              {/* SM-2 Review Quality Rating Buttons */}
              {isFlipped && (
                <div className="flex flex-col gap-2 pt-2 animate-in fade-in">
                  <span className="text-center text-xs text-slate-400 font-medium">Bạn nhớ nội dung này thế nào?</span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleReviewCard(1)}
                      className="py-2.5 px-2 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-bold transition-all"
                    >
                      Lại (1 ngày)
                    </button>
                    <button
                      onClick={() => handleReviewCard(2)}
                      className="py-2.5 px-2 rounded-xl bg-amber-950/80 hover:bg-amber-900/80 border border-amber-800/60 text-amber-300 text-xs font-bold transition-all"
                    >
                      Khó (2 ngày)
                    </button>
                    <button
                      onClick={() => handleReviewCard(3)}
                      className="py-2.5 px-2 rounded-xl bg-blue-950/80 hover:bg-blue-900/80 border border-blue-800/60 text-blue-300 text-xs font-bold transition-all"
                    >
                      Tốt (4 ngày)
                    </button>
                    <button
                      onClick={() => handleReviewCard(4)}
                      className="py-2.5 px-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-300 text-xs font-bold transition-all"
                    >
                      Dễ (7 ngày)
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">Đã ôn xong tất cả các thẻ!</div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
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
      {/* 4. TIMELINE ORDER MODE (Sắp Xếp Niên Đại - §3)                        */}
      {/* ===================================================================== */}
      {activeTab === "timeline" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" /> Chronological Timeline &bull; Sắp Xếp Niên Đại (§3)
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Thử Thách Sắp Xếp Trật Tự Thời Gian Biến Cố
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dùng các phím mũi tên Lên / Xuống để sắp xếp các biến cố từ xa xưa nhất đến gần nhất
              </p>
            </div>
            {currentTimeline && (
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Màn {currentTimelineIndex + 1} / {timelineChallenges.length}
              </span>
            )}
          </div>

          {timelineLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-xs text-slate-400">Đang nạp dữ liệu biến cố lịch sử...</p>
            </div>
          ) : currentTimeline ? (
            <div className="flex flex-col gap-6">
              {/* Challenge Title */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Chủ đề thời đại</span>
                <h3 className="text-lg font-bold text-white">{currentTimeline.era_title}</h3>
                <p className="text-xs text-slate-300">{currentTimeline.description}</p>
              </div>

              {/* Reorderable Events List */}
              <div className="flex flex-col gap-3">
                {userEventOrder.map((ev, idx) => {
                  return (
                    <div
                      key={ev.slug}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 shadow-md ${
                        timelineChecked
                          ? timelineIsCorrect
                            ? "bg-emerald-950/40 border-emerald-500"
                            : "bg-slate-900/80 border-slate-700"
                          : "bg-slate-900/80 border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="text-amber-400 font-medium">{ev.period}</span>
                            {ev.scripture && (
                              <>
                                <span>&bull;</span>
                                <span className="text-blue-300 font-medium">📖 {ev.scripture}</span>
                              </>
                            )}
                            {timelineChecked && (
                              <>
                                <span>&bull;</span>
                                <span className="font-mono text-cyan-300 font-bold">
                                  Niên đại: {ev.approximate_date}
                                </span>
                              </>
                            )}
                          </div>
                          {ev.description && (
                            <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{ev.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Up/Down buttons */}
                      {!timelineChecked && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveEvent(idx, "up")}
                            disabled={idx === 0}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white transition-colors"
                            title="Di chuyển lên trước"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveEvent(idx, "down")}
                            disabled={idx === userEventOrder.length - 1}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white transition-colors"
                            title="Di chuyển xuống sau"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Controls & Narrative Explanation */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {timelineChecked ? (
                    <div className="flex items-center gap-2">
                      {timelineIsCorrect ? (
                        <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          Chính xác hoàn hảo theo lịch sử Kinh Thánh! (+50 XP)
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                          <AlertCircle className="w-5 h-5 text-amber-400" />
                          Thứ tự chưa hoàn toàn chuẩn xác, hãy quan sát niên đại và điều chỉnh lại!
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Sắp xếp hoàn tất rồi bấm kiểm tra niên đại
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    {!timelineChecked ? (
                      <button
                        type="button"
                        onClick={handleCheckTimeline}
                        className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs md:text-sm shadow-lg shadow-purple-600/30 transition-all"
                      >
                        Kiểm Tra Niên Đại
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextTimeline}
                        className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
                      >
                        <span>{currentTimelineIndex + 1 < timelineChallenges.length ? "Màn Tiếp Theo" : "Chơi Lại Từ Đầu"}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Narrative Explanation */}
                {timelineChecked && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 flex flex-col gap-1.5 mt-2 animate-in fade-in">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                      📜 Dòng Chảy Lịch Sử Cứu Rỗi:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {currentTimeline.narrative_explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">Chưa có dữ liệu niên đại.</div>
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
    </main>
  );
}
