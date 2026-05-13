export interface SubtitleEntry {
  start: number;
  end: number;
  text: string;
}

export interface LanguageData {
  code: string;
  name: string;
  displayName: string;
  subtitles: SubtitleEntry[];
  // Mock audio data - using a simple base64 encoded sine wave for demo
  audioData: string;
}

// Generate mock audio data (simple sine wave)
const generateMockAudio = (frequency: number = 440): string => {
  const sampleRate = 44100;
  const duration = 0.1; // 100ms of audio
  const numSamples = sampleRate * duration;
  
  // Create a simple WAV file header and data
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  
  // Generate sine wave data
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
    view.setInt16(44 + i * 2, sample * 32767, true);
  }
  
  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const LANGUAGE_DATA: Record<string, LanguageData> = {
  ES: {
    code: "ES",
    name: "Spanish",
    displayName: "Spanish (ES)",
    subtitles: [
      { start: 0, end: 3, text: "Bienvenidos al futuro de la localización de video" },
      { start: 3, end: 6, text: "Traduce y dobla tus videos instantáneamente" },
      { start: 6, end: 9, text: "Con voces de IA de calidad de estudio" },
      { start: 9, end: 12, text: "Sincronización labial perfecta" },
      { start: 12, end: 15, text: "Soporte para 11 idiomas" },
      { start: 15, end: 18, text: "La forma más fácil de globalizar tu contenido" },
      { start: 18, end: 21, text: "Resultados profesionales en minutos" },
      { start: 21, end: 24, text: "Ahorra tiempo y dinero en localización" },
      { start: 24, end: 27, text: "Alcanza audiencias globales sin esfuerzo" },
      { start: 27, end: 30, text: "El futuro del doblaje está aquí" }
    ],
    audioData: generateMockAudio(392) // G4 frequency for Spanish
  },
  FR: {
    code: "FR",
    name: "French",
    displayName: "French (FR)",
    subtitles: [
      { start: 0, end: 3, text: "Bienvenue dans l'avenir de la localisation vidéo" },
      { start: 3, end: 6, text: "Traduisez et doublez vos vidéos instantanément" },
      { start: 6, end: 9, text: "Avec des voix IA de qualité studio" },
      { start: 9, end: 12, text: "Synchronisation labiale parfaite" },
      { start: 12, end: 15, text: "Support pour 11 langues" },
      { start: 15, end: 18, text: "Le moyen le plus facile de mondialiser votre contenu" },
      { start: 18, end: 21, text: "Résultats professionnels en minutes" },
      { start: 21, end: 24, text: "Économisez temps et argent en localisation" },
      { start: 24, end: 27, text: "Atteignez des audiences globales sans effort" },
      { start: 27, end: 30, text: "L'avenir du doublage est arrivé" }
    ],
    audioData: generateMockAudio(440) // A4 frequency for French
  },
  JA: {
    code: "JA",
    name: "Japanese",
    displayName: "Japanese (JA)",
    subtitles: [
      { start: 0, end: 3, text: "動画ローカリゼーションの未来へようこそ" },
      { start: 3, end: 6, text: "動画を瞬時に翻訳・吹き替え" },
      { start: 6, end: 9, text: "スタジオ品質のAIボイス" },
      { start: 9, end: 12, text: "完璧なリップシンク" },
      { start: 12, end: 15, text: "11言語サポート" },
      { start: 15, end: 18, text: "コンテンツをグローバル化する最も簡単な方法" },
      { start: 18, end: 21, text: "数分でプロの結果" },
      { start: 21, end: 24, text: "ローカリゼーションで時間とお金を節約" },
      { start: 24, end: 27, text: "簡単にグローバルオーディエンスにリーチ" },
      { start: 27, end: 30, text: "吹き替えの未来がここに" }
    ],
    audioData: generateMockAudio(494) // B4 frequency for Japanese
  },
  PT: {
    code: "PT",
    name: "Portuguese",
    displayName: "Portuguese (PT)",
    subtitles: [
      { start: 0, end: 3, text: "Bem-vindo ao futuro da localização de vídeo" },
      { start: 3, end: 6, text: "Traduza e duble seus vídeos instantaneamente" },
      { start: 6, end: 9, text: "Com vozes IA de qualidade de estúdio" },
      { start: 9, end: 12, text: "Sincronização labial perfeita" },
      { start: 12, end: 15, text: "Suporte para 11 idiomas" },
      { start: 15, end: 18, text: "A maneira mais fácil de globalizar seu conteúdo" },
      { start: 18, end: 21, text: "Resultados profissionais em minutos" },
      { start: 21, end: 24, text: "Economize tempo e dinheiro em localização" },
      { start: 24, end: 27, text: "Alcance audiências globais sem esforço" },
      { start: 27, end: 30, text: "O futuro da dublagem está aqui" }
    ],
    audioData: generateMockAudio(349) // F4 frequency for Portuguese
  },
  EN: {
    code: "EN",
    name: "English",
    displayName: "English (EN)",
    subtitles: [
      { start: 0, end: 3, text: "Welcome to the future of video localization" },
      { start: 3, end: 6, text: "Translate and dub your videos instantly" },
      { start: 6, end: 9, text: "With studio-quality AI voices" },
      { start: 9, end: 12, text: "Perfect lip-sync synchronization" },
      { start: 12, end: 15, text: "Support for 11 languages" },
      { start: 15, end: 18, text: "The easiest way to globalize your content" },
      { start: 18, end: 21, text: "Professional results in minutes" },
      { start: 21, end: 24, text: "Save time and money on localization" },
      { start: 24, end: 27, text: "Reach global audiences effortlessly" },
      { start: 27, end: 30, text: "The future of dubbing is here" }
    ],
    audioData: generateMockAudio(523) // C5 frequency for English
  }
};

export const getCurrentSubtitle = (languageCode: string, currentTime: number): string => {
  const languageData = LANGUAGE_DATA[languageCode];
  if (!languageData) return "";
  
  const subtitle = languageData.subtitles.find(
    sub => currentTime >= sub.start && currentTime < sub.end
  );
  
  return subtitle?.text || "";
};
