import express from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import dotenv from 'dotenv';
import { generateMiniPod, processRecordingToMiniPod } from './announce.js';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Middleware
app.use(express.json());

// Serve generated audio files with CORS headers
app.use('/generated-pods', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, 'generated-pods')));

// Set proper MIME types for TypeScript and JavaScript modules
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (path.endsWith('.js') || path.endsWith('.jsx')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (path.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Ensure uploads and generated-pods directories exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('generated-pods')) {
  fs.mkdirSync('generated-pods');
}

// API endpoint for processing audio from React app
app.post('/api/process-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No audio file provided' });
    }

    const audioPath = req.file.path;
    
    // Rename file to have proper .wav extension for OpenAI Whisper
    const wavPath = audioPath + '.wav';
    fs.renameSync(audioPath, wavPath);
    
    // Process recording to create complete minipod (handled in announce.js)
    const result = await processRecordingToMiniPod(wavPath);
    
    // Clean up uploaded file
    if (fs.existsSync(wavPath)) {
      fs.unlinkSync(wavPath);
    }
    
    if (result.success) {
      // Return the audio URL for playback on the page
      res.json({ 
        success: true, 
        transcript: result.transcript,
        summary: result.summary,
        audioUrl: result.firebaseUrl
      });
    } else {
      res.json({ 
        success: false, 
        error: result.error
      });
    }
    
  } catch (err) {
    console.error('Error processing audio:', err);
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test endpoint
app.post('/api/test', async (req, res) => {
  try {
    res.json({ success: true, message: 'API is working!' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Original API endpoint to trigger MiniPod generation
app.post('/api/generate', async (req, res) => {
  try {
    await generateMiniPod();
    const fileName = `generated-pods/morning_minipod_${new Date().toISOString().slice(0,10)}.mp3`;
    res.json({ success: true, file: `/${fileName}` });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Serve built React app
app.use(express.static(path.join(__dirname, 'dist')));

// Serve React app for non-API routes (SPA)
app.get('*', (req, res) => {
  // Don't intercept API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 