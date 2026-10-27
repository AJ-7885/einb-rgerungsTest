export const CLOUD_NEURAL_VOICE_URI = 'cloud:google-wavenet-de';
const VOICE_STORAGE_KEY = 'einbuergerung_selected_voice_v2';

// Legacy formant/novelty synthesizer voices on macOS/iOS (Eloquence) that sound very robotic
const ROBOTIC_VOICE_PREFIXES = [
  'eddy',
  'flo',
  'grandma',
  'grandpa',
  'reed',
  'rocko',
  'sandy',
  'shelley',
  'albert',
  'bad news',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'good news',
  'jester',
  'organ',
  'superstar',
  'trinoids',
  'whisper',
  'wobble',
  'zarvox',
  'fred',
  'junior',
  'kathy',
  'princess',
  'ralph',
];

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private germanVoice: SpeechSynthesisVoice | null = null;
  private cachedGermanVoices: SpeechSynthesisVoice[] = [];
  private selectedVoiceURI: string | null = null;
  private isSpeaking = false;
  private currentAudio: HTMLAudioElement | null = null;
  private audioBlobCache = new Map<string, string>();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedVoice = localStorage.getItem(VOICE_STORAGE_KEY);
        if (savedVoice) {
          this.selectedVoiceURI = savedVoice;
        }
      } catch {
        // ignore storage errors
      }

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  public isRoboticVoice(v: SpeechSynthesisVoice): boolean {
    const name = (v.name || '').toLowerCase().trim();
    const uri = (v.voiceURI || '').toLowerCase();
    if (uri.includes('eloquence')) return true;
    return ROBOTIC_VOICE_PREFIXES.some(
      prefix =>
        name === prefix ||
        name.startsWith(prefix + ' ') ||
        name.startsWith(prefix + '(') ||
        name.startsWith('microsoft ' + prefix)
    );
  }

  public getVoiceQualityScore(v: SpeechSynthesisVoice): number {
    const name = (v.name || '').toLowerCase();
    const uri = (v.voiceURI || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase().replace('_', '-');

    if (this.isRoboticVoice(v)) {
      return 10;
    }

    // Prioritize "Anna" as the #1 default system voice as requested by the user
    if (name.includes('anna') || uri.includes('.anna')) {
      if (name.includes('premium') || uri.includes('premium')) return 1000;
      if (name.includes('enhanced') || uri.includes('enhanced')) return 980;
      if (uri.includes('com.apple.voice')) return 950;
      return 920;
    }

    // Other Apple / Microsoft Neural / Premium / Enhanced German voices
    if (
      name.includes('premium') ||
      uri.includes('premium') ||
      name.includes('natural') ||
      name.includes('neural') ||
      name.includes('siri')
    ) {
      return 880;
    }

    if (name.includes('enhanced') || uri.includes('enhanced')) {
      return 840;
    }

    if (
      name.includes('petra') ||
      name.includes('markus') ||
      name.includes('viktor') ||
      name.includes('yannick') ||
      name.includes('helena') ||
      name.includes('martin') ||
      name.includes('katja') ||
      name.includes('conrad') ||
      name.includes('amala') ||
      name.includes('seraphina')
    ) {
      return 780;
    }

    if (name.includes('google') && lang.startsWith('de')) {
      return 700;
    }

    if (lang === 'de-de') {
      return 500;
    }

    return 300;
  }

  public getVoiceBadge(v: SpeechSynthesisVoice): {
    label: string;
    tier: 'anna' | 'natural' | 'standard' | 'robotic';
  } {
    const name = (v.name || '').toLowerCase();
    const uri = (v.voiceURI || '').toLowerCase();

    if (this.isRoboticVoice(v)) {
      return { label: 'Roboter (Eloquence)', tier: 'robotic' };
    }
    if (name.includes('anna') || uri.includes('.anna')) {
      if (name.includes('premium') || uri.includes('premium')) {
        return { label: 'Anna Premium ★', tier: 'anna' };
      }
      if (name.includes('enhanced') || uri.includes('enhanced')) {
        return { label: 'Anna Enhanced ★', tier: 'anna' };
      }
      return { label: 'Standard (Anna)', tier: 'anna' };
    }
    if (
      name.includes('premium') ||
      uri.includes('premium') ||
      name.includes('enhanced') ||
      uri.includes('enhanced') ||
      name.includes('natural') ||
      name.includes('neural') ||
      name.includes('siri')
    ) {
      return { label: 'Natürlich / HD', tier: 'natural' };
    }
    if (name.includes('google')) {
      return { label: 'Browser TTS', tier: 'standard' };
    }
    return { label: 'Systemstimme', tier: 'standard' };
  }

  public loadVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const allVoices = this.synth.getVoices();

    // Comprehensive German voice match
    const rawDeVoices = allVoices.filter(v => {
      const lang = (v.lang || '').toLowerCase().replace('_', '-');
      const name = (v.name || '').toLowerCase();
      return (
        lang.startsWith('de') ||
        name.includes('deutsch') ||
        name.includes('german') ||
        lang === 'de'
      );
    });

    // Sort by quality score descending (Anna first, then Premium/Natural, robotic Eloquence last)
    const sorted = [...rawDeVoices].sort(
      (a, b) => this.getVoiceQualityScore(b) - this.getVoiceQualityScore(a)
    );

    // Deduplicate voices that share the exact same display name (e.g., macOS dual Anna registration),
    // keeping the highest-scored variant (modern AVSpeechSynthesis over legacy NSSpeechSynthesizer)
    const seenNames = new Set<string>();
    const deVoices: SpeechSynthesisVoice[] = [];
    for (const v of sorted) {
      const key = `${v.name.trim().toLowerCase()}|${v.lang.toLowerCase()}`;
      if (!seenNames.has(key)) {
        seenNames.add(key);
        deVoices.push(v);
      }
    }

    this.cachedGermanVoices = deVoices;

    // Pick best German voice:
    // 1. User selected voice (if not cloud neural)
    // 2. Best "Anna" voice (Default as requested)
    // 3. Highest-scored non-robotic German voice
    const annaVoice = deVoices.find(
      v => v.name.toLowerCase().includes('anna') || v.voiceURI.toLowerCase().includes('.anna')
    );

    const userSelectedSystemVoice =
      this.selectedVoiceURI && this.selectedVoiceURI !== CLOUD_NEURAL_VOICE_URI
        ? deVoices.find(v => v.voiceURI === this.selectedVoiceURI) ||
          rawDeVoices.find(v => v.voiceURI === this.selectedVoiceURI)
        : null;

    const preferred =
      userSelectedSystemVoice ||
      annaVoice ||
      deVoices.find(v => !this.isRoboticVoice(v)) ||
      deVoices[0] ||
      null;

    this.germanVoice = preferred;

    // If no voice was explicitly selected yet, default to Anna's voiceURI
    if (!this.selectedVoiceURI && preferred) {
      this.selectedVoiceURI = preferred.voiceURI;
    }

    return deVoices;
  }

  public getGermanVoices(): SpeechSynthesisVoice[] {
    if (this.cachedGermanVoices.length === 0) {
      this.loadVoices();
    }
    return this.cachedGermanVoices;
  }

  public getActiveVoice(): SpeechSynthesisVoice | null {
    if (!this.germanVoice) {
      this.loadVoices();
    }
    return this.germanVoice;
  }

  public getSelectedVoiceURI(): string {
    if (this.selectedVoiceURI === CLOUD_NEURAL_VOICE_URI) {
      return CLOUD_NEURAL_VOICE_URI;
    }
    const active = this.getActiveVoice();
    return this.selectedVoiceURI || active?.voiceURI || '';
  }

  public setSelectedVoice(voiceURI: string) {
    this.selectedVoiceURI = voiceURI;
    try {
      localStorage.setItem(VOICE_STORAGE_KEY, voiceURI);
    } catch {
      // ignore
    }

    if (voiceURI !== CLOUD_NEURAL_VOICE_URI) {
      const voice = this.cachedGermanVoices.find(v => v.voiceURI === voiceURI);
      if (voice) {
        this.germanVoice = voice;
      }
    }
  }

  public getSupported(): boolean {
    return typeof window !== 'undefined' && ('speechSynthesis' in window || typeof Audio !== 'undefined');
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }

  /**
   * Normalizes German text so TTS engines pronounce abbreviations, slashes, and blanks naturally
   * instead of reading out "Unterstrich" or "Schrägstrich".
   */
  private normalizeGermanText(text: string): string {
    return text
      .replace(/[*_#]/g, '')
      .replace(/_{2,}|\.{3,}|…/g, ', ')
      .replace(/\bz\.\s*B\./gi, 'zum Beispiel')
      .replace(/\bbzw\./gi, 'beziehungsweise')
      .replace(/\bd\.\s*h\./gi, 'das heißt')
      .replace(/\bu\.\s*a\./gi, 'unter anderem')
      .replace(/\bArt\.\s*(\d+)/g, 'Artikel $1')
      .replace(/\bNr\.\s*(\d+)/g, 'Nummer $1')
      .replace(/§\s*(\d+)/g, 'Paragraph $1')
      .replace(/\s+\/\s+/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private speakWithSystemVoice(
    cleanText: string,
    options: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    } = {}
  ): boolean {
    if (!this.synth) return false;

    if (!this.germanVoice || this.cachedGermanVoices.length === 0) {
      this.loadVoices();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'de-DE';

    // Avoid extreme slow time-stretching on macOS compact voices which causes metallic distortion
    const requestedRate = options.rate ?? 1.0;
    utterance.rate = Math.max(0.8, Math.min(1.2, requestedRate));
    utterance.pitch = options.pitch ?? 1.0;

    const activeVoice = this.getActiveVoice();
    if (activeVoice) {
      utterance.voice = activeVoice;
      utterance.lang = activeVoice.lang || 'de-DE';
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      options.onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      options.onError?.();
    };

    this.synth.speak(utterance);
    return true;
  }

  public speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    } = {}
  ): boolean {
    this.stop();

    const cleanText = this.normalizeGermanText(text);
    if (!cleanText) return false;

    // If user selected the Cloud Neural German voice and is online, stream natural neural TTS
    // with automatic fallback to Anna if offline or unreachable
    if (
      this.selectedVoiceURI === CLOUD_NEURAL_VOICE_URI &&
      typeof window !== 'undefined' &&
      navigator.onLine !== false
    ) {
      this.speakWithCloudNeural(cleanText, options);
      return true;
    }

    return this.speakWithSystemVoice(cleanText, options);
  }

  private async speakWithCloudNeural(
    cleanText: string,
    options: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    try {
      let blobUrl = this.audioBlobCache.get(cleanText);
      if (!blobUrl) {
        const res = await fetch(`/api/tts?lang=de&text=${encodeURIComponent(cleanText)}`);
        if (!res.ok) {
          throw new Error(`Cloud TTS HTTP ${res.status}`);
        }
        const blob = await res.blob();
        if (blob.size < 100) {
          throw new Error('Empty audio payload');
        }
        blobUrl = URL.createObjectURL(blob);
        this.audioBlobCache.set(cleanText, blobUrl);
      }

      const audio = new Audio(blobUrl);
      this.currentAudio = audio;
      audio.playbackRate = Math.max(0.75, Math.min(1.25, options.rate ?? 1.0));

      audio.onplay = () => {
        this.isSpeaking = true;
        options.onStart?.();
      };
      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        options.onEnd?.();
      };
      audio.onerror = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        // Fallback to Anna system voice
        this.speakWithSystemVoice(cleanText, options);
      };

      await audio.play();
    } catch {
      // Seamless fallback to Anna system voice if offline or blocked
      this.speakWithSystemVoice(cleanText, options);
    }
  }

  public speakWord(word: string, rate: number = 0.95): boolean {
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim();
    if (!cleanWord) return false;
    return this.speak(cleanWord, { rate });
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechService = new SpeechService();
