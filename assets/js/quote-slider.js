// 재학생 한줄평 슬라이더 — ‹ › 버튼으로 전환. 활성 슬라이드의 문구를 타이핑(지우기 없음).
// TextType(React Bits)의 타이핑 효과만 바닐라로 이식 (gsap 대신 CSS 커서 깜빡임).
(function () {
  const slider = document.getElementById('quote-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.quote-slide'));
  const prev = slider.querySelector('.quote-prev');
  const next = slider.querySelector('.quote-next');
  if (!slides.length) return;

  const TYPING_SPEED = 70;   // ms/글자
  const PAUSE_AFTER = 3500;  // 타이핑 완료 후 다음 한줄평까지 대기(ms)

  // 각 슬라이드 원본 문구 저장 (타이핑하면서 비웠다 채우므로)
  const fullTexts = slides.map(s => {
    const line = s.querySelector('.quote-line');
    return line ? line.textContent.trim() : '';
  });

  let i = 0;
  let typeTimer = null;
  let autoTimer = null;

  function typeText(lineEl, text, onDone) {
    clearTimeout(typeTimer);
    lineEl.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'quote-cursor';
    cursor.textContent = '|';
    lineEl.appendChild(cursor);

    let idx = 0;
    function step() {
      if (idx < text.length) {
        cursor.insertAdjacentText('beforebegin', text[idx]);
        idx += 1;
        typeTimer = setTimeout(step, TYPING_SPEED);
      } else if (onDone) {
        onDone(); // 다 찍히면 커서는 남아 깜빡이고, 자동 전환 예약
      }
    }
    step();
  }

  function go(n) {
    clearTimeout(autoTimer);
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    const line = slides[i].querySelector('.quote-line');
    if (line) {
      typeText(line, fullTexts[i], () => {
        autoTimer = setTimeout(() => go(i + 1), PAUSE_AFTER);
      });
    }
  }

  if (prev) prev.addEventListener('click', () => go(i - 1));
  if (next) next.addEventListener('click', () => go(i + 1));

  go(0);
})();
