import OpenAI from 'openai';
import { z } from 'zod';
import { ScriptOutput } from '../types';

const sceneSchema = z.object({
  narration: z.string().min(20).max(220),
  imagePrompt: z.string().min(15).max(300),
});

const scriptSchema = z.object({
  title: z.string().min(3).max(60),
  hook: z.string().min(10).max(120),
  scenes: z.array(sceneSchema).min(3).max(8),
});

const SYSTEM_PROMPT = `You write tight, visual scripts for short explainer videos.

Output a JSON object with:
- title: 3-7 word punchy title.
- hook: one-sentence value promise shown under the title.
- scenes: 4-7 scenes. Each scene has:
  - narration: 1-2 plain sentences a narrator speaks (8-22 words). No filler, no "in this video". Speak directly to the viewer.
  - imagePrompt: a single visual the scene shows. Concrete subject + composition + mood. No text in the image. No camera or video direction.

Rules:
- Total narration across scenes ~75-130 words (45-70 seconds at natural pace).
- Each scene's image stands alone visually. Avoid "again", "another", "next" in narration.
- Plain language. No jargon unless the topic requires it.
- Keep an arc: hook -> core idea -> mechanism / how it works -> implication or "so what".`;

export async function generateScript(prompt: string): Promise<ScriptOutput> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-2024-11-20',
    temperature: 0.6,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Topic to explain: ${prompt}` },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('script: empty model response');

  const parsed = scriptSchema.parse(JSON.parse(raw));
  return parsed;
}
