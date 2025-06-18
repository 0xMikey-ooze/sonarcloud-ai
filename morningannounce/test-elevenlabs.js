import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testElevenLabs() {
  try {
    console.log('Testing ElevenLabs API...');
    
    // Test with the voice ID and model
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/tnSpp4vdxKPjI9w0GnoV`,
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        text: "Hello, this is a test",
        model_id: 'eleven_v3',
      },
      responseType: 'stream',
    });
    
    console.log('✅ ElevenLabs API working!');
    console.log('Status:', response.status);
    
  } catch (error) {
    console.error('❌ ElevenLabs API error:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    
    // Try with different model
    try {
      console.log('\nTrying with eleven_multilingual_v2...');
      const response2 = await axios({
        method: 'POST',
        url: `https://api.elevenlabs.io/v1/text-to-speech/tnSpp4vdxKPjI9w0GnoV`,
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        data: {
          text: "Hello, this is a test",
          model_id: 'eleven_multilingual_v2',
        },
        responseType: 'stream',
      });
      console.log('✅ eleven_multilingual_v2 works!');
    } catch (error2) {
      console.error('❌ eleven_multilingual_v2 also failed:', error2.response?.status);
    }
  }
}

testElevenLabs();