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
setTimeout(typewrite, 1400);

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
if (heroSlides.length > 1) {
  let heroIdx = 0;
  setInterval(() => {
    heroSlides[heroIdx].classList.remove('is-active');
    heroIdx = (heroIdx + 1) % heroSlides.length;
    heroSlides[heroIdx].classList.add('is-active');
  }, 5000);
}

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
(function () {
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
