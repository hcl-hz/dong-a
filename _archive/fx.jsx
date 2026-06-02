/* =====================================================================
   fx.jsx — global interaction layer
   • cursor follower (lerp ring + dot), grows over [data-cursor]
   • scroll progress bar
   ===================================================================== */
function CursorFX(){
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(pointer:coarse)").matches) return;
    const ring = ringRef.current, dot = dotRef.current;
    let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my, raf;
    let hover = false;
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      const t = e.target.closest("[data-cursor],a,button");
      const nh = !!t;
      if (nh !== hover){ hover = nh; ring.classList.toggle("hover", hover); }
    };
    const loop = () => {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    document.documentElement.classList.add("has-cursor-fx");
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor-fx"); };
  }, []);
  return (
    <>
      <div ref={ringRef} className="cur-ring"></div>
      <div ref={dotRef} className="cur-dot"></div>
    </>
  );
}

function ScrollProgress(){
  const ref = useRef(null);
  useEffect(() => {
    const bar = ref.current;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      const p = h > 0 ? Math.min(1, scrollY / h) : 0;
      bar.style.transform = `scaleX(${p})`;
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive:true });
    addEventListener("resize", onScroll);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, []);
  return <div className="scroll-prog" ref={ref}></div>;
}

Object.assign(window, { CursorFX, ScrollProgress });

/* scroll parallax for [data-parallax] elements */
function useParallax(dep){
  useEffect(() => {
    const els = [...document.querySelectorAll("[data-parallax]")];
    if (!els.length) return;
    let raf = null;
    const update = () => {
      raf = null;
      const vh = innerHeight;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        const off = (r.top + r.height/2 - vh/2) / vh;     // ~ -0.6..0.6
        const speed = parseFloat(el.getAttribute("data-pspeed") || "14");
        el.style.transform = `translate3d(0, ${(off*speed).toFixed(2)}%, 0)`;
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive:true });
    addEventListener("resize", onScroll);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, [dep]);
}

window.useParallax = useParallax;
