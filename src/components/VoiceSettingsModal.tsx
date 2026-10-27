import React, { useState, useEffect } from 'react';
import { speechService, CLOUD_NEURAL_VOICE_URI } from '../services/speechService';
import { Volume2, Check, X, Sparkles, AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  speechRate: number;
  onChangeSpeechRate: (rate: number) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  speechRate,
  onChangeSpeechRate,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedURI, setSelectedURI] = useState<string>('');
  const [showRoboticVoices, setShowRoboticVoices] = useState(false);
  const [showMacUpgradeTip, setShowMacUpgradeTip] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const load = () => {
      const deVoices = speechService.loadVoices();
      setVoices(deVoices);
      const currentURI = speechService.getSelectedVoiceURI();
      if (currentURI) {
        setSelectedURI(currentURI);
      }
    };

    load();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectVoice = (uri: string) => {
    setSelectedURI(uri);
    speechService.setSelectedVoice(uri);
    // Automatically preview the newly selected voice
    setTimeout(() => {
      speechService.speak(
        'Guten Tag! Ich lese die Fragen für den Einbürgerungstest auf Deutsch vor.',
        { rate: speechRate }
      );
    }, 50);
  };

  const handleTestSpeech = () => {
    speechService.speak(
      'Guten Tag! Ich bin Ihre deutsche Stimme. Alle Staatsgewalt geht vom Volke aus.',
      { rate: speechRate }
    );
  };

  const naturalVoices = voices.filter(v => !speechService.isRoboticVoice(v));
  const roboticVoices = voices.filter(v => speechService.isRoboticVoice(v));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Deutsche Sprachausgabe (TTS)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Standardstimme: Anna · Inkl. natürlicher KI-Stimme
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Test Speech Button */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Deutsche Aussprache testen
              </span>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                Klicken Sie auf eine Stimme unten oder testen Sie die aktuelle Auswahl
              </p>
            </div>
            <button
              onClick={handleTestSpeech}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs shrink-0"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Jetzt testen</span>
            </button>
          </div>

          {/* Speed adjustment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sprechgeschwindigkeit (Speed): {speechRate}x
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                1.0x klingt am natürlichsten (ohne Audio-Verzerrung)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 0.85, label: '0.85x (Langsamer)' },
                { val: 0.95, label: '0.95x (Sanft)' },
                { val: 1.0, label: '1.0x (Natürlich ★)' },
              ].map(item => (
                <button
                  key={item.val}
                  onClick={() => onChangeSpeechRate(item.val)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                    speechRate === item.val
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recommended & Natural Voices */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Empfohlene deutsche Stimmen (Anna & KI-Stimme):
            </span>

            <div className="space-y-2">
              {/* Natural System Voices (Anna first!) */}
              {naturalVoices.map(v => {
                const isSelected = selectedURI === v.voiceURI;
                const badge = speechService.getVoiceBadge(v);
                const isAnna = badge.tier === 'anna';
                return (
                  <div
                    key={v.voiceURI}
                    onClick={() => handleSelectVoice(v.voiceURI)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-slate-900 dark:text-white font-bold ring-1 ring-amber-500/40'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{v.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isAnna
                              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isAnna
                          ? 'Standard-Stimme (Offline verfügbar · Apple Deutsch)'
                          : `${v.lang} · Systemstimme`}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                  </div>
                );
              })}

              {/* Built-in Cloud Neural German Voice Option */}
              <div
                onClick={() => handleSelectVoice(CLOUD_NEURAL_VOICE_URI)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                  selectedURI === CLOUD_NEURAL_VOICE_URI
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-slate-900 dark:text-white font-bold ring-1 ring-emerald-500/40'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-bold">Google Neural Deutsch (WaveNet KI)</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      Sehr natürlich · Online
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Flüssige menschliche KI-Aussprache (wechselt offline automatisch zu Anna)
                  </span>
                </div>
                {selectedURI === CLOUD_NEURAL_VOICE_URI && (
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
              </div>

              {naturalVoices.length === 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Systemstimmen werden geladen...</span>
                </div>
              )}
            </div>
          </div>

          {/* Tip to unlock Apple's free Anna (Premium) / Petra (Premium) voice on macOS */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMacUpgradeTip(!showMacUpgradeTip)}
              className="w-full flex items-center justify-between p-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Tipp: Warum klingen manche Systemstimmen roboterhaft? (Anna Premium laden)</span>
              </div>
              {showMacUpgradeTip ? (
                <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </button>

            {showMacUpgradeTip && (
              <div className="px-3.5 pb-3.5 pt-1 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 border-t border-slate-200/70 dark:border-slate-800">
                <p>
                  • Auf macOS sind standardmäßig 8 alte 1990er-Synthesizer-Stimmen (<em>Eddy, Flo, Reed, Rocko...</em>) installiert, die extrem roboterhaft klingen. Wir haben diese unten ausgeblendet.
                </p>
                <p>
                  • Sie können oben entweder direkt <strong>Google Neural Deutsch (WaveNet KI)</strong> nutzen oder auf Ihrem Mac kostenlos <strong>Anna (Premium)</strong> / <strong>Petra (Premium)</strong> freischalten:
                </p>
                <p className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-800 dark:text-slate-200">
                  macOS Systemeinstellungen → Bedienungshilfen → Gesprochener Inhalt → Systemstimme → (i) → Deutsch → „Anna (Premium)“ oder „Petra (Premium)“ herunterladen
                </p>
              </div>
            )}
          </div>

          {/* Collapsible Robotic Voices (Eddy, Flo, Reed, Rocko, etc.) */}
          {roboticVoices.length > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowRoboticVoices(!showRoboticVoices)}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                {showRoboticVoices ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {showRoboticVoices
                    ? `Roboterhafte Systemstimmen ausblenden (${roboticVoices.length})`
                    : `Roboterhafte Systemstimmen (Eddy, Flo, Reed...) anzeigen (${roboticVoices.length})`}
                </span>
              </button>

              {showRoboticVoices && (
                <div className="mt-2 max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {roboticVoices.map(v => {
                    const isSelected = selectedURI === v.voiceURI;
                    return (
                      <div
                        key={v.voiceURI}
                        onClick={() => handleSelectVoice(v.voiceURI)}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition opacity-75 hover:opacity-100 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-slate-900 dark:text-white font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{v.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                            Roboter / Eloquence
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-500" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};
