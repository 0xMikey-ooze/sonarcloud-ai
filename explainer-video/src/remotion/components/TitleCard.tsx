import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { VideoFormat } from '../../types';

interface Props {
  title: string;
  hook: string;
  format: VideoFormat;
}

export const TitleCard: React.FC<Props> = ({ title, hook, format }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 14 } });
  const exit = interpolate(
    frame,
    [durationInFrames - fps * 0.4, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const titleSize = format === 'horizontal' ? 110 : format === 'vertical' ? 120 : 112;
  const hookSize = format === 'horizontal' ? 44 : format === 'vertical' ? 50 : 46;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(120% 80% at 50% 30%, #1a1d29 0%, #0b0c10 70%)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 80px',
        opacity: exit,
      }}
    >
      <div
        style={{
          transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px)`,
          opacity: enter,
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 900,
            lineHeight: 1.05,
            color: '#fff',
            letterSpacing: '-0.03em',
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: hookSize,
            fontWeight: 500,
            color: '#a3a8b8',
            letterSpacing: '-0.01em',
          }}
        >
          {hook}
        </div>
      </div>
    </AbsoluteFill>
  );
};
