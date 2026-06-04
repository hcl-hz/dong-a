import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'https://esm.sh/ogl@1.0.10';

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function getFontSize(font) {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(gl, text, font = 'bold 30px monospace', color = 'black') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(getFontSize(font) * 1.2);
  // 외곽선/그림자가 잘리지 않도록 여백 확보
  const pad = 16;
  canvas.width = textWidth + pad * 2;
  canvas.height = textHeight + pad * 2;
  context.font = font;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  // 그림자/외곽선 없이 글자만
  context.fillStyle = color;
  context.fillText(text, cx, cy);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
      // 이미지 평면에 가려지지 않도록 깊이 테스트/기록 끔 (그리는 순서로만 위/아래 결정)
      depthTest: false,
      depthWrite: false
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeight = this.plane.scale.y * 0.10;
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    // 하단 오버레이 영역에 배치
    const bottomInset = this.plane.scale.y * 0.06;
    this.mesh.position.y = -this.plane.scale.y * 0.5 + textHeight * 0.5 + bottomInset;
    // 왼쪽 정렬: 텍스트 왼쪽 가장자리를 카드 왼쪽 안쪽 여백에 맞춤
    const leftPad = this.plane.scale.x * 0.08;
    this.mesh.position.x = -this.plane.scale.x * 0.5 + leftPad + textWidth * 0.5;
    // 카메라 쪽으로 살짝 당기고 렌더 순서를 올려 이미지 위에 그려지도록 함
    this.mesh.position.z = 0.1;
    this.mesh.renderOrder = 10;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.hoverFactor = 0;
    this.baseScaleX = 0;
    this.baseScaleY = 0;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        uniform float uFade;        // 이미지 투명도 (0=불투명, 1=완전투명)
        uniform float uBar;         // 하단 흰색 바 강도 (중앙 카드=1)
        varying vec2 vUv;
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          // 이미지를 감싸는 흰색 테두리 — 중앙 카드에서만 (uBar). 하단은 두껍게(텍스트 영역).
          float bw = 0.06;   // 좌·우·상단 테두리 두께
          float frame = smoothstep(0.20, 0.195, vUv.y);                       // 하단(두꺼움)
          frame = max(frame, smoothstep(bw, bw - 0.005, vUv.x));              // 좌
          frame = max(frame, smoothstep(1.0 - bw, 1.0 - bw + 0.005, vUv.x));  // 우
          frame = max(frame, smoothstep(1.0 - bw, 1.0 - bw + 0.005, vUv.y));  // 상단
          color.rgb = mix(color.rgb, vec3(1.0), frame * uBar * 0.95);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          alpha *= (1.0 - uFade);   // 중앙 외에는 사진을 투명하게
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
        uFade: { value: 0.05 },   // 이미지 투명도 (0=완전 진함, 1=완전 투명)
        uBar: { value: 0 }        // 하단 흰색 바 (중앙 카드만)
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }
  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }
  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    });
  }
  update(scroll, direction, mouseWorldX = 0, mouseInside = false) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;
    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }
    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    // Hover scale: lerp toward 1.0 (idle) or hoverScale (hovered)
    const halfWidth = this.baseScaleX / 2;
    const isHovered = mouseInside && Math.abs(this.plane.position.x - mouseWorldX) < halfWidth;
    const target = isHovered ? 1 : 0;
    this.hoverFactor += (target - this.hoverFactor) * 0.12;
    // 중앙(x=0)에 가까울수록 1.0, 가장자리로 갈수록 0
    const centerT = Math.max(0, 1 - Math.abs(x) / (this.viewport.width / 2));
    // 크기: 중앙 1.35배, 가장자리 0.85배
    const sizeFactor = 0.85 + centerT * 0.5;
    const boost = (1 + this.hoverFactor * 0.08) * sizeFactor;
    this.plane.scale.x = this.baseScaleX * boost;
    this.plane.scale.y = this.baseScaleY * boost;
    // 커질 때 하단을 고정하고 위로 자라게 (커진 만큼 위로 올림)
    this.plane.position.y += (this.baseScaleY * (boost - 1)) / 2;
    // 투명도: 중앙 카드는 0(완전 불투명), 가장자리로 갈수록 최대 0.5까지 투명
    this.program.uniforms.uFade.value = (1 - centerT) * 0.5;
    // 하단 흰색 바: 중앙 카드에서만 진하게
    this.program.uniforms.uBar.value = Math.pow(centerT, 2);


    const planeOffset = this.baseScaleX / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }
  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500;
    this.baseScaleY = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.baseScaleX = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.plane.scale.y = this.baseScaleY;
    this.plane.scale.x = this.baseScaleX;
    this.plane.program.uniforms.uPlaneSizes.value = [this.baseScaleX, this.baseScaleY];
    this.padding = 3.4;   // 카드 사이 간격
    this.width = this.baseScaleX + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  constructor(container, opts = {}) {
    const {
      items,
      bend = 3,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px sans-serif',
      scrollSpeed = 2,
      scrollEase = 0.05,
      autoSpeed = 0.016   // 자동 흐름 속도(드래그 중엔 멈춤). 0이면 정지.
    } = opts;
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.autoSpeed = autoSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0, position: 0 };
    this.mouseWorldX = 0;
    this.mouseInside = false;
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
  }
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
    this.scene.position.y = -2;   // 갤러리를 아래로 (양수=위, 음수=아래)
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
  }
  createMedias(items, bend, textColor, borderRadius, font) {
    const list = items && items.length ? items : [];
    this.mediasImages = list.concat(list);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font
      });
    });
  }
  onTouchDown(e) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
  }
  onTouchMove(e) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  }
  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }
  onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY || e.wheelDelta || e.detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }
  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }
  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(m => m.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }
  update() {
    if (!this.isDown) this.scroll.target += this.autoSpeed;   // 자동 흐름
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach(m => m.update(this.scroll, direction, this.mouseWorldX, this.mouseInside));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    this.mouseWorldX = (mouseX / rect.width - 0.5) * this.viewport.width;
    this.mouseInside = true;
  }
  onMouseLeave() {
    this.mouseInside = false;
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnMouseLeave = this.onMouseLeave.bind(this);

    window.addEventListener('resize', this.boundOnResize);

    // (휠 제거 — 풀페이지 섹션 이동과 충돌 방지. 자동 흐름 + 드래그로 탐색)

    // Mouse position tracking for hover
    this.container.addEventListener('mousemove', this.boundOnMouseMove);
    this.container.addEventListener('mouseleave', this.boundOnMouseLeave);

    // Drag scoped to container; move/up on window so drag works outside container
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);

    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true });
    this.container.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
    this.container.addEventListener('touchend', this.boundOnTouchUp);
  }
  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    this.container.removeEventListener('wheel', this.boundOnWheel);
    this.container.removeEventListener('mousemove', this.boundOnMouseMove);
    this.container.removeEventListener('mouseleave', this.boundOnMouseLeave);
    this.container.removeEventListener('mousedown', this.boundOnTouchDown);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    this.container.removeEventListener('touchstart', this.boundOnTouchDown);
    this.container.removeEventListener('touchmove', this.boundOnTouchMove);
    this.container.removeEventListener('touchend', this.boundOnTouchUp);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

// ── INIT ──
const items = [
  { image: 'assets/images/img.jpg',  text: '푸른 자연 속 캠퍼스' },
  { image: 'assets/images/img2.jpg', text: '언제나 열린 학습 공간' },
  { image: 'assets/images/img3.jpg', text: '활기찬 동아리 활동' },
  { image: 'assets/images/img4.jpg', text: '첨단 연구 인프라' },
  { image: 'assets/images/img5.jpg', text: '건강한 캠퍼스 라이프' }
];

function init() {
  const container = document.getElementById('circular-gallery');
  if (!container) return;

  const font = '15px "Noto Sans KR"';

  const start = () => {
    new App(container, {
      items,
      bend: 1.4,   // 곡률 (작을수록 평평, 0이면 일자)
      textColor: '#ffffff',
      borderRadius: 0.05,
      font,
      scrollSpeed: 2,
      scrollEase: 0.05
    });
  };

  if (document.fonts && document.fonts.load) {
    document.fonts.load(font).then(start).catch(start);
  } else {
    start();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
