import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import { uploadToSupabase, cleanupLocalFile } from './supabase-config.js';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Configure FFmpeg paths for macOS Homebrew installation
ffmpeg.setFfmpegPath('/opt/homebrew/bin/ffmpeg');
ffmpeg.setFfprobePath('/opt/homebrew/bin/ffprobe');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const elevenLabsClient = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

// CONFIG: paths
const ANNOUNCEMENT_AUDIO = path.join(__dirname, 'announcements', 'daily.mp3');
const INTRO_AUDIO = path.join(__dirname, 'audio-assets', 'intro.mp3');
const OUTRO_AUDIO = path.join(__dirname, 'audio-assets', 'outro.mp3');
const SUMMARY_AUDIO = path.join(__dirname, 'generated-pods', 'summary.mp3');
const FINAL_POD = path.join(__dirname, 'generated-pods', `morning_minipod_${new Date().toISOString().slice(0,10)}.mp3`);

// 1. Transcribe audio to text
async function transcribeAudio(audioPath) {
  const resp = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1"
  });
  return resp.text;
}

// 2. Summarize for parents with emotion tags for ElevenLabs
async function summarizeText(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `You are the host of a lively, friendly school morning podcast made just for parents. Based on the school’s morning announcements, generate a short, engaging audio script for today's episode.

Please follow these exact rules:
1. Max 350 words
2. Short, natural spoken sentences (2–3 seconds when read aloud)
3. Use square-bracket emotion tags only, e.g., [excited], [seriously], [laughs] — never use parentheses or emotion words outside brackets
4. Sound like a cheerful, informed school host talking directly to parents
5. Only include updates parents care about: trips, events, due dates, reminders, celebrations
6. Make it flow like a mini morning show — start upbeat, transition smoothly, and close with encouragement
7. Use pauses and human moments like [sighs], [laughs], [whispers] for warmth

Approved emotion tags:
- [excited], [happy], [cheerful] → for fun or good news
- [seriously], [dramatically] → for important reminders
- [laughs], [sighs] → for natural reactions
- [whispers], [quietly] → for emphasis or side comments
- [applause], [clapping] → for celebrations or student success

Start with something like:
"[happy] Good morning Oakville parents! [excited] Here’s what’s buzzing at school today…"

Here are today’s raw announcements:

${text}`
    }],
  });
  return completion.choices[0].message.content;
}

// 3. Generate TTS audio with ElevenLabs (Rachel voice - tested working)
async function textToSpeech(text, outputPath) {
  const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice (confirmed working)
  
  // Clean up text to ensure proper emotion tag format for ElevenLabs
  let cleanText = text
    .replace(/\(([^)]+)\)/g, '[$1]') // Convert (emotion) to [emotion]
    .replace(/\[([^\]]+)\]/g, (_, emotion) => {
      // Comprehensive list of valid ElevenLabs tags
      const validTags = [
        // Emotional Tags
        'excited', 'sad', 'angry', 'crying', 'sarcastic', 'happy', 'curious', 'mischievously',
        // Delivery Style Tags
        'whispers', 'shouts', 'quietly', 'dramatically', 'seriously',
        // Non-Verbal Human Reactions
        'laughs', 'laughs harder', 'starts laughing', 'sighs', 'exhales', 'snorts', 'clears throat', 'gulps', 'swallows',
        // Creative or Fun Tags
        'sings', 'woo', 'fart',
        // Accent Tags
        'american accent', 'british accent', 'strong french accent', 'strong german accent',
        // Sound Effects
        'applause', 'clapping', 'gunshot', 'door slams'
      ];
      const cleanEmotion = emotion.toLowerCase().trim();
      return validTags.includes(cleanEmotion) ? `[${cleanEmotion}]` : '';
    });
  
  console.log('🎤 Processed text for TTS:', cleanText);
  
  const response = await axios({
    method: 'POST',
    url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      text: cleanText,
      model_id: 'eleven_multilingual_v2' // v2 model with better emotion support
    },
    responseType: 'stream',
  });
  
  const stream = fs.createWriteStream(outputPath);
  response.data.pipe(stream);
  return new Promise((resolve) => stream.on('finish', resolve));
}

// 4. Merge intro, summary, outro into final pod
function stitchAudio(intro, summary, outro, output) {
  return new Promise((resolve, reject) => {
    const ffmpegCommand = ffmpeg();
    
    // Add inputs that exist
    if (intro && fs.existsSync(intro)) {
      ffmpegCommand.input(intro);
    }
    ffmpegCommand.input(summary);
    if (outro && fs.existsSync(outro)) {
      ffmpegCommand.input(outro);
    }
    
    ffmpegCommand
      .on('end', resolve)
      .on('error', reject)
      .mergeToFile(output, path.dirname(output));
  });
}

// MAIN LOGIC - Process uploaded audio and create minipod
async function processRecordingToMiniPod(audioPath) {
  try {
    console.log('🔊 Transcribing audio...');
    const transcript = await transcribeAudio(audioPath);

    console.log('📝 Summarizing for parents (2-minute relevant content)...');
    const summary = await summarizeText(transcript);

    console.log('🎤 Converting summary to speech...');
    const summaryAudioPath = path.join(__dirname, 'generated-pods', `summary_${Date.now()}.mp3`);
    await textToSpeech(summary, summaryAudioPath);

    console.log('🔗 Creating complete MiniPod with intro + summary + outro...');
    const finalPodPath = path.join(__dirname, 'generated-pods', `morning_minipod_${Date.now()}.mp3`);
    await stitchAudio(INTRO_AUDIO, summaryAudioPath, OUTRO_AUDIO, finalPodPath);

    // Upload to Supabase Storage
    console.log('📱 Uploading MiniPod to Supabase...');
    const fileName = path.basename(finalPodPath);
    const supabaseUrl = await uploadToSupabase(finalPodPath, fileName);
    console.log(`🎵 Supabase audio URL: ${supabaseUrl}`);
    
    // Clean up temp files
    console.log('🗑️ Cleaning up temp files...');
    cleanupLocalFile(summaryAudioPath);
    cleanupLocalFile(finalPodPath);
    
    return {
      success: true,
      transcript: transcript,
      summary: summary,
      firebaseUrl: supabaseUrl,
      podName: fileName
    };
  } catch (err) {
    console.error('❌ Error generating MiniPod:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

// ORIGINAL LOGIC - For existing daily.mp3 file
async function generateMiniPod() {
  try {
    console.log('🔊 Transcribing audio...');
    const transcript = await transcribeAudio(ANNOUNCEMENT_AUDIO);

    console.log('📝 Summarizing for parents...');
    const summary = await summarizeText(transcript);

    console.log('🎤 Converting summary to speech...');
    await textToSpeech(summary, SUMMARY_AUDIO);

    console.log('🔗 Stitching audio files...');
    await stitchAudio(INTRO_AUDIO, SUMMARY_AUDIO, OUTRO_AUDIO, FINAL_POD);

    console.log(`✅ Morning MiniPod created: ${FINAL_POD}`);
  } catch (err) {
    console.error('❌ Error generating MiniPod:', err);
  }
}

export { generateMiniPod, processRecordingToMiniPod, transcribeAudio, summarizeText, textToSpeech, stitchAudio };