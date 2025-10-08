import React, { useEffect, useState } from 'react';
import { useBlackHole } from '../../hooks/useBlackHole';
import type { BlackholeProps } from '.';

interface EventHorizonProps {
  backgroundCanvas?: HTMLCanvasElement | null;
  cameraOffset?: number;
  cameraSpeed: BlackholeProps['cameraSpeed'];
  radius?: BlackholeProps['radius'];
  animation?: BlackholeProps['animation'];
}

/**
 * 블랙홀 효과를 보여주는 React 컴포넌트
 * WebGL을 사용하여 실시간 블랙홀 중력 효과를 렌더링합니다
 * @param {EventHorizonProps} props - 컴포넌트 props
 * @param {HTMLCanvasElement} props.backgroundCanvas - 배경으로 사용할 캔버스
 * @param {number} props.cameraOffset - 카메라 오프셋
 * @param {number} props.cameraSpeed - 카메라 속도
 * @param {number} props.radius - 왜곡 효과의 반지름 (픽셀 단위)
 * @param {boolean} props.animation - 애니메이션 여부
 * @returns {JSX.Element} 블랙홀 캔버스 요소
 */
const EventHorizon: React.FC<EventHorizonProps> = ({
  backgroundCanvas,
  cameraOffset = 0,
  cameraSpeed = 0.3,
  radius = 200,
  animation = true,
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
    cameraOffset,
    cameraSpeed,
    radius,
    animation
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
      className="absolute top-0 left-0 w-full h-full bg-transparent cursor-pointer"
    />
  );
};

export default EventHorizon;
