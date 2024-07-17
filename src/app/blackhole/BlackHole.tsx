'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './blackhole.module.css';

const BlackHole: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>(() => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return { width: 0, height: 0 };
  });

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

  useEffect(() => {
    const bgUrl =
      'https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?q=80&w=2708&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    let blackholeMass = 1500;
    let curblackholeMass = 0;
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let mouse = { x: 0, y: 0, moved: false };
    let startTime = new Date().getTime();
    let currentTime = 0;

    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texCoord = a_texCoord;
      }
    `;

    const fragmentShaderSource = `
    precision mediump float;
#define PI 3.14159265359
uniform sampler2D u_image;
varying vec2 v_texCoord;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_mass;
uniform float u_time;
uniform vec2 u_imageResolution;

vec2 rotate(vec2 mt, vec2 st, float angle){
  float cos = cos(angle * PI);
  float sin = sin(angle * 0.5);
  float nx = (cos * (st.x - mt.x)) + (sin * (st.y - mt.y)) + mt.x;
  float ny = (cos * (st.y - mt.y)) - (sin * (st.x - mt.x)) + mt.y;
  return vec2(nx, ny);
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution;
  vec2 mt = u_mouse/u_resolution;
  
  float screenAspect = u_resolution.x / u_resolution.y;
  float imageAspect = u_imageResolution.x / u_imageResolution.y;
  
  // 이미지 UV 계산
  vec2 uv = st;
  if (screenAspect > imageAspect) {
    float scale = screenAspect / imageAspect;
    uv.x = (uv.x - 0.5) * scale + 0.5;
  } else {
    float scale = imageAspect / screenAspect;
    uv.y = (uv.y - 0.5) * scale + 0.5;
  }
  
  // 마우스 UV 계산 (이미지 기준)
  vec2 mouseUv = mt;
  if (screenAspect > imageAspect) {
    float scale = screenAspect / imageAspect;
    mouseUv.x = (mouseUv.x - 0.5) * scale + 0.5;
  } else {
    float scale = imageAspect / screenAspect;
    mouseUv.y = (mouseUv.y - 0.5) * scale + 0.5;
  }

  // 블랙홀 효과를 위한 거리 계산 (화면 비율 고려)
  float dx = (uv.x - mouseUv.x) * screenAspect;
  float dy = uv.y - mouseUv.y;
  float dist = sqrt(dx * dx + dy * dy);
  float pull = u_mass / (dist * dist);
  
  // 회전 적용 (이미지 UV 기준)
  vec2 r = rotate(mouseUv, uv, pull);
  
  r += vec2(u_time * 0.05);
  
  r = fract(r);
  
  vec4 imgcolor = texture2D(u_image, r);
  vec3 color = vec3(
    (imgcolor.x - (pull * 0.25)),
    (imgcolor.y - (pull * 0.25)), 
    (imgcolor.z - (pull * 0.25))
  );
  gl_FragColor = vec4(color,1.);
}
    `;

    function createShader(
      gl: WebGLRenderingContext,
      type: number,
      source: string
    ): WebGLShader | null {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    function createProgram(
      gl: WebGLRenderingContext,
      vertexShader: WebGLShader,
      fragmentShader: WebGLShader
    ): WebGLProgram | null {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      return program;
    }

    function init(image: HTMLImageElement) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      gl =
        canvas.getContext('webgl') ||
        (canvas.getContext(
          'experimental-webgl'
        ) as WebGLRenderingContext | null);
      if (!gl) return;

      canvas.width = windowSize.width;
      canvas.height = windowSize.height;

      mouse = {
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

      program = createProgram(gl, vertexShader, fragmentShader);
      if (!program) return;

      gl.useProgram(program);

      const imageResolutionLocation = gl.getUniformLocation(
        program,
        'u_imageResolution'
      );
      gl.uniform2f(imageResolutionLocation, image.width, image.height);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        ]),
        gl.STATIC_DRAW
      );

      const positionLocation = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
      const texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
        ]),
        gl.STATIC_DRAW
      );
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );

      render();
    }

    function render() {
      if (!gl || !program) return;

      const now = new Date().getTime();
      currentTime = (now - startTime) / 1000;

      if (curblackholeMass < blackholeMass - 50) {
        curblackholeMass += (blackholeMass - curblackholeMass) * 0.03;
      }

      // 마우스가 움직이지 않은 경우에는 원래의 애니메이션을 유지합니다.
      if (!mouse.moved) {
        mouse.y =
          -(window.innerHeight / 2) +
          Math.sin(currentTime * 0.7) * (window.innerHeight * 0.25) +
          (canvasRef.current?.height || 0);
        mouse.x =
          window.innerWidth / 2 +
          Math.sin(currentTime * 0.6) * -(window.innerWidth * 0.35);
      } else {
        // 목표 위치로 부드럽게 이동합니다.
        mouse.x += (targetMouse.x - mouse.x) * 0.1;
        mouse.y += (targetMouse.y - mouse.y) * 0.1;
      }

      gl.uniform1f(
        gl.getUniformLocation(program, 'u_mass'),
        curblackholeMass * 0.00001
      );
      gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), mouse.x, mouse.y);
      gl.uniform1f(gl.getUniformLocation(program, 'u_time'), currentTime);
      gl.uniform2f(
        gl.getUniformLocation(program, 'u_resolution'),
        canvasRef.current?.width || 0,
        canvasRef.current?.height || 0
      );

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestAnimationFrame(render);
    }
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = bgUrl;
    image.onload = () => init(image);

    let targetMouse = { x: mouse.x, y: mouse.y };

    const handleMouseClick = (e: MouseEvent) => {
      targetMouse.x = e.pageX;
      targetMouse.y = -e.pageY + (canvasRef.current?.height || 0);
      mouse.moved = true;
    };

    document.addEventListener('click', handleMouseClick);

    return () => {
      document.removeEventListener('click', handleMouseClick);
    };
  }, [windowSize.width, windowSize.height]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default BlackHole;
