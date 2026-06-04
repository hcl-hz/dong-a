// 인터뷰 섹션 격자 셀 생성 — 섹션을 가득 채워 격자무늬를 형성하고,
// 지정한 칸(FLIP_FRACTIONS)은 불규칙하게 3D로 뒤집히며 이미지를 보였다 감춘다.
(function () {
  const CELL = 120;  // 셀 한 변(px). .interviews-grid의 grid 트랙과 동일해야 함.
  const DEBUG = false;      // true면 각 칸에 (열,행) 좌표 표시 — 위치 확인용.
  const SHOW_BADGE = false; // true면 화면 상단 중앙에 "전체 N × M" 빨간 배지 표시.

  // ── 위치 지정 방법 ─────────────────────────────────────────────
  // DEBUG=true면 화면 왼쪽 위에 "전체 N × M" 배지가 뜬다(N=열 수, M=행 수).
  // 1) 각 칸에 표시된 (열,행) 숫자를 보고 원하는 칸을 FLIP_CELLS에 적는다.
  // 2) 그때 배지에 떠 있는 N·M을 REF_COLS·REF_ROWS에 그대로 적는다.
  // 코드가 이 좌표를 비율(좌표 ÷ 기준 칸수)로 환산하므로, 화면 크기가
  // 달라져도 항상 같은 상대 위치를 유지한다. 인덱스 순서대로 IMAGES와 매칭.
  const REF_COLS = 16;  // 아래 좌표를 읽은 화면의 전체 열 수 (배지의 N)
  const REF_ROWS = 9;   // 아래 좌표를 읽은 화면의 전체 행 수 (배지의 M)
  const FLIP_CELLS = [
    [13, 5],  // people
    [2, 8],   // people2
    [6, 4],   // people3
    [14, 3],  // people4
    [2, 3],   // people5
  ];
  const FLIP_FRACTIONS = FLIP_CELLS.map(([c, r]) => [c / REF_COLS, r / REF_ROWS]);

  const IMAGES = [
    'assets/images/people.jpg',
    'assets/images/people2.jpg',
    'assets/images/people3.jpg',
    'assets/images/people4.jpg',
    'assets/images/people5.jpg',
  ];

  // 이미지별 얼굴 확대 배율 (IMAGES와 같은 순서). people/people3는 덜 확대.
  const IMAGE_SCALES = [1.05, 1.35, 1.05, 1.05, 1.0];

  const grid = document.getElementById('interviews-grid');
  if (!grid) return;

  let lastCols = -1;
  let lastRows = -1;
  let timers = [];

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const rand = (min, max) => min + Math.random() * (max - min);

  // DEBUG용: 현재 그리드의 전체 칸 수를 화면 좌상단에 표시.
  function showSizeBadge(cols, rows) {
    let badge = document.getElementById('grid-size-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'grid-size-badge';
      badge.style.cssText =
        'position:fixed;top:10px;left:50%;transform:translateX(-50%);' +
        'z-index:2147483647;padding:8px 14px;' +
        'background:#e11d48;color:#fff;font:700 15px/1.2 monospace;' +
        'border-radius:8px;pointer-events:none;box-shadow:0 2px 12px rgba(0,0,0,.4)';
      document.body.appendChild(badge);
    }
    badge.textContent = '전체 ' + cols + ' × ' + rows + ' (열 × 행)';
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  // 한 칸을 불규칙한 간격으로 뒤집었다 되돌린다.
  function startFlip(cell) {
    function loop() {
      cell.classList.add('is-flipped');
      const t1 = setTimeout(() => {
        cell.classList.remove('is-flipped');
        const t2 = setTimeout(loop, rand(2500, 6500)); // 숨김 시간 (불규칙)
        timers.push(t2);
      }, rand(1800, 4200)); // 이미지 보임 시간 (불규칙)
      timers.push(t1);
    }
    // 시작 시점도 제각각 → 동시에 뒤집히지 않음
    const t0 = setTimeout(loop, rand(0, 3500));
    timers.push(t0);
  }

  function build() {
    const w = grid.clientWidth;
    const h = grid.clientHeight;
    if (!w || !h) return;

    const cols = Math.ceil(w / CELL);
    const rows = Math.ceil(h / CELL);
    if (cols === lastCols && rows === lastRows) return; // 크기 변화 없으면 재생성 안 함
    lastCols = cols;
    lastRows = rows;

    if (SHOW_BADGE) showSizeBadge(cols, rows);

    // 비율 좌표 → 현재 그리드의 실제 [열, 행]로 변환 (1~cols/rows 범위로 클램프)
    const flipPositions = FLIP_FRACTIONS.map(([fx, fy]) => [
      clamp(Math.round(fx * cols), 1, cols),
      clamp(Math.round(fy * rows), 1, rows),
    ]);
    const flipIndex = (col, row) =>
      flipPositions.findIndex(([c, r]) => c === col && r === row);

    clearTimers();
    const frag = document.createDocumentFragment();
    const flipCells = [];

    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= cols; col++) {
        const cell = document.createElement('span');
        const fIdx = flipIndex(col, row);
        cell.className = fIdx !== -1 ? 'grid-cell is-flip' : 'grid-cell';

        if (DEBUG) {
          cell.textContent = col + ',' + row;
          cell.classList.add('grid-cell--debug');
        }

        if (fIdx !== -1) {
          // 플립 구조: 앞면(격자에 묻힘) + 뒷면(이미지)
          const flip = document.createElement('span');
          flip.className = 'flip';
          const front = document.createElement('span');
          front.className = 'flip-face flip-front';
          const back = document.createElement('span');
          back.className = 'flip-face flip-back';
          const img = document.createElement('img');
          img.src = IMAGES[fIdx % IMAGES.length];
          img.alt = '';
          img.loading = 'lazy';
          img.style.transform = 'scale(' + IMAGE_SCALES[fIdx % IMAGE_SCALES.length] + ')';
          back.appendChild(img);
          flip.append(front, back);
          cell.appendChild(flip);
          flipCells.push(cell);
        }

        frag.appendChild(cell);
      }
    }
    grid.replaceChildren(frag);
    flipCells.forEach(startFlip);
  }

  // 셀은 absolute 그리드라 섹션 높이에 영향을 주지 않음 → 무한 루프 없음.
  if ('ResizeObserver' in window) {
    new ResizeObserver(build).observe(grid);
  } else {
    window.addEventListener('resize', build);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
