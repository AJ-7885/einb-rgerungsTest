export type Language = 'de' | 'en' | 'fa';
export type TranslationMode = 'both' | 'en' | 'fa' | 'none';

export type CategoryId = 'politik' | 'geschichte' | 'gesellschaft' | 'bundesland';

export interface TranslationText {
  de: string;
  en: string;
  fa: string;
}

export interface QuestionOption {
  id: 'a' | 'b' | 'c' | 'd';
  de: string;
  en: string;
  fa: string;
}

export interface VocabularyTerm {
  term: string;
  syllables?: string;
  en: string;
  fa: string;
  context?: string;
}

export interface Question {
  id: number;
  category: CategoryId;
  stateCode?: string; // e.g., 'BE' for Berlin, 'BY' for Bayern
  question: TranslationText;
  options: QuestionOption[];
  correctOptionId: 'a' | 'b' | 'c' | 'd';
  explanation: TranslationText;
  keyVocabulary?: VocabularyTerm[];
  imageUrl?: string;
}

export interface GermanState {
  code: string;
  name: string;
  nameEn: string;
  nameFa: string;
  capital: string;
  capitalEn: string;
  capitalFa: string;
  population: string;
  flagColor: string;
  description: TranslationText;
  svgIcon: string;
}

export interface UserStats {
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  bookmarkedIds: number[];
  wrongQuestionIds: number[];
  answeredQuestions: Record<number, { isCorrect: boolean; selectedOption: string; timestamp: number }>;
  examSessions: ExamSessionResult[];
  streakDays: number;
  lastStudyDate: string;
  unlockedBadgeIds: string[];
}

export interface ExamSessionResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  timeSpentSeconds: number;
  stateCode: string;
  answers: Record<number, 'a' | 'b' | 'c' | 'd'>;
  questionIds: number[];
}

export interface Badge {
  id: string;
  title: TranslationText;
  description: TranslationText;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface GlossaryItem {
  id: string;
  term: string;
  article?: 'der' | 'die' | 'das';
  plural?: string;
  syllables: string;
  category: 'verfassung' | 'justiz' | 'politik' | 'gesellschaft' | 'geschichte';
  meaning: TranslationText;
  exampleSentence: TranslationText;
}
