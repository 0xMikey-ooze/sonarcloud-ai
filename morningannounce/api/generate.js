import { generateMiniPod } from '../announce.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await generateMiniPod();
    const fileName = `generated-pods/morning_minipod_${new Date().toISOString().slice(0,10)}.mp3`;
    return res.json({ success: true, file: `/${fileName}` });
  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
}