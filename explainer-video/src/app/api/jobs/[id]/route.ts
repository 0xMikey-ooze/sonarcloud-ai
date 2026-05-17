import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/jobs';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const job = getJob(params.id);
  if (!job) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(job);
}
