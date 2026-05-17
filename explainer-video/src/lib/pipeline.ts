import { v4 as uuid } from 'uuid';
import { generateScript } from './script';
import { generateImage } from './recraft';
import { synthesize } from './tts';
import { downloadToJob, writeBufferToJob } from './assets';
import { renderVideo } from './render';
import { createJob, getJob, updateJob } from './jobs';
import { FPS, SceneSpec, VideoFormat, VideoInputProps } from '../types';

export interface StartJobInput {
  prompt: string;
  format: VideoFormat;
}

export function startJob({ prompt, format }: StartJobInput): string {
  const id = uuid();
  createJob({
    id,
    prompt,
    format,
    status: 'queued',
    progress: 0,
    createdAt: Date.now(),
  });

  runJob(id, prompt, format).catch((err) => {
    console.error(`[job ${id}] failed:`, err);
    updateJob(id, {
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    });
  });

  return id;
}

async function runJob(id: string, prompt: string, format: VideoFormat) {
  updateJob(id, { status: 'script', progress: 0.05 });
  const script = await generateScript(prompt);

  updateJob(id, { status: 'images', progress: 0.15 });

  const ttsTasks = script.scenes.map((s) => synthesize(s.narration));
  const imageTasks = script.scenes.map((s) => generateImage({ prompt: s.imagePrompt, format }));

  const [ttsResults, imageUrls] = await Promise.all([
    Promise.all(ttsTasks),
    Promise.all(imageTasks),
  ]);

  updateJob(id, { status: 'tts', progress: 0.6 });

  const scenes: SceneSpec[] = [];
  for (let i = 0; i < script.scenes.length; i++) {
    const tts = ttsResults[i];
    const imageRemoteUrl = imageUrls[i];

    const imageLocal = await downloadToJob(id, imageRemoteUrl, `scene-${i}.png`);
    const audioLocal = await writeBufferToJob(id, tts.audioBuffer, `scene-${i}.mp3`);

    scenes.push({
      index: i,
      narration: script.scenes[i].narration,
      imagePrompt: script.scenes[i].imagePrompt,
      imageUrl: imageLocal,
      audioUrl: audioLocal,
      durationFrames: Math.max(Math.round(tts.durationSec * FPS) + 6, FPS),
      captionWords: tts.words,
    });
  }

  const inputProps: VideoInputProps = {
    title: script.title,
    hook: script.hook,
    scenes,
    format,
  };

  updateJob(id, { status: 'rendering', progress: 0.7 });

  const relativeUrl = await renderVideo({
    jobId: id,
    inputProps,
    onProgress: (pct) => {
      updateJob(id, { progress: 0.7 + pct * 0.3 });
    },
  });

  updateJob(id, { status: 'done', progress: 1, videoUrl: relativeUrl });
}

export { getJob };
