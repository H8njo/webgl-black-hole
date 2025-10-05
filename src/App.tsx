import { useRef, useState } from 'react';
import BlackHole from './components/Blackhole';
import Galaxy from './components/Galaxy';

function App() {
  const galaxyCanvasRef = useRef<HTMLCanvasElement>(null);
  const [galaxyCanvas, setGalaxyCanvas] = useState<HTMLCanvasElement | null>(
    null
  );
  const [cameraOffset, setCameraOffset] = useState<number>(0);

  const handleGalaxyUpdate = (canvas: HTMLCanvasElement) => {
    setGalaxyCanvas(canvas);
  };

  const handleCameraUpdate = (offset: number) => {
    setCameraOffset(offset);
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Galaxy 배경 */}
      {/* <div className="absolute inset-0 z-0"></div> */}
      <Galaxy
        ref={galaxyCanvasRef}
        onCanvasUpdate={handleGalaxyUpdate}
        onCameraUpdate={handleCameraUpdate}
      />
      {/* Blackhole 오버레이 */}
      <div className="absolute inset-0">
        {galaxyCanvas && (
          <BlackHole
            backgroundCanvas={galaxyCanvas}
            cameraOffset={cameraOffset}
          />
        )}
      </div>
    </div>
  );
}

export default App;
