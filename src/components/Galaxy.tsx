import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  color: string;
}

const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const cameraOffsetRef = useRef<number>(0);

  // RGB 색상을 RGBA로 변환하는 함수
  const rgbToRgba = (rgb: string, alpha: number): string => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [, r, g, b] = match;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return rgb;
  };

  // 별 생성 함수
  const createStars = (canvas: HTMLCanvasElement): Star[] => {
    const stars: Star[] = [];
    const numStars = 15000; // 별의 개수

    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * (canvas.width * 2); // 화면 너비의 2배로 확장
      const y = Math.random() * canvas.height;
      const size = Math.random() * 1 + 0.1; // 0.2 ~ 1.0 크기
      const brightness = Math.random(); // 0 ~ 1 밝기

      // 색상 결정 (흰색, 파란색, 분홍색 계열)
      let color: string;
      const colorType = Math.random();
      if (colorType < 0.7) {
        // 70% 확률로 흰색/연한 파란색
        const blueIntensity = Math.random() * 0.3;
        const r = Math.round(255 - blueIntensity * 100);
        const g = Math.round(255 - blueIntensity * 50);
        color = `rgb(${r}, ${g}, 255)`;
      } else if (colorType < 0.9) {
        // 20% 확률로 더 강한 파란색
        const r = Math.round(200 + Math.random() * 55);
        const g = Math.round(220 + Math.random() * 35);
        color = `rgb(${r}, ${g}, 255)`;
      } else {
        // 10% 확률로 분홍색/붉은색
        const redIntensity = Math.random() * 0.5;
        const g = Math.round(200 - redIntensity * 100);
        const b = Math.round(200 - redIntensity * 100);
        color = `rgb(255, ${g}, ${b})`;
      }

      stars.push({
        x,
        y,
        size,
        brightness,
        color,
      });
    }

    return stars;
  };

  // 별 그리기 함수
  const drawStars = (ctx: CanvasRenderingContext2D, stars: Star[]) => {
    // 완전 검은색 배경
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 별들 그리기
    stars.forEach((star) => {
      const currentBrightness = star.brightness;

      // 카메라 오프셋을 적용한 별의 위치 계산
      const screenX = star.x - cameraOffsetRef.current;

      // 화면 밖의 별들은 건너뛰기
      if (screenX < -50 || screenX > ctx.canvas.width + 50) {
        return;
      }

      // 별의 크기에 따라 그리기 방식 결정
      if (star.size > 0.7) {
        // 큰 별들은 후광 효과 추가
        const glowSize = star.size * 3;
        const glowGradient = ctx.createRadialGradient(
          screenX,
          star.y,
          0,
          screenX,
          star.y,
          glowSize
        );
        // 후광 효과도 밝기에 따라 조정
        const colorMatch = star.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (colorMatch) {
          const [, r, g, b] = colorMatch;
          const baseR = parseInt(r || '0') * currentBrightness;
          const baseG = parseInt(g || '0') * currentBrightness;
          const baseB = parseInt(b || '0') * currentBrightness;

          glowGradient.addColorStop(
            0,
            `rgb(${Math.round(baseR)}, ${Math.round(baseG)}, ${Math.round(
              baseB
            )})`
          );
          glowGradient.addColorStop(
            0.3,
            `rgba(${Math.round(baseR)}, ${Math.round(baseG)}, ${Math.round(
              baseB
            )}, 0.5)`
          );
          glowGradient.addColorStop(
            0.6,
            `rgba(${Math.round(baseR)}, ${Math.round(baseG)}, ${Math.round(
              baseB
            )}, 0.25)`
          );
          glowGradient.addColorStop(
            1,
            `rgba(${Math.round(baseR)}, ${Math.round(baseG)}, ${Math.round(
              baseB
            )}, 0)`
          );
        } else {
          glowGradient.addColorStop(0, star.color);
          glowGradient.addColorStop(0.3, rgbToRgba(star.color, 0.5));
          glowGradient.addColorStop(0.6, rgbToRgba(star.color, 0.25));
          glowGradient.addColorStop(1, rgbToRgba(star.color, 0));
        }

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(screenX, star.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // 별의 중심 그리기
      // 밝기에 따라 색상 조정
      const colorMatch = star.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (colorMatch) {
        const [, r, g, b] = colorMatch;
        const adjustedR = Math.round(parseInt(r || '0') * currentBrightness);
        const adjustedG = Math.round(parseInt(g || '0') * currentBrightness);
        const adjustedB = Math.round(parseInt(b || '0') * currentBrightness);
        ctx.fillStyle = `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`;
      } else {
        ctx.fillStyle = star.color;
      }

      ctx.beginPath();
      ctx.arc(screenX, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // 애니메이션 루프
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 카메라가 오른쪽으로 이동 (속도 조절 가능)
    cameraOffsetRef.current += 0.5;

    // 별들이 화면 너비를 넘어가면 다시 시작 위치로 리셋
    if (cameraOffsetRef.current > canvas.width * 2) {
      cameraOffsetRef.current = 0;
    }

    drawStars(ctx, starsRef.current);
    animationRef.current = requestAnimationFrame(animate);
  };

  // 캔버스 크기 조정
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    // 별들 재생성
    starsRef.current = createStars(canvas);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 초기 설정
    resizeCanvas();
    animationRef.current = requestAnimationFrame(animate);

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', resizeCanvas);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default StarField;
