# explainer-video

Prompt → MP4 explainer video. OpenAI writes the script, Recraft draws each scene, ElevenLabs narrates with word-level timestamps, Remotion renders the MP4.

## Stack

- Next.js 14 (App Router) – form + API routes
- Remotion 4 – composition + local renderer
- OpenAI `gpt-4o` – script generation (JSON output)
- Recraft v3 – per-scene illustrations (one shared style for visual consistency)
- ElevenLabs `convertWithTimestamps` – TTS with word-level alignment for karaoke captions

## Quick start

```bash
cd explainer-video
npm install                # installs Next, Remotion, OpenAI, ElevenLabs SDKs
cp .env.local.example .env.local
# Fill in OPENAI_API_KEY, RECRAFT_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID

npm run remotion           # opens Remotion Studio at the fixture; no API calls
npm run dev                # opens http://localhost:3030 for the prompt UI
```

Remotion will install a Chromium build on first render (~150 MB). The render path is single-threaded and slow (1–3 min for a ~45s video on an M-series Mac). Generated MP4s land in `public/renders/<jobId>.mp4`.

## Pipeline

1. POST `/api/generate` with `{prompt, format}` → returns `jobId` and kicks off `runJob` in the background (in-memory, single process).
2. `runJob`:
   1. **script** – OpenAI returns `{title, hook, scenes: [{narration, imagePrompt}]}`.
   2. **images + tts in parallel** – Recraft for each `imagePrompt`, ElevenLabs `convertWithTimestamps` for each `narration`.
   3. Download each Recraft URL and write the audio buffer to `public/assets/<jobId>/`.
   4. Build `inputProps` with `durationFrames` derived from each scene's measured audio length.
   5. **render** – `@remotion/bundler` bundles the composition once (cached), `@remotion/renderer` writes `public/renders/<jobId>.mp4`.
3. Frontend polls `GET /api/jobs/<id>` every 1.5s, shows progress, plays the video when `status === 'done'`.

## Files

```
src/
  app/
    page.tsx                 # prompt form + status polling
    api/generate/route.ts    # POST: start a job
    api/jobs/[id]/route.ts   # GET:  job status
  remotion/
    index.ts                 # registerRoot(Root)
    Root.tsx                 # 3 compositions (Square, Vertical, Horizontal) + calculateMetadata
    compositions/
      ExplainerSquare.tsx    # one ExplainerVideo component, 3 dimensions registered
    components/
      TitleCard.tsx          # 1.8s intro: title + hook
      Scene.tsx              # image (Ken Burns), audio, caption overlay
      Caption.tsx            # word-by-word karaoke highlighting
    fixture.json             # offline preview data
  lib/
    script.ts                # OpenAI JSON-mode script generation
    recraft.ts               # POST /v1/images/generations
    tts.ts                   # ElevenLabs convertWithTimestamps → buffer + word timings
    assets.ts                # download / write to public/assets/<jobId>
    render.ts                # bundle (cached) + renderMedia
    pipeline.ts              # orchestrator: script → images+tts → render
    jobs.ts                  # in-memory job store (globalThis)
  types.ts                   # VideoInputProps, SceneSpec, JobRecord, FPS=30
```

## Visual consistency

Every Recraft call passes the same `style` (default: `digital_illustration`). To switch the look, change `RECRAFT_STYLE` in `.env.local` (e.g. `realistic_image`, `vector_illustration`, `icon`). For tighter style anchoring across scenes, upload reference images via `POST /v1/styles` and pass the resulting `style_id`.

## Cost per video

Per generation, ballpark:

| Item | Calls | Cost |
|---|---|---|
| OpenAI (script) | 1 | ~$0.01 |
| Recraft (images, v3) | 5–7 | $0.20–0.55 |
| ElevenLabs (TTS) | 5–7 | $0.05–0.15 |
| **Total** | | **~$0.30–0.70** |

Local rendering is free CPU time.

## Known limitations (MVP)

- **Single process, in-memory jobs.** Restarting `next dev` loses status of in-flight jobs. The MP4 still finishes if Node keeps running.
- **No auth or quotas.** Don't expose this URL publicly without adding one.
- **Square only is finished art direction.** Vertical and Horizontal compositions are wired and dimensionally correct, but caption + image placement is tuned for Square. Adjust `Scene.tsx` / `Caption.tsx` font sizes and gradients per format when you take them seriously.
- **No retry on partial failures.** If one Recraft call fails mid-pipeline, the whole job fails. Add per-scene retries before any production use.
- **Recraft URL TTL.** We download images to `public/assets/<jobId>/` immediately to avoid expiring URLs mid-render.

## Switching to Remotion Lambda later

The composition and `inputProps` shape don't change. Replace `src/lib/render.ts`:

1. Use `deploySite()` and `deployFunction()` once (separate `scripts/setup.ts`); store `functionName` + `serveUrl` in `.env.local`.
2. Replace `renderMedia` with `renderMediaOnLambda` from `@remotion/lambda/client`, with `webhook: { url, secret }` pointing at a new `/api/render-webhook` route that updates the job.
3. Upload `public/assets/<jobId>/*` to the Remotion-provisioned S3 bucket and rewrite `inputProps.scenes[].imageUrl` / `audioUrl` to those S3 URLs before calling Lambda.
4. Run `npx remotion lambda policies user` and `policies role` and paste them into AWS IAM.

Everything else (script.ts, recraft.ts, tts.ts, pipeline orchestration) stays.
