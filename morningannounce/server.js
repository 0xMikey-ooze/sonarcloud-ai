import express from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import twilio from 'twilio';
import dotenv from 'dotenv';
import { generateMiniPod, processRecordingToMiniPod } from './announce.js';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Function to send SMS via Twilio
async function sendSMS(phoneNumber, message) {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return { success: false, error: error.message };
  }
}

// API endpoint for processing audio from React app
app.post('/api/process-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No audio file provided' });
    }

    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: 'Phone number required' });
    }

    const audioPath = req.file.path;
    
    // Process recording to create complete minipod (handled in announce.js)
    const result = await processRecordingToMiniPod(audioPath, phoneNumber);
    
    // Clean up uploaded file
    fs.unlinkSync(audioPath);
    
    if (result.success) {
      // Send SMS with the Firebase-hosted minipod link
      const smsMessage = `🎧 Your Morning MiniPod is ready! 

Listen to your 2-minute parent-focused school update:
${result.firebaseUrl}

Have a great day! 📚`;
      const smsResult = await sendSMS(phoneNumber, smsMessage);
      
      if (smsResult.success) {
        res.json({ 
          success: true, 
          transcript: result.transcript,
          summary: result.summary,
          audioUrl: result.firebaseUrl,
          phoneNumber: phoneNumber,
          smsId: smsResult.messageId
        });
      } else {
        res.json({ 
          success: false, 
          error: `SMS failed: ${smsResult.error}`,
          transcript: result.transcript,
          summary: result.summary,
          audioUrl: result.firebaseUrl
        });
      }
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

// Serve React app for root (will switch to this)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 