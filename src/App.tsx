import React, { useState } from 'react';
import { useProgress } from './hooks/useProgress';
import { OFFICIAL_QUESTIONS } from './data/questions';
import { GERMAN_STATES } from './data/states';
import { Navbar } from './components/Navbar';
import { QuestionExplorer } from './components/QuestionExplorer';
import { ExamSimulator } from './components/ExamSimulator';
import { ThreeDVisualizer } from './components/ThreeDVisualizer';
import { GlossaryModal } from './components/GlossaryModal';
import { StatisticsModal } from './components/StatisticsModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { StatePickerModal } from './components/StatePickerModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import brandenburgGateImg from './assets/images/brandenburg_gate_berlin_1793084132948.jpg';
import {
  BookOpen,
  Timer,
  Layers,
  Award,
  Sparkles,
  Volume2,
  Globe2,
  MapPin,
  CheckCircle2,
  Flame,
  CheckSquare,
} from 'lucide-react';

export default function App() {
  const {
    stats,
    prefs,
    recordAnswer,
    toggleBookmark,
    batchBookmark,
    recordExamSession,
    updatePrefs,
    resetAllProgress,
  } = useProgress();

  const [activeTab, setActiveTab] = useState<'questions' | 'simulator' | '3d' | 'lexikon' | 'stats'>('questions');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isStatePickerOpen, setIsStatePickerOpen] = useState(false);
  const [customPracticeIds, setCustomPracticeIds] = useState<number[] | null>(null);

  const currentState = GERMAN_STATES.find(s => s.code === prefs.selectedStateCode) || GERMAN_STATES[0];

  const handleSelectState = (stateCode: string) => {
    updatePrefs({ selectedStateCode: stateCode });
  };

  const handleStartPracticeCustom = (questionIds: number[]) => {
    setCustomPracticeIds(questionIds);
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'lexikon') setIsGlossaryOpen(true);
          else if (tab === 'stats') setIsStatsOpen(true);
          else setActiveTab(tab);
        }}
        isDarkMode={prefs.isDarkMode}
        onToggleDarkMode={() => updatePrefs({ isDarkMode: !prefs.isDarkMode })}
        speechRate={prefs.speechRate}
        onChangeSpeechRate={(rate) => updatePrefs({ speechRate: rate })}
        translationMode={prefs.translationMode}
        onChangeTranslationMode={(mode) => updatePrefs({ translationMode: mode })}
        onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
        selectedStateCode={prefs.selectedStateCode}
        onOpenStatePicker={() => setIsStatePickerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Hero Banner (Only when on 'questions' tab) */}
        {activeTab === 'questions' && (
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-900 text-white">
            <img
              src={brandenburgGateImg}
              alt="Brandenburg Gate Berlin"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />

            <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Offizieller BAMF Prüfungskatalog · Trilingual (DE / EN / فارسی)</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Einbürgerungstest Deutschland
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Vollständiger offizieller Fragenkatalog (alle 300 Bundesfragen + 160 Landesfragen aller 16 Bundesländer).
                Klicken Sie auf beliebige deutsche Wörter für die korrekte Aussprache und lernen Sie mit
                präzisen Übersetzungen auf Englisch und Persisch (فارسی).
              </p>

              {/* Quick Actions & State Badge */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setCustomPracticeIds(null);
                    setActiveTab('simulator');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm transition shadow-sm"
                >
                  <Timer className="w-4 h-4" />
                  <span>Prüfung simulieren (33 Fragen)</span>
                </button>

                <button
                  onClick={() => setIsGlossaryOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs sm:text-sm transition"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Wörterbuch & Fachlexikon</span>
                </button>

                <button
                  onClick={() => setActiveTab('3d')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs sm:text-sm transition"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>3D Modelle</span>
                </button>

                {/* State selector clickable badge */}
                <button
                  onClick={() => setIsStatePickerOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-medium text-slate-200 transition group"
                  title="Bundesland wechseln (Click to change state)"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-amber-400 font-bold">
                    {prefs.selectedStateCode === 'ALL'
                      ? '🌐 Alle 16 Bundesländer'
                      : `${currentState.svgIcon} ${currentState.name} (${currentState.code})`}
                  </span>
                  <span className="text-[11px] text-slate-400 underline decoration-dotted">Ändern ▾</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Strip at Bottom of Hero */}
            <div className="relative z-10 border-t border-slate-800 bg-slate-950/60 backdrop-blur-xs px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Klick-Aussprache aktiv: Jedes deutsche Wort kann angehört werden</span>
              </div>

              <div className="flex items-center gap-4 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {stats.correctCount} richtig gelöst
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {stats.streakDays} Tage Streak
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab View: Questions Explorer */}
        {activeTab === 'questions' && (
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
            onBatchBookmark={batchBookmark}
            onPracticeCustomQuestions={handleStartPracticeCustom}
            speechRate={prefs.speechRate}
            translationMode={prefs.translationMode}
          />
        )}

        {/* Tab View: Exam Simulator */}
        {activeTab === 'simulator' && (
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
        )}

        {/* Tab View: 3D Visualizer */}
        {activeTab === '3d' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Interaktiver 3D Visualizer
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Visuelles Lernen für Verfassungsprinzipien, die 16 Bundesländer und historische Meilensteine.
                </p>
              </div>
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

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">EinbürgerungsTest Plus</span>
            <span aria-hidden="true">·</span>
            <span>BAMF Vorbereitung mit Sprachausgabe & Übersetzung</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setIsStatePickerOpen(true)}
              className="hover:text-amber-500 transition"
            >
              Bundesland wechseln
            </button>
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="hover:text-amber-500 transition"
            >
              Fachlexikon
            </button>
            <button
              onClick={() => setIsStatsOpen(true)}
              className="hover:text-amber-500 transition"
            >
              Lernstatistik
            </button>
            <span className="text-slate-400">100% Offline-Fähig</span>
          </div>
        </div>
      </footer>

      {/* Terminology Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        speechRate={prefs.speechRate}
        translationMode={prefs.translationMode}
        onChangeTranslationMode={(mode) => updatePrefs({ translationMode: mode })}
      />

      {/* Progress & Statistics Modal */}
      <StatisticsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        totalQuestionsCount={OFFICIAL_QUESTIONS.length}
        onResetProgress={resetAllProgress}
      />

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        speechRate={prefs.speechRate}
        onChangeSpeechRate={(rate) => updatePrefs({ speechRate: rate })}
      />

      {/* Bundesland State Picker Modal */}
      <StatePickerModal
        isOpen={isStatePickerOpen}
        onClose={() => setIsStatePickerOpen(false)}
        selectedStateCode={prefs.selectedStateCode}
        onSelectState={handleSelectState}
      />

      {/* Persistent Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
