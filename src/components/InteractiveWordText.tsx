import React, { useState } from 'react';
import { speechService } from '../services/speechService';
import { Volume2 } from 'lucide-react';
import { VocabularyTerm, TranslationMode } from '../types';
import { CIVIC_GLOSSARY } from '../data/glossary';

interface InteractiveWordTextProps {
  text: string;
  speechRate?: number;
  highlightTerms?: VocabularyTerm[];
  className?: string;
  showSentenceAudio?: boolean;
  disableWordClick?: boolean;
  translationMode?: TranslationMode;
}

export const InteractiveWordText: React.FC<InteractiveWordTextProps> = ({
  text,
  speechRate = 1.0,
  highlightTerms = [],
  className = '',
  showSentenceAudio = true,
  disableWordClick = false,
  translationMode = 'both',
}) => {
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [activeTermTooltip, setActiveTermTooltip] = useState<{
    word: string;
    syllables?: string;
    en?: string;
    fa?: string;
  } | null>(null);

  // Split into tokens (words and punctuation)
  const tokens = text.split(/(\s+|[.,/#!$%^&*;:{}=\-_`~()?"'])/g).filter(Boolean);

  const handleWordClick = (token: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanWord = token.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').trim();
    if (!cleanWord || cleanWord.length < 2) return;

    setActiveWordIndex(index);
    speechService.speakWord(cleanWord, speechRate);

    // Check if this word matches any question vocabulary term or global civic glossary term
    const lowerWord = cleanWord.toLowerCase();
    const matchedTerm = highlightTerms.find(
      t => t.term.toLowerCase() === lowerWord ||
           (lowerWord.length >= 5 && t.term.toLowerCase().length >= 5 &&
             (lowerWord.includes(t.term.toLowerCase()) || t.term.toLowerCase().includes(lowerWord)))
    );

    if (matchedTerm) {
      setActiveTermTooltip({
        word: cleanWord,
        syllables: matchedTerm.syllables,
        en: matchedTerm.en,
        fa: matchedTerm.fa,
      });
    } else {
      const matchedGlossary = CIVIC_GLOSSARY.find(g => {
        const gTerm = g.term.split('(')[0].trim().toLowerCase();
        return gTerm === lowerWord ||
          (g.plural && g.plural.toLowerCase() === lowerWord) ||
          (lowerWord.length >= 6 && gTerm.length >= 5 && (lowerWord.startsWith(gTerm) || gTerm.startsWith(lowerWord)));
      });
      if (matchedGlossary) {
        setActiveTermTooltip({
          word: cleanWord,
          syllables: matchedGlossary.syllables,
          en: matchedGlossary.meaning.en.split(':')[0],
          fa: matchedGlossary.meaning.fa.split(':')[0],
        });
      } else {
        setActiveTermTooltip(null);
      }
    }

    setTimeout(() => {
      setActiveWordIndex(null);
    }, 1200);
  };

  const handleSpeakSentence = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.speak(text, { rate: speechRate });
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {showSentenceAudio && (
        <button
          onClick={handleSpeakSentence}
          className="inline-flex items-center justify-center p-1.5 mr-2 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors align-middle"
          title="Ganzen Satz vorlesen (Listen to full sentence)"
          aria-label="Listen to sentence"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      )}

      <span className="leading-relaxed">
        {disableWordClick ? (
          <span>{text}</span>
        ) : (
          tokens.map((token, idx) => {
            const isWord = /[a-zA-ZäöüÄÖÜß]{2,}/.test(token);
            if (!isWord) {
              return <span key={idx}>{token}</span>;
            }

            const cleanWord = token.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').toLowerCase();
            const hasVocab =
              highlightTerms.some(
                t => t.term.toLowerCase() === cleanWord ||
                  (cleanWord.length >= 5 && t.term.toLowerCase().length >= 5 && cleanWord.includes(t.term.toLowerCase()))
              ) ||
              CIVIC_GLOSSARY.some(g => {
                const gTerm = g.term.split('(')[0].trim().toLowerCase();
                return gTerm === cleanWord || (g.plural && g.plural.toLowerCase() === cleanWord);
              });
            const isActive = activeWordIndex === idx;

            return (
              <span
                key={idx}
                onClick={(e) => handleWordClick(token, idx, e)}
                className={`cursor-pointer rounded-xs px-0.5 transition-all select-none ${
                  isActive
                    ? 'bg-amber-300 text-slate-950 dark:bg-amber-500 dark:text-slate-950 ring-2 ring-amber-400 font-semibold scale-105'
                    : hasVocab
                    ? 'underline decoration-amber-500 decoration-2 underline-offset-4 hover:bg-amber-100 dark:hover:bg-slate-800'
                    : 'hover:bg-amber-100 dark:hover:bg-slate-800 hover:text-amber-700 dark:hover:text-amber-300'
                }`}
                title="Klicken zum Anhören (Click to pronounce)"
              >
                {token}
              </span>
            );
          })
        )}
      </span>

      {/* Syllable and translation mini-popup */}
      {activeTermTooltip &&
        (activeTermTooltip.syllables ||
          ((translationMode === 'en' || translationMode === 'both') && activeTermTooltip.en) ||
          ((translationMode === 'fa' || translationMode === 'both') && activeTermTooltip.fa)) && (
          <div
            className="absolute left-0 -top-12 z-30 flex items-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150"
            onClick={() => setActiveTermTooltip(null)}
          >
            {activeTermTooltip.syllables && (
              <span
                className={`font-mono text-amber-300 font-bold ${
                  translationMode !== 'none' ? 'border-r border-slate-700 pr-2' : ''
                }`}
              >
                {activeTermTooltip.syllables}
              </span>
            )}
            {(translationMode === 'en' || translationMode === 'both') && activeTermTooltip.en && (
              <span className="text-slate-200">{activeTermTooltip.en}</span>
            )}
            {(translationMode === 'fa' || translationMode === 'both') && activeTermTooltip.fa && (
              <span
                className={`text-amber-200 font-fa ${
                  translationMode === 'both' ? 'border-l border-slate-700 pl-2' : ''
                }`}
                dir="rtl"
              >
                {activeTermTooltip.fa}
              </span>
            )}
          </div>
        )}
    </div>
  );
};
