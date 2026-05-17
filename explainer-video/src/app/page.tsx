'use client';
import { useEffect, useState } from 'react';
import type { JobRecord, VideoFormat } from '@/types';

const STATUS_LABEL: Record<JobRecord['status'], string> = {
  queued: 'Queued',
  script: 'Writing script',
  images: 'Generating images (Recraft)',
  tts: 'Synthesizing narration (ElevenLabs)',
  rendering: 'Rendering video (Remotion)',
  done: 'Done',
  error: 'Error',
};

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [format, setFormat] = useState<VideoFormat>('square');
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    const poll = async () => {
      const r = await fetch(`/api/jobs/${jobId}`);
      if (!r.ok) return;
      const data = (await r.json()) as JobRecord;
      if (cancelled) return;
      setJob(data);
      if (data.status !== 'done' && data.status !== 'error') {
        setTimeout(poll, 1500);
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [jobId]);

  const submit = async () => {
    if (!prompt.trim() || submitting) return;
    setSubmitting(true);
    setJob(null);
    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, format }),
      });
      const data = await r.json();
      if (r.ok) setJobId(data.jobId);
      else setJob({ id: '', prompt, format, status: 'error', progress: 0, createdAt: Date.now(), error: JSON.stringify(data.error) });
    } finally {
      setSubmitting(false);
    }
  };

  const pct = job ? Math.round(job.progress * 100) : 0;

  return (
    <main style={{ maxWidth: 720, margin: '64px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Explainer Video
      </h1>
      <p style={{ color: '#9ba0b0', marginBottom: 32 }}>
        Describe a topic. Recraft draws it, ElevenLabs narrates it, Remotion renders the MP4.
      </p>

      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Topic</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="How a CPU works"
        rows={3}
        style={{
          width: '100%',
          padding: 16,
          fontSize: 16,
          background: '#15171f',
          color: '#fff',
          border: '1px solid #2a2d3a',
          borderRadius: 12,
          resize: 'vertical',
        }}
      />

      <label style={{ display: 'block', margin: '16px 0 8px', fontWeight: 600 }}>Format</label>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['square', 'vertical', 'horizontal'] as VideoFormat[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            style={{
              padding: '10px 16px',
              background: format === f ? '#fde047' : '#15171f',
              color: format === f ? '#0b0c10' : '#fff',
              border: '1px solid #2a2d3a',
              borderRadius: 10,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={submitting || !prompt.trim() || (job?.status && job.status !== 'done' && job.status !== 'error')}
        style={{
          marginTop: 24,
          width: '100%',
          padding: '14px 20px',
          background: '#fde047',
          color: '#0b0c10',
          border: 'none',
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting ? 'Submitting…' : 'Generate video'}
      </button>

      {job && (
        <div style={{ marginTop: 32, padding: 20, background: '#15171f', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <strong>{STATUS_LABEL[job.status]}</strong>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 8, background: '#0b0c10', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: job.status === 'error' ? '#ef4444' : '#fde047',
                transition: 'width 0.3s',
              }}
            />
          </div>
          {job.error && (
            <pre style={{ marginTop: 16, color: '#ef4444', whiteSpace: 'pre-wrap' }}>{job.error}</pre>
          )}
          {job.videoUrl && (
            <video
              src={job.videoUrl}
              controls
              autoPlay
              style={{ width: '100%', marginTop: 16, borderRadius: 8, background: '#000' }}
            />
          )}
        </div>
      )}
    </main>
  );
}
