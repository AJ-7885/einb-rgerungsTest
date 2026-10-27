import React from 'react';
import { Question, TranslationMode } from '../types';
import { InteractiveWordText } from './InteractiveWordText';
import { speechService } from '../services/speechService';
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  Volume2,
  Check,
  X,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber?: number;
  totalQuestions?: number;
  selectedOptionId?: string;
  onSelectOption: (optionId: 'a' | 'b' | 'c' | 'd') => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isSimulatorMode?: boolean;
  showExplanation?: boolean;
  speechRate?: number;
  activeLanguage?: TranslationMode;
  isAccordion?: boolean;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

const CATEGORY_LABELS: Record<Question['category'], string> = {
  politik: 'Politik',
  geschichte: 'Geschichte',
  gesellschaft: 'Gesellschaft',
  bundesland: 'Landesfrage',
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  isBookmarked,
  onToggleBookmark,
  isSimulatorMode = false,
  showExplanation: forceShowExplanation = false,
  speechRate = 1.0,
  activeLanguage = 'both',
  isAccordion = false,
  isOpen = true,
  onToggleOpen,
}) => {
  const hasAnswered = !!selectedOptionId;
  const isCorrect = selectedOptionId === question.correctOptionId;
  const shouldReveal = (!isSimulatorMode && hasAnswered) || forceShowExplanation;
  const isExpanded = !isAccordion || isOpen;

  const handleSpeakQuestion = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.speak(question.question.de, { rate: speechRate });
  };

  const handleSpeakOption = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.speak(text, { rate: speechRate });
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark();
  };

  // Status badge styling for the question number
  let numberBadgeClasses =
    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  if (shouldReveal) {
    if (isCorrect) {
      numberBadgeClasses =
        'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    } else {
      numberBadgeClasses =
        'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    }
  } else if (hasAnswered) {
    numberBadgeClasses =
      'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
  }

  return (
    <article
      aria-label={`Frage ${questionNumber || question.id}`}
      className={`w-full bg-white dark:bg-slate-900 border transition-colors rounded-2xl ${
        isExpanded
          ? 'border-slate-300 dark:border-slate-700 shadow-xs'
          : 'border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Question Header (Clickable Accordion Trigger in Explorer Mode) */}
      <div
        role={isAccordion ? 'button' : undefined}
        tabIndex={isAccordion ? 0 : undefined}
        aria-expanded={isAccordion ? isExpanded : undefined}
        onClick={isAccordion ? onToggleOpen : undefined}
        onKeyDown={
          isAccordion
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleOpen?.();
                }
              }
            : undefined
        }
        className={`flex items-start justify-between gap-3 sm:gap-4 p-4 sm:p-5 ${
          isAccordion
            ? 'cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl'
            : ''
        }`}
      >
        {/* Left: Number & Status Indicator */}
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold ${numberBadgeClasses}`}
          >
            <span>#{questionNumber ?? question.id}</span>
            {totalQuestions ? <span className="opacity-60">/{totalQuestions}</span> : null}
            {shouldReveal && isCorrect && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            {shouldReveal && !isCorrect && <X className="w-3.5 h-3.5 stroke-[2.5]" />}
          </span>
        </div>

        {/* Center: Question Text + Active Translation */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
            <InteractiveWordText
              text={question.question.de}
              speechRate={speechRate}
              highlightTerms={question.keyVocabulary}
              showSentenceAudio={false}
              disableWordClick={!isExpanded}
              translationMode={activeLanguage}
            />
          </div>

          {activeLanguage !== 'none' && (
            <div className="space-y-1">
              {(activeLanguage === 'en' || activeLanguage === 'both') && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {question.question.en}
                </p>
              )}

              {(activeLanguage === 'fa' || activeLanguage === 'both') && (
                <p
                  className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/85 font-fa leading-relaxed text-right"
                  dir="rtl"
                >
                  {question.question.fa}
                </p>
              )}
            </div>
          )}

          {/* Subtle Category Tag when expanded */}
          {isExpanded && (
            <div className="pt-0.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <span>
                {CATEGORY_LABELS[question.category]}
                {question.stateCode ? ` (${question.stateCode})` : ''}
              </span>
              <span>·</span>
              <span>Offizielle Frage #{question.id}</span>
            </div>
          )}
        </div>

        {/* Right: Audio, Bookmark & Accordion Chevron */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleSpeakQuestion}
            className="p-2 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Frage vorlesen (Listen to question)"
            aria-label="Frage vorlesen"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleBookmarkClick}
            className={`p-2 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
              isBookmarked
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Gemerkt (Bookmarked)' : 'Frage merken (Bookmark)'}
            aria-label={isBookmarked ? 'Frage aus Merkliste entfernen' : 'Frage merken'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-current" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {isAccordion && (
            <span
              aria-hidden="true"
              className={`p-1.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-180 text-slate-700 dark:text-slate-200' : ''
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {/* Expandable Answer Options & Explanation */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-150">
          {/* Multiple-Choice Options */}
          <div className="space-y-2" role="radiogroup" aria-label="Antwortmöglichkeiten">
            {question.options.map(option => {
              const isSelected = selectedOptionId === option.id;
              const isThisCorrect = option.id === question.correctOptionId;

              let optionStyle =
                'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60';

              if (shouldReveal) {
                if (isThisCorrect) {
                  optionStyle =
                    'border-emerald-500 dark:border-emerald-500/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100';
                } else if (isSelected && !isThisCorrect) {
                  optionStyle =
                    'border-rose-500 dark:border-rose-500/80 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100';
                } else {
                  optionStyle =
                    'border-slate-200/60 dark:border-slate-800/60 opacity-55 bg-white dark:bg-slate-900/40';
                }
              } else if (isSelected) {
                optionStyle =
                  'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-1 ring-amber-500/40';
              }

              return (
                <div
                  key={option.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => onSelectOption(option.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectOption(option.id);
                    }
                  }}
                  className={`group flex items-start justify-between gap-3 p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${optionStyle}`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Option Letter / Status Indicator */}
                    <span
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center font-mono font-bold text-xs uppercase shrink-0 transition-colors ${
                        shouldReveal
                          ? isThisCorrect
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : isSelected
                            ? 'border-rose-600 bg-rose-600 text-white'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'
                          : isSelected
                          ? 'border-amber-500 bg-amber-500 text-slate-950'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:border-amber-500'
                      }`}
                    >
                      {shouldReveal && isThisCorrect ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : shouldReveal && isSelected && !isThisCorrect ? (
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        option.id
                      )}
                    </span>

                    {/* Option Text & Translations */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                        {option.de}
                      </p>

                      {(activeLanguage === 'en' || activeLanguage === 'both') && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                          {option.en}
                        </p>
                      )}

                      {(activeLanguage === 'fa' || activeLanguage === 'both') && (
                        <p
                          className="text-xs text-amber-800/85 dark:text-amber-300/80 font-fa leading-snug text-right"
                          dir="rtl"
                        >
                          {option.fa}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Speak Option + Status Pill */}
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    <button
                      type="button"
                      onClick={e => handleSpeakOption(option.de, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                      title="Antwort vorlesen (Listen to answer)"
                      aria-label="Antwort vorlesen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {shouldReveal && isThisCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    {shouldReveal && isSelected && !isThisCorrect && (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Concise Explanation & Retry Bar */}
          {shouldReveal && (
            <div className="pt-2 space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                      isCorrect
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Richtig beantwortet</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Nicht richtig — Richtige Antwort: {question.correctOptionId.toUpperCase()}</span>
                      </>
                    )}
                  </span>

                  {!isSimulatorMode && (
                    <button
                      type="button"
                      onClick={() => onSelectOption('' as any)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Zurücksetzen</span>
                    </button>
                  )}
                </div>

                {/* Explanation Text */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {question.explanation.de}
                </p>

                {(activeLanguage === 'en' || activeLanguage === 'both') && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {question.explanation.en}
                  </p>
                )}

                {(activeLanguage === 'fa' || activeLanguage === 'both') && (
                  <p
                    className="text-xs text-amber-800/90 dark:text-amber-300/85 font-fa leading-relaxed text-right"
                    dir="rtl"
                  >
                    {question.explanation.fa}
                  </p>
                )}

                {/* Compact Vocabulary Chips */}
                {question.keyVocabulary && question.keyVocabulary.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/60 flex flex-wrap items-center gap-1.5">
                    {question.keyVocabulary.map((vocab, vIdx) => (
                      <button
                        key={vIdx}
                        type="button"
                        onClick={() => speechService.speakWord(vocab.term, speechRate)}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] hover:border-amber-400 transition-colors"
                        title="Begriff anhören"
                      >
                        <Volume2 className="w-3 h-3 text-amber-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {vocab.syllables || vocab.term}
                        </span>
                        {(activeLanguage === 'en' || activeLanguage === 'both') && (
                          <span className="text-slate-500 dark:text-slate-400">· {vocab.en}</span>
                        )}
                        {(activeLanguage === 'fa' || activeLanguage === 'both') && (
                          <span className="text-amber-700 dark:text-amber-300 font-fa" dir="rtl">
                            ({vocab.fa})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
