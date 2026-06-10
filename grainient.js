// grainient.js — React Bits <Grainient /> 컴포넌트를 바닐라 ES 모듈로 포팅한 버전.
// 원본은 React + ogl 이지만, 이 프로젝트는 빌드 단계가 없는 순수 바닐라이므로
// React(useEffect/useRef)를 걷어내고 동일한 ogl WebGL2 셰이더 로직만 옮겼습니다.
//
// 사용법: <div data-grainient data-grainient-* ...></div> 요소를 두면 자동 마운트.
//   data-grainient-color1 / -color2 / -color3   (#hex, 그라디언트 3색)
//   data-grainient-time-speed / -zoom / -contrast / -saturation / -gamma
//   data-grainient-warp-strength / -warp-frequency / -warp-speed / -warp-amplitude
//   data-grainient-blend-angle / -blend-softness / -rotation-amount / -noise-scale
//   data-grainient-grain-amount / -grain-scale / -grain-animated
//   data-grainient-color-balance / -center-x / -center-y
//
// ogl 은 패키지 매니저가 없으므로 CDN(ESM)에서 직접 가져옵니다.
import { Renderer, Program, Mesh, Triangle } from 'https://esm.sh/ogl@1.0.11';

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));

  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`;

function mountGrainient(container, opts) {
  const o = opts || {};
  const renderer = new Renderer({
    webgl: 2,
    alpha: true,
    antialias: false,
    dpr: Math.min(window.devicePixelRatio || 1, 2)
  });

  const gl = renderer.gl;
  const canvas = gl.canvas;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new Float32Array([1, 1]) },
      uTimeSpeed: { value: o.timeSpeed ?? 0.25 },
      uColorBalance: { value: o.colorBalance ?? 0.0 },
      uWarpStrength: { value: o.warpStrength ?? 1.0 },
      uWarpFrequency: { value: o.warpFrequency ?? 5.0 },
      uWarpSpeed: { value: o.warpSpeed ?? 2.0 },
      uWarpAmplitude: { value: o.warpAmplitude ?? 50.0 },
      uBlendAngle: { value: o.blendAngle ?? 0.0 },
      uBlendSoftness: { value: o.blendSoftness ?? 0.05 },
      uRotationAmount: { value: o.rotationAmount ?? 500.0 },
      uNoiseScale: { value: o.noiseScale ?? 2.0 },
      uGrainAmount: { value: o.grainAmount ?? 0.1 },
      uGrainScale: { value: o.grainScale ?? 2.0 },
      uGrainAnimated: { value: o.grainAnimated ? 1.0 : 0.0 },
      uContrast: { value: o.contrast ?? 1.5 },
      uGamma: { value: o.gamma ?? 1.0 },
      uSaturation: { value: o.saturation ?? 1.0 },
      uCenterOffset: { value: new Float32Array([o.centerX ?? 0.0, o.centerY ?? 0.0]) },
      uZoom: { value: o.zoom ?? 0.9 },
      uColor1: { value: new Float32Array(hexToRgb(o.color1 ?? '#FF9FFC')) },
      uColor2: { value: new Float32Array(hexToRgb(o.color2 ?? '#5227FF')) },
      uColor3: { value: new Float32Array(hexToRgb(o.color3 ?? '#B497CF')) }
    }
  });

  const mesh = new Mesh(gl, { geometry, program });

  const setSize = () => {
    const rect = container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setSize(w, h);
    const res = program.uniforms.iResolution.value;
    res[0] = gl.drawingBufferWidth;
    res[1] = gl.drawingBufferHeight;
    renderer.render({ scene: mesh });
  };

  const ro = new ResizeObserver(setSize);
  ro.observe(container);
  setSize();

  let raf = 0;
  let isVisible = true;
  let isPageVisible = !document.hidden;
  const t0 = performance.now();

  const loop = t => {
    program.uniforms.iTime.value = (t - t0) * 0.001;
    renderer.render({ scene: mesh });
    raf = requestAnimationFrame(loop);
  };
  const tryStart = () => {
    if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
  };
  const tryStop = () => {
    if (raf !== 0) { cancelAnimationFrame(raf); raf = 0; }
  };

  // 화면 밖이면 렌더 정지 — CLAUDE.md의 visGate 성능 게이트와 동일한 취지.
  const io = new IntersectionObserver(
    ([entry]) => { isVisible = entry.isIntersecting; isVisible ? tryStart() : tryStop(); },
    { threshold: 0 }
  );
  io.observe(container);

  const onVisibility = () => {
    isPageVisible = !document.hidden;
    isPageVisible ? tryStart() : tryStop();
  };
  document.addEventListener('visibilitychange', onVisibility);

  tryStart();

  return () => {
    tryStop();
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    try { container.removeChild(canvas); } catch { /* ignore */ }
  };
}

// data-grainient 요소를 찾아 자동 마운트. (app.js 의 init* 모듈 철학과 동일하게 속성 구동)
function num(v, fallback) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function boot() {
  document.querySelectorAll('[data-grainient]').forEach(el => {
    const d = el.dataset;
    mountGrainient(el, {
      color1: d.grainientColor1 || '#FF9FFC',
      color2: d.grainientColor2 || '#5227FF',
      color3: d.grainientColor3 || '#B497CF',
      timeSpeed: num(d.grainientTimeSpeed, 0.25),
      colorBalance: num(d.grainientColorBalance, 0.0),
      warpStrength: num(d.grainientWarpStrength, 1.0),
      warpFrequency: num(d.grainientWarpFrequency, 5.0),
      warpSpeed: num(d.grainientWarpSpeed, 2.0),
      warpAmplitude: num(d.grainientWarpAmplitude, 50.0),
      blendAngle: num(d.grainientBlendAngle, 0.0),
      blendSoftness: num(d.grainientBlendSoftness, 0.05),
      rotationAmount: num(d.grainientRotationAmount, 500.0),
      noiseScale: num(d.grainientNoiseScale, 2.0),
      grainAmount: num(d.grainientGrainAmount, 0.1),
      grainScale: num(d.grainientGrainScale, 2.0),
      grainAnimated: d.grainientGrainAnimated === 'true',
      contrast: num(d.grainientContrast, 1.5),
      gamma: num(d.grainientGamma, 1.0),
      saturation: num(d.grainientSaturation, 1.0),
      centerX: num(d.grainientCenterX, 0.0),
      centerY: num(d.grainientCenterY, 0.0),
      zoom: num(d.grainientZoom, 0.9)
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

export { mountGrainient };
