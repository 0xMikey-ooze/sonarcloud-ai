import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function testV2() {
  try {
    console.log('Testing eleven_multilingual_v2 with Rachel voice...');
    
    const response = await axios({
      method: 'POST',
      url: 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        text: "[excited] Hello! This is a test with emotion tags!",
        model_id: 'eleven_multilingual_v2'
      },
      responseType: 'stream',
    });
    
    console.log('✅ V2 model works! Status:', response.status);
    
    const stream = fs.createWriteStream('test-v2.mp3');
    response.data.pipe(stream);
    
    stream.on('finish', () => {
      console.log('✅ Audio saved as test-v2.mp3');
    });
    
  } catch (error) {
    console.error('❌ V2 test failed');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
    
    // Try with v1 as fallback
    try {
      console.log('\nTrying v1 fallback...');
      const response = await axios({
        method: 'POST',
        url: 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        data: {
          text: "Hello! This is a test.",
          model_id: 'eleven_monolingual_v1'
        },
        responseType: 'stream',
      });
      
      console.log('✅ V1 fallback works! Status:', response.status);
      
      const stream = fs.createWriteStream('test-v1-fallback.mp3');
      response.data.pipe(stream);
      
      stream.on('finish', () => {
        console.log('✅ V1 audio saved as test-v1-fallback.mp3');
      });
      
    } catch (fallbackError) {
      console.error('❌ V1 fallback also failed:', fallbackError.response?.status);
    }
  }
}

testV2();