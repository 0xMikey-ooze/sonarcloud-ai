import { Composition, CalculateMetadataFunction } from 'remotion';
import { ExplainerVideo } from './compositions/ExplainerSquare';
import { VideoInputProps, FPS, INTRO_FRAMES } from '../types';
import fixture from './fixture.json';

const calculateMetadata: CalculateMetadataFunction<VideoInputProps> = ({ props }) => {
  const sceneFrames = props.scenes.reduce((acc, s) => acc + s.durationFrames, 0);
  return {
    durationInFrames: Math.max(INTRO_FRAMES + sceneFrames, FPS),
    props,
  };
};

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ExplainerSquare"
        component={ExplainerVideo}
        durationInFrames={FPS * 30}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={fixture as VideoInputProps}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="ExplainerVertical"
        component={ExplainerVideo}
        durationInFrames={FPS * 30}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ ...(fixture as VideoInputProps), format: 'vertical' }}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="ExplainerHorizontal"
        component={ExplainerVideo}
        durationInFrames={FPS * 30}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ ...(fixture as VideoInputProps), format: 'horizontal' }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
