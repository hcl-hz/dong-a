// CircularText — React Bits <CircularText />를 바닐라 JS로 이식.
// motion(Framer Motion) 대신 CSS 애니메이션으로 회전, 호버 시 가속(speedUp).
// 글자를 원형으로 배치: 각 글자를 컨테이너 중심 기준으로 (360/글자수)*i 도 회전.
(function () {
  function build(el) {
    const text = el.dataset.text || '';
    const letters = Array.from(text);
    const n = letters.length || 1;
    letters.forEach((ch, i) => {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? ' ' : ch;
      const deg = (360 / n) * i;
      span.style.transform = 'rotate(' + deg + 'deg)';
      el.appendChild(span);
    });
  }

  function init() {
    document.querySelectorAll('.circular-text').forEach(build);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
