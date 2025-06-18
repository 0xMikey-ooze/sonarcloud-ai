import { processRecordingToMiniPod } from '../announce.js';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
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
    // Phone number not required since we're not using SMS

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
}