// ── SCROLL PROGRESS ──
const scrollProgress = document.getElementById('scroll-progress');

// body에 overflow-x:hidden이 걸려 overflow-y가 auto로 계산되면서 스크롤 컨테이너가
// 바뀔 수 있어 window.scrollY가 신뢰되지 않는다. 실제 스크롤 위치를 견고하게 읽는다.
function getScrollTop() {
  return window.scrollY
    || (document.scrollingElement || document.documentElement).scrollTop
    || document.body.scrollTop
    || 0;
}

function updateScrollProgress() {
  const pct = (getScrollTop() / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  scrollProgress.style.width = pct + '%';
}

// ── NAV ──
const navHeader = document.getElementById('nav-header');
const navLinks = document.querySelectorAll('.nav-link');

function updateNav() {
  // 활성 메뉴 판정: 뷰포트 기준 위치(getBoundingClientRect)로 계산해 스크롤 컨테이너에 무관하게 동작
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (sec.getBoundingClientRect().top <= 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

// nav 배경/글자색 전환(.scrolled): window.scrollY가 신뢰되지 않을 수 있어,
// 페이지 상단에 둔 센티넬을 IntersectionObserver로 감시한다(스크롤 컨테이너 무관).
(function setupNavTheme() {
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:60px;pointer-events:none;';
  document.body.appendChild(sentinel);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      navHeader.classList.toggle('scrolled', !entry.isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  } else {
    navHeader.classList.add('scrolled');
  }
})();

// ── HAMBURGER ──
const hamburger = document.getElementById('nav-hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navMenu.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── TYPEWRITER ──
const typewriterEl = document.getElementById('typewriter');
const words = ['동아대학교', '미래를 만드는 곳', '여러분의 가능성', '글로벌 인재의 요람'];
let wordIdx = 0, charIdx = 0, deleting = false;

function typewrite() {
  const word = words[wordIdx];
  typewriterEl.textContent = deleting
    ? word.substring(0, --charIdx)
    : word.substring(0, ++charIdx);

  if (!deleting && charIdx === word.length) {
    setTimeout(() => { deleting = true; typewrite(); }, 2200);
    return;
  }
  if (deleting && charIdx === 0) {
    deleting = false;
    wordIdx = (wordIdx + 1) % words.length;
  }
  setTimeout(typewrite, deleting ? 55 : 120);
}
if (typewriterEl) setTimeout(typewrite, 1400);

// ── REVEAL (Intersection Observer) ──
const reveals = document.querySelectorAll('.reveal');

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = parseInt(entry.target.dataset.delay || 0);
    setTimeout(() => entry.target.classList.add('visible'), delay);
  });
}, { threshold: 0.12 });

reveals.forEach(el => revealObs.observe(el));

// ── COUNTER ANIMATION (React Bits <CountUp /> 스프링 방식 이식) ──
// motion useSpring을 바닐라로: 스프링 물리(stiffness/damping)로 from→to 보간하며 ease-out.
// React Bits 기본 모델(stiffness=100/dur, damping=20+40/dur)은 큰 수에서 꼬리가 길어,
// 동일한 ease-out 느낌을 유지하되 상대 임계값으로 ~1.6초에 안착하도록 정지 조건을 둠.
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const plain = el.hasAttribute('data-plain'); // 연도 등 천단위 콤마 없이 표시
  const fmt = n => {
    const r = Math.round(n);
    return plain ? String(r) : r.toLocaleString('en-US'); // separator: ","
  };

  const stiffness = 80;
  const damping = 28;   // 과감쇠 → 오버슈트 없이, 끝부분을 더 부드럽게 제동
  const mass = 1;

  // from = 0 에서 시작 (data-plain 연도 포함). 정지 임계값은 범위에 비례.
  // 임계값을 작게 둘수록 목표값에 거의 닿을 때까지 "스르륵" 기어가다 멈춤.
  const restDelta = Math.max(0.5, Math.abs(target) * 0.0006);
  const restSpeed = Math.max(0.5, Math.abs(target) * 0.004);

  let value = 0;
  let velocity = 0;
  let last = null;

  function frame(now) {
    if (last === null) last = now;
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.064) dt = 0.064; // 탭 비활성 등으로 인한 큰 점프 방지

    // 세미-임플리싯 오일러 스프링 적분
    const accel = (stiffness * (target - value) - damping * velocity) / mass;
    velocity += accel * dt;
    value += velocity * dt;

    if (Math.abs(target - value) <= restDelta && Math.abs(velocity) <= restSpeed) {
      el.textContent = fmt(target);
      return;
    }
    el.textContent = fmt(value);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

let statsTriggered = false;

new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !statsTriggered) {
    statsTriggered = true;
    document.querySelectorAll('.stat-num').forEach(animateCounter);
  }
}, { threshold: 0.3 }).observe(document.getElementById('stats'));

// ── SPLIT TEXT ──
function splitText(el, charDelay = 0.04) {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text);
  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'split-char';
    span.textContent = ch === ' ' ? ' ' : ch;
    span.style.transitionDelay = `${i * charDelay}s`;
    span.setAttribute('aria-hidden', 'true');
    el.appendChild(span);
  });
  el.classList.add('split-text');
}

const splitTargets = document.querySelectorAll('[data-split]');
splitTargets.forEach(el => splitText(el));

const splitObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('split-visible');
      splitObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
splitTargets.forEach(el => splitObs.observe(el));

// ── COLLAGE CARDS ENTRY ──
const collageCards = document.querySelector('.collage-cards');
if (collageCards) {
  const collageObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        collageObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  collageObs.observe(collageCards);
}

// ── LIGHTBOX ──
const images = ['assets/images/img.jpg','assets/images/img2.jpg','assets/images/img3.jpg','assets/images/img4.jpg','assets/images/img5.jpg'];
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
let lbIndex = 0;

// 라이트박스 마크업이 있는 페이지에서만 동작 (없으면 통째로 스킵)
if (lightbox) {
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      lbIndex = parseInt(item.dataset.index);
      lightboxImg.src = images[lbIndex];
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.getElementById('lightbox-prev').addEventListener('click', () => {
    lbIndex = (lbIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[lbIndex];
  });

  document.getElementById('lightbox-next').addEventListener('click', () => {
    lbIndex = (lbIndex + 1) % images.length;
    lightboxImg.src = images[lbIndex];
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') document.getElementById('lightbox-prev').click();
    if (e.key === 'ArrowRight') document.getElementById('lightbox-next').click();
  });
}

// ── BACK TO TOP ──
const backToTop = document.getElementById('back-to-top');
if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

function updateBackToTop() {
  if (backToTop) backToTop.classList.toggle('visible', getScrollTop() > 400);
}

// ── 3D TILT EFFECT ──
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -10;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 10;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ── SCROLL LISTENER ──
function onScroll() {
  updateScrollProgress();
  updateNav();
  updateBackToTop();
}
window.addEventListener('scroll', onScroll, { passive: true });
// 스크롤 컨테이너가 body 등으로 바뀌어도 동작하도록 캡처 단계로도 수신
document.addEventListener('scroll', onScroll, { passive: true, capture: true });

updateNav();
updateBackToTop();

// ── 히어로 이미지 슬라이드쇼 (img2부터 5장 반복) ──
const heroSlides = document.querySelectorAll('#hero-slideshow .hero-slide');
const heroTexts = document.querySelectorAll('.hero-texts .hero-text');
const heroVideos = [...document.querySelectorAll('#hero-slideshow .hero-slide[data-kind="video"] .hero-video')];
const pauseAllVideos = () => heroVideos.forEach((v) => { try { v.pause(); } catch (e) {} });
const HERO_IMAGE_DWELL = 5000;  // 이미지 슬라이드 노출 시간
const HERO_VIDEO_DWELL = 6000;  // 영상 노출 시간 (영상 길이에 맞춰 조정)
// 활성 슬라이드에 맞는 텍스트만 노출 (영상=중앙 타이틀 / 이미지=홍보문구)
const syncHeroText = (i) => {
  heroTexts.forEach((t) => t.classList.toggle('is-active', Number(t.dataset.slide) === i));
};
if (heroSlides.length > 1) {
  let heroIdx = 0;
  let heroTimer = null;
  let heroPaused = false;
  const dwellOf = (i) => (heroSlides[i].dataset.kind === 'video' ? HERO_VIDEO_DWELL : HERO_IMAGE_DWELL);
  const HPG_PAUSE = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="5" height="18" rx="1"/><rect x="14" y="3" width="5" height="18" rx="1"/></svg>';
  const HPG_PLAY = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg>';
  // 세그먼트 인디케이터 생성 (슬라이드당 1개) + 재생/일시정지 토글
  const progWrap = document.querySelector('[data-hero-prog]');
  const segFills = [];
  if (progWrap) {
    heroSlides.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'hpg-seg';
      b.type = 'button';
      b.setAttribute('aria-label', `${i + 1}번째 슬라이드 보기`);
      const f = document.createElement('span');
      f.className = 'hpg-fill';
      b.appendChild(f);
      b.addEventListener('click', () => showHero(i));
      progWrap.appendChild(b);
      segFills.push(f);
    });
    // 컨트롤 묶음 (< 정지 >) — 메인처럼 버튼 사이 간격을 좁게
    const ctrl = document.createElement('div');
    ctrl.className = 'hpg-ctrl';
    // 이전 슬라이드 버튼 (정지 토글 왼쪽)
    const prevBtn = document.createElement('button');
    prevBtn.className = 'hpg-nav hpg-prev';
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', '이전 슬라이드');
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
    prevBtn.addEventListener('click', () => showHero((heroIdx - 1 + heroSlides.length) % heroSlides.length));
    ctrl.appendChild(prevBtn);
    const toggle = document.createElement('button');
    toggle.className = 'hpg-toggle';
    toggle.type = 'button';
    toggle.innerHTML = HPG_PAUSE;
    toggle.setAttribute('aria-label', '슬라이드 일시정지');
    ctrl.appendChild(toggle);
    // 다음 슬라이드 버튼 (정지 토글 오른쪽)
    const nextBtn = document.createElement('button');
    nextBtn.className = 'hpg-nav hpg-next';
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', '다음 슬라이드');
    nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
    nextBtn.addEventListener('click', () => showHero((heroIdx + 1) % heroSlides.length));
    ctrl.appendChild(nextBtn);
    progWrap.appendChild(ctrl);
    toggle.addEventListener('click', () => {
      heroPaused = !heroPaused;
      toggle.innerHTML = heroPaused ? HPG_PLAY : HPG_PAUSE;
      toggle.setAttribute('aria-label', heroPaused ? '슬라이드 재생' : '슬라이드 일시정지');
      if (heroPaused) {
        clearTimeout(heroTimer);
        pauseAllVideos();
        const af = segFills[heroIdx]; // 현재 막대를 현재 너비에서 정지
        if (af) { const w = getComputedStyle(af).width; af.style.transition = 'none'; af.style.width = w; }
      } else {
        paintSegs(heroIdx);
        scheduleHero();
      }
    });
  }
  function paintSegs(i) {
    const dur = dwellOf(i);
    segFills.forEach((f, k) => {
      f.style.transition = 'none';
      if (k < i) { f.style.width = '100%'; }
      else if (k > i) { f.style.width = '0%'; }
      else { f.style.width = '0%'; void f.offsetWidth; f.style.transition = `width ${dur}ms linear`; f.style.width = '100%'; }
    });
  }
  const goNext = () => showHero((heroIdx + 1) % heroSlides.length);
  function scheduleHero() {
    clearTimeout(heroTimer);
    if (heroPaused) return;
    const cur = heroSlides[heroIdx];
    const curVideo = cur.querySelector('.hero-video');
    // 활성 슬라이드 외 영상은 정지(되감기)
    heroVideos.forEach((v) => { if (v !== curVideo) { try { v.pause(); v.currentTime = 0; } catch (e) {} } });
    if (cur.dataset.kind === 'video' && curVideo) {
      // 영상: 처음부터 재생하되 긴 영상이어도 HERO_VIDEO_DWELL만큼만 보여주고 다음
      try { curVideo.currentTime = 0; const p = curVideo.play(); if (p) p.catch(() => {}); } catch (e) {}
      heroTimer = setTimeout(goNext, HERO_VIDEO_DWELL);
    } else {
      pauseAllVideos();
      heroTimer = setTimeout(goNext, HERO_IMAGE_DWELL);
    }
  }
  function showHero(i) {
    heroSlides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    heroIdx = i;
    syncHeroText(i);
    paintSegs(i);
    scheduleHero();
  }
  syncHeroText(0);
  paintSegs(0);
  scheduleHero(); // 초기 영상 슬라이드부터 시작
}

// ── 카드형 안내 배너 캐러셀 ──
(function () {
  const stage = document.querySelector('[data-cbn-stage]');
  if (!stage) return;
  const cards = [...stage.querySelectorAll('.cbn-card')];
  if (!cards.length) return;
  const dotsWrap = document.querySelector('[data-cbn-dots]');
  const toggleBtn = document.querySelector('[data-cbn-toggle]');
  const DWELL = 5000;
  const PAUSE = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="5" height="18" rx="1"/><rect x="14" y="3" width="5" height="18" rx="1"/></svg>';
  const PLAY = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg>';
  let idx = 0, timer = null, paused = false;
  const dots = [], fills = [];
  if (dotsWrap) {
    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'cbn-dot'; d.type = 'button';
      d.setAttribute('aria-label', `${i + 1}번째 배너`);
      const f = document.createElement('span'); f.className = 'cbn-dot-fill';
      d.appendChild(f);
      d.addEventListener('click', () => { go(i); restart(); });
      dotsWrap.appendChild(d); dots.push(d); fills.push(f);
    });
  }
  function paintFill() {
    fills.forEach((f, k) => {
      f.style.transition = 'none'; f.style.width = '0%';
      if (k === idx && !paused) { void f.offsetWidth; f.style.transition = `width ${DWELL}ms linear`; f.style.width = '100%'; }
    });
  }
  function go(i) {
    idx = (i % cards.length + cards.length) % cards.length;
    cards.forEach((c, k) => c.classList.toggle('is-active', k === idx));
    dots.forEach((d, k) => d.classList.toggle('is-active', k === idx));
    paintFill();
  }
  function restart() { clearInterval(timer); if (!paused && cards.length > 1) timer = setInterval(() => go(idx + 1), DWELL); }
  if (toggleBtn) {
    toggleBtn.innerHTML = PAUSE;
    toggleBtn.addEventListener('click', () => {
      paused = !paused;
      toggleBtn.innerHTML = paused ? PLAY : PAUSE;
      toggleBtn.setAttribute('aria-label', paused ? '배너 재생' : '배너 일시정지');
      if (paused) {
        clearInterval(timer);
        const af = fills[idx];
        if (af) { const w = getComputedStyle(af).width; af.style.transition = 'none'; af.style.width = w; }
      } else { paintFill(); restart(); }
    });
  }
  go(0); restart();
})();

// ── 공지사항 카드 탭 전환 ──
document.querySelectorAll('.notice-tabs').forEach(tabs => {
  const content = tabs.closest('.reflect-content');
  if (!content) return;
  tabs.querySelectorAll('.notice-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.tab;
      tabs.querySelectorAll('.notice-tab').forEach(t => t.classList.toggle('is-active', t === tab));
      content.querySelectorAll('.notice-panel').forEach(p =>
        p.classList.toggle('is-active', p.dataset.panel === key));
    });
  });
});

// ── 누적 스크롤 기반 섹션 이동 (풀페이지 스타일) ──
// [비활성화] 자유 스크롤로 변경 — 휠/키 가로채기 제거
(function () {
  return;
  const targets = [
    ...document.querySelectorAll('main > section'),
    document.querySelector('.site-footer')
  ].filter(Boolean);
  if (targets.length < 2) return;

  const THRESHOLD = 70;   // 이동을 트리거하는 누적 휠 양 (클수록 둔감)
  const LOCK_MS = 800;    // 전환 중 추가 입력 잠금
  let accum = 0;
  let locked = false;
  let current = 0;
  let resetT, lockT;

  // 각 섹션의 문서상 top을 누적 높이(offsetHeight)로 계산 — 스크롤/스티키 영향 없음.
  // (offsetTop은 position:sticky에서 스크롤에 따라 값이 변해 부정확함)
  let tops = [];
  function computeTops() {
    tops = [];
    let y = 0;
    for (const el of targets) { tops.push(y); y += el.offsetHeight; }
  }

  function nearest() {
    const y = getScrollTop();
    let best = 0, bestD = Infinity;
    tops.forEach((t, i) => {
      const d = Math.abs(t - y);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }

  function goTo(i) {
    i = Math.max(0, Math.min(targets.length - 1, i));
    if (i === current) { accum = 0; return; }
    current = i;
    locked = true;
    accum = 0;
    // 픽셀 위치로 부드럽게 이동 → 스티키 요소 흔들림 없음
    window.scrollTo({ top: tops[i], behavior: 'smooth' });
    clearTimeout(lockT);
    lockT = setTimeout(() => { locked = false; }, LOCK_MS);
  }

  window.addEventListener('wheel', (e) => {
    e.preventDefault();           // 자유 스크롤 차단 → 섹션 단위로만 이동
    if (locked) return;
    accum += e.deltaY;
    clearTimeout(resetT);
    resetT = setTimeout(() => { accum = 0; }, 220); // 멈추면 누적 초기화
    if (Math.abs(accum) >= THRESHOLD) {
      goTo(current + (accum > 0 ? 1 : -1));
    }
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault(); goTo(current + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault(); goTo(current - 1);
    }
  });

  // 상단 메뉴(앵커) 클릭은 goTo로 라우팅 → current를 정확히 유지
  document.querySelectorAll('.nav-link[href^="#"]').forEach(a => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;                       // "#" 빈 링크는 무시
    const sec = document.getElementById(id);
    const idx = sec ? targets.indexOf(sec) : -1;
    if (idx < 0) return;
    a.addEventListener('click', (e) => { e.preventDefault(); goTo(idx); });
  });

  window.addEventListener('resize', () => { computeTops(); current = nearest(); });
  computeTops();
  current = nearest();   // 새로고침이 중간에서 됐을 때 대비, 최초 1회만
})();

// ── 동아파워 카드 슬라이드 (자동 없음 · 좌우 화살표로만 이동) ──
(function () {
  const marquee = document.querySelector('.pw2-marquee');
  if (!marquee) return;
  const rows = [...marquee.querySelectorAll('.pw2-row')];
  // 각 행 복제 → 끝까지 가도 끊김 없이 이어짐
  rows.forEach((row) => { row.innerHTML += row.innerHTML; });

  const states = rows.map((row) => ({ el: row, offset: 0, target: 0, setW: 1 }));
  const cards = [...marquee.querySelectorAll('.pw2-stat')];
  const gapPx = () => {
    const c = cards[0];
    return c ? (parseFloat(getComputedStyle(c).marginRight) || 0) : 18;
  };
  // 보이는 영역에 정확히 N개가 들어가도록 카드 폭 설정 (와이드=5개)
  const sizeCards = () => {
    const mw = marquee.clientWidth || 1;
    const gap = gapPx();
    const count = mw >= 1180 ? 5 : mw >= 820 ? 4 : mw >= 560 ? 3 : 2;
    // 내림(floor)으로 5장 합이 영역을 넘지 않게 → 끝 카드 잘림 방지
    const cardW = Math.floor((mw - gap * (count - 1)) / count);
    cards.forEach((c) => { c.style.flex = `0 0 ${cardW}px`; c.style.maxWidth = `${cardW}px`; });
  };
  const stepPx = () => {
    const card = cards[0];
    if (!card) return 240;
    // 카드 단위(폭+간격)의 2배 — 카드 경계에 정확히 맞춰 이동
    return Math.round(card.offsetWidth + gapPx()) * 2;
  };
  const measure = () => {
    sizeCards();
    states.forEach((s) => { s.setW = Math.round(s.el.scrollWidth / 2) || 1; });
  };
  const apply = (s) => {
    let o = s.offset % s.setW;
    if (o < 0) o += s.setW;
    s.el.style.transform = `translateX(${-Math.round(o)}px)`; // 정수 px → 서브픽셀 잘림 방지
  };
  measure();
  states.forEach(apply);
  window.addEventListener('resize', () => { measure(); states.forEach(apply); });

  // 클릭 시 target으로 부드럽게 보간
  let raf = null;
  const tick = () => {
    let moving = false;
    states.forEach((s) => {
      const diff = s.target - s.offset;
      if (Math.abs(diff) > 0.5) { s.offset += diff * 0.18; moving = true; }
      else {
        // 정지 시 setW 범위로 정규화 → 오차 누적 방지 (apply는 modulo라 점프 없음)
        let n = s.target % s.setW;
        if (n < 0) n += s.setW;
        s.offset = n;
        s.target = n;
      }
      apply(s);
    });
    if (moving) raf = requestAnimationFrame(tick);
    else raf = null;
  };
  const nudge = (dir) => {
    const step = stepPx();
    states.forEach((s) => { s.target += dir * step; });
    if (raf === null) raf = requestAnimationFrame(tick);
  };

  const prev = document.querySelector('.pw2-prev');
  const next = document.querySelector('.pw2-next');
  if (prev) prev.addEventListener('click', () => nudge(-1));
  if (next) next.addEventListener('click', () => nudge(1));
})();

// ── 동아파워 카드 숫자 카운트업 (섹션 진입 시 1회) ──
(function () {
  const marquee = document.querySelector('.pw2-marquee');
  if (!marquee) return;
  // 텍스트형(전국 1위·3대 국책사업 등) 제외, 숫자형 figure만 — 마퀴 복제본 포함
  const figs = [...marquee.querySelectorAll('.pw2-figure:not(.pw2-figure--text)')];
  if (!figs.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const items = figs.map((el) => {
    const raw = el.textContent.trim();
    return {
      el, raw,
      hasComma: raw.indexOf(',') !== -1,
      dec: (raw.split('.')[1] || '').length,
      num: parseFloat(raw.replace(/,/g, '')),
    };
  }).filter((it) => isFinite(it.num));
  if (!items.length) return;

  const fmt = (v, it) => {
    let s = it.dec ? v.toFixed(it.dec) : String(Math.round(v));
    if (it.hasComma) {
      const p = s.split('.');
      p[0] = Number(p[0]).toLocaleString('en-US');
      s = p.join('.');
    }
    return s;
  };

  let rafId = null;
  const run = () => {
    if (reduced) { items.forEach((it) => { it.el.textContent = it.raw; }); return; }
    if (rafId) cancelAnimationFrame(rafId); // 진행 중이던 카운트 취소 후 새로 시작
    const dur = 1400;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const t0 = performance.now();
    items.forEach((it) => { it.el.textContent = fmt(0, it); });
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = ease(t);
      items.forEach((it) => { it.el.textContent = fmt(it.num * e, it); });
      if (t < 1) rafId = requestAnimationFrame(frame);
      else { rafId = null; items.forEach((it) => { it.el.textContent = it.raw; }); } // 원본 포맷 복원
    };
    rafId = requestAnimationFrame(frame);
  };

  if ('IntersectionObserver' in window) {
    let visible = false;
    const io = new IntersectionObserver((entries) => {
      const isIn = entries.some((e) => e.isIntersecting);
      if (isIn && !visible) { visible = true; run(); }      // 들어올 때마다 재실행
      else if (!isIn && visible) { visible = false; }       // 나가면 리셋해 다음 진입 때 다시 카운트
    }, { threshold: 0.25 });
    io.observe(marquee);
  } else {
    run();
  }
})();

// ── 플로팅 도크 TOP 버튼 ──
(function () {
  const top = document.querySelector('.dq-top');
  if (top) top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// ── 대상별 슬라이드 패널 (예비동아인/재학생/교직원/학부모) ──
(function () {
  const panel = document.getElementById('dq-panel');
  if (!panel) return;
  const titleEl = panel.querySelector('.dq-panel-title');
  const icoEl = panel.querySelector('.dq-panel-ico');
  const listEl = panel.querySelector('.dq-panel-list');
  const closeBtn = panel.querySelector('.dq-panel-close');
  const btns = [...document.querySelectorAll('.d-quick .dq-item[data-aud]')];

  // 대상별 관련 항목 (실제 링크/항목으로 교체하세요)
  const LINKS = {
    '예비동아인': [
      { t: '대학 입학안내', u: 'https://ent.donga.ac.kr/admission/html/main/intro.asp' },
      { t: '대학원 입학안내', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN057' },
      { t: '대학소개', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN272' },
      { t: '장학제도안내', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN153' },
      { t: '캠퍼스맵', u: 'https://www.donga.ac.kr/kor/CMS/CampusMgr/list.do?mCode=MN032' },
      { t: '오시는 길', u: 'http://donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN034' },
    ],
    '동아인': { groups: [
      { g: '학사·장학', items: [
        { t: '수강신청', u: 'https://dxsugang.donga.ac.kr/login' },
        { t: '등록금', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN159' },
        { t: '학사일정', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN173' },
        { t: '장학공지', u: 'https://www.donga.ac.kr/kor/CMS/Board/Board.do?mCode=MN172' },
        { t: '공지사항', u: 'https://www.donga.ac.kr/kor/CMS/Board/Board.do?mCode=MN170' },
        { t: '증명서 발급', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN200' },
        { t: '공결안내', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN100' },
        { t: '교내장학규정', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN153' },
      ] },
      { g: '학습·취업', items: [
        { t: 'LMS(학습관리시스템)', u: 'https://eclass.donga.ac.kr/' },
        { t: 'GeLC<br>(부·울·경 이러닝지원센터)', u: 'https://gelc.or.kr/main/MainView.dunet#main' },
        { t: 'DECO 시스템', u: 'https://deco.donga.ac.kr/' },
        { t: '현장실습신청', u: 'https://dx.donga.ac.kr/' },
        { t: '다잇다(취업선배 온라인 멘토링)', u: 'https://daitdaa.donga.ac.kr/' },
      ] },
      { g: '생활·캠퍼스', items: [
        { t: '캠퍼스맵', u: 'https://www.donga.ac.kr/kor/CMS/CampusMgr/list.do?mCode=MN032' },
        { t: '식단표', u: 'https://www.donga.ac.kr/kor/CMS/DietMenuMgr/list.do?mCode=MN199' },
        { t: '셔틀버스', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN201' },
        { t: '기숙사(한림생활관)', u: 'https://hanlim.donga.ac.kr/' },
        { t: '도서관', u: 'https://library.donga.ac.kr/' },
        { t: '네트워크 접근제어(NAC)', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN191' },
      ] },
    ] },
    '교직원': [
      { t: '식단표', u: 'https://www.donga.ac.kr/kor/CMS/DietMenuMgr/list.do?mCode=MN199' },
      { t: '그룹웨어', u: 'https://portal.donga.ac.kr/' },
      { t: '주차안내', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN204' },
      { t: '교내 연락처', u: 'https://www.donga.ac.kr/kor/CMS/ContactMgr/list.do?mCode=MN014' },
      { t: '통합정보시스템', u: 'https://dx.donga.ac.kr/' },
      { t: '네트워크 접근제어(NAC)', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN191' },
      { t: 'NAC 관련 FAQ', u: 'https://www.donga.ac.kr/kor/CMS/Board/Board.do?mCode=MN254' },
    ],
    '일반인': [
      { t: '채용공고', u: 'https://www.donga.ac.kr/kor/CMS/Board/Board.do?mCode=MN175' },
      { t: '교내 연락처', u: 'https://www.donga.ac.kr/kor/CMS/ContactMgr/list.do?mCode=MN014' },
      { t: '대관 및 예약안내', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN286' },
      { t: '주차시설안내', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN204' },
      { t: '오시는 길', u: 'https://www.donga.ac.kr/kor/CMS/Contents/Contents.do?mCode=MN034' },
    ],
  };

  // 대상별 아이콘 (Lucide 인라인 SVG)
  const ICONS = {
    '예비동아인': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    '동아인': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    '교직원': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    '일반인': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  };

  let openAud = null;
  const linkHTML = (item) => {
    const label = typeof item === 'string' ? item : item.t;
    const href = typeof item === 'string' ? '#' : item.u;
    const ext = href && href !== '#';
    return `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
  };
  const render = (aud) => {
    titleEl.textContent = aud;
    if (icoEl) icoEl.innerHTML = ICONS[aud] || '';
    const data = LINKS[aud] || [];
    const grouped = !Array.isArray(data) && data.groups;
    if (grouped) {
      listEl.classList.add('is-grouped');
      listEl.innerHTML = data.groups.map((grp) =>
        `<li class="dq-group"><span class="dq-group-title">${grp.g}</span>` +
        `<div class="dq-group-grid">${grp.items.map(linkHTML).join('')}</div></li>`
      ).join('');
      panel.classList.add('dq-wide');
    } else {
      listEl.classList.remove('is-grouped');
      listEl.innerHTML = data.map((item) => `<li>${linkHTML(item)}</li>`).join('');
      panel.classList.toggle('dq-wide', data.length >= 12);
    }
  };
  const close = () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    btns.forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-expanded', 'false'); });
    openAud = null;
  };
  const open = (aud, btn) => {
    render(aud);
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    btns.forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    openAud = aud;
  };

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const aud = btn.dataset.aud;
      if (openAud === aud) close(); // 같은 버튼 재클릭 → 닫기
      else open(aud, btn);
    });
  });
  if (closeBtn) closeBtn.addEventListener('click', close);
  // 동적 생성된 플레이스홀더 링크(href="#") 상단 점프 방지
  listEl.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  // 바깥 클릭 / Esc 닫기
  document.addEventListener('click', (e) => {
    if (openAud && !panel.contains(e.target) && !e.target.closest('.d-quick')) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

// ── 플레이스홀더 링크(href="#") 클릭 시 상단 점프 방지 ──
document.querySelectorAll('a[href="#"]').forEach((a) => {
  a.addEventListener('click', (e) => e.preventDefault());
});

// ── 대학공지 카테고리 버튼 선택 전환 ──
(function () {
  const cats = document.querySelectorAll('.na-cat');
  cats.forEach((btn) => {
    btn.addEventListener('click', () => {
      cats.forEach((b) => b.classList.toggle('is-active', b === btn));
    });
  });
})();

// ── 동아뉴스 슬라이더 (텍스트 + 메인/다음 이미지 전환) ──
(function () {
  const slider = document.querySelector('.nf-slider');
  if (!slider) return;
  const NEWS = [
    { title: '동아대, ‘2026 HR 혁신 포럼’ 성황리 개최… 전국 HR 전문가 100여 명 교류', desc: '동아대학교(총장 이해우)는 학생·인재개발처(처장 신용택) 인재개발과 주관으로 국내 최대 규모의 ‘2026 HR 혁신 포럼’이 성황리에 마무리됐다고 12일 밝혔다.', date: '2026.06.12', img: 'uploads/1bf1ad6d56164ee8acbebcb9cd1d67b9.jpeg' },
    { title: '동아대, 중국 선전대·싱가포르 공과대와 ‘글로벌 AI 협력’ 추진', desc: '동아대학교(총장 이해우)는 소프트웨어혁신센터(센터장 이석환)가 중국 선전대학교(SZU), 싱가포르 공과대학교(SIT)와 인공지능(AI)·소프트웨어(SW) 분야 글로벌 협력 강화를 위한 3개 대학 간 협력 체계 구축을 본격적으로 추진한다고 24일 밝혔다.', date: '2026.06.24', img: 'uploads/908a3b2468234f6abe50f324b6539a47.jpeg' },
    { title: '동아대, 2026학년도 직원 연수회 ‘이어온 80년, 함께 채워갈 내일’ 개최', desc: '동아대학교(총장 이해우)는 부산 중구 코모도호텔에서 ‘2026학년도 직원 연수회’를 지난 23일 성황리에 개최했다고 24일 밝혔다.', date: '2026.06.24', img: 'uploads/8f34a15267164402af5774ccd60018ba.jpeg' },
    { title: '동아대, 외국인 유학생 ‘K-Culture School: 자기주도 정주 설계 캠프’ 성료', desc: '동아대학교(총장 이해우)는 외국인 유학생들의 성공적인 한국 사회 안착과 지역 정주를 지원하기 위한 ‘K-Culture School: 자기주도 정주 설계 캠프 제주 프로그램’을 성황리에 마쳤다고 22일 밝혔다.', date: '2026.06.22', img: 'uploads/d95935cddd7f4d37a8e2cf27bd471399.jpeg' },
    { title: '동아대 의과대학 혁신사업센터, ‘좋은 의사 프로젝트: 지역을 잇다’ 성황리 개최', desc: '동아대학교(총장 이해우) 의과대학 혁신사업센터(센터장 김종국)는 ‘좋은 의사 프로젝트: 지역을 잇다-진료실을 넘어 사회로’ 행사를 성황리에 마쳤다고 16일 밝혔다.', date: '2026.06.16', img: 'uploads/fb841d0ad36d4f0e87e6c59d3f2ae90b.jpeg' }
  ];
  const PEOPLE = [
    { title: '세계를 무대로 — 글로벌 기업 진출 동문', desc: '동아대를 졸업하고 해외 유수 기업에서 활약 중인 동문의 이야기를 전합니다.', date: '2026.05.18', img: 'assets/images/people.jpg' },
    { title: '연구로 미래를 여는 사람들 — 우수 연구자', desc: '국제 학술지에 잇따라 성과를 낸 동아대 연구진을 만나봅니다.', date: '2026.05.12', img: 'assets/images/people2.jpg' },
    { title: '캠퍼스를 빛내는 학생들 — 동아 서포터즈', desc: '학교를 알리고 지역과 소통하는 학생 홍보대사들의 활동기.', date: '2026.05.06', img: 'assets/images/people3.jpg' },
    { title: '지역과 함께 — 동아 봉사단', desc: '이웃과 함께하는 동아인의 따뜻한 나눔 활동을 소개합니다.', date: '2026.04.28', img: 'assets/images/people4.jpg' },
    { title: '도전하는 청년 — 창업 동아리 스토리', desc: '아이디어를 사업으로 키워가는 동아대 청년 창업가들.', date: '2026.04.20', img: 'assets/images/people5.jpg' }
  ];
  const DATA = { '동아뉴스': NEWS, '동아피플': PEOPLE };

  const titleEl = slider.querySelector('[data-nf-title]');
  const descEl = slider.querySelector('[data-nf-desc]');
  const dateEl = slider.querySelector('[data-nf-date]');
  const panels = [...slider.querySelectorAll('.nf-panel')];
  const prevBtn = slider.querySelector('[data-nf-dir="prev"]');
  const nextBtn = slider.querySelector('[data-nf-dir="next"]');
  let current = NEWS;
  let idx = 0;
  const setActive = (i) => {
    const len = current.length;
    idx = ((i % len) + len) % len; // 무한 순환 (화살표 클릭 시에만)
    const nextIdx = (idx + 1) % len; // 다음 미리보기 (마지막 → 첫 기사)
    const prevIdx = (idx - 1 + len) % len; // 직전(나가는) 사진
    panels.forEach((p, k) => {
      p.classList.toggle('is-active', k === idx);
      p.classList.toggle('is-next', k === nextIdx);
      // 시각 순서를 항상 [이전 | 활성 | 다음]으로 고정 → 나가는 사진이 항상 왼쪽으로 밀려 사라지고,
      // 순환(마지막↔첫)에서도 가운데로 빠지지 않음
      p.style.order = k === idx ? 1 : k === nextIdx ? 2 : k === prevIdx ? 0 : 3;
    });
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
    const cur = current[idx];
    titleEl.textContent = cur.title;
    descEl.textContent = cur.desc;
    dateEl.textContent = cur.date;
  };
  const applyDataset = (data) => {
    current = data;
    panels.forEach((p, k) => {
      const img = p.querySelector('img');
      if (img && data[k]) img.src = data[k].img;
    });
    setActive(0);
  };
  panels.forEach((p, k) => p.addEventListener('click', () => setActive(k)));
  slider.querySelectorAll('[data-nf-dir]').forEach((el) => {
    el.addEventListener('click', () => setActive(idx + (el.dataset.nfDir === 'prev' ? -1 : 1)));
  });
  // 제목 라인 탭(동아뉴스/동아피플) → 데이터셋 전환
  document.querySelectorAll('.nf-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nf-tab').forEach((t) => t.classList.toggle('is-active', t === tab));
      applyDataset(DATA[tab.textContent.trim()] || NEWS);
    });
  });
  applyDataset(NEWS);   // 초기 로드 시 텍스트 + 이미지를 데이터에서 채움
})();

// ── 동아 캘린더 (월 달력 그리드) ──
(function () {
  const grid = document.querySelector('[data-cal-grid]');
  const monthEl = document.querySelector('[data-cal-month]');
  if (!grid) return;

  // 이벤트(학사일정) 시작일 — 월별 dot 표시
  const EVENTS = { '2026-6': [6, 9, 16, 23, 29] };

  let view = new Date(2026, 5, 1); // 2026.6 기준
  const today = new Date();

  const render = () => {
    const year = view.getFullYear();
    const month = view.getMonth(); // 0-based
    if (monthEl) monthEl.textContent = year + '.' + (month + 1);
    const evDays = EVENTS[year + '-' + (month + 1)] || [];

    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    let html = '';
    // 이전 달 채우기
    for (let i = firstDow - 1; i >= 0; i--) {
      html += `<span class="nt2-cal-day other">${prevDays - i}</span>`;
    }
    // 이번 달
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(year, month, d).getDay();
      let cls = 'nt2-cal-day';
      if (dow === 0) cls += ' sun';
      if (dow === 6) cls += ' sat';
      if (evDays.includes(d)) cls += ' has-event';
      if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) cls += ' today';
      html += `<span class="${cls}">${d}</span>`;
    }
    // 다음 달 채우기
    const filled = firstDow + daysInMonth;
    const rest = (7 - (filled % 7)) % 7;
    for (let i = 1; i <= rest; i++) html += `<span class="nt2-cal-day other">${i}</span>`;

    grid.innerHTML = html;
  };

  document.querySelectorAll('[data-cal-dir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      view.setMonth(view.getMonth() + (btn.dataset.calDir === 'next' ? 1 : -1));
      render();
    });
  });
  render();
})();

// ── 대학공지/캘린더 탭 선택 전환 ──
(function () {
  // 캘린더 탭: 활성 표시만 전환
  const calTabs = document.querySelectorAll('.nt2-cal-tab');
  calTabs.forEach((tab) => {
    tab.addEventListener('click', () => calTabs.forEach((t) => t.classList.toggle('is-active', t === tab)));
  });
  // 공지 카테고리 탭: 클릭 시 해당 카테고리 항목만 노출 (전체=모두)
  const noticeTabs = document.querySelectorAll('.nt2-tab');
  const noticeItems = [...document.querySelectorAll('.nt2-list .nt2-item')];
  const NOTICE_LIMIT = 4;   // 탭별 최대 노출 개수 (레이아웃 고정)
  const filterNotice = (cat) => {
    let shown = 0;
    noticeItems.forEach((li) => {
      const itemCat = (li.querySelector('.nt2-cat')?.textContent || '').trim();
      const match = (cat === '전체' || itemCat === cat) && shown < NOTICE_LIMIT;
      li.style.display = match ? '' : 'none';
      if (match) shown++;
    });
  };
  noticeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      noticeTabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      filterNotice(tab.textContent.trim());
    });
  });
  filterNotice('전체');   // 초기 로드: 전체 탭 최신 4건만 노출
})();

// ── 주요서비스 (탭 전환 + 화살표 스크롤) ──
(function () {
  const carousel = document.querySelector('.svc2-carousel');
  if (!carousel) return;
  const tabs = document.querySelectorAll('.svc2-tab');
  const tracks = document.querySelectorAll('.svc2-track');
  const prev = document.querySelector('.svc2-prev');
  const next = document.querySelector('.svc2-next');

  const activeTrack = () => document.querySelector('.svc2-track.is-active');
  const step = (track) => {
    const item = track.querySelector('.svc2-item');
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 12) || 12;
    const w = item ? item.getBoundingClientRect().width + gap : 240;
    return w * 3; // 한 번에 3개씩
  };

  // 등장 스태거 애니메이션: 아이템에 인덱스 부여 + 재생 트리거
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    tracks.forEach((tr) => {
      tr.classList.add('anim');
      [...tr.querySelectorAll('.svc2-item')].forEach((it, i) => it.style.setProperty('--i', i));
    });
  }
  const playIn = (tr) => {
    if (!tr || reduced) return;
    tr.classList.remove('is-in');
    void tr.offsetWidth; // 리플로우 → 애니메이션 리셋
    tr.classList.add('is-in');
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.panel;
      tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      tracks.forEach((tr) => {
        const on = tr.dataset.panel === key;
        tr.classList.toggle('is-active', on);
        if (on) tr.scrollLeft = 0; // 탭 바꾸면 처음으로
      });
      playIn(activeTrack()); // 탭 전환 시 새 아이콘 스태거 재생
    });
  });

  // 섹션이 처음 보일 때 1회 재생
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { playIn(activeTrack()); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(carousel);
  }

  if (prev) prev.addEventListener('click', () => { const t = activeTrack(); if (t) t.scrollBy({ left: -step(t), behavior: 'smooth' }); });
  if (next) next.addEventListener('click', () => { const t = activeTrack(); if (t) t.scrollBy({ left: step(t), behavior: 'smooth' }); });
})();
