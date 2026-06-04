// Masonry (가로 무한 스크롤형) — React Bits <Masonry />를 바닐라 JS로 이식 후 변형.
// 각 행(row)을 독립적인 무한 루프 트랙으로 구성해, 드래그·휠·자동흐름으로 끝없이 순환한다.
// 타일은 일반 DOM이라 캡션 텍스트를 HTML/CSS로 자유롭게 편집할 수 있다.
(function () {
  // 캡션 텍스트는 여기서 자유롭게 수정하세요. ar = 세로/가로 비율(클수록 세로로 긴 사진 → 가로폭이 좁아짐).
  const items = [
    { img: 'assets/images/img.jpg',  caption: '캠퍼스 전경',   ar: 0.72 },
    { img: 'assets/images/img2.jpg', caption: '도서관',       ar: 1.0  },
    { img: 'assets/images/img3.jpg', caption: '동아리 활동',   ar: 0.68 },
    { img: 'assets/images/img4.jpg', caption: '연구실',       ar: 0.9  },
    { img: 'assets/images/img5.jpg', caption: '체육시설',     ar: 0.78 },
    { img: 'assets/images/img2.jpg', caption: '학술 세미나',   ar: 0.85 },
    { img: 'assets/images/img.jpg',  caption: '캠퍼스 축제',   ar: 1.0  },
    { img: 'assets/images/img4.jpg', caption: '실험 · 연구',   ar: 0.66 },
    { img: 'assets/images/img3.jpg', caption: '학생 자치활동', ar: 0.95 },
    { img: 'assets/images/img5.jpg', caption: '스포츠 대회',   ar: 0.7  },
    { img: 'assets/images/img.jpg',  caption: '강의실',       ar: 0.9  },
    { img: 'assets/images/img2.jpg', caption: '기숙사 생활',   ar: 0.68 },
    { img: 'assets/images/img3.jpg', caption: '졸업식',       ar: 1.0  },
    { img: 'assets/images/img4.jpg', caption: '봉사 활동',     ar: 0.75 },
    { img: 'assets/images/img5.jpg', caption: '국제 교류',     ar: 0.88 },
    { img: 'assets/images/img.jpg',  caption: '산학 협력',     ar: 0.66 }
  ];

  const autoSpeed = 0.6; // 자동 흐름 속도(px/frame). 0으로 두면 자동 흐름 없음.

  // 행 수 (행 수가 적을수록 카드가 커진다)
  function currentRows() {
    return 2;
  }

  // 갤러리 높이: 헤더/패딩을 뺀 "남은 화면 높이"에 맞춰, 두 줄이 항상 다 보이도록 계산
  function galleryHeight(list) {
    const section = list.closest('.campus-life') || list.parentElement;
    const cs = getComputedStyle(section);
    const padTop = parseFloat(cs.paddingTop) || 0;
    const padBot = parseFloat(cs.paddingBottom) || 0;

    let headerH = 0;
    const header = section.querySelector('.section-header');
    if (header) {
      const hcs = getComputedStyle(header);
      headerH = header.offsetHeight + (parseFloat(hcs.marginTop) || 0) + (parseFloat(hcs.marginBottom) || 0);
    }
    const listMt = parseFloat(getComputedStyle(list).marginTop) || 0;

    let h = window.innerHeight - padTop - padBot - headerH - listMt - 16;
    h = h * 0.75;             // 카드 축소 배율 (값이 작을수록 카드 작아짐)
    return Math.max(200, Math.min(h, 520)); // 너무 작거나 크지 않게 제한
  }

  function makeTile(item) {
    const tile = document.createElement('div');
    tile.className = 'masonry-item';
    tile.innerHTML =
      '<div class="masonry-img">' +
      '<div class="masonry-photo" style="background-image:url(\'' + item.img + '\')"></div>' +
      '<span class="masonry-caption">' + item.caption + '</span>' +
      '</div>';
    return tile;
  }

  function init() {
    const list = document.getElementById('masonry');
    if (!list) return;

    let rowsData = []; // [{ row, track, base:[item...], width }]

    // 행 컨테이너 생성 + 아이템을 행에 라운드로빈 배정
    function build() {
      list.innerHTML = '';
      rowsData = [];
      const rows = currentRows();
      const assign = Array.from({ length: rows }, () => []);
      items.forEach((it, i) => assign[i % rows].push(it));

      for (let r = 0; r < rows; r++) {
        const row = document.createElement('div');
        row.className = 'masonry-row';
        const track = document.createElement('div');
        track.className = 'masonry-row-track';
        row.appendChild(track);
        list.appendChild(row);
        rowsData.push({ row, track, base: assign[r], width: 0 });
      }
    }

    // 행 높이/타일 폭 계산 + 끊김 없는 순환을 위해 화면을 채울 만큼 복제
    function layout() {
      const rows = currentRows();
      const height = galleryHeight(list);
      const rowHeight = height / rows;
      list.style.height = height + 'px';
      const viewportW = list.clientWidth || window.innerWidth;

      // 중간중간 넓은 간격: 3번째 타일마다 추가 간격(px). 루프 계산에도 포함해 끊김 방지.
      const EXTRA_GAP = k => (k % 3 === 2 ? 56 : 0);

      rowsData.forEach(rd => {
        const widths = rd.base.map(it => rowHeight / it.ar);
        const gaps = rd.base.map((_, k) => EXTRA_GAP(k));
        const setWidth =
          widths.reduce((a, b) => a + b, 0) + gaps.reduce((a, b) => a + b, 0);
        rd.width = setWidth;
        rd.row.style.height = rowHeight + 'px';

        // 한 세트(setWidth)가 화면보다 좁을 수 있으니, 화면+여유를 덮을 만큼 복제
        const copies = Math.max(2, Math.ceil(viewportW / setWidth) + 1);
        rd.track.innerHTML = '';
        for (let c = 0; c < copies; c++) {
          rd.base.forEach((it, k) => {
            const tile = makeTile(it);
            tile.style.width = widths[k] + 'px';
            if (gaps[k]) tile.style.marginRight = gaps[k] + 'px';
            rd.track.appendChild(tile);
          });
        }
      });
    }

    build();
    layout();

    // 등장 애니메이션
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        list.classList.add('in');
        io.disconnect();
      });
    }, { threshold: 0.1 });
    io.observe(list);

    // ── 스크롤 상태 (무한 루프) ──
    let scrollX = 0;
    let paused = false;
    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    list.addEventListener('pointerdown', e => {
      isDown = true;
      paused = true;
      startX = e.clientX;
      startScroll = scrollX;
      list.classList.add('dragging');
      list.setPointerCapture(e.pointerId);
    });
    list.addEventListener('pointermove', e => {
      if (!isDown) return;
      scrollX = startScroll - (e.clientX - startX);
    });
    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      paused = false;
      list.classList.remove('dragging');
    };
    list.addEventListener('pointerup', endDrag);
    list.addEventListener('pointercancel', endDrag);

    // 마우스를 올리면 자동 흐름 일시정지(읽기 편하도록)
    list.addEventListener('mouseenter', () => { paused = true; });
    list.addEventListener('mouseleave', () => { if (!isDown) paused = false; });

    // (휠 가로스크롤 제거 — 풀페이지 섹션 이동과 충돌 방지. 자동 흐름 + 드래그로 탐색)

    // 매 프레임: 자동 흐름 + 각 행을 자기 폭으로 모듈로 → 끊김 없는 무한 순환
    function frame() {
      if (!paused) scrollX += autoSpeed;
      rowsData.forEach(rd => {
        if (rd.width > 0) {
          const t = ((scrollX % rd.width) + rd.width) % rd.width;
          rd.track.style.transform = 'translateX(' + (-t) + 'px)';
        }
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // 리사이즈 대응 (행 수가 바뀌면 재구성)
    let resizeT;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        const prevRows = rowsData.length;
        const rows = currentRows();
        if (rows !== prevRows) build();
        layout();
      }, 150);
    });
    window.addEventListener('load', layout);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
