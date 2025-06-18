import { uploadToSupabase } from './supabase-config.js';
import fs from 'fs';
import path from 'path';

async function testSupabaseUpload() {
  try {
    console.log('🧪 Testing Supabase upload...');
    
    // Use an existing MP3 file for testing
    const testFile = './generated-pods/morning_minipod_1750263929740.mp3';
    
    if (!fs.existsSync(testFile)) {
      console.log('❌ Test file not found, creating a simple test file...');
      fs.writeFileSync('./test-upload.txt', 'This is a test file for Supabase storage.');
      const result = await uploadToSupabase('./test-upload.txt', 'test-upload.txt', 'audio-files');
      console.log('✅ Test upload successful:', result);
      fs.unlinkSync('./test-upload.txt');
    } else {
      console.log('📁 Found existing MP3 file, testing with:', testFile);
      const fileName = `test-${Date.now()}.mp3`;
      const result = await uploadToSupabase(testFile, fileName, 'audio-files');
      console.log('✅ MP3 upload successful:', result);
    }
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
  }
}

testSupabaseUpload();