import React, { useState } from 'react';
import { GermanState } from '../types';
import { GERMAN_STATES } from '../data/states';
import { MapPin, Check, X, Search, Building2, Users } from 'lucide-react';

interface StatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStateCode: string;
  onSelectState: (stateCode: string) => void;
}

export const StatePickerModal: React.FC<StatePickerModalProps> = ({
  isOpen,
  onClose,
  selectedStateCode,
  onSelectState,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredStates = GERMAN_STATES.filter(state => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      state.name.toLowerCase().includes(q) ||
      state.nameEn.toLowerCase().includes(q) ||
      state.nameFa.toLowerCase().includes(q) ||
      state.capital.toLowerCase().includes(q) ||
      state.code.toLowerCase().includes(q)
    );
  });

  const handlePick = (code: string) => {
    onSelectState(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Bundesland auswählen (Select Federal State)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wählen Sie Ihr Bundesland für die 10 spezifischen Landesfragen im Einbürgerungstest
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar & All-states toggle */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Bundesland oder Landeshauptstadt suchen (z.B. Berlin, München, NRW, بایرن)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={() => handlePick('ALL')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                selectedStateCode === 'ALL'
                  ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🌐 Alle 16 Länder anzeigen
            </button>
          </div>
        </div>

        {/* States Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStates.map((state) => {
              const isSelected = selectedStateCode === state.code;
              return (
                <div
                  key={state.code}
                  onClick={() => handlePick(state.code)}
                  className={`group relative p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-500/80 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/80 bg-white dark:bg-slate-900 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                        {state.svgIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {state.name}
                          </h3>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                            {state.code}
                          </span>
                        </div>
                        <p className="text-xs text-amber-700/80 dark:text-amber-400/90 font-fa" dir="rtl">
                          {state.nameFa}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{state.capital}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{state.population}</span>
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {state.description.de}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Aktuell gewählt: <strong className="text-slate-900 dark:text-white font-bold">{selectedStateCode === 'ALL' ? 'Alle 16 Bundesländer' : selectedStateCode}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold hover:opacity-90 transition"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};
