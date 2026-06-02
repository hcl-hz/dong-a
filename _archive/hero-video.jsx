/* =====================================================================
   hero-video.jsx — 시안A 전용: mp4 영상 배경 히어로 + 하단 공지 슬라이더
   파랑/흰 교차 카드 · 3초 1개씩 자동 루프 슬라이드
   ===================================================================== */
function HeroVideo(){
  const D = window.DA;
  const notices = D.heroNotices;
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const pausedRef = useRef(false);

  // random orb config per card (position + drift), stable across renders
  const orbs = useRef(notices.map(()=>({
    top: 12 + Math.random()*56,
    left: 8 + Math.random()*72,
    size: 70 + Math.random()*90,
    dur: 5 + Math.random()*5,
    dx: (Math.random()*2-1)*26,
    dy: (Math.random()*2-1)*22,
    delay: -Math.random()*5,
  }))).current;

  const scrollToIdx = (n)=>{
    const el = trackRef.current; if(!el) return;
    const first = el.firstChild ? el.firstChild.nextSibling || el.firstChild : null;
    const card = el.querySelector(".hv-card");
    const cardW = card ? card.getBoundingClientRect().width + 16 : 320;
    el.scrollTo({ left: n * cardW, behavior:"smooth" });
  };

  useEffect(()=>{ scheduleIcons(); });

  // 3s auto-advance, one card at a time, wrap to start
  useEffect(()=>{
    const t = setInterval(()=>{
      if (pausedRef.current) return;
      setIdx(p => { const np=(p+1)%notices.length; scrollToIdx(np); return np; });
    }, 3000);
    return ()=>clearInterval(t);
  }, [notices.length]);

  const go = (d)=>{ setIdx(p => { const np=(p+d+notices.length)%notices.length; scrollToIdx(np); return np; }); };
  const drag = useDragScroll();

  return (
    <section className="hero hv" id="top">
      <div className="hv-media">
        <video className="hv-video" src={D.heroVideo} autoPlay loop muted playsInline></video>
        <div className="hv-scrim"></div>
      </div>

      {/* right-center headline */}
      <div className="hv-copy">
        <span className="hv-copy-kicker">DONG-A UNIVERSITY</span>
        <h2 className="hv-copy-title">열린 미래,<br/><em>꿈이 있는</em> 대학</h2>
        <p className="hv-copy-sub">개교 80주년, 새로운 흐름의 중심에서</p>
      </div>

      {/* bottom notice slider */}
      <div className="hv-bottom"
           onMouseEnter={()=>{pausedRef.current=true;}}
           onMouseLeave={()=>{pausedRef.current=false;}}>
        <div className="hv-head">
          <div className="hv-htext">
            <h2>공지사항</h2>
            <span><b>{notices.length}</b>건의 공지가 진행 중입니다</span>
          </div>
          <div className="hv-ctrl">
            <span className="hv-page">{String(idx+1).padStart(2,"0")} <s>/ {String(notices.length).padStart(2,"0")}</s></span>
            <button onClick={()=>go(-1)} data-cursor aria-label="이전"><Icon name="chevron-left" size={20}/></button>
            <button onClick={()=>go(1)} data-cursor aria-label="다음"><Icon name="chevron-right" size={20}/></button>
          </div>
        </div>
        <div className="hv-track" ref={(el)=>{ trackRef.current=el; if(drag) drag.current=el; }}>
          {notices.map((n,i)=>{
            const o = orbs[i];
            return (
            <a className={`hv-card shine ${i%2 ? "alt" : ""}`} href="#" key={i} data-cursor>
              <span className="hv-orb" style={{
                top:o.top+"%", left:o.left+"%", width:o.size+"px", height:o.size+"px",
                "--dx":o.dx+"px", "--dy":o.dy+"px",
                animationDuration:o.dur+"s", animationDelay:o.delay+"s"
              }}></span>
              <span className="hv-num">{String(i+1).padStart(2,"0")}</span>
              <h3 className="hv-title">{n.title}</h3>
              <div className="hv-range">{n.from} ~ {n.to}</div>
              <span className="hv-arrow"><Icon name="arrow-up-right" size={18}/></span>
            </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
window.HeroVideo = HeroVideo;
