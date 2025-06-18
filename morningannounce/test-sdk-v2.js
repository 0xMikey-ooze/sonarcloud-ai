import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

async function testSDKv2() {
  try {
    console.log('Testing ElevenLabs SDK v2...');
    
    // List voices first
    const voices = await client.voices.getAll();
    console.log('First 3 voices:');
    voices.voices.slice(0, 3).forEach(voice => {
      console.log(`- ${voice.name}: ${voice.voice_id}`);
    });
    
    // Use first available voice
    const firstVoice = voices.voices[0];
    console.log(`Using voice: ${firstVoice.name} (${firstVoice.voice_id})`);
    
    // Test different method calls
    console.log('Available methods:', Object.getOwnPropertyNames(client));
    console.log('TTS methods:', client.textToSpeech ? Object.getOwnPropertyNames(client.textToSpeech) : 'textToSpeech not found');
    
    // Try direct generate method
    const audioStream = await client.generate({
      voice: firstVoice.voice_id,
      text: "[excited] Hello! This is a test with emotion tags!",
      model_id: "eleven_multilingual_v2"
    });
    
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    
    const audioBuffer = Buffer.concat(chunks);
    fs.writeFileSync('test-output-v2.mp3', audioBuffer);
    console.log('✅ Test successful! Audio saved as test-output-v2.mp3');
    
  } catch (error) {
    console.error('❌ SDK v2 test failed:', error.message);
    console.error('Full error:', error);
  }
}

testSDKv2();