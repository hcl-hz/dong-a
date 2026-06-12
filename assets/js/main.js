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
    { title: '동아대 부동산학교육과정, ‘2026 통합 원우회장배 골프대회’ 성료', desc: '지난 11일 부산 기장군 베이사이드 컨트리클럽에서 열린 ‘2026 동아대학교 부동산학교육과정 통합 원우회장배 골프대회’ 참가자들이...', date: '2026.05.21', img: 'uploads/image.png' },
    { title: '동아대 경찰학과, 김수환 前 부산경찰청장 초청 특강 성료', desc: '지난 11일 동아대 부민캠퍼스에서 열린 초청 특강에서 김수환 전 부산경찰청장이 ...', date: '2025.05.20', img: 'uploads/image copy.png' },
    { title: '동아대 한국어문학과, ‘제5회 살내(矢川) 최낙복 장학금 수여식’ 개최', desc: '‘제5회 살내(矢川) 최낙복 장학금 수여식’에 참석한 최낙복 명예교수와 ...', date: '2025.05.20', img: 'uploads/image copy 2.png' },
    { title: '동아대·동명대 교수 연합팀, 전국교수축구대회 ‘준우승’', desc: '‘제20회 전국교수축구대회’에서 준우승을 차지한 동아대·동명대 연합팀 소속 교수들...', date: '2025.05.19', img: 'uploads/스크린샷 2026-06-12 10.05.06.png' },
    { title: '의과대학, 지역 어린이 건강 돌봄 봉사', desc: '지역 아동을 대상으로 건강 검진과 돌봄 활동을 진행했다.', date: '2026.05.22', img: 'uploads/스크린샷 2026-06-12 10.06.12.png' }
  ];
  const titleEl = slider.querySelector('[data-nf-title]');
  const descEl = slider.querySelector('[data-nf-desc]');
  const dateEl = slider.querySelector('[data-nf-date]');
  const panels = [...slider.querySelectorAll('.nf-panel')];
  const prevBtn = slider.querySelector('[data-nf-dir="prev"]');
  const nextBtn = slider.querySelector('[data-nf-dir="next"]');
  let idx = 0;
  const setActive = (i) => {
    idx = Math.max(0, Math.min(NEWS.length - 1, i)); // 순환 없음 — 양 끝에서 멈춤
    const nextIdx = idx + 1; // 마지막이면 일치하는 패널 없음 → 미리보기 없음
    panels.forEach((p, k) => {
      p.classList.toggle('is-active', k === idx);
      p.classList.toggle('is-next', k === nextIdx);
    });
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === NEWS.length - 1;
    const cur = NEWS[idx];
    titleEl.textContent = cur.title;
    descEl.textContent = cur.desc;
    dateEl.textContent = cur.date;
  };
  panels.forEach((p, k) => p.addEventListener('click', () => setActive(k)));
  slider.querySelectorAll('[data-nf-dir]').forEach((el) => {
    el.addEventListener('click', () => setActive(idx + (el.dataset.nfDir === 'prev' ? -1 : 1)));
  });
  setActive(0);
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
  const groups = [
    document.querySelectorAll('.nt2-tab'),
    document.querySelectorAll('.nt2-cal-tab')
  ];
  groups.forEach((tabs) => {
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      });
    });
  });
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

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.panel;
      tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      tracks.forEach((tr) => {
        const on = tr.dataset.panel === key;
        tr.classList.toggle('is-active', on);
        if (on) tr.scrollLeft = 0; // 탭 바꾸면 처음으로
      });
    });
  });

  if (prev) prev.addEventListener('click', () => { const t = activeTrack(); if (t) t.scrollBy({ left: -step(t), behavior: 'smooth' }); });
  if (next) next.addEventListener('click', () => { const t = activeTrack(); if (t) t.scrollBy({ left: step(t), behavior: 'smooth' }); });
})();
