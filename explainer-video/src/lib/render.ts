import path from 'path';
import { promises as fs } from 'fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { VideoFormat, VideoInputProps } from '../types';

const COMPOSITION_ID: Record<VideoFormat, string> = {
  square: 'ExplainerSquare',
  vertical: 'ExplainerVertical',
  horizontal: 'ExplainerHorizontal',
};

let cachedServeUrl: string | null = null;

async function getServeUrl(): Promise<string> {
  if (cachedServeUrl) return cachedServeUrl;
  const entry = path.join(process.cwd(), 'src', 'remotion', 'index.ts');
  const publicDir = path.join(process.cwd(), 'public');
  const url = await bundle({
    entryPoint: entry,
    publicDir,
    webpackOverride: (c) => c,
  });
  cachedServeUrl = url;
  return url;
}

export interface RenderArgs {
  jobId: string;
  inputProps: VideoInputProps;
  onProgress?: (pct: number) => void;
}

export async function renderVideo({ jobId, inputProps, onProgress }: RenderArgs): Promise<string> {
  const serveUrl = await getServeUrl();
  const compositionId = COMPOSITION_ID[inputProps.format];

  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  const outDir = path.join(process.cwd(), 'public', 'renders');
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${jobId}.mp4`);

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: outPath,
    inputProps,
    onProgress: ({ progress }) => onProgress?.(progress),
  });

  return `/renders/${jobId}.mp4`;
}
