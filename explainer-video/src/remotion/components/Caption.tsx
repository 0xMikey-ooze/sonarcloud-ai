import { useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionWord, VideoFormat } from '../../types';

interface Props {
  words: CaptionWord[];
  format: VideoFormat;
}

export const Caption: React.FC<Props> = ({ words, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const fontSize = format === 'horizontal' ? 52 : format === 'vertical' ? 64 : 58;

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        fontWeight: 800,
        fontSize,
        lineHeight: 1.15,
        color: '#fff',
        textAlign: 'center',
        textShadow: '0 4px 24px rgba(0,0,0,0.55)',
        letterSpacing: '-0.01em',
      }}
    >
      {words.map((w, i) => {
        const active = currentMs >= w.startMs && currentMs <= w.endMs;
        const spoken = currentMs > w.endMs;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              padding: '0 6px',
              color: active ? '#fde047' : spoken ? '#ffffff' : 'rgba(255,255,255,0.55)',
              transform: active ? 'translateY(-2px) scale(1.04)' : 'none',
              transition: 'none',
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
