/* =====================================================================
   sec-news-stats.jsx — 동아뉴스(hover showcase) + 통계(counter glow)
   ===================================================================== */

/* ---------- Ticker / Marquee ---------- */
function Ticker(){
  const items = ["GLOCAL UNIVERSITY 30","열린 미래 꿈이 있는 대학","DONG-A DNA","도전과 혁신","부산을 넘어 세계로","13 COLLEGES · 3 CAMPUS"];
  const Row = ({rev}) => (
    <div className={`tick-row ${rev?"rev":""}`}>
      {[...items,...items].map((t,i)=><span key={i}>{t}<i className="tk-star">✦</i></span>)}
    </div>
  );
  return (
    <div className="ticker">
      <Row /><Row rev />
    </div>
  );
}

/* ---------- 동아뉴스 : hover-linked showcase ---------- */
function News(){
  const D = window.DA;
  const items = D.news;
  const [active, setActive] = useState(0);
  useEffect(()=>{ scheduleIcons(); },[active]);
  const cur = items[active];
  return (
    <section className="sec news2" id="news">
      <div className="wrap">
        <SectionHead index="01" eyebrow="DONG-A NEWS" title="지금, <em>동아</em>에서는" more="뉴스 전체보기" />
        <div className="news2-grid">
          {/* large preview */}
          <div className="news2-stage" data-reveal="left">
            {items.map((n,i)=>(
              <div className={`n2-layer ${i===active?"on":""}`} key={i}>
                <image-slot id={n.slot} fit="cover" src={n.src} placeholder={`동아뉴스 ${i+1} 이미지`}></image-slot>
              </div>
            ))}
            <div className="n2-grad"></div>
            <div className="n2-info" key={active}>
              <span className="n2-cat">{cur.cat}</span>
              <h3 className="n2-title">{cur.title}</h3>
              <div className="n2-meta"><span>{cur.date}</span><a href="#" data-cursor>기사 보기 <Icon name="arrow-up-right" size={16}/></a></div>
            </div>
            <div className="n2-index">{String(active+1).padStart(2,"0")}<s>/{String(items.length).padStart(2,"0")}</s></div>
          </div>
          {/* list */}
          <ul className="news2-list" data-stagger="right">
            {items.map((n,i)=>(
              <li key={i} className={`n2-row ${i===active?"on":""}`}
                  data-cursor
                  onMouseEnter={()=>setActive(i)} onClick={()=>setActive(i)}>
                <span className="n2-num">{String(i+1).padStart(2,"0")}</span>
                <div className="n2-rbody">
                  <span className="n2-rcat">{n.cat}</span>
                  <p>{n.title}</p>
                </div>
                <span className="n2-rdate">{n.date}</span>
                <span className="n2-bar"></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 통계 : counters + animated bars + mouse glow ---------- */
function StatItem({ s }){
  const [ref, val] = useCountUp(s.value, { comma: s.comma });
  return (
    <div className="stat2" data-cursor>
      <div className="s2-num" ref={ref}>{val}<i className="s2-suf">{s.suffix}</i></div>
      <div className="s2-bar"><span></span></div>
      <div className="s2-label">{s.label}</div>
      <div className="s2-sub">{s.sub}</div>
    </div>
  );
}
function Stats(){
  const D = window.DA;
  const glowRef = useRef(null);
  useEffect(()=>{
    const el = glowRef.current; if(!el) return;
    const onMove=(e)=>{const r=el.getBoundingClientRect();
      el.style.setProperty("--mx",(e.clientX-r.left)+"px");
      el.style.setProperty("--my",(e.clientY-r.top)+"px");};
    el.addEventListener("mousemove",onMove);
    return ()=>el.removeEventListener("mousemove",onMove);
  },[]);
  return (
    <section className="sec stats2" id="stats" ref={glowRef}>
      <div className="stats2-glow"></div>
      <div className="wrap">
        <div className="stats2-head">
          <div data-reveal="left">
            <div className="sec-eyebrow on"><em>02</em>BY THE NUMBERS</div>
            <h2 className="stats2-title">숫자로 보는 <em>동아대학교</em></h2>
          </div>
          <p className="stats2-lead" data-reveal="right">부산을 대표하는 종합대학,<br/>그 규모와 깊이를 데이터로 만나보세요.</p>
        </div>
        <div className="stats2-grid" data-stagger="up">
          {D.stats.map((s,i)=><StatItem key={i} s={s} />)}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Ticker, News, Stats });
