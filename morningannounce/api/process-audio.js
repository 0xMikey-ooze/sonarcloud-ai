const fs = require('fs');
const path = require('path');
const { writeFile } = require('fs/promises');
const { tmpdir } = require('os');
const formidable = require('formidable');

// Import announce.js functions - we'll need to convert these
const OpenAI = require('openai');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

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
      content: `You are the host of a lively, friendly school morning podcast made just for parents. Based on the school's morning announcements, generate a short, engaging audio script for today's episode.

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
"[happy] Good morning Oakville parents! [excited] Here's what's buzzing at school today…"

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
    console.log('🔊 Transcribing audio...');
    const transcript = await transcribeAudio(audioPath);

    console.log('📝 Summarizing for parents (2-minute relevant content)...');
    const summary = await summarizeText(transcript);

    console.log('🎤 Converting summary to speech...');
    const summaryAudioPath = path.join(tmpdir(), `summary_${Date.now()}.mp3`);
    await textToSpeech(summary, summaryAudioPath);

    // Upload to Supabase Storage
    console.log('📱 Uploading MiniPod to Supabase...');
    const fileName = `morning_minipod_${Date.now()}.mp3`;
    const supabaseUrl = await uploadToSupabase(summaryAudioPath, fileName);
    console.log(`🎵 Supabase audio URL: ${supabaseUrl}`);
    
    // Clean up temp files
    console.log('🗑️ Cleaning up temp files...');
    if (fs.existsSync(summaryAudioPath)) {
      fs.unlinkSync(summaryAudioPath);
    }
    
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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
    });

    const [fields, files] = await form.parse(req);
    
    if (!files.audio || !files.audio[0]) {
      return res.status(400).json({ success: false, error: 'No audio file provided' });
    }

    const audioFile = files.audio[0];

    // Create temporary file in Vercel's tmp directory
    const tempDir = tmpdir();
    const tempFilePath = path.join(tempDir, `upload-${Date.now()}.wav`);
    
    // Copy uploaded file to temp location with .wav extension
    const fileBuffer = fs.readFileSync(audioFile.filepath);
    await writeFile(tempFilePath, fileBuffer);
    
    // Process recording to create complete minipod
    const result = await processRecordingToMiniPod(tempFilePath);
    
    // Clean up temp file
    try {
      fs.unlinkSync(tempFilePath);
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
      return res.json({ 
        success: false, 
        error: result.error
      });
    }
    
  } catch (err) {
    console.error('Error processing audio:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};