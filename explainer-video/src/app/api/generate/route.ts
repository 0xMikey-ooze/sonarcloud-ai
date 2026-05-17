import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { startJob } from '@/lib/pipeline';

export const runtime = 'nodejs';
export const maxDuration = 300;

const schema = z.object({
  prompt: z.string().min(8).max(500),
  format: z.enum(['square', 'vertical', 'horizontal']),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const jobId = startJob(parsed.data);
  return NextResponse.json({ jobId });
}
