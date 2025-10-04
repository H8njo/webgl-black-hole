/**
 * WebGL 쉐이더를 생성합니다
 * @param {WebGLRenderingContext} gl - WebGL 컨텍스트
 * @param {number} type - 쉐이더 타입 (VERTEX_SHADER 또는 FRAGMENT_SHADER)
 * @param {string} source - 쉐이더 소스 코드
 * @returns {WebGLShader | null} 생성된 쉐이더 또는 null
 */
export const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  return shader;
};

/**
 * WebGL 프로그램을 생성합니다
 * @param {WebGLRenderingContext} gl - WebGL 컨텍스트
 * @param {WebGLShader} vertexShader - 버텍스 쉐이더
 * @param {WebGLShader} fragmentShader - 프래그먼트 쉐이더
 * @returns {WebGLProgram | null} 생성된 프로그램 또는 null
 */
export const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null => {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  return program;
};

/**
 * 사각형을 그리기 위한 버텍스 버퍼를 생성합니다
 * @param {WebGLRenderingContext} gl - WebGL 컨텍스트
 * @returns {WebGLBuffer | null} 생성된 버퍼 또는 null
 */
export const createQuadBuffer = (
  gl: WebGLRenderingContext
): WebGLBuffer | null => {
  const buffer = gl.createBuffer();
  if (!buffer) return null;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    ]),
    gl.STATIC_DRAW
  );

  return buffer;
};

/**
 * 텍스처 좌표를 위한 버퍼를 생성합니다
 * @param {WebGLRenderingContext} gl - WebGL 컨텍스트
 * @returns {WebGLBuffer | null} 생성된 버퍼 또는 null
 */
export const createTextureCoordsBuffer = (
  gl: WebGLRenderingContext
): WebGLBuffer | null => {
  const buffer = gl.createBuffer();
  if (!buffer) return null;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
    ]),
    gl.STATIC_DRAW
  );

  return buffer;
};

/**
 * 이미지로부터 WebGL 텍스처를 생성합니다
 * @param {WebGLRenderingContext} gl - WebGL 컨텍스트
 * @param {HTMLImageElement} image - 텍스처로 사용할 이미지
 * @returns {WebGLTexture | null} 생성된 텍스처 또는 null
 */
export const createTexture = (
  gl: WebGLRenderingContext,
  image: HTMLImageElement
): WebGLTexture | null => {
  const texture = gl.createTexture();
  if (!texture) return null;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  return texture;
};
