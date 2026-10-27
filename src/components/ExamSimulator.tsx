import React, { useState, useEffect, useMemo } from 'react';
import { Question, ExamSessionResult, TranslationMode } from '../types';
import { QuestionCard } from './QuestionCard';
import confetti from 'canvas-confetti';
import {
  Timer,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flag,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
} from 'lucide-react';

interface ExamSimulatorProps {
  allQuestions: Question[];
  selectedStateCode: string;
  onFinishExam: (result: ExamSessionResult) => void;
  bookmarkedIds: number[];
  onToggleBookmark: (id: number) => void;
  speechRate?: number;
  translationMode: TranslationMode;
  customQuestionIds?: number[];
  onClearCustomQuestions?: () => void;
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({
  allQuestions,
  selectedStateCode,
  onFinishExam,
  bookmarkedIds,
  onToggleBookmark,
  speechRate = 0.85,
  translationMode,
  customQuestionIds,
  onClearCustomQuestions,
}) => {
  // If custom question ids are provided, practice those exact questions!
  const examQuestions = useMemo(() => {
    if (customQuestionIds && customQuestionIds.length > 0) {
      const selected = allQuestions.filter(q => customQuestionIds.includes(q.id));
      if (selected.length > 0) return selected;
    }

    // Select 30 federal questions + 3 state questions
    const federal = allQuestions.filter(q => q.category !== 'bundesland');
    const state = allQuestions.filter(q =>
      q.category === 'bundesland' && (selectedStateCode === 'ALL' || q.stateCode === selectedStateCode)
    );

    // Shuffle and pick
    const shuffledFederal = [...federal].sort(() => 0.5 - Math.random()).slice(0, 30);
    const shuffledState = [...state].sort(() => 0.5 - Math.random()).slice(0, 3);

    // If fewer than 3 state questions exist, fill with federal
    const combined = [...shuffledFederal, ...shuffledState];
    if (combined.length < 33) {
      const remaining = federal.filter(q => !combined.some(c => c.id === q.id));
      combined.push(...remaining.slice(0, 33 - combined.length));
    }

    return combined.slice(0, 33);
  }, [allQuestions, selectedStateCode, customQuestionIds]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'a' | 'b' | 'c' | 'd'>>({});
  const [flaggedIndices, setFlaggedIndices] = useState<number[]>([]);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(60 * 60); // 60 minutes
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isExamSubmitted) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExamSubmitted]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionId: 'a' | 'b' | 'c' | 'd') => {
    const q = examQuestions[currentIndex];
    setAnswers(prev => ({
      ...prev,
      [q.id]: optionId,
    }));
  };

  const toggleFlagCurrent = () => {
    setFlaggedIndices(prev =>
      prev.includes(currentIndex) ? prev.filter(i => i !== currentIndex) : [...prev, currentIndex]
    );
  };

  const totalExamQuestions = examQuestions.length;
  const minPassScore = totalExamQuestions === 33 ? 17 : Math.max(1, Math.ceil(totalExamQuestions * 0.5));

  const handleSubmitExam = () => {
    let score = 0;
    examQuestions.forEach(q => {
      if (answers[q.id] === q.correctOptionId) {
        score += 1;
      }
    });

    const isPassed = score >= minPassScore;

    const result: ExamSessionResult = {
      id: `exam_${Date.now()}`,
      date: new Date().toISOString(),
      score,
      totalQuestions: totalExamQuestions,
      passed: isPassed,
      timeSpentSeconds: 3600 - timeLeftSeconds,
      stateCode: selectedStateCode,
      answers,
      questionIds: examQuestions.map(q => q.id),
    };

    setIsExamSubmitted(true);
    setShowConfirmSubmit(false);
    onFinishExam(result);

    if (isPassed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const currentQ = examQuestions[currentIndex] || examQuestions[0];
  const answeredCount = Object.keys(answers).length;

  // Calculate results if submitted
  const correctCount = useMemo(() => {
    if (!isExamSubmitted) return 0;
    return examQuestions.filter(q => answers[q.id] === q.correctOptionId).length;
  }, [isExamSubmitted, examQuestions, answers]);

  const passed = correctCount >= minPassScore;

  return (
    <div className="space-y-6">
      {/* Top Simulator Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {customQuestionIds && customQuestionIds.length > 0
                  ? 'Gezieltes Training (Ausgewählte Fragen)'
                  : 'BAMF Test-Simulator'}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {totalExamQuestions} Fragen · 60 Min
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {customQuestionIds && customQuestionIds.length > 0 ? (
                <span className="flex items-center gap-2">
                  <span>Sie üben gezielt {totalExamQuestions} ausgewählte Fragen</span>
                  {onClearCustomQuestions && (
                    <button
                      onClick={onClearCustomQuestions}
                      className="text-amber-600 dark:text-amber-400 font-bold underline hover:no-underline"
                    >
                      Zum Standard 33-Fragen Test
                    </button>
                  )}
                </span>
              ) : (
                `30 Bundesfragen + 3 Landesfragen (${selectedStateCode}) · Mindestens 17 Punkte zum Bestehen`
              )}
            </p>
          </div>
        </div>

        {/* Timer & Submit Button */}
        <div className="flex items-center gap-3">
          {!isExamSubmitted && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
                timeLeftSeconds < 300
                  ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-400 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>
          )}

          {!isExamSubmitted ? (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-sm"
            >
              Test abgeben ({answeredCount}/{totalExamQuestions})
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {passed && (
                <button
                  onClick={() => setShowCertificate(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition"
                >
                  <Award className="w-4 h-4" />
                  <span>Zertifikat anzeigen</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Test jetzt beenden und auswerten?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Sie haben <strong>{answeredCount} von 33</strong> Fragen beantwortet.
              {answeredCount < 33 && (
                <span className="block mt-1 text-amber-600 dark:text-amber-400 font-semibold">
                  ⚠️ Es sind noch {33 - answeredCount} Fragen unbeantwortet!
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Weiter üben
              </button>
              <button
                onClick={handleSubmitExam}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                Ja, jetzt abgeben
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Score Banner */}
      {isExamSubmitted && (
        <div
          className={`border rounded-2xl p-6 shadow-sm ${
            passed
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 text-rose-950 dark:text-rose-100'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl ${
                  passed
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-xl font-extrabold">
                  {passed ? 'HERZLICHEN GLÜCKWUNSCH! BESTANDEN!' : 'LEIDER NICHT BESTANDEN'}
                </h3>
                <p className="text-xs sm:text-sm mt-1 opacity-90">
                  Sie haben <strong>{correctCount} von {totalExamQuestions}</strong> Punkten erreicht (
                  {Math.round((correctCount / totalExamQuestions) * 100)}%). Benötigt werden {minPassScore} Punkte.
                </p>
                {(translationMode === 'fa' || translationMode === 'both') && (
                  <p className="text-xs font-fa mt-1 opacity-80" dir="rtl">
                    {passed
                      ? 'تبریک! شما در آزمون شبیه‌ساز شهروندی قبول شدید.'
                      : 'متأسفانه نمره قبولی را کسب نکردید. مرور سوالات اشتباه را تمرین کنید.'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsExamSubmitted(false);
                  setAnswers({});
                  setFlaggedIndices([]);
                  setTimeLeftSeconds(3600);
                  setCurrentIndex(0);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Neuen Test starten</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Navigation Palette Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
          <span>Fragenübersicht (Palette)</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Beantwortet ({answeredCount})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              Offen ({totalExamQuestions - answeredCount})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
          {examQuestions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = currentIndex === idx;
            const isFlagged = flaggedIndices.includes(idx);
            const isCorrectAnswer = isExamSubmitted && answers[q.id] === q.correctOptionId;
            const isWrongAnswer = isExamSubmitted && isAnswered && !isCorrectAnswer;

            let btnStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

            if (isExamSubmitted) {
              if (isCorrectAnswer) btnStyle = 'bg-emerald-600 text-white font-bold';
              else if (isWrongAnswer) btnStyle = 'bg-rose-600 text-white font-bold';
              else btnStyle = 'bg-slate-200 dark:bg-slate-800 text-slate-400';
            } else if (isCurrent) {
              btnStyle = 'ring-2 ring-amber-500 bg-amber-500 text-slate-950 font-bold';
            } else if (isAnswered) {
              btnStyle = 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold border border-amber-300 dark:border-amber-700/60';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative flex items-center justify-center h-8 rounded-lg text-xs transition ${btnStyle}`}
              >
                {idx + 1}
                {isFlagged && !isExamSubmitted && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Card */}
      {currentQ && (
        <div className="space-y-4">
          <QuestionCard
            question={currentQ}
            questionNumber={currentIndex + 1}
            totalQuestions={totalExamQuestions}
            selectedOptionId={answers[currentQ.id]}
            onSelectOption={handleSelectOption}
            isBookmarked={bookmarkedIds.includes(currentQ.id)}
            onToggleBookmark={() => onToggleBookmark(currentQ.id)}
            isSimulatorMode={!isExamSubmitted}
            showExplanation={isExamSubmitted}
            speechRate={speechRate}
            activeLanguage={translationMode}
          />

          {/* Bottom Prev / Flag / Next controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Vorherige Frage</span>
            </button>

            {!isExamSubmitted && (
              <button
                onClick={toggleFlagCurrent}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                  flaggedIndices.includes(currentIndex)
                    ? 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flaggedIndices.includes(currentIndex) ? 'Markiert' : 'Frage vormerken'}</span>
              </button>
            )}

            <button
              onClick={() => setCurrentIndex(prev => Math.min(totalExamQuestions - 1, prev + 1))}
              disabled={currentIndex === totalExamQuestions - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 disabled:opacity-40 hover:opacity-90 transition"
            >
              <span>Nächste Frage</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-4 border-amber-500 rounded-3xl p-8 shadow-2xl text-center relative">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>

            <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3">
              <Award className="w-12 h-12" />
            </div>

            <h3 className="text-xl font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Bescheinigung über Prüfungserfolg
            </h3>
            <p className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold mt-1">
              Einbürgerungstest Simulator (BAMF Standard)
            </p>

            <div className="my-6 py-4 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Erreichte Punktzahl:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {correctCount} von 33 ({Math.round((correctCount / 33) * 100)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Prüfungsstatus:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">BESTANDEN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bundesland:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStateCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Datum:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {new Date().toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 italic">
              "Die Kenntnisse der Rechts- und Gesellschaftsordnung sowie der Lebensverhältnisse in Deutschland wurden erfolgreich nachgewiesen."
            </p>

            <button
              onClick={() => setShowCertificate(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-600 transition"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
