import React from 'react';
import { UserStats } from '../types';
import {
  BarChart3,
  Award,
  CheckCircle2,
  XCircle,
  Flame,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  totalQuestionsCount: number;
  onResetProgress: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  isOpen,
  onClose,
  stats,
  totalQuestionsCount,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const totalAnswered = stats.answeredCount;
  const accuracy = totalAnswered > 0 ? Math.round((stats.correctCount / totalAnswered) * 100) : 0;
  const coveragePercent = Math.round((totalAnswered / Math.max(1, totalQuestionsCount)) * 100);

  // Readiness Score: weighted by coverage and accuracy
  const readinessScore = Math.min(100, Math.round(accuracy * 0.7 + coveragePercent * 0.3));

  const allBadges = [
    {
      id: 'first_step',
      title: 'Erster Schritt',
      desc: 'Erste Frage erfolgreich beantwortet',
      icon: '🌱',
      isUnlocked: true,
    },
    {
      id: 'ten_done',
      title: '10 Fragen gemeistert',
      desc: 'Mindestens 10 Fragen geübt',
      icon: '🎯',
      isUnlocked: stats.unlockedBadgeIds.includes('ten_done'),
    },
    {
      id: 'twenty_five_correct',
      title: 'Wissens-Champion',
      desc: '25 Fragen fehlerfrei beantwortet',
      icon: '⭐',
      isUnlocked: stats.unlockedBadgeIds.includes('twenty_five_correct'),
    },
    {
      id: 'smart_saver',
      title: 'Fokus-Lerner',
      desc: '3 schwierige Fragen gemerkt',
      icon: '📌',
      isUnlocked: stats.unlockedBadgeIds.includes('smart_saver'),
    },
    {
      id: 'exam_master',
      title: 'Prüfungsmeister',
      desc: 'Eine BAMF-Prüfungssimulation bestanden (>=17/33)',
      icon: '🏆',
      isUnlocked: stats.unlockedBadgeIds.includes('exam_master'),
    },
    {
      id: 'high_scorer',
      title: 'Überflieger',
      desc: 'Über 30 Punkte in der Prüfung erreicht',
      icon: '🥇',
      isUnlocked: stats.unlockedBadgeIds.includes('high_scorer'),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Lernfortschritt & Statistiken
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detaillierte Auswertung & Erfolge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Readiness gauge */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Prüfungsbereitschaft (Exam Readiness)
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {readinessScore}% bereit
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {readinessScore >= 80
                  ? 'Hervorragend! Sie haben beste Chancen, den Test auf Anhieb zu bestehen.'
                  : readinessScore >= 50
                  ? 'Auf gutem Weg! Vertiefen Sie schwache Themen und simulieren Sie weitere Prüfungen.'
                  : 'Gerade erst gestartet. Üben Sie regelmäßig, um Ihre Trefferquote zu steigern.'}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{stats.streakDays} Tage Streak</span>
            </div>
          </div>

          {/* Quick Metrics KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Beantwortet</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {stats.answeredCount}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Richtig</span>
              <p className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-200 mt-1">
                {stats.correctCount}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50">
              <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">Falsch</span>
              <p className="text-xl font-bold font-mono text-rose-800 dark:text-rose-200 mt-1">
                {stats.wrongCount}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Erfolgsquote</span>
              <p className="text-xl font-bold font-mono text-amber-800 dark:text-amber-200 mt-1">
                {accuracy}%
              </p>
            </div>
          </div>

          {/* Badges Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Erfolge & Abzeichen (Badges)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allBadges.map(b => (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                    b.isUnlocked
                      ? 'bg-white dark:bg-slate-800/80 border-amber-300 dark:border-amber-700/60 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-50'
                  }`}
                >
                  <span className="text-2xl shrink-0">{b.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {b.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {b.desc}
                    </p>
                  </div>
                  {b.isUnlocked && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Exam History */}
          {stats.examSessions.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Bisherige Prüfungssimulationen ({stats.examSessions.length})
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {stats.examSessions.map((session, sIdx) => (
                  <div
                    key={session.id || sIdx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {session.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {session.passed ? 'Bestanden' : 'Nicht bestanden'}
                      </span>
                      <span className="text-slate-400">· {session.stateCode}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {session.score} / {session.totalQuestions}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(session.date).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset progress */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Fortschritt wird lokal auf diesem Gerät gespeichert.
            </span>
            <button
              onClick={() => {
                if (window.confirm('Möchten Sie Ihren gesamten Lernfortschritt wirklich zurücksetzen?')) {
                  onResetProgress();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Fortschritt zurücksetzen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
