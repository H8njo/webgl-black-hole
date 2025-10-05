import { useRef, useState } from 'react';
import EventHorizon from './EventHorizon';
import Galaxy from './Galaxy';

interface BlackholeProps {
  backgroundImageUrl?: string;
  numStars?: number;
  cameraSpeed?: number;
  starSizeRange?: {
    small: { min: number; max: number; ratio: number };
    medium: { min: number; max: number; ratio: number };
    large: { min: number; max: number; ratio: number };
  };
  brightnessRange?: { min: number; max: number };
}

const Blackhole = (props: BlackholeProps) => {
  const galaxyCanvasRef = useRef<HTMLCanvasElement>(null);
  const [galaxyCanvas, setGalaxyCanvas] = useState<HTMLCanvasElement | null>();

  const handleGalaxyUpdate = (canvas: HTMLCanvasElement) => {
    setGalaxyCanvas(canvas);
  };
  return (
    <div className="relative w-full h-screen bg-black">
      {/* Galaxy 배경 */}
      <Galaxy
        ref={galaxyCanvasRef}
        onCanvasUpdate={handleGalaxyUpdate}
        {...props}
      />
      {/* Blackhole 오버레이 */}
      <div className="absolute inset-0">
        {galaxyCanvas && (
          <EventHorizon
            backgroundCanvas={galaxyCanvas}
            cameraSpeed={props.cameraSpeed || 0}
          />
        )}
      </div>
    </div>
  );
};

export default Blackhole;
