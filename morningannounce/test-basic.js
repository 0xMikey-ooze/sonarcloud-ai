import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function testBasic() {
  try {
    console.log('Testing most basic ElevenLabs call...');
    console.log('API Key:', process.env.ELEVENLABS_API_KEY ? 'Present' : 'Missing');
    
    // Use Rachel voice (most common default)
    const response = await axios({
      method: 'POST',
      url: 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        text: "Hello world",
        model_id: 'eleven_monolingual_v1'
      },
      responseType: 'stream',
    });
    
    console.log('✅ Success! Status:', response.status);
    
    const stream = fs.createWriteStream('test-basic.mp3');
    response.data.pipe(stream);
    
    stream.on('finish', () => {
      console.log('✅ Audio saved as test-basic.mp3');
    });
    
  } catch (error) {
    console.error('❌ Basic test failed');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testBasic();