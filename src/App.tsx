import React, { useState } from 'react';
import { useProgress } from './hooks/useProgress';
import { OFFICIAL_QUESTIONS } from './data/questions';
import { GERMAN_STATES } from './data/states';
import { Navbar, NavTab } from './components/Navbar';
import { QuestionExplorer, FilterType } from './components/QuestionExplorer';
import { ExamSimulator } from './components/ExamSimulator';
import { ThreeDVisualizer } from './components/ThreeDVisualizer';
import { GlossaryModal } from './components/GlossaryModal';
import { StatisticsModal } from './components/StatisticsModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { StatePickerModal } from './components/StatePickerModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  BookOpen,
  Timer,
  Layers,
  MapPin,
  CheckCircle2,
  Bookmark,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ListChecks,
} from 'lucide-react';

export default function App() {
  const {
    stats,
    prefs,
    recordAnswer,
    toggleBookmark,
    recordExamSession,
    updatePrefs,
    resetAllProgress,
  } = useProgress();

  const [activeTab, setActiveTab] = useState<'home' | 'questions' | 'simulator' | '3d'>('home');
  const [questionFilter, setQuestionFilter] = useState<FilterType>('all');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isStatePickerOpen, setIsStatePickerOpen] = useState(false);
  const [customPracticeIds, setCustomPracticeIds] = useState<number[] | null>(null);

  const currentState =
    GERMAN_STATES.find(s => s.code === prefs.selectedStateCode) || GERMAN_STATES[0];

  const totalActiveQuestions = prefs.selectedStateCode === 'ALL' ? 460 : 310;
  const progressPercent = Math.min(
    100,
    Math.round((stats.answeredCount / totalActiveQuestions) * 100)
  );

  const handleSelectState = (stateCode: string) => {
    updatePrefs({ selectedStateCode: stateCode });
  };

  const handleStartPracticeCustom = (questionIds: number[]) => {
    setCustomPracticeIds(questionIds);
    setActiveTab('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuestionsWithFilter = (filter: FilterType) => {
    setQuestionFilter(filter);
    setActiveTab('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNavTab = (tab: NavTab) => {
    if (tab === 'lexikon') {
      setIsGlossaryOpen(true);
    } else if (tab === 'stats') {
      setIsStatsOpen(true);
    } else {
      if (tab === 'questions') {
        setQuestionFilter('all');
      }
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Global Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectNavTab}
        isDarkMode={prefs.isDarkMode}
        onToggleDarkMode={() => updatePrefs({ isDarkMode: !prefs.isDarkMode })}
        translationMode={prefs.translationMode}
        onChangeTranslationMode={mode => updatePrefs({ translationMode: mode })}
        onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
        selectedStateCode={prefs.selectedStateCode}
        onOpenStatePicker={() => setIsStatePickerOpen(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* VIEW 1: Minimalist Landing Dashboard ('home') */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Clean Intro Header */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  Offizieller BAMF Fragenkatalog
                </span>

                <button
                  type="button"
                  onClick={() => setIsStatePickerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Bundesland:{' '}
                    <strong>
                      {prefs.selectedStateCode === 'ALL'
                        ? 'Alle 16 Länder'
                        : `${currentState.name} (${currentState.code})`}
                    </strong>
                  </span>
                  <span className="text-slate-400">· Ändern</span>
                </button>
              </div>

              <div className="space-y-2 max-w-2xl">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Einbürgerungstest Deutschland
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Lernen Sie gezielt alle 300 Bundesfragen und die Landesfragen Ihres Bundeslandes — mit deutscher Sprachausgabe und optionaler Übersetzung.
                </p>
              </div>

              {/* Compact Progress Bar */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Lernfortschritt: {stats.answeredCount} von {totalActiveQuestions} Fragen geübt ({progressPercent}%)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {stats.correctCount} richtig
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </section>

            {/* Primary Choice: Learn All Questions vs. Take Exam Simulation */}
            <section
              aria-label="Lernmodus wählen"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Card 1: Fragenkatalog (Accordion Learning) */}
              <button
                type="button"
                onClick={() => handleOpenQuestionsWithFilter('all')}
                className="group text-left bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-3xl p-6 shadow-2xs transition-all flex flex-col justify-between gap-6 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <ListChecks className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Fragenkatalog lernen
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Übersichtliche Liste aller {totalActiveQuestions} Fragen. Klicken Sie auf eine Frage, um die Antwortmöglichkeiten und Erklärung aufzuklappen.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <span>Alle {totalActiveQuestions} Fragen öffnen</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Card 2: Exam Simulator */}
              <button
                type="button"
                onClick={() => {
                  setCustomPracticeIds(null);
                  setActiveTab('simulator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group text-left bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-3xl p-6 shadow-2xs transition-all flex flex-col justify-between gap-6 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Timer className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Prüfung simulieren (33 Fragen)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Offizieller Prüfungsmodus: 30 Bundesfragen + 3 Landesfragen in 60 Minuten. Mindestens 17 richtige Antworten zum Bestehen.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Prüfung jetzt starten</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </section>

            {/* Secondary Quick-Access Tools */}
            <section
              aria-label="Schnellzugriff"
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              <button
                type="button"
                onClick={() => handleOpenQuestionsWithFilter('wrong')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500/60 text-left transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                    {stats.wrongQuestionIds.length}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Fehlerliste</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Falsche Fragen üben
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleOpenQuestionsWithFilter('bookmarked')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/60 text-left transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                    {stats.bookmarkedIds.length}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Gemerkte Fragen</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Gespeicherte Liste
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsGlossaryOpen(true)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left transition space-y-1.5"
              >
                <BookOpen className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">Fachlexikon</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Wichtige Begriffe
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsStatsOpen(true)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left transition space-y-1.5"
              >
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">Statistiken</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Auswertung & Ergebnisse
                </p>
              </button>
            </section>
          </div>
        )}

        {/* VIEW 2: Accordion Questions Catalog ('questions') */}
        {activeTab === 'questions' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Fragenkatalog
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Klicken Sie auf eine Frage, um die 4 Antwortmöglichkeiten aufzuklappen.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCustomPracticeIds(null);
                  setActiveTab('simulator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-2xs"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Prüfung starten (33 Fragen)</span>
              </button>
            </div>

            <QuestionExplorer
              questions={OFFICIAL_QUESTIONS}
              selectedStateCode={prefs.selectedStateCode}
              onSelectState={handleSelectState}
              onOpenStatePicker={() => setIsStatePickerOpen(true)}
              bookmarkedIds={stats.bookmarkedIds}
              wrongQuestionIds={stats.wrongQuestionIds}
              answeredQuestions={stats.answeredQuestions}
              onAnswerQuestion={recordAnswer}
              onToggleBookmark={toggleBookmark}
              onPracticeCustomQuestions={handleStartPracticeCustom}
              speechRate={prefs.speechRate}
              translationMode={prefs.translationMode}
              initialFilter={questionFilter}
            />
          </div>
        )}

        {/* VIEW 3: Exam Simulator ('simulator') */}
        {activeTab === 'simulator' && (
          <div className="animate-in fade-in duration-150">
            <ExamSimulator
              allQuestions={OFFICIAL_QUESTIONS}
              selectedStateCode={prefs.selectedStateCode}
              onFinishExam={recordExamSession}
              bookmarkedIds={stats.bookmarkedIds}
              onToggleBookmark={toggleBookmark}
              speechRate={prefs.speechRate}
              translationMode={prefs.translationMode}
              customQuestionIds={customPracticeIds || undefined}
              onClearCustomQuestions={() => setCustomPracticeIds(null)}
            />
          </div>
        )}

        {/* VIEW 4: 3D Visualizer ('3d') */}
        {activeTab === '3d' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <span>Interaktive 3D Verfassungs-Modelle</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visuelles Lernen für Gewaltenteilung, die 16 Bundesländer und deutsche Geschichte.
              </p>
            </div>

            <ThreeDVisualizer
              onSelectState={handleSelectState}
              selectedStateCode={prefs.selectedStateCode}
              translationMode={prefs.translationMode}
              speechRate={prefs.speechRate}
            />
          </div>
        )}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 mt-12 py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              EinbürgerungsTest Plus
            </span>
            <span aria-hidden="true">·</span>
            <span>Offizielle BAMF-Fragen</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => handleOpenQuestionsWithFilter('all')}
              className="hover:text-amber-500 transition"
            >
              Fragenkatalog
            </button>
            <button
              type="button"
              onClick={() => setIsGlossaryOpen(true)}
              className="hover:text-amber-500 transition"
            >
              Lexikon
            </button>
            <button
              type="button"
              onClick={() => setIsStatsOpen(true)}
              className="hover:text-amber-500 transition"
            >
              Statistik
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        speechRate={prefs.speechRate}
        translationMode={prefs.translationMode}
      />

      <StatisticsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        totalQuestionsCount={OFFICIAL_QUESTIONS.length}
        onResetProgress={resetAllProgress}
      />

      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        speechRate={prefs.speechRate}
        onChangeSpeechRate={rate => updatePrefs({ speechRate: rate })}
      />

      <StatePickerModal
        isOpen={isStatePickerOpen}
        onClose={() => setIsStatePickerOpen(false)}
        selectedStateCode={prefs.selectedStateCode}
        onSelectState={handleSelectState}
      />

      <OfflineIndicator />
    </div>
  );
}
