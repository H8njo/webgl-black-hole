/**
 * 버텍스 쉐이더 소스 코드
 * 화면 전체를 덮는 사각형을 그리는 기본 쉐이더
 */
export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

/**
 * 프래그먼트 쉐이더 소스 코드
 * 블랙홀 중력 효과를 구현하는 쉐이더
 */
export const fragmentShaderSource = `
  precision mediump float;
  #define PI 3.14159265359
  
  // 유니폼 변수들
  uniform sampler2D u_image;
  varying vec2 v_texCoord;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_mass;
  uniform float u_time;
  uniform vec2 u_imageResolution;
  uniform float u_cameraOffset;

  /**
   * 2D 회전 변환 함수
   * @param {vec2} mt - 회전 중심점
   * @param {vec2} st - 회전할 점
   * @param {float} angle - 회전 각도
   * @returns {vec2} 회전된 점
   */
  vec2 rotate(vec2 mt, vec2 st, float angle) {
    float cos = cos(angle * PI);
    float sin = sin(angle * 0.5);
    float nx = (cos * (st.x - mt.x)) + (sin * (st.y - mt.y)) + mt.x;
    float ny = (cos * (st.y - mt.y)) - (sin * (st.x - mt.x)) + mt.y;
    return vec2(nx, ny);
  }

  void main() {
    // 화면 좌표를 정규화
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec2 mt = u_mouse / u_resolution;
    
    // 화면과 이미지의 종횡비 계산
    float screenAspect = u_resolution.x / u_resolution.y;
    float imageAspect = u_imageResolution.x / u_imageResolution.y;
    
    // 이미지 UV 좌표 계산 (종횡비 보정)
    vec2 uv = st;
    if (screenAspect > imageAspect) {
      float scale = screenAspect / imageAspect;
      uv.x = (uv.x - 0.5) * scale + 0.5;
    } else {
      float scale = imageAspect / screenAspect;
      uv.y = (uv.y - 0.5) * scale + 0.5;
    }
    
    // 마우스 UV 좌표 계산 (이미지 기준)
    vec2 mouseUv = mt;
    if (screenAspect > imageAspect) {
      float scale = screenAspect / imageAspect;
      mouseUv.x = (mouseUv.x - 0.5) * scale + 0.5;
    } else {
      float scale = imageAspect / screenAspect;
      mouseUv.y = (mouseUv.y - 0.5) * scale + 0.5;
    }

    // 블랙홀 중력 효과를 위한 거리 계산
    float dx = (uv.x - mouseUv.x) * screenAspect;
    float dy = uv.y - mouseUv.y;
    float dist = sqrt(dx * dx + dy * dy);
    float pull = u_mass / (dist * dist + 0.001);
    
    // 회전 효과 적용
    vec2 r = rotate(mouseUv, uv, pull);
    
    // 카메라 오프셋과 시간에 따른 애니메이션 효과
    r += vec2((u_cameraOffset / u_resolution.x) + (u_time * 0.05), 0);
    
    // 텍스처 좌표를 0-1 범위로 제한
    r = fract(r);
    
    // 텍스처에서 색상 샘플링
    vec4 imgcolor = texture2D(u_image, r);
    
      // 블랙홀 효과에 따른 색상 조정
    vec3 color = vec3(
      (imgcolor.x - (pull * 0.25)),
      (imgcolor.y - (pull * 0.25)), 
      (imgcolor.z - (pull * 0.25))
    );
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
