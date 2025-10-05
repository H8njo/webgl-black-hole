import { useEffect, useRef, forwardRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  color: string;
}

interface GalaxyProps {
  onCanvasUpdate?: (canvas: HTMLCanvasElement) => void;
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

const Galaxy = forwardRef<HTMLCanvasElement, GalaxyProps>(
  (
    {
      onCanvasUpdate,
      backgroundImageUrl,
      numStars = 10000,
      cameraSpeed = 0.5,
      starSizeRange = {
        small: { min: 0.5, max: 1.2, ratio: 0.7 },
        medium: { min: 1.0, max: 1.8, ratio: 0.2 },
        large: { min: 1.5, max: 2.5, ratio: 0.1 },
      },
      brightnessRange = { min: 0.8, max: 1.0 },
    },
    ref
  ) => {
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
    const stars: Star[] = [];

    // 별 생성 함수
    const createStars = (canvas: HTMLCanvasElement): Star[] => {
      for (let i = 0; i < numStars; i++) {
        const x = Math.random() * (canvas.width * 2); // 화면 너비의 2배로 확장
        const y = Math.random() * canvas.height;
        // 별 크기 비율 조정
        const randomValue = Math.random();
        let size;
        if (randomValue < starSizeRange.small.ratio) {
          // 작은 별
          size =
            (Math.random() *
              (starSizeRange.small.max - starSizeRange.small.min) +
              starSizeRange.small.min) /
            window.devicePixelRatio;
        } else if (
          randomValue <
          starSizeRange.small.ratio + starSizeRange.medium.ratio
        ) {
          // 중간 별
          size =
            (Math.random() *
              (starSizeRange.medium.max - starSizeRange.medium.min) +
              starSizeRange.medium.min) /
            window.devicePixelRatio;
        } else {
          // 큰 별
          size =
            (Math.random() *
              (starSizeRange.large.max - starSizeRange.large.min) +
              starSizeRange.large.min) /
            window.devicePixelRatio;
        }
        const brightness =
          Math.random() * (brightnessRange.max - brightnessRange.min) +
          brightnessRange.min;

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

    // 배경 이미지 로딩
    const loadBackgroundImage = (): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        if (!backgroundImageUrl) {
          reject(new Error('No background image URL provided'));
          return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = backgroundImageUrl;
      });
    };

    // 별 그리기 함수
    const drawStars = async (ctx: CanvasRenderingContext2D, stars: Star[]) => {
      // 배경 이미지 그리기
      try {
        const bgImg = await loadBackgroundImage();
        ctx.drawImage(bgImg, 0, 0, ctx.canvas.width, ctx.canvas.height);
      } catch (error) {
        // 이미지 로딩 실패 시 어두운 배경 사용
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }

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
        if (star.size > 1.0) {
          // 큰 별들은 후광 효과 추가
          const glowSize = star.size * 4;
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
    const animate = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 카메라가 오른쪽으로 이동 (속도 조절 가능)
      cameraOffsetRef.current += cameraSpeed;

      // 별들이 화면 너비를 넘어가면 다시 시작 위치로 리셋
      if (cameraOffsetRef.current > canvas.width * 2) {
        cameraOffsetRef.current = 0;
      }

      await drawStars(ctx, starsRef.current);

      // 블랙홀에 캔버스 업데이트 알림
      if (onCanvasUpdate && canvas) {
        onCanvasUpdate(canvas);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // 캔버스 크기 조정
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 스케일링 제거 - 선명한 렌더링을 위해
        ctx.imageSmoothingEnabled = false;
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
      <div className="w-full h-screen overflow-hidden">
        <canvas
          ref={(node) => {
            canvasRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className="w-full h-full"
        />
      </div>
    );
  }
);

export default Galaxy;
