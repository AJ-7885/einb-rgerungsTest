import React, { useState, useMemo } from 'react';
import { Question, TranslationMode } from '../types';
import { QuestionCard } from './QuestionCard';
import { GERMAN_STATES } from '../data/states';
import {
  Search,
  Bookmark,
  AlertTriangle,
  MapPin,
  BookOpen,
  CheckSquare,
  Square,
  PlayCircle,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface QuestionExplorerProps {
  questions: Question[];
  selectedStateCode: string;
  onSelectState: (code: string) => void;
  onOpenStatePicker?: () => void;
  bookmarkedIds: number[];
  wrongQuestionIds: number[];
  answeredQuestions: Record<number, { isCorrect: boolean; selectedOption: string }>;
  onAnswerQuestion: (questionId: number, optionId: 'a' | 'b' | 'c' | 'd', isCorrect: boolean) => void;
  onToggleBookmark: (id: number) => void;
  onBatchBookmark?: (questionIds: number[], shouldBookmark: boolean) => void;
  onPracticeCustomQuestions?: (questionIds: number[]) => void;
  speechRate?: number;
  translationMode: TranslationMode;
}

type FilterType = 'all' | 'politik' | 'geschichte' | 'gesellschaft' | 'bundesland' | 'bookmarked' | 'wrong';

export const QuestionExplorer: React.FC<QuestionExplorerProps> = ({
  questions,
  selectedStateCode,
  onSelectState,
  onOpenStatePicker,
  bookmarkedIds,
  wrongQuestionIds,
  answeredQuestions,
  onAnswerQuestion,
  onToggleBookmark,
  onBatchBookmark,
  onPracticeCustomQuestions,
  speechRate = 0.85,
  translationMode,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const itemsPerPage = 8;

  const currentState = useMemo(() => {
    return GERMAN_STATES.find(s => s.code === selectedStateCode) || GERMAN_STATES[0];
  }, [selectedStateCode]);

  // Filter logic
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      // Category filter
      if (filter === 'politik' && q.category !== 'politik') return false;
      if (filter === 'geschichte' && q.category !== 'geschichte') return false;
      if (filter === 'gesellschaft' && q.category !== 'gesellschaft') return false;
      
      if (filter === 'bundesland') {
        if (q.category !== 'bundesland') return false;
        if (selectedStateCode !== 'ALL' && q.stateCode !== selectedStateCode) return false;
      }
      
      if (filter === 'bookmarked' && !bookmarkedIds.includes(q.id)) return false;
      if (filter === 'wrong' && !wrongQuestionIds.includes(q.id)) return false;

      // If general 'all', and a specific state is chosen, only show that state's state-questions along with all federal questions
      if (filter === 'all' && q.category === 'bundesland' && selectedStateCode !== 'ALL' && q.stateCode !== selectedStateCode) {
        return false;
      }

      // Keyword Search filter (German, English, Persian, ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inDe = q.question.de.toLowerCase().includes(query);
        const inEn = q.question.en.toLowerCase().includes(query);
        const inFa = q.question.fa.toLowerCase().includes(query);
        const inId = q.id.toString() === query;
        const inVocab = q.keyVocabulary?.some(v =>
          v.term.toLowerCase().includes(query) ||
          v.en.toLowerCase().includes(query) ||
          v.fa.toLowerCase().includes(query)
        );

        if (!inDe && !inEn && !inFa && !inId && !inVocab) {
          return false;
        }
      }

      return true;
    });
  }, [questions, filter, selectedStateCode, bookmarkedIds, wrongQuestionIds, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredQuestions.slice(start, start + itemsPerPage);
  }, [filteredQuestions, activePage, itemsPerPage]);

  // Multi-select helpers
  const handleToggleSelectQuestion = (id: number) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedQuestions.map(q => q.id);
    const allPageSelected = pageIds.every(id => selectedQuestionIds.includes(id));
    if (allPageSelected) {
      setSelectedQuestionIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      const set = new Set([...selectedQuestionIds, ...pageIds]);
      setSelectedQuestionIds(Array.from(set));
    }
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredQuestions.map(q => q.id);
    const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedQuestionIds.includes(id));
    if (allFilteredSelected) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredIds);
    }
  };

  const handleClearSelection = () => {
    setSelectedQuestionIds([]);
  };

  const handleBookmarkSelected = (shouldBookmark: boolean) => {
    if (selectedQuestionIds.length === 0) return;
    if (onBatchBookmark) {
      onBatchBookmark(selectedQuestionIds, shouldBookmark);
    } else {
      selectedQuestionIds.forEach(id => {
        const isBm = bookmarkedIds.includes(id);
        if (shouldBookmark && !isBm) onToggleBookmark(id);
        else if (!shouldBookmark && isBm) onToggleBookmark(id);
      });
    }
  };

  const handlePracticeSelected = () => {
    if (selectedQuestionIds.length === 0) return;
    if (onPracticeCustomQuestions) {
      onPracticeCustomQuestions(selectedQuestionIds);
    }
  };

  const isCurrentPageAllSelected =
    paginatedQuestions.length > 0 &&
    paginatedQuestions.every(q => selectedQuestionIds.includes(q.id));

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Deck */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Row 1: Search & Bundesland Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActivePage(1);
              }}
              placeholder="Fragen suchen (z.B. Grundgesetz, Wahl, 1989 / search in DE, EN, فارسی)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Bundesland Badge & Quick Switch Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onOpenStatePicker) onOpenStatePicker();
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 transition text-xs font-bold shrink-0"
              title="Klicken zum Wechseln des Bundeslandes (Click to change federal state)"
            >
              <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {selectedStateCode === 'ALL' ? '🌐 Alle Länder' : `${currentState.svgIcon} ${currentState.name}`}
              </span>
              <span className="text-amber-600 dark:text-amber-400 text-[10px]">Ändern ▾</span>
            </button>

            {/* Direct state dropdown fallback */}
            <select
              value={selectedStateCode}
              aria-label="Bundesland auswählen"
              onChange={(e) => {
                onSelectState(e.target.value);
                setActivePage(1);
              }}
              className="hidden lg:block py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">🌐 Alle 16 Bundesländer</option>
              {GERMAN_STATES.map(s => (
                <option key={s.code} value={s.code}>
                  {s.svgIcon} {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Category Filter segmented tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => { setFilter('all'); setActivePage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Alle Fragen ({selectedStateCode === 'ALL' ? '460' : '310'})
          </button>

          <button
            onClick={() => { setFilter('politik'); setActivePage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'politik'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Politik (100)
          </button>

          <button
            onClick={() => { setFilter('geschichte'); setActivePage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'geschichte'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Geschichte (100)
          </button>

          <button
            onClick={() => { setFilter('gesellschaft'); setActivePage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'gesellschaft'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gesellschaft (100)
          </button>

          <button
            onClick={() => { setFilter('bundesland'); setActivePage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'bundesland'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {selectedStateCode === 'ALL' ? 'Landesfragen (160)' : `${currentState.name} (10)`}
          </button>

          <button
            onClick={() => { setFilter('bookmarked'); setActivePage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'bookmarked'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Gemerkte ({bookmarkedIds.length})</span>
          </button>

          <button
            onClick={() => { setFilter('wrong'); setActivePage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'wrong'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Lernliste / Fehler ({wrongQuestionIds.length})</span>
          </button>
        </div>

        {/* Row 3: Multi-select Action Bar / Question Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAllOnPage}
              className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
            >
              {isCurrentPageAllSelected ? (
                <CheckSquare className="w-4 h-4 text-amber-500" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Seite auswählen ({paginatedQuestions.length})</span>
            </button>

            <button
              onClick={handleSelectAllFiltered}
              className="hidden sm:inline-block font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
            >
              Alle {filteredQuestions.length} auswählen
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span>{filteredQuestions.length} Fragen gefunden</span>
            <span>Seite {activePage} von {totalPages}</span>
          </div>
        </div>
      </div>

      {/* Floating / Sticky Multi-Select Action Toolbar when questions are selected */}
      {selectedQuestionIds.length > 0 && (
        <div className="sticky top-18 z-30 bg-amber-500 dark:bg-amber-600 text-slate-950 p-3 sm:p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-slate-950 text-amber-400 font-bold flex items-center justify-center text-xs">
              {selectedQuestionIds.length}
            </span>
            <span className="font-bold text-xs sm:text-sm">
              {selectedQuestionIds.length === 1 ? '1 Frage ausgewählt' : `${selectedQuestionIds.length} Fragen ausgewählt`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            {/* Batch Bookmark */}
            <button
              onClick={() => handleBookmarkSelected(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-white hover:bg-slate-900 transition shadow-xs"
              title="Alle ausgewählten Fragen in die Merkliste speichern"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Merken ({selectedQuestionIds.length})</span>
            </button>

            {/* Practice in Simulator */}
            {onPracticeCustomQuestions && (
              <button
                onClick={handlePracticeSelected}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 transition shadow-xs"
                title="Simulator nur mit diesen ausgewählten Fragen starten"
              >
                <PlayCircle className="w-4 h-4 text-emerald-600" />
                <span>Im Test üben</span>
              </button>
            )}

            {/* Clear Selection */}
            <button
              onClick={handleClearSelection}
              className="p-1.5 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition"
              title="Auswahl aufheben (Clear selection)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Follow-up Learning Banner if filter === 'wrong' */}
      {filter === 'wrong' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-wrap items-center justify-between gap-4 text-xs text-rose-950 dark:text-rose-100">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Lernliste für Nachbereitung (Follow-up Learning)</h4>
              <p className="opacity-90 mt-0.5">
                Hier werden alle Fragen gesammelt, die Sie noch nicht richtig beantwortet haben ({wrongQuestionIds.length} Fragen). Sobald Sie eine Frage richtig beantworten, wird sie automatisch aus dieser Liste entfernt.
              </p>
            </div>
          </div>
          {wrongQuestionIds.length > 0 && onPracticeCustomQuestions && (
            <button
              onClick={() => onPracticeCustomQuestions(wrongQuestionIds)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold whitespace-nowrap transition shadow-xs"
            >
              Alle {wrongQuestionIds.length} im Simulator üben
            </button>
          )}
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {paginatedQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Keine Fragen für diesen Filter gefunden
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Probieren Sie einen anderen Suchbegriff oder wählen Sie "Alle Fragen".
            </p>
          </div>
        ) : (
          paginatedQuestions.map((q, idx) => {
            const answered = answeredQuestions[q.id];
            const isSelected = selectedQuestionIds.includes(q.id);
            return (
              <QuestionCard
                key={q.id}
                question={q}
                questionNumber={(activePage - 1) * itemsPerPage + idx + 1}
                selectedOptionId={answered?.selectedOption}
                onSelectOption={(optId) => {
                  if (!optId) {
                    onAnswerQuestion(q.id, '' as any, false);
                    return;
                  }
                  const isCorrect = optId === q.correctOptionId;
                  onAnswerQuestion(q.id, optId, isCorrect);
                }}
                isBookmarked={bookmarkedIds.includes(q.id)}
                onToggleBookmark={() => onToggleBookmark(q.id)}
                speechRate={speechRate}
                activeLanguage={translationMode}
                isSelected={isSelected}
                onToggleSelect={() => handleToggleSelectQuestion(q.id)}
              />
            );
          })
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4">
          <button
            onClick={() => setActivePage(1)}
            disabled={activePage === 1}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Erste Seite (Page 1)"
          >
            « Erste
          </button>

          <button
            onClick={() => setActivePage(prev => Math.max(1, prev - 1))}
            disabled={activePage === 1}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            ‹ Zurück
          </button>

          <span className="text-xs font-mono font-bold px-3 py-1.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl">
            Seite {activePage} von {totalPages}
          </span>

          <button
            onClick={() => setActivePage(prev => Math.min(totalPages, prev + 1))}
            disabled={activePage === totalPages}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Weiter ›
          </button>

          <button
            onClick={() => setActivePage(totalPages)}
            disabled={activePage === totalPages}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Letzte Seite (Last Page)"
          >
            Letzte »
          </button>
        </div>
      )}
    </div>
  );
};
