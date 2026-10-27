import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { Moon, Sun, Volume2, Languages } from 'lucide-react';

import { TranslationMode } from '../types';
import { GERMAN_STATES } from '../data/states';

interface NavbarProps {
  activeTab: 'questions' | 'simulator' | '3d' | 'lexikon' | 'stats';
  onSelectTab: (tab: 'questions' | 'simulator' | '3d' | 'lexikon' | 'stats') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  speechRate: number;
  onChangeSpeechRate: (rate: number) => void;
  translationMode: TranslationMode;
  onChangeTranslationMode: (mode: TranslationMode) => void;
  onOpenVoiceSettings: () => void;
  selectedStateCode: string;
  onOpenStatePicker: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  speechRate,
  onChangeSpeechRate,
  translationMode,
  onChangeTranslationMode,
  onOpenVoiceSettings,
  selectedStateCode,
  onOpenStatePicker,
}) => {
  const currentState = GERMAN_STATES.find(s => s.code === selectedStateCode);
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div
          onClick={() => onSelectTab('questions')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-xs">
            DE
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            EinbürgerungsTest<span className="text-amber-500">Plus</span>
          </span>
        </div>

        {/* Zone 2: Clean 4–5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onSelectTab('questions')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'questions'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fragenkatalog
          </button>

          <button
            onClick={() => onSelectTab('simulator')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'simulator'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Test-Simulator
          </button>

          <button
            onClick={() => onSelectTab('3d')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === '3d'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            3D Visualizer
          </button>

          <button
            onClick={() => onSelectTab('lexikon')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'lexikon'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fachlexikon
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'stats'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Statistiken
          </button>
        </nav>

        {/* Zone 3: 1 Primary Actions Group */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Bundesland Selector Button */}
          <button
            onClick={onOpenStatePicker}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition text-xs font-bold shadow-2xs"
            title="Bundesland ändern (Change State)"
          >
            <span className="text-sm">{currentState ? currentState.svgIcon : '🌐'}</span>
            <span className="max-w-[85px] sm:max-w-[120px] truncate">
              {currentState ? currentState.name : 'Alle Länder'}
            </span>
            <span className="text-[10px] text-amber-500 dark:text-amber-400">▾</span>
          </button>

          {/* Global Translation Mode Selector (including 'none' / Nur DE) */}
          <div
            className="flex items-center gap-0.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
            title="Übersetzung wählen oder ausschalten (Translation mode)"
          >
            <Languages className="w-3.5 h-3.5 text-amber-500 mx-1 hidden sm:inline" />
            <button
              onClick={() => onChangeTranslationMode('none')}
              className={`px-2 py-0.5 rounded-lg transition ${
                translationMode === 'none'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-extrabold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Keine Übersetzung — Nur Deutsch (No translation)"
            >
              Nur DE
            </button>
            <button
              onClick={() => onChangeTranslationMode('en')}
              className={`px-2 py-0.5 rounded-lg transition ${
                translationMode === 'en'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Englische Übersetzung (English translation)"
            >
              EN
            </button>
            <button
              onClick={() => onChangeTranslationMode('fa')}
              className={`px-2 py-0.5 rounded-lg transition ${
                translationMode === 'fa'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Persische Übersetzung (Persian translation)"
            >
              فا
            </button>
            <button
              onClick={() => onChangeTranslationMode('both')}
              className={`px-2 py-0.5 rounded-lg transition ${
                translationMode === 'both'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Englisch & Persisch (Both translations)"
            >
              EN+فا
            </button>
          </div>

          {/* German Voice Settings Trigger */}
          <button
            onClick={onOpenVoiceSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold"
            title="Deutsche Sprachausgabe / Stimme einstellen (Standard: Anna)"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Stimme (Anna)</span>
          </button>

          {/* TTS Speed Selector */}
          <div className="hidden xl:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onChangeSpeechRate(0.85)}
              className={`px-1.5 py-0.5 rounded-md ${speechRate === 0.85 ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'hover:text-slate-900'}`}
              title="Langsameres Tempo"
            >
              0.85x
            </button>
            <button
              onClick={() => onChangeSpeechRate(0.95)}
              className={`px-1.5 py-0.5 rounded-md ${speechRate === 0.95 ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'hover:text-slate-900'}`}
              title="Sanftes Lerntempo"
            >
              0.95x
            </button>
            <button
              onClick={() => onChangeSpeechRate(1.0)}
              className={`px-1.5 py-0.5 rounded-md ${speechRate === 1.0 ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'hover:text-slate-900'}`}
              title="Natürliches Tempo (Empfohlen)"
            >
              1.0x
            </button>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isDarkMode ? 'Heller Modus' : 'Dunkler Modus'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* In-App PWA Install */}
          <PWAInstallButton />
        </div>
      </div>

      {/* Mobile sub-navigation bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 overflow-x-auto">
        <button
          onClick={() => onSelectTab('questions')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'questions' ? 'bg-amber-500 text-slate-950 font-bold' : ''}`}
        >
          Fragen
        </button>
        <button
          onClick={() => onSelectTab('simulator')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'simulator' ? 'bg-amber-500 text-slate-950 font-bold' : ''}`}
        >
          Simulator
        </button>
        <button
          onClick={() => onSelectTab('3d')}
          className={`px-2 py-1 rounded-lg ${activeTab === '3d' ? 'bg-amber-500 text-slate-950 font-bold' : ''}`}
        >
          3D Visuals
        </button>
        <button
          onClick={() => onSelectTab('lexikon')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'lexikon' ? 'bg-amber-500 text-slate-950 font-bold' : ''}`}
        >
          Lexikon
        </button>
        <button
          onClick={() => onSelectTab('stats')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'stats' ? 'bg-amber-500 text-slate-950 font-bold' : ''}`}
        >
          Statistik
        </button>
      </div>
    </header>
  );
};
