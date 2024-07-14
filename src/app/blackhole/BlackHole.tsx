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
      'https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
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
    uniform float u_clickedTime;

    vec2 rotate(vec2 mt, vec2 st, float angle){
      float cos = cos((angle + u_clickedTime) * PI);
      float sin = sin(angle * 0.0);
      float nx = (cos * (st.x - mt.x)) + (sin * (st.y - mt.y)) + mt.x;
      float ny = (cos * (st.y - mt.y)) - (sin * (st.x - mt.x)) + mt.y;
      return vec2(nx, ny);
    }

    void main() {
      vec2 st = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y)/u_resolution;
      vec2 mt = vec2(u_mouse.x, u_resolution.y - u_mouse.y)/u_resolution;
      float dx = st.x - mt.x;
      float dy = st.y - mt.y;
      float dist = sqrt(dx * dx + dy * dy);
      float pull = u_mass / (dist * dist);
      vec3 color = vec3(0.0);
      vec2 r = rotate(mt,st,pull);
      vec4 imgcolor = texture2D(u_image, r);
      color = vec3(
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

      if (mouse.moved == false) {
        mouse.y =
          -(window.innerHeight / 2) +
          Math.sin(currentTime * 0.7) * (window.innerHeight * 0.25) +
          (canvasRef.current?.height || 0);
        mouse.x =
          window.innerWidth / 2 +
          Math.sin(currentTime * 0.6) * -(window.innerWidth * 0.35);
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

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.pageX;
      mouse.y = -e.pageY + (canvasRef.current?.height || 0);
      mouse.moved = true;
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [windowSize.width, windowSize.height]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default BlackHole;
