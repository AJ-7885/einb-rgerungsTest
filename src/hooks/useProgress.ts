import { useState, useEffect } from 'react';
import { UserStats, ExamSessionResult, TranslationMode } from '../types';

const STATS_STORAGE_KEY = 'einbuergerung_user_stats_v2';
const PREFS_STORAGE_KEY = 'einbuergerung_user_prefs_v2';

export interface UserPrefs {
  selectedStateCode: string;
  translationMode: TranslationMode;
  isDarkMode: boolean;
  speechRate: number; // 0.85, 0.95, 1.0
  wordPronounceMode: boolean; // Click on words speaks aloud
}

const DEFAULT_STATS: UserStats = {
  answeredCount: 0,
  correctCount: 0,
  wrongCount: 0,
  bookmarkedIds: [],
  wrongQuestionIds: [],
  answeredQuestions: {},
  examSessions: [],
  streakDays: 1,
  lastStudyDate: new Date().toISOString().split('T')[0],
  unlockedBadgeIds: ['first_step'],
};

const DEFAULT_PREFS: UserPrefs = {
  selectedStateCode: 'BE', // Berlin default, selectable to any of 16
  translationMode: 'both', // Both English and Persian alongside German (or 'none', 'en', 'fa')
  isDarkMode: true, // Dark mode default as requested for comfortable late night study
  speechRate: 1.0, // 1.0x natural pitch/rate without robotic time-stretching
  wordPronounceMode: true,
};

export function useProgress() {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATS, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_STATS;
  });

  const [prefs, setPrefs] = useState<UserPrefs>(() => {
    try {
      const saved = localStorage.getItem(PREFS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PREFS, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_PREFS;
  });

  // Apply dark mode class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [prefs.isDarkMode]);

  // Persist stats
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore quota errors
    }
  }, [stats]);

  // Persist prefs
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs]);

  // Record an answer
  const recordAnswer = (questionId: number, selectedOption: string, isCorrect: boolean) => {
    setStats(prev => {
      // If empty option, clear answered status to allow fresh retry
      if (!selectedOption) {
        const { [questionId]: removed, ...remainingAnswered } = prev.answeredQuestions;
        let newAnsweredCount = prev.answeredCount;
        let newCorrectCount = prev.correctCount;
        let newWrongCount = prev.wrongCount;

        if (removed) {
          newAnsweredCount = Math.max(0, newAnsweredCount - 1);
          if (removed.isCorrect) newCorrectCount = Math.max(0, newCorrectCount - 1);
          else newWrongCount = Math.max(0, newWrongCount - 1);
        }

        return {
          ...prev,
          answeredQuestions: remainingAnswered,
          answeredCount: newAnsweredCount,
          correctCount: newCorrectCount,
          wrongCount: newWrongCount,
        };
      }

      const alreadyAnswered = !!prev.answeredQuestions[questionId];
      const prevWasCorrect = prev.answeredQuestions[questionId]?.isCorrect;

      const newAnsweredQuestions = {
        ...prev.answeredQuestions,
        [questionId]: {
          isCorrect,
          selectedOption,
          timestamp: Date.now(),
        },
      };

      let newAnsweredCount = prev.answeredCount;
      let newCorrectCount = prev.correctCount;
      let newWrongCount = prev.wrongCount;

      if (!alreadyAnswered) {
        newAnsweredCount += 1;
        if (isCorrect) newCorrectCount += 1;
        else newWrongCount += 1;
      } else {
        if (!prevWasCorrect && isCorrect) {
          newCorrectCount += 1;
          newWrongCount = Math.max(0, newWrongCount - 1);
        } else if (prevWasCorrect && !isCorrect) {
          newCorrectCount = Math.max(0, newCorrectCount - 1);
          newWrongCount += 1;
        }
      }

      // Update wrong questions list
      let newWrongQuestionIds = [...prev.wrongQuestionIds];
      if (!isCorrect && !newWrongQuestionIds.includes(questionId)) {
        newWrongQuestionIds.push(questionId);
      } else if (isCorrect && newWrongQuestionIds.includes(questionId)) {
        newWrongQuestionIds = newWrongQuestionIds.filter(id => id !== questionId);
      }

      // Check badges
      const unlockedBadges = [...prev.unlockedBadgeIds];
      if (newAnsweredCount >= 10 && !unlockedBadges.includes('ten_done')) {
        unlockedBadges.push('ten_done');
      }
      if (newCorrectCount >= 25 && !unlockedBadges.includes('twenty_five_correct')) {
        unlockedBadges.push('twenty_five_correct');
      }

      return {
        ...prev,
        answeredCount: newAnsweredCount,
        correctCount: newCorrectCount,
        wrongCount: newWrongCount,
        answeredQuestions: newAnsweredQuestions,
        wrongQuestionIds: newWrongQuestionIds,
        unlockedBadgeIds: unlockedBadges,
      };
    });
  };

  // Toggle bookmark / saved question
  const toggleBookmark = (questionId: number) => {
    setStats(prev => {
      const isBookmarked = prev.bookmarkedIds.includes(questionId);
      const newBookmarked = isBookmarked
        ? prev.bookmarkedIds.filter(id => id !== questionId)
        : [...prev.bookmarkedIds, questionId];

      const unlockedBadges = [...prev.unlockedBadgeIds];
      if (newBookmarked.length >= 3 && !unlockedBadges.includes('smart_saver')) {
        unlockedBadges.push('smart_saver');
      }

      return {
        ...prev,
        bookmarkedIds: newBookmarked,
        unlockedBadgeIds: unlockedBadges,
      };
    });
  };

  // Batch bookmark multiple questions
  const batchBookmark = (questionIds: number[], shouldBookmark: boolean = true) => {
    setStats(prev => {
      let newBookmarked: number[];
      if (shouldBookmark) {
        const set = new Set([...prev.bookmarkedIds, ...questionIds]);
        newBookmarked = Array.from(set);
      } else {
        const removeSet = new Set(questionIds);
        newBookmarked = prev.bookmarkedIds.filter(id => !removeSet.has(id));
      }

      const unlockedBadges = [...prev.unlockedBadgeIds];
      if (newBookmarked.length >= 3 && !unlockedBadges.includes('smart_saver')) {
        unlockedBadges.push('smart_saver');
      }

      return {
        ...prev,
        bookmarkedIds: newBookmarked,
        unlockedBadgeIds: unlockedBadges,
      };
    });
  };

  // Record an exam simulation session
  const recordExamSession = (session: ExamSessionResult) => {
    setStats(prev => {
      const unlockedBadges = [...prev.unlockedBadgeIds];
      if (session.passed && !unlockedBadges.includes('exam_master')) {
        unlockedBadges.push('exam_master');
      }
      if (session.score >= 30 && !unlockedBadges.includes('high_scorer')) {
        unlockedBadges.push('high_scorer');
      }

      return {
        ...prev,
        examSessions: [session, ...prev.examSessions],
        unlockedBadgeIds: unlockedBadges,
      };
    });
  };

  const updatePrefs = (partial: Partial<UserPrefs>) => {
    setPrefs(prev => ({ ...prev, ...partial }));
  };

  const resetAllProgress = () => {
    setStats(DEFAULT_STATS);
  };

  return {
    stats,
    prefs,
    recordAnswer,
    toggleBookmark,
    batchBookmark,
    recordExamSession,
    updatePrefs,
    resetAllProgress,
  };
}
