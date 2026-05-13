export interface TTSLanguage {
  code: string;
  name: string;
  voiceURI?: string;
  lang: string;
}

// Map our language codes to Web Speech API language codes
export const TTS_LANGUAGES: Record<string, TTSLanguage> = {
  ES: {
    code: "ES",
    name: "Spanish",
    lang: "es-ES"
  },
  FR: {
    code: "FR", 
    name: "French",
    lang: "fr-FR"
  },
  JA: {
    code: "JA",
    name: "Japanese", 
    lang: "ja-JP"
  },
  PT: {
    code: "PT",
    name: "Portuguese",
    lang: "pt-BR"
  },
  EN: {
    code: "EN",
    name: "English",
    lang: "en-US"
  }
};

export class TTSService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private audioCache: Map<string, string> = new Map();

  constructor() {
    this.synth = window.speechSynthesis;
    
    // Initial voice load
    this.loadVoices();
    
    // Reload voices when they change
    this.synth.addEventListener('voiceschanged', () => {
      this.loadVoices();
    });
    
    // Force voices to load after multiple delays (some browsers need this)
    setTimeout(() => this.loadVoices(), 100);
    setTimeout(() => this.loadVoices(), 500);
    setTimeout(() => this.loadVoices(), 1000);
    setTimeout(() => this.loadVoices(), 2000);
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
  }

  private getVoiceForLanguage(languageCode: string): SpeechSynthesisVoice | null {
    // Force reload voices if empty
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const ttsLang = TTS_LANGUAGES[languageCode];
    if (!ttsLang) {
      console.error(`No language configuration found for ${languageCode}`);
      return null;
    }

    console.log(`Available voices for ${languageCode}:`, this.voices.map(v => ({ name: v.name, lang: v.lang, localService: v.localService })));

    // Try to find exact match first
    let voice = this.voices.find(voice => voice.lang === ttsLang.lang);
    console.log(`Exact match for ${languageCode} (${ttsLang.lang}):`, voice);
    
    // If no exact match, try to find voice that starts with language code
    if (!voice) {
      const langPrefix = ttsLang.lang.split('-')[0];
      voice = this.voices.find(voice => voice.lang.startsWith(langPrefix));
      console.log(`Prefix match for ${languageCode} (${langPrefix}):`, voice);
    }

    // Special handling for Japanese - try multiple variations
    if (!voice && languageCode === 'JA') {
      const japaneseOptions = [
        () => this.voices.find(v => v.lang === 'ja-JP'),
        () => this.voices.find(v => v.lang === 'ja'),
        () => this.voices.find(v => v.lang.includes('ja')),
        () => this.voices.find(v => v.name.toLowerCase().includes('japanese')),
        () => this.voices.find(v => v.name.toLowerCase().includes('kyoko')),
        () => this.voices.find(v => v.name.toLowerCase().includes('aya')),
        () => this.voices.find(v => v.name.toLowerCase().includes('haruka')),
        () => this.voices.find(v => v.name.toLowerCase().includes('sakura')),
      ];
      
      for (const [index, option] of japaneseOptions.entries()) {
        voice = option();
        if (voice) {
          console.log(`Japanese voice found at option ${index}:`, voice.name, voice.lang);
          break;
        }
      }
    }

    // If still no voice, use any available voice as fallback
    if (!voice && this.voices.length > 0) {
      console.log(`No specific voice found for ${languageCode}, using fallback voice:`, this.voices[0]);
      voice = this.voices[0];
    }

    if (!voice) {
      console.error(`No voice available for ${languageCode} and no fallback`);
      // Create a default voice as last resort
      const utterance = new SpeechSynthesisUtterance('');
      utterance.lang = ttsLang.lang;
      return null;
    }

    return voice;
  }

  public async generateAudio(text: string, languageCode: string): Promise<string> {
    const cacheKey = `${languageCode}-${text}`;
    
    // Return cached audio if available
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getVoiceForLanguage(languageCode);
      
      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = TTS_LANGUAGES[languageCode]?.lang || 'en-US';
      utterance.rate = 0.9; // Slightly slower for better clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Create audio context to capture speech
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      
      // This is a workaround - we'll create a data URL from the speech
      // Since direct capture is complex, we'll use a simpler approach
      utterance.onend = () => {
        // For now, return a placeholder that will trigger the browser's TTS
        // In a real implementation, you'd capture the audio stream
        resolve(`tts-${cacheKey}`);
      };

      utterance.onerror = (event) => {
        reject(new Error(`TTS Error: ${event.error}`));
      };

      this.synth.speak(utterance);
      
      // For demo purposes, we'll simulate the audio generation
      setTimeout(() => {
        resolve(`tts-${cacheKey}`);
      }, 1000);
    });
  }

  public speakText(text: string, languageCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getVoiceForLanguage(languageCode);
      
      if (voice) {
        utterance.voice = voice;
        console.log(`Using voice for ${languageCode}:`, voice.name, voice.lang);
      } else {
        console.warn(`No voice found for ${languageCode}, using default`);
      }

      utterance.lang = TTS_LANGUAGES[languageCode]?.lang || 'en-US';
      
      // Adjust rate and pitch for different languages - ultra slow for maximum duration
      if (languageCode === 'JA') {
        utterance.rate = 0.2; // Ultra slow for Japanese to match video
        utterance.pitch = 0.7;
      } else if (languageCode === 'ES' || languageCode === 'FR') {
        utterance.rate = 0.25; // Ultra slow for Romance languages
        utterance.pitch = 0.7;
      } else if (languageCode === 'PT') {
        utterance.rate = 0.3; // Very slow for Portuguese
        utterance.pitch = 0.7;
      } else {
        utterance.rate = 0.25; // Ultra slow default rate
        utterance.pitch = 0.7;
      }
      
      utterance.volume = 1.0;

      console.log(`Speaking "${text}" in ${languageCode} at rate ${utterance.rate}`);

      utterance.onend = () => {
        console.log(`Finished speaking "${text}" in ${languageCode}`);
        resolve();
      };

      utterance.onerror = (event) => {
        console.error(`TTS Error for ${languageCode}:`, event.error);
        reject(new Error(`TTS Error: ${event.error}`));
      };

      // Small delay to ensure proper initialization
      setTimeout(() => {
        this.synth.speak(utterance);
      }, 50);
    });
  }

  public stop() {
    this.synth.cancel();
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

// Singleton instance
export const ttsService = new TTSService();
