import { useEffect, useRef } from 'react';
import {
  createShader,
  createProgram,
  createQuadBuffer,
  createTextureCoordsBuffer,
  createTexture,
} from '../utils/webglUtils';
import {
  vertexShaderSource,
  fragmentShaderSource,
} from '../shaders/blackholeShaders';

interface WindowSize {
  width: number;
  height: number;
}

interface MousePosition {
  x: number;
  y: number;
  moved: boolean;
}

interface BlackHoleConfig {
  mass: number;
  currentMass: number;
  startTime: number;
  currentTime: number;
}

/**
 * 블랙홀 효과를 위한 커스텀 훅
 * @param {Object} windowSize - 윈도우 크기 정보
 * @param {number} windowSize.width - 윈도우 너비
 * @param {number} windowSize.height - 윈도우 높이
 * @returns {Object} 캔버스 참조 객체
 */
export const useBlackHole = (windowSize: WindowSize) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInitializedRef = useRef(false);

  // 전역 상태를 위한 ref들
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0, moved: false });
  const targetMouseRef = useRef<MousePosition>({ x: 0, y: 0, moved: false });
  const configRef = useRef<BlackHoleConfig>({
    mass: 1500,
    currentMass: 0,
    startTime: new Date().getTime(),
    currentTime: 0,
  });

  // WebGL 초기화
  useEffect(() => {
    const bgUrl =
      'https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?q=80&w=2708&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

    /**
     * WebGL 컨텍스트와 프로그램 초기화
     * @param {HTMLImageElement} image - 텍스처로 사용할 이미지
     */
    const initWebGL = (image: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl = (canvas.getContext('webgl') ||
        canvas.getContext(
          'experimental-webgl'
        )) as WebGLRenderingContext | null;
      if (!gl) return;

      glRef.current = gl;
      canvas.width = windowSize.width;
      canvas.height = windowSize.height;

      mouseRef.current = {
        x: window.innerWidth / 2,
        y: -(window.innerHeight / 2) + canvas.height,
        moved: false,
      };

      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

      const vertexShader = createShader(
        gl,
        gl.VERTEX_SHADER,
        vertexShaderSource
      );
      const fragmentShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
      );
      if (!vertexShader || !fragmentShader) return;

      const program = createProgram(gl, vertexShader, fragmentShader);
      if (!program) return;

      programRef.current = program;
      gl.useProgram(program);

      // 이미지 해상도 설정
      const imageResolutionLocation = gl.getUniformLocation(
        program,
        'u_imageResolution'
      );
      gl.uniform2f(imageResolutionLocation, image.width, image.height);

      // 버텍스 버퍼 설정
      const positionBuffer = createQuadBuffer(gl);
      if (!positionBuffer) return;

      const positionLocation = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // 텍스처 좌표 버퍼 설정
      const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
      const texCoordBuffer = createTextureCoordsBuffer(gl);
      if (!texCoordBuffer) return;

      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      // 텍스처 생성
      const texture = createTexture(gl, image);
      if (!texture) return;

      isInitializedRef.current = true;
      render();
    };

    /**
     * 마우스 위치 업데이트
     * 자동 애니메이션 또는 사용자 클릭에 따른 위치 변경
     */
    const updateMousePosition = () => {
      const now = new Date().getTime();
      configRef.current.currentTime =
        (now - configRef.current.startTime) / 1000;

      // 블랙홀 질량 점진적 증가
      if (configRef.current.currentMass < configRef.current.mass - 50) {
        configRef.current.currentMass +=
          (configRef.current.mass - configRef.current.currentMass) * 0.03;
      }

      if (!mouseRef.current.moved) {
        // 자동 애니메이션 모드
        mouseRef.current.y =
          -(window.innerHeight / 2) +
          Math.sin(configRef.current.currentTime * 0.7) *
            (window.innerHeight * 0.25) +
          (canvasRef.current?.height || 0);
        mouseRef.current.x =
          window.innerWidth / 2 +
          Math.sin(configRef.current.currentTime * 0.6) *
            -(window.innerWidth * 0.35);
      } else {
        // 사용자 클릭 모드 - 부드러운 이동
        mouseRef.current.x +=
          (targetMouseRef.current.x - mouseRef.current.x) * 0.1;
        mouseRef.current.y +=
          (targetMouseRef.current.y - mouseRef.current.y) * 0.1;
      }
    };

    /**
     * WebGL 유니폼 변수들 업데이트
     */
    const updateUniforms = () => {
      if (!glRef.current || !programRef.current) return;

      glRef.current.uniform1f(
        glRef.current.getUniformLocation(programRef.current, 'u_mass'),
        configRef.current.currentMass * 0.00001
      );
      glRef.current.uniform2f(
        glRef.current.getUniformLocation(programRef.current, 'u_mouse'),
        mouseRef.current.x,
        mouseRef.current.y
      );
      glRef.current.uniform1f(
        glRef.current.getUniformLocation(programRef.current, 'u_time'),
        configRef.current.currentTime
      );
      glRef.current.uniform2f(
        glRef.current.getUniformLocation(programRef.current, 'u_resolution'),
        canvasRef.current?.width || 0,
        canvasRef.current?.height || 0
      );
    };

    /**
     * 렌더링 루프
     * 매 프레임마다 실행되는 함수
     */
    const render = () => {
      if (!glRef.current || !programRef.current) return;

      updateMousePosition();
      updateUniforms();
      glRef.current.drawArrays(glRef.current.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };

    // 이미지 로드 및 초기화
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = bgUrl;
    image.onload = () => initWebGL(image);
  }, [windowSize.width, windowSize.height]);

  // 클릭 이벤트 처리
  useEffect(() => {
    /**
     * 마우스 클릭 이벤트 핸들러
     * @param {MouseEvent} e - 마우스 이벤트 객체
     */
    const handleMouseClick = (e: MouseEvent) => {
      // 초기화되지 않았거나 캔버스가 없으면 무시
      if (!isInitializedRef.current || !canvasRef.current) return;

      // 캔버스 영역 내에서만 클릭 처리
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 캔버스 영역을 벗어나면 무시
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

      // 목표 마우스 위치 설정
      targetMouseRef.current.x = e.pageX;
      targetMouseRef.current.y = -e.pageY + canvas.height;
      mouseRef.current.moved = true;
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleMouseClick);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('click', handleMouseClick);
      }
    };
  }, []);

  return { canvasRef };
};
