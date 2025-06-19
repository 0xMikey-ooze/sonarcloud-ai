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

// Configure FFmpeg paths based on environment
// On Heroku, FFmpeg is available via buildpack in system PATH
// On local macOS with Homebrew, we may need to specify the path
if (process.env.NODE_ENV !== 'production' && process.platform === 'darwin') {
  // Only set paths for local macOS development if the binaries exist
  const homebrewFfmpeg = '/opt/homebrew/bin/ffmpeg';
  const homebrewFfprobe = '/opt/homebrew/bin/ffprobe';
  
  if (fs.existsSync(homebrewFfmpeg) && fs.existsSync(homebrewFfprobe)) {
    ffmpeg.setFfmpegPath(homebrewFfmpeg);
    ffmpeg.setFfprobePath(homebrewFfprobe);
    console.log('🔧 Using Homebrew FFmpeg paths for local development');
  } else {
    console.log('🔧 Using system PATH for FFmpeg (Homebrew not found or not needed)');
  }
} else {
  // Production (Heroku) or other environments - use system PATH
  console.log('🔧 Using system PATH for FFmpeg (production environment)');
}

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
      content: `You are the host of a lively, friendly school morning podcast made just for parents. Based on the school's morning announcements, generate a short, engaging audio script for today's episode.

Please follow these exact rules:
1. Max 350 words
2. Short, natural spoken sentences (2–3 seconds when read aloud)
3. Sound like a cheerful, informed school host talking directly to parents
4. Only include updates parents care about: trips, events, due dates, reminders, celebrations
5. Make it flow like a mini morning show — start upbeat, transition smoothly, and close with encouragement
6. Use pauses and human moments for warmth and naturalness

Start with something like:
"Good morning Oakville parents! Here's what's buzzing at school today…"

Here are today's raw announcements:

${text}`
    }],
  });
  return completion.choices[0].message.content;
}

// 3. Generate TTS audio with ElevenLabs (Rachel voice - tested working)
async function textToSpeech(text, outputPath) {
  const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice (confirmed working)
  
  // Clean up text to ensure proper emotion tag format for ElevenLabs
  let cleanText = text;
  
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
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.3,
        similarity_boost: 0.5
      }
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