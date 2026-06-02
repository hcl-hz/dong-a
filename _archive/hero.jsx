/* =====================================================================
   hero.jsx — full-bleed 100vh slider with drag&drop image slots
   ===================================================================== */
function Hero(){
  const D = window.DA;
  const slides = D.hero;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);
  const heroRef = useRef(null);

  const go = useCallback((n) => setI((n + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused) return;
    timer.current = setTimeout(() => go(i + 1), 6000);
    return () => clearTimeout(timer.current);
  }, [i, paused, go]);

  useEffect(() => { scheduleIcons(); }, [i]);

  // mouse parallax
  useEffect(() => {
    const el = heroRef.current; if (!el || window.matchMedia("(pointer:coarse)").matches) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--px", px.toFixed(3));
      el.style.setProperty("--py", py.toFixed(3));
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className="hero" id="top" ref={heroRef}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {slides.map((s, idx) => (
        <div key={idx} className={`hero-slide ${idx === i ? "active" : ""}`}>
          <div className="hero-media">
            <image-slot id={s.slot} fit="cover" src={s.src}
              placeholder={`메인 비주얼 ${idx + 1} — 캠퍼스 사진을 끌어다 놓으세요`}></image-slot>
          </div>
          <div className="hero-scrim"></div>
          <div className="hero-inner">
            <span className="hero-tag"><span className="dot"></span>{s.tag}</span>
            <div className="hero-kicker">{s.kicker}</div>
            <h1 className="hero-title">
              {s.title.map((line, li) => <span key={li}>{line}</span>)}
            </h1>
            <p className="hero-desc">{s.desc}</p>
            <a className="hero-btn" href="#" data-cursor>{s.cta} <Icon name="arrow-right" size={18} /></a>
          </div>
        </div>
      ))}

      {/* rotating kinetic badge — text ring + centered arrow circle */}
      <div className="hero-badge">
        <svg viewBox="0 0 140 140" className="rotor" aria-hidden="true">
          <defs><path id="circ" d="M70,70 m-54,0 a54,54 0 1,1 108,0 a54,54 0 1,1 -108,0" /></defs>
          <text>
            <textPath href="#circ" startOffset="0" textLength="339" lengthAdjust="spacing">
              DONG-A UNIVERSITY · 도전과 혁신 · SINCE 1947 ·
            </textPath>
          </text>
        </svg>
        <div className="core"><Icon name="arrow-down" size={24} /></div>
      </div>

      {/* controls */}
      <div className="hero-ui">
        <div className="hero-count">
          <b>{String(i + 1).padStart(2, "0")}</b> <s>/ {String(slides.length).padStart(2, "0")}</s>
        </div>
        <div className="hero-dots">
          {slides.map((_, idx) => (
            <button key={idx} className={idx === i ? "on" : ""} onClick={() => go(idx)} aria-label={`slide ${idx+1}`}></button>
          ))}
        </div>
        <div className="hero-arrows">
          <button onClick={() => go(i - 1)} aria-label="이전"><Icon name="chevron-left" size={20} /></button>
          <button onClick={() => go(i + 1)} aria-label="다음"><Icon name="chevron-right" size={20} /></button>
        </div>
      </div>
    </section>
  );
}
window.Hero = Hero;
