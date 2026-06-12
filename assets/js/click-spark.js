// ClickSpark — 클릭 시 마우스 포인터 위치에 스파크가 퍼지는 효과.
// React Bits의 <ClickSpark /> 컴포넌트를 이 사이트(순수 HTML/JS)용 바닐라 JS로 이식.
// 화면 전체를 덮는 고정 캔버스를 깔고(pointer-events:none) 클릭 위치에 스파크를 그린다.
(function () {
  const opts = {
    sparkColor: '#ffffff', // 기본(어두운/파란 배경)
    sparkColorLight: '#006EE9', // 아이보리 배경에서 쓸 메인 블루
    sparkSize: 18,         // 각 스파크 선의 초기 길이
    sparkRadius: 26,       // 클릭 중심에서 퍼지는 거리
    sparkCount: 8,         // 클릭당 스파크 개수
    duration: 500,         // 애니메이션 길이(ms)
    easing: 'ease-out',    // linear | ease-in | ease-in-out | ease-out
    extraScale: 1.0,       // 퍼지는 거리 배수
    lineWidth: 2
  };

  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  const ctx = canvas.getContext('2d');

  let sparks = [];
  let rafId = null;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    // 좌표를 CSS 픽셀 기준으로 그릴 수 있게 변환 설정 (clientX/Y와 일치)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function easeFunc(t) {
    switch (opts.easing) {
      case 'linear':
        return t;
      case 'ease-in':
        return t * t;
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default: // ease-out
        return t * (2 - t);
    }
  }

  function draw(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sparks = sparks.filter(spark => {
      const elapsed = timestamp - spark.startTime;
      if (elapsed >= opts.duration) return false;

      const progress = elapsed / opts.duration;
      const eased = easeFunc(progress);

      const distance = eased * opts.sparkRadius * opts.extraScale;
      const lineLength = opts.sparkSize * (1 - eased);

      const x1 = spark.x + distance * Math.cos(spark.angle);
      const y1 = spark.y + distance * Math.sin(spark.angle);
      const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
      const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

      ctx.strokeStyle = spark.color || opts.sparkColor;
      ctx.lineWidth = opts.lineWidth;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      return true;
    });

    rafId = requestAnimationFrame(draw);
  }

  // 아이보리(밝은) 배경 섹션 — 여기선 스파크를 메인 블루로
  const LIGHT_SECTIONS = ['about', 'stats', 'news'];

  function sparkColorAt(x, y) {
    // 페이지별 전역 오버라이드 (예: window.__clickSparkColor = '#ffc24b')
    if (typeof window !== 'undefined' && window.__clickSparkColor) return window.__clickSparkColor;
    const el = document.elementFromPoint(x, y);
    if (!el) return opts.sparkColor;
    const sec = el.closest('section[id], footer');
    if (!sec) return opts.sparkColor;
    if (sec.tagName === 'FOOTER') return opts.sparkColorLight; // 푸터(아이보리)
    return LIGHT_SECTIONS.includes(sec.id) ? opts.sparkColorLight : opts.sparkColor;
  }

  function onClick(e) {
    // 캔버스가 뷰포트에 고정돼 있으므로 clientX/Y를 그대로 사용
    const x = e.clientX;
    const y = e.clientY;
    const color = sparkColorAt(x, y); // 클릭 지점 배경에 맞는 색
    const now = performance.now();
    for (let i = 0; i < opts.sparkCount; i++) {
      sparks.push({
        x,
        y,
        angle: (2 * Math.PI * i) / opts.sparkCount,
        startTime: now,
        color
      });
    }
  }

  function init() {
    document.body.appendChild(canvas);
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('click', onClick);
    rafId = requestAnimationFrame(draw);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
