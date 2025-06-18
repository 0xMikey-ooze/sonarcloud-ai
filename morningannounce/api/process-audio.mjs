import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import formidable from 'formidable';

// Import announce.js functions - we'll need to convert these
import OpenAI from 'openai';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Transcribe audio to text
async function transcribeAudio(audioPath) {
  const resp = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1"
  });
  return resp.text;
}

// Summarize for parents with emotion tags for ElevenLabs
async function summarizeText(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `You are the host of a lively, friendly school morning podcast made just for parents. Based on the school's morning announcements, generate a COMPLETE audio script for today's episode with intro, content, and outro.

Please follow these exact rules:
1. Max 400 words total (including intro and outro)
2. Short, natural spoken sentences (2–3 seconds when read aloud)
3. Use square-bracket emotion tags only, e.g., [excited], [seriously], [laughs] — never use parentheses or emotion words outside brackets
4. Sound like a cheerful, informed school host talking directly to parents
5. Only include updates parents care about: trips, events, due dates, reminders, celebrations
6. Make it flow like a complete mini morning show with intro, main content, and outro
7. Use pauses and human moments like [sighs], [laughs], [whispers] for warmth

STRUCTURE:
- INTRO: Welcome parents warmly, mention it's the Morning MiniPod
- MAIN CONTENT: Announcements that matter to parents
- OUTRO: Encouraging sign-off, remind them to have a great day

Approved emotion tags:
- [excited], [happy], [cheerful] → for fun or good news
- [seriously], [dramatically] → for important reminders
- [laughs], [sighs] → for natural reactions
- [whispers], [quietly] → for emphasis or side comments
- [applause], [clapping] → for celebrations or student success

Example structure:
"[happy] Good morning parents! Welcome to your Morning MiniPod. [excited] Here's what's buzzing at school today…
[content from announcements]
[cheerful] That's all for today's MiniPod! Have a wonderful day with your kids. [happy] We'll see you tomorrow!"

Here are today's raw announcements:

${text}`
    }],
  });
  return completion.choices[0].message.content;
}

// Generate TTS audio with ElevenLabs
async function textToSpeech(text, outputPath) {
  const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice
  
  // Clean up text to ensure proper emotion tag format for ElevenLabs
  let cleanText = text
    .replace(/\(([^)]+)\)/g, '[$1]') // Convert (emotion) to [emotion]
    .replace(/\[([^\]]+)\]/g, (_, emotion) => {
      const validTags = [
        'excited', 'sad', 'angry', 'crying', 'sarcastic', 'happy', 'curious', 'mischievously',
        'whispers', 'shouts', 'quietly', 'dramatically', 'seriously',
        'laughs', 'laughs harder', 'starts laughing', 'sighs', 'exhales', 'snorts', 'clears throat', 'gulps', 'swallows',
        'sings', 'woo', 'fart',
        'american accent', 'british accent', 'strong french accent', 'strong german accent',
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
      model_id: 'eleven_multilingual_v2'
    },
    responseType: 'stream',
  });
  
  const stream = fs.createWriteStream(outputPath);
  response.data.pipe(stream);
  return new Promise((resolve) => stream.on('finish', resolve));
}


// Upload file to Supabase Storage
async function uploadToSupabase(filePath, fileName, bucketName = 'audio-files') {
  try {
    console.log(`📤 Uploading ${fileName} to Supabase...`);
    
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log(`✅ File uploaded successfully: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('❌ Error uploading to Supabase:', error);
    throw error;
  }
}

// Process uploaded audio and create minipod
async function processRecordingToMiniPod(audioPath) {
  try {
    console.log('🔊 Step 1: Transcribing audio with OpenAI Whisper...');
    const transcript = await transcribeAudio(audioPath);
    console.log('✅ Transcription completed, length:', transcript.length);

    console.log('📝 Step 2: Summarizing for parents with GPT-4...');
    const summary = await summarizeText(transcript);
    console.log('✅ Summary completed, length:', summary.length);

    console.log('🎤 Step 3: Converting complete script (with intro/outro) to speech...');
    const finalAudioPath = path.join(tmpdir(), `morning_minipod_${Date.now()}.mp3`);
    await textToSpeech(summary, finalAudioPath);
    console.log('✅ TTS completed, file size:', fs.existsSync(finalAudioPath) ? fs.statSync(finalAudioPath).size : 'File not found');

    // Upload to Supabase Storage
    console.log('📱 Step 4: Uploading complete MiniPod to Supabase...');
    const fileName = `morning_minipod_${Date.now()}.mp3`;
    const supabaseUrl = await uploadToSupabase(finalAudioPath, fileName);
    console.log(`✅ Upload completed: ${supabaseUrl}`);
    
    // Clean up temp files
    console.log('🗑️ Step 5: Cleaning up temp files...');
    if (fs.existsSync(finalAudioPath)) {
      fs.unlinkSync(finalAudioPath);
    }
    console.log('✅ Cleanup completed');
    
    return {
      success: true,
      transcript: transcript,
      summary: summary,
      firebaseUrl: supabaseUrl,
      podName: fileName
    };
  } catch (err) {
    console.error('❌ Error in processRecordingToMiniPod:', err);
    console.error('❌ Stack trace:', err.stack);
    return {
      success: false,
      error: `Processing failed: ${err.message}`
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting audio processing...');
    
    // Check environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Missing OPENAI_API_KEY');
      return res.status(500).json({ success: false, error: 'Missing OpenAI API key configuration' });
    }
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('❌ Missing ELEVENLABS_API_KEY');
      return res.status(500).json({ success: false, error: 'Missing ElevenLabs API key configuration' });
    }
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase configuration');
      return res.status(500).json({ success: false, error: 'Missing Supabase configuration' });
    }
    
    console.log('✅ Environment variables checked');

    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
    });

    console.log('📤 Parsing form data...');
    const [fields, files] = await form.parse(req);
    console.log('📤 Form parsed, files:', Object.keys(files));
    
    if (!files.audio || !files.audio[0]) {
      console.error('❌ No audio file in request');
      return res.status(400).json({ success: false, error: 'No audio file provided' });
    }

    const audioFile = files.audio[0];
    console.log('🎵 Audio file received:', audioFile.originalFilename, 'Size:', audioFile.size);

    // Create temporary file in Vercel's tmp directory
    const tempDir = tmpdir();
    const tempFilePath = path.join(tempDir, `upload-${Date.now()}.wav`);
    
    console.log('💾 Saving to temp file:', tempFilePath);
    
    // Copy uploaded file to temp location with .wav extension
    const fileBuffer = fs.readFileSync(audioFile.filepath);
    await writeFile(tempFilePath, fileBuffer);
    
    console.log('✅ File saved, starting processing...');
    
    // Process recording to create complete minipod
    const result = await processRecordingToMiniPod(tempFilePath);
    
    console.log('🎯 Processing result:', result.success ? 'SUCCESS' : 'FAILED');
    
    // Clean up temp file
    try {
      fs.unlinkSync(tempFilePath);
      console.log('🗑️ Temp file cleaned up');
    } catch (e) {
      console.warn('Could not clean up temp file:', e.message);
    }
    
    if (result.success) {
      return res.json({ 
        success: true, 
        transcript: result.transcript,
        summary: result.summary,
        audioUrl: result.firebaseUrl
      });
    } else {
      console.error('❌ Processing failed:', result.error);
      return res.json({ 
        success: false, 
        error: result.error
      });
    }
    
  } catch (err) {
    console.error('❌ Handler error:', err);
    return res.status(500).json({ success: false, error: `Handler error: ${err.message}` });
  }
};