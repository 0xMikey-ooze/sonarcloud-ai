import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { CaptionWord } from '../types';

export interface TtsResult {
  audioBuffer: Buffer;
  durationSec: number;
  words: CaptionWord[];
}

interface AlignmentResponse {
  audioBase64?: string;
  audio_base64?: string;
  alignment?: AlignmentData;
  normalizedAlignment?: AlignmentData;
  normalized_alignment?: AlignmentData;
}

interface AlignmentData {
  characters?: string[];
  characterStartTimesSeconds?: number[];
  character_start_times_seconds?: number[];
  characterEndTimesSeconds?: number[];
  character_end_times_seconds?: number[];
}

function readAlignment(payload: AlignmentResponse) {
  const a = payload.alignment || payload.normalizedAlignment || payload.normalized_alignment;
  if (!a) throw new Error('tts: no alignment in response');
  const characters = a.characters || [];
  const startTimes = a.characterStartTimesSeconds || a.character_start_times_seconds || [];
  const endTimes = a.characterEndTimesSeconds || a.character_end_times_seconds || [];
  return { characters, startTimes, endTimes };
}

function buildWords(characters: string[], starts: number[], ends: number[]): CaptionWord[] {
  const words: CaptionWord[] = [];
  let current = '';
  let wordStart = -1;
  let lastEnd = 0;

  const flush = () => {
    if (!current.trim()) return;
    words.push({
      text: current,
      startMs: Math.round(wordStart * 1000),
      endMs: Math.round(lastEnd * 1000),
    });
    current = '';
    wordStart = -1;
  };

  for (let i = 0; i < characters.length; i++) {
    const ch = characters[i];
    const s = starts[i] ?? lastEnd;
    const e = ends[i] ?? s;
    if (/\s/.test(ch)) {
      flush();
      lastEnd = e;
      continue;
    }
    if (wordStart < 0) wordStart = s;
    current += ch;
    lastEnd = e;
  }
  flush();
  return words;
}

export async function synthesize(text: string): Promise<TtsResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('tts: ELEVENLABS_API_KEY not set');
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!voiceId) throw new Error('tts: ELEVENLABS_VOICE_ID not set');

  const client = new ElevenLabsClient({ apiKey });
  const response = (await client.textToSpeech.convertWithTimestamps(voiceId, {
    text,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  })) as AlignmentResponse;

  const b64 = response.audioBase64 || response.audio_base64;
  if (!b64) throw new Error('tts: no audio_base64 in response');
  const audioBuffer = Buffer.from(b64, 'base64');

  const { characters, startTimes, endTimes } = readAlignment(response);
  const words = buildWords(characters, startTimes, endTimes);
  const durationSec = words.length ? words[words.length - 1].endMs / 1000 : 0;

  return { audioBuffer, durationSec, words };
}
