import { promises as fs } from 'fs';
import path from 'path';

const ASSETS_ROOT = path.join(process.cwd(), 'public', 'assets');

export async function ensureJobDir(jobId: string): Promise<string> {
  const dir = path.join(ASSETS_ROOT, jobId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function downloadToJob(jobId: string, url: string, filename: string): Promise<string> {
  const dir = await ensureJobDir(jobId);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`asset download ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buf);
  return `/assets/${jobId}/${filename}`;
}

export async function writeBufferToJob(
  jobId: string,
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const dir = await ensureJobDir(jobId);
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);
  return `/assets/${jobId}/${filename}`;
}

export function publicUrl(relativePath: string): string {
  const base = process.env.PUBLIC_BASE_URL || 'http://localhost:3030';
  return `${base}${relativePath}`;
}
