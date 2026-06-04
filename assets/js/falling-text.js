// FallingText — React Bits <FallingText /> 를 바닐라 JS로 이식 (matter-js 물리).
// .falling-text 컨테이너의 data-text(공백 구분 단어)를 단어 스팬으로 만들고,
// trigger(scroll/hover/click/auto) 시 물리 엔진으로 단어들이 우르르 떨어진다.
import Matter from 'https://esm.sh/matter-js@0.19.0';

function initFallingText(container) {
  const target = container.querySelector('.falling-text-target');
  const canvasContainer = container.querySelector('.falling-text-canvas');
  if (!target || !canvasContainer) return;

  const trigger = container.dataset.trigger || 'scroll';
  const gravity = parseFloat(container.dataset.gravity || '0.56');
  const mouseStiffness = parseFloat(container.dataset.stiffness || '0.9');

  // 단어 스팬 생성
  const words = (container.dataset.text || '').trim().split(/\s+/).filter(Boolean);
  target.innerHTML = words.map(w => `<span class="falling-word">${w}</span>`).join(' ');

  let started = false;

  function start() {
    if (started) return;
    started = true;
    // 레이아웃이 잡힌 뒤 물리 시작
    requestAnimationFrame(runPhysics);
  }

  function runPhysics() {
    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint, Body } = Matter;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width <= 0 || height <= 0) return;

    const engine = Engine.create();
    engine.world.gravity.y = gravity;

    const render = Render.create({
      element: canvasContainer,
      engine,
      options: { width, height, background: 'transparent', wireframes: false }
    });

    const wallOpts = { isStatic: true, render: { fillStyle: 'transparent' } };
    const floor = Bodies.rectangle(width / 2, height + 25, width, 50, wallOpts);
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height, wallOpts);
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, wallOpts);
    const ceiling = Bodies.rectangle(width / 2, -25, width, 50, wallOpts);

    const spans = target.querySelectorAll('.falling-word');
    const wordBodies = [...spans].map(elem => {
      const r = elem.getBoundingClientRect();
      const x = r.left - rect.left + r.width / 2;
      const y = r.top - rect.top + r.height / 2;
      const body = Bodies.rectangle(x, y, r.width, r.height, {
        render: { fillStyle: 'transparent' },
        restitution: 0.8,
        frictionAir: 0.01,
        friction: 0.2
      });
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 6, y: (Math.random()) * 2 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.07);
      elem.style.position = 'absolute';
      elem.style.transform = 'none';
      return { elem, body };
    });

    const mouse = Mouse.create(container);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: mouseStiffness, render: { visible: false } }
    });
    render.mouse = mouse;

    World.add(engine.world, [floor, leftWall, rightWall, ceiling, mouseConstraint, ...wordBodies.map(wb => wb.body)]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    (function updateLoop() {
      wordBodies.forEach(({ body, elem }) => {
        elem.style.left = body.position.x + 'px';
        elem.style.top = body.position.y + 'px';
        elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      requestAnimationFrame(updateLoop);
    })();
  }

  if (trigger === 'auto') {
    start();
  } else if (trigger === 'scroll') {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { start(); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(container);
  } else if (trigger === 'hover') {
    container.addEventListener('mouseenter', start, { once: true });
  } else if (trigger === 'click') {
    container.addEventListener('click', start, { once: true });
  }
}

function init() {
  document.querySelectorAll('.falling-text').forEach(initFallingText);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
