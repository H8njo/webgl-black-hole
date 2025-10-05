import { useRef, useState } from 'react';
import BlackHole from './components/Blackhole';
import Galaxy from './components/Galaxy';

function App() {
  const galaxyCanvasRef = useRef<HTMLCanvasElement>(null);
  const [galaxyCanvas, setGalaxyCanvas] = useState<HTMLCanvasElement | null>(
    null
  );

  // Galaxy 설정
  const bgUrl =
    'https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?q=80&w=2708&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  const galaxyConfig = {
    numStars: 10000,
    cameraSpeed: 0,
    starSizeRange: {
      small: { min: 0.3, max: 1.0, ratio: 0.8 },
      medium: { min: 1.0, max: 1.8, ratio: 0.15 },
      large: { min: 1.8, max: 3.0, ratio: 0.05 },
    },
    brightnessRange: { min: 0.7, max: 1.0 },
  };

  const handleGalaxyUpdate = (canvas: HTMLCanvasElement) => {
    setGalaxyCanvas(canvas);
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Galaxy 배경 */}
      {/* <div className="absolute inset-0 z-0"></div> */}
      <Galaxy
        ref={galaxyCanvasRef}
        onCanvasUpdate={handleGalaxyUpdate}
        backgroundImageUrl={bgUrl}
        {...galaxyConfig}
      />
      {/* Blackhole 오버레이 */}
      <div className="absolute inset-0">
        {galaxyCanvas && (
          <BlackHole
            backgroundCanvas={galaxyCanvas}
            cameraSpeed={galaxyConfig.cameraSpeed}
          />
        )}
      </div>
    </div>
  );
}

export default App;
