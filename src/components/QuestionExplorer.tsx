import React, { useState, useMemo, useEffect } from 'react';
import { Question, TranslationMode } from '../types';
import { QuestionCard } from './QuestionCard';
import { GERMAN_STATES } from '../data/states';
import {
  Search,
  Bookmark,
  AlertTriangle,
  BookOpen,
  X,
  ChevronsUpDown,
  PlayCircle,
} from 'lucide-react';

export type FilterType =
  | 'all'
  | 'politik'
  | 'geschichte'
  | 'gesellschaft'
  | 'bundesland'
  | 'bookmarked'
  | 'wrong';

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
  onPracticeCustomQuestions?: (questionIds: number[]) => void;
  speechRate?: number;
  translationMode: TranslationMode;
  initialFilter?: FilterType;
}

export const QuestionExplorer: React.FC<QuestionExplorerProps> = ({
  questions,
  selectedStateCode,
  bookmarkedIds,
  wrongQuestionIds,
  answeredQuestions,
  onAnswerQuestion,
  onToggleBookmark,
  onPracticeCustomQuestions,
  speechRate = 1.0,
  translationMode,
  initialFilter = 'all',
}) => {
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);
  const [openQuestionIds, setOpenQuestionIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setFilter(initialFilter);
    setActivePage(1);
  }, [initialFilter]);

  const currentState = useMemo(() => {
    return GERMAN_STATES.find(s => s.code === selectedStateCode) || GERMAN_STATES[0];
  }, [selectedStateCode]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (filter === 'politik' && q.category !== 'politik') return false;
      if (filter === 'geschichte' && q.category !== 'geschichte') return false;
      if (filter === 'gesellschaft' && q.category !== 'gesellschaft') return false;

      if (filter === 'bundesland') {
        if (q.category !== 'bundesland') return false;
        if (selectedStateCode !== 'ALL' && q.stateCode !== selectedStateCode) return false;
      }

      if (filter === 'bookmarked' && !bookmarkedIds.includes(q.id)) return false;
      if (filter === 'wrong' && !wrongQuestionIds.includes(q.id)) return false;

      if (
        filter === 'all' &&
        q.category === 'bundesland' &&
        selectedStateCode !== 'ALL' &&
        q.stateCode !== selectedStateCode
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inDe = q.question.de.toLowerCase().includes(query);
        const inEn = q.question.en.toLowerCase().includes(query);
        const inFa = q.question.fa.toLowerCase().includes(query);
        const inId = q.id.toString() === query;
        const inVocab = q.keyVocabulary?.some(
          v =>
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

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredQuestions.slice(start, start + itemsPerPage);
  }, [filteredQuestions, activePage, itemsPerPage]);

  const handleToggleQuestion = (id: number) => {
    setOpenQuestionIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const areAllCurrentPageOpen =
    paginatedQuestions.length > 0 && paginatedQuestions.every(q => !!openQuestionIds[q.id]);

  const handleToggleAllCurrentPage = () => {
    const nextState = !areAllCurrentPageOpen;
    setOpenQuestionIds(prev => {
      const updated = { ...prev };
      paginatedQuestions.forEach(q => {
        updated[q.id] = nextState;
      });
      return updated;
    });
  };

  const answeredInFilteredCount = useMemo(() => {
    return filteredQuestions.filter(q => !!answeredQuestions[q.id]).length;
  }, [filteredQuestions, answeredQuestions]);

  return (
    <div className="space-y-4">
      {/* Clean, Minimalist Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setActivePage(1);
            }}
            placeholder="Frage oder Stichwort suchen (Deutsch, English, فارسی oder Nr.)..."
            aria-label="Fragen durchsuchen"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActivePage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Suche löschen"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="tablist"
          aria-label="Fragenkategorien"
        >
          {(
            [
              {
                id: 'all',
                label: `Alle (${selectedStateCode === 'ALL' ? '460' : '310'})`,
              },
              { id: 'politik', label: 'Politik (100)' },
              { id: 'geschichte', label: 'Geschichte (100)' },
              { id: 'gesellschaft', label: 'Gesellschaft (100)' },
              {
                id: 'bundesland',
                label:
                  selectedStateCode === 'ALL'
                    ? 'Landesfragen (160)'
                    : `${currentState.name} (10)`,
              },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => {
                setFilter(tab.id);
                setActivePage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'bookmarked'}
            onClick={() => {
              setFilter('bookmarked');
              setActivePage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'bookmarked'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Gemerkt ({bookmarkedIds.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'wrong'}
            onClick={() => {
              setFilter('wrong');
              setActivePage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'wrong'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span>Fehler ({wrongQuestionIds.length})</span>
          </button>
        </div>

        {/* Sub-Toolbar: Question Counter, Accordion Expand/Collapse All, & Page Size */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {filteredQuestions.length} Fragen
            </span>
            <span>·</span>
            <span>{answeredInFilteredCount} beantwortet</span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-500">
              (Klicken Sie auf eine Frage, um Antworten anzuzeigen)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAllCurrentPage}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              <span>{areAllCurrentPageOpen ? 'Alle zuklappen' : 'Alle aufklappen'}</span>
            </button>

            <select
              value={itemsPerPage}
              aria-label="Fragen pro Seite"
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setActivePage(1);
              }}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border-0 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value={25}>25 / Seite</option>
              <option value={50}>50 / Seite</option>
              <option value={100}>100 / Seite</option>
              <option value={500}>Alle anzeigen</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contextual Practice Banner when viewing Wrong or Bookmarked questions */}
      {filter === 'wrong' && wrongQuestionIds.length > 0 && onPracticeCustomQuestions && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-950 dark:text-rose-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>
              <strong>{wrongQuestionIds.length} Fragen</strong> zur Wiederholung vorgemerkt. Sobald Sie eine Frage richtig lösen, verschwindet sie aus dieser Liste.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onPracticeCustomQuestions(wrongQuestionIds)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Im Simulator üben</span>
          </button>
        </div>
      )}

      {filter === 'bookmarked' && bookmarkedIds.length > 0 && onPracticeCustomQuestions && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950 dark:text-amber-100">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>{bookmarkedIds.length} gemerkte Fragen</strong> in Ihrer persönlichen Lernliste.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onPracticeCustomQuestions(bookmarkedIds)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold transition"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Im Simulator üben</span>
          </button>
        </div>
      )}

      {/* Accordion Questions List */}
      <div className="space-y-2.5">
        {paginatedQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2.5" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Keine Fragen gefunden
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Passen Sie den Suchbegriff an oder wechseln Sie den Filter oben.
            </p>
          </div>
        ) : (
          paginatedQuestions.map((q, idx) => {
            const answered = answeredQuestions[q.id];
            const isOpen = !!openQuestionIds[q.id];
            return (
              <QuestionCard
                key={q.id}
                question={q}
                questionNumber={(activePage - 1) * itemsPerPage + idx + 1}
                selectedOptionId={answered?.selectedOption}
                onSelectOption={optId => {
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
                isAccordion={true}
                isOpen={isOpen}
                onToggleOpen={() => handleToggleQuestion(q.id)}
              />
            );
          })
        )}
      </div>

      {/* Clean Pagination Controls */}
      {totalPages > 1 && (
        <nav
          aria-label="Seitennavigation"
          className="flex flex-wrap items-center justify-center gap-1.5 pt-3"
        >
          <button
            type="button"
            onClick={() => {
              setActivePage(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={activePage === 1}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-35 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            « Erste
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePage(prev => Math.max(1, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={activePage === 1}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-35 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            ‹ Zurück
          </button>

          <span className="text-xs font-mono font-bold px-3.5 py-1.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl">
            Seite {activePage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => {
              setActivePage(prev => Math.min(totalPages, prev + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={activePage === totalPages}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-35 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Weiter ›
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePage(totalPages);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={activePage === totalPages}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-35 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Letzte »
          </button>
        </nav>
      )}
    </div>
  );
};
