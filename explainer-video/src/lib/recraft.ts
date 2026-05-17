import { VideoFormat } from '../types';

const BASE_URL = 'https://external.api.recraft.ai/v1';

const SIZE_BY_FORMAT: Record<VideoFormat, string> = {
  square: '1024x1024',
  vertical: '1024x1820',
  horizontal: '1820x1024',
};

export interface RecraftOptions {
  prompt: string;
  format: VideoFormat;
  style?: string;
  model?: string;
}

export async function generateImage({
  prompt,
  format,
  style = process.env.RECRAFT_STYLE || 'digital_illustration',
  model = process.env.RECRAFT_MODEL || 'recraftv3',
}: RecraftOptions): Promise<string> {
  const apiKey = process.env.RECRAFT_API_KEY;
  if (!apiKey) throw new Error('recraft: RECRAFT_API_KEY not set');

  const res = await fetch(`${BASE_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model,
      style,
      size: SIZE_BY_FORMAT[format],
      n: 1,
      response_format: 'url',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`recraft: ${res.status} ${body}`);
  }

  const json = (await res.json()) as { data: Array<{ url: string }> };
  const url = json.data?.[0]?.url;
  if (!url) throw new Error('recraft: no url in response');
  return url;
}
