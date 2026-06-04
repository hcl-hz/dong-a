// Lightfall — React Bits <Lightfall />를 이 사이트(순수 HTML/JS)용 바닐라 JS로 이식.
// 캠퍼스 라이프 섹션 배경에 떨어지는 빛줄기 효과를 깐다(기존 side-rays 대체).
// 캔버스에 mix-blend-mode:screen 을 적용해 밝은 블루 배경 위에 빛만 더해지도록 한다.
import { Renderer, Program, Mesh, Triangle } from 'https://esm.sh/ogl@1.0.10';

const MAX_COLORS = 8;

function hexToRGB(hex) {
  const c = hex.replace('#', '').padEnd(6, '0');
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255
  ];
}

function prepColors(input) {
  const base = (input && input.length ? input : ['#A6C8FF', '#5227FF', '#FF9FFC']).slice(0, MAX_COLORS);
  const count = base.length;
  const arr = [];
  for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]));
  const avg = [0, 0, 0];
  for (let i = 0; i < count; i++) {
    avg[0] += arr[i][0];
    avg[1] += arr[i][1];
    avg[2] += arr[i][2];
  }
  avg[0] /= count;
  avg[1] /= count;
  avg[2] /= count;
  return { arr, count, avg };
}

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision highp float;

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

uniform vec3  uBgColor;
uniform vec3  uMouseColor;
uniform float uSpeed;
uniform int   uStreakCount;
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;
uniform float uTwinkle;
uniform float uZoom;
uniform float uBgGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

vec3 tanhv(vec3 x) {
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 r) {
  vec2 P = (frag + frag - r) / r.x;
  float z = 0.0;
  float d = 1e3;
  vec4 O = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(O * O));
    z += d;
  }
  return vec2(O.x, atan(O.z, O.y));
}

void mainImage(out vec4 o, vec2 C) {
  vec2 r = iResolution.xy;
  vec2 uv0 = (C + C - r) / r.x;
  float T = 0.1 * iTime * uSpeed + 9.0;
  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);

  vec2 c0 = sceneC(C, r);
  vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);
  vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
  vec2 dCx = cdx - c0;
  vec2 dCy = cdy - c0;
  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dCx) + abs(dCy);
  C = c0;

  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mN = (iMouse + iMouse - r) / r.x;
    float md = length(uv0 - mN);
    mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    O.rgb += uMouseColor * mGlow * 0.25;
  }

  float zr = 5e-4 * uStreakWidth;
  vec2 rr = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);

  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float jf = float(m) + 1.0;
    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);
    Pp -= floor(Pp / Y + 0.5) * Y;
    float h = fract(8663.0 * ic);
    vec3 col = palette(h);
    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);
    weight *= (1.0 + mGlow * 2.0);
    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
    C.x += Y.x / 8.0;
  }

  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  // 빛이 없는 곳은 투명하게 (밝기 기준 알파) → 배경 그라데이션이 그대로 보이고 빛줄기만 얹힘
  float a = max(colr.r, max(colr.g, colr.b)) * uOpacity;
  o = vec4(colr, a);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`;

function createLightfall(container, options = {}) {
  const {
    colors = ['#BAE6FD', '#A6C8FF', '#FFFFFF'],
    backgroundColor = '#006EE9',
    speed = 0.8,
    streakCount = 6,
    streakWidth = 1,
    streakLength = 1,
    glow = 1,
    density = 1,
    twinkle = 1,
    zoom = 2.5,
    backgroundGlow = 0.6,
    opacity = 1,
    mouseInteraction = true,
    mouseStrength = 0.6,
    mouseRadius = 0.8,
    mouseDampening = 0.15,
    mixBlendMode,
    dpr
  } = options;

  const getDpr = () => dpr ?? Math.min(window.devicePixelRatio || 1, 2);

  const renderer = new Renderer({ dpr: getDpr(), alpha: true, antialias: true });
  const gl = renderer.gl;
  const canvas = gl.canvas;
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  if (mixBlendMode) canvas.style.mixBlendMode = mixBlendMode;
  container.appendChild(canvas);

  const { arr, count, avg } = prepColors(colors);

  const uniforms = {
    iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
    iMouse:      { value: [0, 0] },
    iTime:       { value: 0 },
    uColor0:     { value: arr[0] },
    uColor1:     { value: arr[1] },
    uColor2:     { value: arr[2] },
    uColor3:     { value: arr[3] },
    uColor4:     { value: arr[4] },
    uColor5:     { value: arr[5] },
    uColor6:     { value: arr[6] },
    uColor7:     { value: arr[7] },
    uColorCount: { value: count },
    uBgColor:    { value: hexToRGB(backgroundColor) },
    uMouseColor: { value: avg },
    uSpeed:      { value: speed },
    uStreakCount:{ value: Math.max(1, Math.min(16, Math.round(streakCount))) },
    uStreakWidth:{ value: streakWidth },
    uStreakLength:{ value: streakLength },
    uGlow:       { value: glow },
    uDensity:    { value: density },
    uTwinkle:    { value: twinkle },
    uZoom:       { value: zoom },
    uBgGlow:     { value: backgroundGlow },
    uOpacity:    { value: opacity },
    uMouseEnabled:{ value: mouseInteraction ? 1 : 0 },
    uMouseStrength:{ value: mouseStrength },
    uMouseRadius:{ value: mouseRadius }
  };

  const program = new Program(gl, { vertex, fragment, uniforms });
  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  let rafId = null;
  let mouseTarget = [0, 0];
  let lastTime = 0;

  function resize() {
    renderer.dpr = getDpr();
    const rect = container.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
  }
  resize();
  window.addEventListener('resize', resize);

  // 컨테이너가 pointer-events:none 이라 window에서 좌표를 받아 캔버스 기준으로 변환
  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const scale = renderer.dpr || 1;
    const x = (e.clientX - rect.left) * scale;
    const y = (rect.height - (e.clientY - rect.top)) * scale;
    mouseTarget = [x, y];
    if (mouseDampening <= 0) uniforms.iMouse.value = [x, y];
  }
  if (mouseInteraction) window.addEventListener('pointermove', onPointerMove);

  function loop(t) {
    rafId = requestAnimationFrame(loop);
    uniforms.iTime.value = t * 0.001;
    if (mouseDampening > 0) {
      if (!lastTime) lastTime = t;
      const dt = (t - lastTime) / 1000;
      lastTime = t;
      const tau = Math.max(1e-4, mouseDampening);
      let factor = 1 - Math.exp(-dt / tau);
      if (factor > 1) factor = 1;
      const cur = uniforms.iMouse.value;
      cur[0] += (mouseTarget[0] - cur[0]) * factor;
      cur[1] += (mouseTarget[1] - cur[1]) * factor;
    } else {
      lastTime = t;
    }
    renderer.render({ scene: mesh });
  }
  rafId = requestAnimationFrame(loop);

  return {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      if (mouseInteraction) window.removeEventListener('pointermove', onPointerMove);
      try {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      } catch (e) {}
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };
}

function init() {
  const container = document.getElementById('side-rays');
  if (!container) return;
  createLightfall(container, {
    colors: ['#BAE6FD', '#A6C8FF', '#FFFFFF'],
    backgroundColor: '#006EE9',
    speed: 0.7,
    streakCount: 2,   // 줄기 개수 조금 늘림 (1 → 2)
    density: 0.4,     // 세로 밀도 조금 늘림 (0.25 → 0.4)
    glow: 0.4,        // 선명도/밝기 더 낮춤 (0.6 → 0.4)
    twinkle: 1,
    zoom: 2.5,
    backgroundGlow: 0,   // 중앙 위쪽 원형 글로우 제거
    opacity: 0.6,     // 전체 투명도 더 낮춰 은은하게 (0.8 → 0.6)
    mouseInteraction: false   // 커서 주변 원형 빛 제거
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
