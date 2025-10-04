import React, { useEffect, useState } from 'react';
import { useBlackHole } from '../hooks/useBlackHole';

interface BlackHoleProps {
  backgroundCanvas?: HTMLCanvasElement | null;
  cameraOffset?: number;
}

/**
 * 블랙홀 효과를 보여주는 React 컴포넌트
 * WebGL을 사용하여 실시간 블랙홀 중력 효과를 렌더링합니다
 * @param {BlackHoleProps} props - 컴포넌트 props
 * @param {HTMLCanvasElement} props.backgroundCanvas - 배경으로 사용할 캔버스
 * @returns {JSX.Element} 블랙홀 캔버스 요소
 */
const BlackHole: React.FC<BlackHoleProps> = ({
  backgroundCanvas,
  cameraOffset = 0,
}) => {
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return { width: 0, height: 0 };
  });

  const { canvasRef } = useBlackHole(
    windowSize,
    backgroundCanvas,
    cameraOffset
  );

  /**
   * 윈도우 리사이즈 이벤트 핸들러
   * 윈도우 크기가 변경될 때 상태를 업데이트합니다
   */
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        pointerEvents: 'none',
      }}
    />
  );
};

export default BlackHole;
