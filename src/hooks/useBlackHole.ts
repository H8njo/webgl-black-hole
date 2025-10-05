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
export const useBlackHole = (
  windowSize: WindowSize,
  backgroundCanvas?: HTMLCanvasElement | null,
  cameraOffset?: number,
  cameraSpeed: number = 0
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInitializedRef = useRef(false);

  // 전역 상태를 위한 ref들
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
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
    /**
     * WebGL 컨텍스트와 프로그램 초기화
     */
    const initWebGL = (bgCanvas: HTMLCanvasElement) => {
      // Galaxy 캔버스가 아직 준비되지 않았으면 대기
      if (!bgCanvas || bgCanvas.width === 0 || bgCanvas.height === 0) {
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl = (canvas.getContext('webgl') ||
        canvas.getContext(
          'experimental-webgl'
        )) as WebGLRenderingContext | null;
      if (!gl) return;

      glRef.current = gl;

      // Galaxy와 동일한 해상도로 설정 (devicePixelRatio 제거)
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      mouseRef.current = {
        x: window.innerWidth / 2,
        y: -(window.innerHeight / 2) + canvas.height,
        moved: false,
      };

      gl.viewport(0, 0, canvas.width, canvas.height);

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
      gl.uniform2f(imageResolutionLocation, bgCanvas.width, bgCanvas.height);

      // 카메라 오프셋 유니폼 설정
      const cameraOffsetLocation = gl.getUniformLocation(
        program,
        'u_cameraOffset'
      );
      gl.uniform1f(cameraOffsetLocation, cameraOffset || 0);

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

      // Galaxy 캔버스를 텍스처로 사용
      const texture = createTexture(gl, bgCanvas);
      if (!texture) return;

      textureRef.current = texture;

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
          (targetMouseRef.current.x - mouseRef.current.x) * 0.02;
        mouseRef.current.y +=
          (targetMouseRef.current.y - mouseRef.current.y) * 0.02;
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
      // 논리적 해상도 전달 (Galaxy와 동일)
      const rect = canvasRef.current?.getBoundingClientRect();
      glRef.current.uniform2f(
        glRef.current.getUniformLocation(programRef.current, 'u_resolution'),
        rect?.width || 0,
        rect?.height || 0
      );
      glRef.current.uniform1f(
        glRef.current.getUniformLocation(programRef.current, 'u_cameraOffset'),
        cameraOffset || 0
      );
      glRef.current.uniform1f(
        glRef.current.getUniformLocation(programRef.current, 'u_cameraSpeed'),
        cameraSpeed
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

    // WebGL 초기화 (Galaxy 캔버스 사용)
    if (backgroundCanvas) {
      initWebGL(backgroundCanvas);
    }
  }, [windowSize.width, windowSize.height]);

  // backgroundCanvas 변경 시 텍스처 업데이트
  useEffect(() => {
    if (
      !glRef.current ||
      !programRef.current ||
      !textureRef.current ||
      !backgroundCanvas
    ) {
      return;
    }

    const gl = glRef.current;
    const texture = textureRef.current;

    // 기존 텍스처 업데이트
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      backgroundCanvas
    );

    // 이미지 해상도 업데이트
    const imageResolutionLocation = gl.getUniformLocation(
      programRef.current,
      'u_imageResolution'
    );
    if (imageResolutionLocation) {
      gl.uniform2f(
        imageResolutionLocation,
        backgroundCanvas.width,
        backgroundCanvas.height
      );
    }
  }, [backgroundCanvas]);

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
