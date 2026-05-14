const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Potong jika lebih dari 24MB
  const MAX_SIZE = 24 * 1024 * 1024;
  const trimmedBlob = audioBlob.size > MAX_SIZE
    ? audioBlob.slice(0, MAX_SIZE, audioBlob.type)
    : audioBlob;

  const formData = new FormData();
  formData.append('file', trimmedBlob, 'audio.mp4');
  formData.append('model', 'whisper-large-v3');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + GROQ_API_KEY },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error('Transcribe failed: ' + JSON.stringify(err));
  }

  const data = await response.json();
  return data.text;
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  // auto-detect bahasa sumber
  const url = 'https://api.mymemory.translated.net/get?q='
    + encodeURIComponent(text)
    + '&langpair=autodetect|' + targetLang;

  const response = await fetch(url);
  const data = await response.json();
  return data.responseData.translatedText;
}

export async function generateVoice(text: string): Promise<Blob> {
  const response = await fetch(
    'https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb',
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error('TTS failed: ' + JSON.stringify(err));
  }

  return await response.blob();
}