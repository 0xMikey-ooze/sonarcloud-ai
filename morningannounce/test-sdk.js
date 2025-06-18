import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

async function testSDK() {
  try {
    console.log('Testing ElevenLabs SDK...');
    
    // First, list available voices to check if our voice ID exists
    console.log('Fetching available voices...');
    const voices = await client.voices.getAll();
    console.log('Available voices:');
    voices.voices.forEach(voice => {
      console.log(`- ${voice.name}: ${voice.voice_id}`);
    });
    
    // Check if our voice ID exists
    const ourVoiceId = 'tnSpp4vdxKPjI9w0GnoV';
    const voiceExists = voices.voices.find(v => v.voice_id === ourVoiceId);
    
    if (!voiceExists) {
      console.log(`❌ Voice ID ${ourVoiceId} not found!`);
      console.log('Using first available voice instead...');
      const firstVoice = voices.voices[0];
      console.log(`Using: ${firstVoice.name} (${firstVoice.voice_id})`);
      
      // Test with first available voice
      const response = await client.textToSpeech.create({
        voice_id: firstVoice.voice_id,
        model_id: "eleven_v3",
        text: "[excited] Hello! This is a test.",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      });
      
      const audioBuffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync('test-output.mp3', audioBuffer);
      console.log('✅ Test successful! Audio saved as test-output.mp3');
      
    } else {
      console.log(`✅ Voice ID ${ourVoiceId} found: ${voiceExists.name}`);
      
      // Test with our voice
      const response = await client.textToSpeech.create({
        voice_id: ourVoiceId,
        model_id: "eleven_v3",
        text: "[excited] Hello! This is a test.",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      });
      
      const audioBuffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync('test-output.mp3', audioBuffer);
      console.log('✅ Test successful! Audio saved as test-output.mp3');
    }
    
  } catch (error) {
    console.error('❌ SDK test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testSDK();