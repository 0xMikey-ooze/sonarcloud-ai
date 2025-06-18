export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple response for now
    return res.json({ success: true, message: 'Generate endpoint working' });
  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
};