/* =====================================================================
   parts.jsx — shared atoms + reveal + interaction hooks
   ===================================================================== */
const { useState, useEffect, useRef, useCallback, useLayoutEffect } = React;

/* ---- Lucide icon (CDN). Debounced createIcons once per frame. ---- */
let _iconRAF = null;
function scheduleIcons(){
  if (_iconRAF) return;
  _iconRAF = requestAnimationFrame(() => {
    _iconRAF = null;
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  });
}
function Icon({ name, size = 20, stroke = 2, className = "", style = {} }){
  const ref = useRef(null);
  useEffect(() => { scheduleIcons(); });
  return <i ref={ref} data-lucide={name} className={className}
    style={{ width: size, height: size, display:"inline-flex", ...style }}></i>;
}

/* =====================================================================
   REVEAL — uses a data attribute (data-rv) instead of a class so it
   SURVIVES React re-renders (React rewrites className but leaves
   unknown data-* attributes untouched).
   ===================================================================== */
function useReveal(dep){
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal],[data-stagger]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){ e.target.setAttribute("data-rv",""); io.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -4% 0px" });
    els.forEach(el => { if (!el.hasAttribute("data-rv")) io.observe(el); });
    return () => io.disconnect();
  }, [dep]);
}

/* ---- count-up when in view (data-rv independent; uses own IO) ---- */
function useCountUp(target, { comma = false } = {}){
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const node = ref.current; if (!node) return;
    let started = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !started){
          started = true;
          const dur = 1700, t0 = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 4);
            setVal(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.5 });
    io.observe(node);
    return () => io.disconnect();
  }, [target]);
  const display = comma ? val.toLocaleString("en-US") : val;
  return [ref, display];
}

/* =====================================================================
   INTERACTION HOOKS — all mutate DOM directly (no React re-render)
   ===================================================================== */

/* magnetic: element drifts toward cursor, springs back */
function useMagnetic(strength = 0.35){
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el || window.matchMedia("(pointer:coarse)").matches) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width/2);
      const my = e.clientY - (r.top + r.height/2);
      el.style.transform = `translate(${mx*strength}px, ${my*strength}px)`;
    };
    const onLeave = () => { el.style.transform = "translate(0,0)"; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [strength]);
  return ref;
}

/* 3D tilt toward cursor */
function useTilt(max = 9){
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el || window.matchMedia("(pointer:coarse)").matches) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px*max}deg) rotateX(${-py*max}deg)`;
    };
    const onLeave = () => { el.style.transform = "perspective(900px) rotateY(0) rotateX(0)"; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [max]);
  return ref;
}

/* ---- split text into animated words / chars ---- */
function SplitWords({ text }){
  return text.split(" ").map((w, i) => (
    <span className="sw" key={i} style={{ "--i": i }}><span>{w}</span></span>
  ));
}

/* ---- Section header (editorial: big index + title) ---- */
function SectionHead({ index, eyebrow, title, more, light, center }){
  return (
    <div className={`sec-head ${center ? "center" : ""} ${light ? "on-dark" : ""}`}>
      <div data-reveal="up">
        <div className="sec-eyebrow">{index && <em>{index}</em>}{eyebrow}</div>
        <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: title }}></h2>
      </div>
      {more && (
        <a className="more-link" data-reveal="right" data-cursor href="#">
          {more} <span className="ml-ic"><Icon name="arrow-right" size={17} /></span>
        </a>
      )}
    </div>
  );
}

/* drag-to-scroll for horizontal rails */
function useDragScroll(){
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let down=false, moved=false, startX=0, startL=0;
    const md = (e)=>{ down=true; moved=false; startX=e.pageX; startL=el.scrollLeft; el.classList.add("grabbing"); };
    const mm = (e)=>{ if(!down) return; const d=e.pageX-startX; if(Math.abs(d)>4) moved=true; el.scrollLeft=startL-d; };
    const up = ()=>{ down=false; el.classList.remove("grabbing"); };
    const clk = (e)=>{ if(moved){ e.preventDefault(); } };
    el.addEventListener("mousedown", md);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", up);
    el.addEventListener("click", clk, true);
    return ()=>{ el.removeEventListener("mousedown",md); window.removeEventListener("mousemove",mm);
      window.removeEventListener("mouseup",up); el.removeEventListener("click",clk,true); };
  }, []);
  return ref;
}

Object.assign(window, {
  Icon, useReveal, useCountUp, useMagnetic, useTilt, useDragScroll,
  SplitWords, SectionHead, scheduleIcons
});
