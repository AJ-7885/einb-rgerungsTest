import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { Moon, Sun, Volume2 } from 'lucide-react';
import { TranslationMode } from '../types';
import { GERMAN_STATES } from '../data/states';

export type NavTab = 'home' | 'questions' | 'simulator' | '3d' | 'lexikon' | 'stats';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
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
  translationMode,
  onChangeTranslationMode,
  onOpenVoiceSettings,
  selectedStateCode,
  onOpenStatePicker,
}) => {
  const currentState = GERMAN_STATES.find(s => s.code === selectedStateCode);

  const navItems: { id: NavTab; label: string; mobileLabel: string }[] = [
    { id: 'home', label: 'Start', mobileLabel: 'Start' },
    { id: 'questions', label: 'Fragenkatalog', mobileLabel: 'Fragen' },
    { id: 'simulator', label: 'Prüfung', mobileLabel: 'Prüfung' },
    { id: '3d', label: '3D Modelle', mobileLabel: '3D' },
    { id: 'lexikon', label: 'Lexikon', mobileLabel: 'Lexikon' },
    { id: 'stats', label: 'Statistik', mobileLabel: 'Statistik' },
  ];

  const langOptions: { id: TranslationMode; label: string; title: string }[] = [
    { id: 'none', label: 'Nur DE', title: 'Keine Übersetzung (German only)' },
    { id: 'en', label: 'EN', title: 'Deutsch + Englisch' },
    { id: 'fa', label: 'فا', title: 'Deutsch + Persisch (فارسی)' },
    { id: 'both', label: 'EN+فا', title: 'Deutsch + Englisch + Persisch' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        {/* Brand Logo -> Returns to Landing Page */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-xs shadow-2xs">
            DE
          </div>
          <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
            EinbürgerungsTest<span className="text-amber-500">Plus</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Hauptnavigation"
          className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400"
        >
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-amber-400 font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Global Controls: Bundesland, Single Language Switcher, Voice, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Bundesland Selector */}
          <button
            type="button"
            onClick={onOpenStatePicker}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-amber-500/50 transition text-xs font-semibold"
            title="Bundesland ändern (Change Federal State)"
          >
            <span>{currentState ? currentState.svgIcon : '🌐'}</span>
            <span className="max-w-[72px] sm:max-w-[110px] truncate">
              {currentState ? currentState.name : 'Alle Länder'}
            </span>
          </button>

          {/* Single Global Translation Selector */}
          <div
            role="group"
            aria-label="Übersetzungssprache"
            className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-[11px] font-semibold border border-slate-200 dark:border-slate-800"
          >
            {langOptions.map(opt => {
              const isSelected = translationMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeTranslationMode(opt.id)}
                  title={opt.title}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Voice Settings Button */}
          <button
            type="button"
            onClick={onOpenVoiceSettings}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            title="Deutsche Stimme & Sprechtempo (Standard: Anna)"
            aria-label="Stimme und Sprechtempo einstellen"
          >
            <Volume2 className="w-4 h-4 text-amber-500" />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            title={isDarkMode ? 'Zum hellen Modus wechseln (Light mode)' : 'Zum dunklen Modus wechseln (Dark mode)'}
            aria-label={isDarkMode ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <PWAInstallButton />
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden flex items-center justify-around px-2 py-1.5 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/90 dark:bg-slate-900/80 overflow-x-auto"
      >
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.mobileLabel}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
