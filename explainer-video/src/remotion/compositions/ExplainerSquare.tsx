import { AbsoluteFill, Sequence } from 'remotion';
import { VideoInputProps, INTRO_FRAMES } from '../../types';
import { Scene } from '../components/Scene';
import { TitleCard } from '../components/TitleCard';

export const ExplainerVideo: React.FC<VideoInputProps> = ({ scenes, title, hook, format }) => {
  let offset = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0b0c10' }}>
      <Sequence from={0} durationInFrames={INTRO_FRAMES}>
        <TitleCard title={title} hook={hook} format={format} />
      </Sequence>
      {scenes.map((scene) => {
        const from = offset + INTRO_FRAMES;
        offset += scene.durationFrames;
        return (
          <Sequence key={scene.index} from={from} durationInFrames={scene.durationFrames}>
            <Scene scene={scene} format={format} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
