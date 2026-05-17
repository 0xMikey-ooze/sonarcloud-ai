export type VideoFormat = 'square' | 'vertical' | 'horizontal';

export interface SceneSpec {
  index: number;
  narration: string;
  imagePrompt: string;
  imageUrl: string;
  audioUrl: string;
  durationFrames: number;
  captionWords: CaptionWord[];
}

export interface CaptionWord {
  text: string;
  startMs: number;
  endMs: number;
}

export interface ScriptScene {
  narration: string;
  imagePrompt: string;
}

export interface ScriptOutput {
  title: string;
  hook: string;
  scenes: ScriptScene[];
}

export interface VideoInputProps {
  title: string;
  hook: string;
  scenes: SceneSpec[];
  format: VideoFormat;
}

export interface JobRecord {
  id: string;
  prompt: string;
  format: VideoFormat;
  status: 'queued' | 'script' | 'images' | 'tts' | 'rendering' | 'done' | 'error';
  progress: number;
  videoUrl?: string;
  error?: string;
  createdAt: number;
}

export const FPS = 30;
export const INTRO_FRAMES = Math.round(FPS * 1.8);
