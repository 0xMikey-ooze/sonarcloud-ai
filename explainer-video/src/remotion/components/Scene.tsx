import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { SceneSpec, VideoFormat } from '../../types';
import { Caption } from './Caption';

interface Props {
  scene: SceneSpec;
  format: VideoFormat;
}

export const Scene: React.FC<Props> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const sceneFrames = scene.durationFrames;
  const zoom = interpolate(frame, [0, sceneFrames], [1.0, 1.08], {
    extrapolateRight: 'clamp',
  });
  const drift = interpolate(frame, [0, sceneFrames], [0, -20], {
    extrapolateRight: 'clamp',
  });

  const fadeIn = interpolate(frame, [0, fps * 0.4], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(
    frame,
    [sceneFrames - fps * 0.35, sceneFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const opacity = Math.min(fadeIn, fadeOut);

  const captionMaxWidth = format === 'horizontal' ? '70%' : '88%';
  const captionBottom = format === 'vertical' ? '18%' : '8%';

  return (
    <AbsoluteFill style={{ backgroundColor: '#0b0c10', opacity }}>
      <AbsoluteFill style={{ transform: `scale(${zoom}) translateY(${drift}px)` }}>
        <Img
          src={scene.imageUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.65) 88%, rgba(0,0,0,0.85) 100%)',
        }}
      />
      {scene.audioUrl ? <Audio src={scene.audioUrl} /> : null}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: captionBottom,
        }}
      >
        <div style={{ maxWidth: captionMaxWidth, width: '100%', padding: '0 48px' }}>
          <Caption words={scene.captionWords} format={format} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
