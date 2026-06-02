/* =====================================================================
   hero-d.jsx — 시안D (BFC형) 히어로
   영상 배경 + 중앙 대형 "DONG-A UNIVERSITY" (글자 랜덤 하나씩 등장)
   완성되면 한글 서브 아래→위 / 하단 통계 카운터
   ===================================================================== */
function HeroD(){
  const D = window.DA;
  const full = "DONG-A UNIVERSITY";
  const chars = full.split("");
  const [shown, setShown] = useState(()=>new Set());
  const [done, setDone] = useState(false);

  useEffect(()=>{
    // shuffle non-space indices
    const idxs = chars.map((c,i)=>i).filter(i=>chars[i] !== " ");
    for (let i=idxs.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [idxs[i],idxs[j]]=[idxs[j],idxs[i]]; }
    let k = 0;
    const set = new Set();
    // spaces visible immediately
    chars.forEach((c,i)=>{ if(c===" ") set.add(i); });
    setShown(new Set(set));
    const t = setInterval(()=>{
      if (k >= idxs.length){ clearInterval(t); setTimeout(()=>setDone(true), 260); return; }
      set.add(idxs[k]); k++;
      setShown(new Set(set));
    }, 130);
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{ scheduleIcons(); });

  return (
    <section className="hero hd" id="top">
      <div className="hd-media">
        <video className="hd-video" src={D.heroVideo} autoPlay loop muted playsInline></video>
        <div className="hd-scrim"></div>
        <div className="hd-sweep"></div>
      </div>

      <div className="hd-center">
        <h1 className="hd-title" aria-label={full}>
          {chars.map((c,i)=>(
            <span key={i} className={`hd-ch ${shown.has(i)?"on":""}`}>
              {c===" " ? "\u00A0" : c}
            </span>
          ))}
        </h1>
        <span className={`hd-eyebrow ${done?"on":""}`}>부산을 넘어 세계로, 도전과 혁신의 80년</span>
      </div>

      <HeroDNotices />
    </section>
  );
}
window.HeroD = HeroD;

/* ---------- 하단 공지사항 자동 슬라이드 (파랑/흰 교차 카드) ---------- */
function HeroDNotices(){
  const notices = window.DA.heroNotices;
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const pausedRef = useRef(false);

  // 카드별 반투명 원 설정 (위치 + 움직임 랜덤, 렌더 간 고정)
  const orbs = useRef(notices.map(()=>({
    top: 8 + Math.random()*60,
    left: 6 + Math.random()*70,
    size: 90 + Math.random()*110,
    dur: 5 + Math.random()*5,
    dx: (Math.random()*2-1)*30,
    dy: (Math.random()*2-1)*26,
    delay: -Math.random()*5,
  }))).current;

  const scrollToIdx = (n)=>{
    const el = trackRef.current; if(!el) return;
    const card = el.querySelector(".hdn-card");
    const cardW = card ? card.getBoundingClientRect().width + 16 : 320;
    el.scrollTo({ left: n * cardW, behavior:"smooth" });
  };

  useEffect(()=>{ scheduleIcons(); });

  // 3s 자동 진행, 한 칸씩, 끝나면 처음으로
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
    <div className="hdn"
         onMouseEnter={()=>{pausedRef.current=true;}}
         onMouseLeave={()=>{pausedRef.current=false;}}>
      <div className="hdn-head">
        <div className="hdn-htext">
          <h2>공지사항</h2>
          <span><b>{notices.length}</b>건의 공지가 진행 중입니다</span>
        </div>
        <div className="hdn-ctrl">
          <span className="hdn-page">{String(idx+1).padStart(2,"0")} <s>/ {String(notices.length).padStart(2,"0")}</s></span>
          <button onClick={()=>go(-1)} data-cursor aria-label="이전"><Icon name="chevron-left" size={20}/></button>
          <button onClick={()=>go(1)} data-cursor aria-label="다음"><Icon name="chevron-right" size={20}/></button>
        </div>
      </div>
      <div className="hdn-track" ref={(el)=>{ trackRef.current=el; if(drag) drag.current=el; }}>
        {notices.map((n,i)=>{
          const o = orbs[i];
          return (
          <a className={`hdn-card ${i%2 ? "alt" : ""}`} href="#" key={i} data-cursor
             style={{ "--in-delay": (3.0 + i*0.09) + "s" }}>
            <span className="hdn-orb" style={{
              top:o.top+"%", left:o.left+"%", width:o.size+"px", height:o.size+"px",
              "--dx":o.dx+"px", "--dy":o.dy+"px",
              animationDuration:o.dur+"s", animationDelay:o.delay+"s"
            }}></span>
            <h3 className="hdn-title">{n.title}</h3>
            <p className="hdn-desc">{n.desc}</p>
            <div className="hdn-range">{n.from} ~ {n.to}</div>
            <span className="hdn-arrow"><Icon name="arrow-up-right" size={18}/></span>
          </a>
          );
        })}
      </div>
    </div>
  );
}
