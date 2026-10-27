import React, { useState } from 'react';
import { CIVIC_GLOSSARY } from '../data/glossary';
import { speechService } from '../services/speechService';
import { GlossaryItem, TranslationMode } from '../types';
import { BookOpen, Search, Volume2, X, Sparkles } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  speechRate?: number;
  translationMode: TranslationMode;
  onChangeTranslationMode?: (mode: TranslationMode) => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  speechRate = 1.0,
  translationMode,
  onChangeTranslationMode,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredGlossary = CIVIC_GLOSSARY.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const inTerm = item.term.toLowerCase().includes(q);
      const inEn = item.meaning.en.toLowerCase().includes(q);
      const inFa = item.meaning.fa.toLowerCase().includes(q);
      if (!inTerm && !inEn && !inFa) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Rechts- & Verfassungslexikon
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Civic & Legal Terminology · Ausgesprochen & Übersetzt (DE / EN / فارسی)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
            aria-label="Lexikon schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Begriff suchen (z.B. Rechtsstaat, Bundesrat, Wahl, قوا)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Alle Begriffe' },
              { id: 'verfassung', label: 'Verfassung & Recht' },
              { id: 'politik', label: 'Politik & Wahlen' },
              { id: 'justiz', label: 'Justiz & Gerichte' },
              { id: 'gesellschaft', label: 'Gesellschaft & Wirtschaft' },
              { id: 'geschichte', label: 'Geschichte & Gedenken' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Terms list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredGlossary.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Keine passenden Begriffe gefunden.
            </div>
          ) : (
            filteredGlossary.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-amber-300 dark:hover:border-amber-600/50 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      {item.article}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.term}
                    </h3>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                      {item.syllables}
                    </span>
                  </div>

                  <button
                    onClick={() => speechService.speakWord(item.term, speechRate)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition"
                    title="Aussprache anhören"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Aussprache</span>
                  </button>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.meaning.de}
                </p>

                {(translationMode === 'en' || translationMode === 'both') && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/50 pt-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">EN:</span>
                    {item.meaning.en}
                  </p>
                )}

                {(translationMode === 'fa' || translationMode === 'both') && (
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 font-fa border-t border-slate-200 dark:border-slate-700/50 pt-1.5 text-right" dir="rtl">
                    <span className="font-semibold text-amber-700 dark:text-amber-400 ml-1">فارسی:</span>
                    {item.meaning.fa}
                  </p>
                )}

                <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 italic">
                  <span>Beispiel: "{item.exampleSentence.de}"</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
