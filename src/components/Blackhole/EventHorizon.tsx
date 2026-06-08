import React, { useEffect, useRef, useState } from 'react';
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
 * WebGL을 사용하여 실시간 블랙홀 중력 효과를 렌더링합니다.
 * 풀스크린(window) 대신 부모 컨테이너 크기에 맞춰 렌더링합니다.
 */
const EventHorizon: React.FC<EventHorizonProps> = ({
  backgroundCanvas,
  cameraOffset = 0,
  cameraSpeed = 0.3,
  radius = 200,
  animation = true,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // 컨테이너 크기 — window가 아닌 부모 컨테이너 기준. 크기 변화 시 WebGL 재초기화 트리거.
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const { canvasRef } = useBlackHole(
    containerSize,
    backgroundCanvas,
    cameraOffset,
    cameraSpeed,
    radius,
    animation
  );

  // 부모 컨테이너 크기 관찰 (ResizeObserver)
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize((prev) =>
        prev.width === rect.width && prev.height === rect.height
          ? prev
          : { width: rect.width, height: rect.height }
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full bg-transparent cursor-pointer"
      />
    </div>
  );
};

export default EventHorizon;
