import React, { useState, useEffect } from 'react';
import { Question, TranslationMode } from '../types';
import { InteractiveWordText } from './InteractiveWordText';
import { speechService } from '../services/speechService';
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  Sparkles,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
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
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

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
  isSelected = false,
  onToggleSelect,
}) => {
  const [localLangView, setLocalLangView] = useState<TranslationMode>(activeLanguage);

  useEffect(() => {
    setLocalLangView(activeLanguage);
  }, [activeLanguage]);

  const hasAnswered = !!selectedOptionId;
  const isCorrect = selectedOptionId === question.correctOptionId;
  const shouldReveal = (!isSimulatorMode && hasAnswered) || forceShowExplanation;

  const handleSpeakOption = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.speak(text, { rate: speechRate });
  };

  return (
    <article
      aria-label={`Question ${questionNumber || question.id}`}
      className={`w-full bg-white dark:bg-slate-900 border transition-all rounded-2xl p-5 sm:p-7 shadow-sm ${
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-500/40 dark:ring-amber-500/30 shadow-md'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          {onToggleSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-amber-500 border-amber-600 text-slate-950 font-extrabold text-[11px]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-white dark:bg-slate-800 text-transparent'
              }`}
              title={isSelected ? 'Auswahl aufheben (Deselect)' : 'Frage merken / auswählen (Select)'}
            >
              ✓
            </button>
          )}
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            Frage {questionNumber ?? question.id}
            {totalQuestions ? ` / ${totalQuestions}` : ''}
          </span>
          <span aria-hidden="true">·</span>
          <span className="capitalize text-amber-700 dark:text-amber-400 font-medium">
            {question.category === 'politik' && 'Politik in der Demokratie'}
            {question.category === 'geschichte' && 'Geschichte & Verantwortung'}
            {question.category === 'gesellschaft' && 'Mensch & Gesellschaft'}
            {question.category === 'bundesland' && `Landesfrage (${question.stateCode})`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Language Toggle (with 'none' / Nur DE option) */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-semibold">
            <button
              onClick={() => setLocalLangView('none')}
              className={`px-2 py-1 rounded-md transition-colors ${
                localLangView === 'none'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Keine Übersetzung — Nur Deutsch (No translation)"
            >
              Nur DE
            </button>
            <button
              onClick={() => setLocalLangView('both')}
              className={`px-2 py-1 rounded-md transition-colors ${
                localLangView === 'both'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Englisch & Persisch"
            >
              EN + فا
            </button>
            <button
              onClick={() => setLocalLangView('en')}
              className={`px-2 py-1 rounded-md transition-colors ${
                localLangView === 'en'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Englisch"
            >
              EN
            </button>
            <button
              onClick={() => setLocalLangView('fa')}
              className={`px-2 py-1 rounded-md transition-colors ${
                localLangView === 'fa'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Persisch (فارسی)"
            >
              فارسی
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-xl transition-colors ${
              isBookmarked
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Gespeichert (Bookmarked)' : 'Schwere Frage merken'}
            aria-label="Bookmark question"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-current" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Question Body */}
      <div className="mt-4 space-y-2">
        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
          <InteractiveWordText
            text={question.question.de}
            speechRate={speechRate}
            highlightTerms={question.keyVocabulary}
            showSentenceAudio={true}
            translationMode={localLangView}
          />
        </div>

        {/* Multilingual Translation */}
        {localLangView !== 'none' && (
          <div className="space-y-1.5 pt-1">
            {(localLangView === 'en' || localLangView === 'both') && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-7">
                <span className="text-slate-400 text-xs font-bold mr-1">EN:</span>
                {question.question.en}
              </p>
            )}

            {(localLangView === 'fa' || localLangView === 'both') && (
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300/90 font-fa leading-relaxed text-right pr-2" dir="rtl">
                <span className="text-amber-600 dark:text-amber-400 text-xs font-bold ml-1">فارسی:</span>
                {question.question.fa}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Multiple Choices / Options List */}
      <div className="mt-6 space-y-3">
        {question.options.map(option => {
          const isSelected = selectedOptionId === option.id;
          const isThisCorrect = option.id === question.correctOptionId;

          // Compute exact borders according to user requirement:
          // "If the choice is correct, the border should turn green;
          //  if incorrect, the selected border should turn red and the correct answer should turn green."
          let optionBorderAndBg = 'border-2 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 bg-white dark:bg-slate-900';

          if (shouldReveal) {
            if (isThisCorrect) {
              // Correct answer turns green
              optionBorderAndBg = 'border-2 border-emerald-500 dark:border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30';
            } else if (isSelected && !isThisCorrect) {
              // Incorrect selected choice turns red
              optionBorderAndBg = 'border-2 border-rose-500 dark:border-rose-500 bg-rose-50/90 dark:bg-rose-950/50 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/30';
            } else {
              optionBorderAndBg = 'border-2 border-slate-200/60 dark:border-slate-800/60 opacity-50 bg-white dark:bg-slate-900/60';
            }
          } else if (isSelected) {
            optionBorderAndBg = 'border-2 border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-500/30';
          }

          return (
            <div
              key={option.id}
              onClick={() => onSelectOption(option.id)}
              className={`group flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all shadow-xs ${optionBorderAndBg}`}
            >
              <div className="flex items-start gap-3 flex-1">
                {/* Option letter & checkbox/radio button indicator */}
                <div className="flex items-center gap-2 mt-0.5 shrink-0">
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center font-bold text-xs uppercase transition-all ${
                      shouldReveal
                        ? isThisCorrect
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : isSelected
                          ? 'border-rose-600 bg-rose-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500'
                        : isSelected
                        ? 'border-amber-500 bg-amber-500 text-slate-950'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:border-amber-500 group-hover:bg-amber-100 dark:group-hover:bg-slate-700'
                    }`}
                  >
                    {shouldReveal && isThisCorrect ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : shouldReveal && isSelected && !isThisCorrect ? (
                      <X className="w-4 h-4 stroke-[3]" />
                    ) : (
                      option.id
                    )}
                  </div>

                  {/* Speaker button to listen to this specific option */}
                  <button
                    type="button"
                    onClick={(e) => handleSpeakOption(option.de, e)}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Option vorlesen (Listen to option)"
                    aria-label="Listen to option"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Option text content with translation */}
                <div className="flex-1 space-y-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    <InteractiveWordText
                      text={option.de}
                      speechRate={speechRate}
                      showSentenceAudio={false}
                      disableWordClick={true}
                    />
                  </div>

                  {(localLangView === 'en' || localLangView === 'both') && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {option.en}
                    </p>
                  )}

                  {(localLangView === 'fa' || localLangView === 'both') && (
                    <p className="text-xs text-amber-700/90 dark:text-amber-400/90 font-fa text-right" dir="rtl">
                      {option.fa}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              {shouldReveal && (
                <div className="shrink-0 self-center">
                  {isThisCorrect ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Richtig</span>
                    </span>
                  ) : isSelected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold">
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Falsch</span>
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Immediate Result Feedback Bar */}
      {shouldReveal && (
        <div className="mt-4">
          {!isCorrect ? (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-900 dark:text-rose-200 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <span className="font-bold">Falsch beantwortet — Zur Wiederholungsliste hinzugefügt!</span>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Diese Frage wird in Ihrer Fehlerliste gespeichert, damit Sie sie gezielt wiederholen können.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  // Retry by clearing selection
                  onSelectOption('' as any);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-200/80 hover:bg-rose-300 dark:bg-rose-900 dark:hover:bg-rose-800 text-rose-950 dark:text-rose-100 font-bold transition shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nochmal versuchen</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">Ausgezeichnet! Richtige Antwort gewählt.</span>
                <p className="text-[11px] opacity-90 mt-0.5">
                  Toll gemacht! Falls die Frage vorher in der Fehlerliste war, wurde sie automatisch entfernt.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explanation & Learning Card */}
      {shouldReveal && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>Erklärung & Hintergrund (Explanation)</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {question.explanation.de}
          </p>

          {(localLangView === 'en' || localLangView === 'both') && (
            <p className="text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/60 pt-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">EN:</span>
              {question.explanation.en}
            </p>
          )}

          {(localLangView === 'fa' || localLangView === 'both') && (
            <p className="text-xs text-amber-800 dark:text-amber-300/90 font-fa border-t border-slate-200 dark:border-slate-700/60 pt-2 text-right" dir="rtl">
              <span className="font-semibold text-amber-700 dark:text-amber-400 ml-1">فارسی:</span>
              {question.explanation.fa}
            </p>
          )}

          {/* Key Vocabulary chips with syllable split */}
          {question.keyVocabulary && question.keyVocabulary.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Schlüsselbegriffe (Key Vocabulary with Syllable Break):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {question.keyVocabulary.map((vocab, vIdx) => (
                  <div
                    key={vIdx}
                    onClick={() => speechService.speakWord(vocab.term, speechRate)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
                    title="Anhören (Listen)"
                  >
                    <Volume2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="font-semibold text-amber-900 dark:text-amber-200">
                      {vocab.syllables || vocab.term}
                    </span>
                    {(localLangView === 'en' || localLangView === 'both') && (
                      <span className="text-slate-500 dark:text-slate-400">· {vocab.en}</span>
                    )}
                    {(localLangView === 'fa' || localLangView === 'both') && (
                      <span className="text-amber-700 dark:text-amber-300 font-fa" dir="rtl">
                        ({vocab.fa})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
