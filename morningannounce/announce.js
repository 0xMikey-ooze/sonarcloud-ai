import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import { uploadToFirebase, cleanupLocalFile } from './firebase-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// 2. Summarize for parents
async function summarizeText(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `Summarize the following school announcements into 200 words or less, selecting only information relevant to parents:\n\n${text}`
    }],
  });
  return completion.choices[0].message.content;
}

// 3. Generate TTS audio with ElevenLabs
async function textToSpeech(text, outputPath) {
  const voiceId = '56AoDkrOh6qfVPDXZ7Pt'; // Custom voice for morning announcements
  const response = await axios({
    method: 'POST',
    url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      text: text,
      model_id: 'eleven_multilingual_v2',
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
    ffmpeg()
      .input(intro)
      .input(summary)
      .input(outro)
      .on('end', resolve)
      .on('error', reject)
      .mergeToFile(output, path.dirname(output));
  });
}

// MAIN LOGIC - Process uploaded audio and create minipod
async function processRecordingToMiniPod(audioPath, phoneNumber) {
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

    console.log('☁️ Uploading MiniPod to Firebase Storage...');
    const finalPodName = `minipod_${Date.now()}_${phoneNumber.replace(/[^0-9]/g, '')}.mp3`;
    const firebaseUrl = await uploadToFirebase(finalPodPath, finalPodName);

    console.log('🗑️ Cleaning up local files...');
    cleanupLocalFile(summaryAudioPath);
    cleanupLocalFile(finalPodPath);

    console.log(`✅ Morning MiniPod uploaded to Firebase: ${firebaseUrl}`);
    
    return {
      success: true,
      transcript: transcript,
      summary: summary,
      firebaseUrl: firebaseUrl,
      podName: finalPodName
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