# Vercel Deployment Guide

## Prerequisites
1. Vercel CLI installed: `npm i -g vercel`
2. Vercel account connected: `vercel login`

## Environment Variables Required
Set these in your Vercel dashboard or via CLI:

```bash
# OpenAI API Key
vercel env add OPENAI_API_KEY

# ElevenLabs API Key  
vercel env add ELEVENLABS_API_KEY

# Supabase Configuration
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

## Deployment Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add the required environment variables listed above
   - Redeploy if needed: `vercel --prod`

## Important Notes

- **FFmpeg**: Make sure your Vercel deployment has access to FFmpeg. You may need to use a Vercel layer or configure paths for serverless functions.
- **File Uploads**: Uses temporary files in `/tmp` directory which is available in Vercel serverless functions.
- **Audio Processing**: ElevenLabs API calls and OpenAI Whisper API calls are handled in serverless functions with 60-second timeout.
- **Storage**: Generated audio files are stored in Supabase Storage, not local filesystem.

## Testing Locally Before Deploy

```bash
# Start development server
npm run dev

# Test the API endpoints
curl -X POST http://localhost:3000/api/process-audio
```

## Architecture Changes for Vercel

- Moved Express server routes to `/api` directory as Vercel serverless functions
- Removed SMS/Twilio functionality (not needed)
- Updated file upload handling to work with Vercel's serverless environment
- Added formidable for handling multipart form data in serverless functions
- Configured proper build settings in `vercel.json`