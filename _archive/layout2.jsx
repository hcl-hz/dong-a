/* =====================================================================
   layout2.jsx — 시안2 "에디토리얼 / 다크 사이드바"
   완전히 다른 레이아웃: 교차 풀블리드 행 + 가로 뉴스 레일 + 인라인 통계 밴드
   + 적층 캠퍼스 밴드
   ===================================================================== */

/* ---------- 자랑거리 : alternating full-bleed editorial rows ---------- */
function PrideRows(){
  const D = window.DA;
  return (
    <section className="sec ed-pride" id="pride">
      <div className="wrap">
        <SectionHead index="01" eyebrow="SINCE 1947 · 개교 80주년" title="동아대는, <em>이런 대학입니다</em>" />
      </div>
      <div className="edp-rows">
        {D.pride.map((p,i)=>(
          <div className={`edp-row ${i%2?"rev":""}`} key={i} data-reveal={i%2?"right":"left"}>
            <div className="edp-media">
              <image-slot id={`ed-pride-${p.no}`} fit="cover" src={p.src} placeholder="이미지"></image-slot>
              <span className="edp-no">{p.no}</span>
            </div>
            <div className="edp-text">
              <span className="edp-kick"><Icon name={p.icon} size={18}/> {p.kicker}</span>
              <h3 className="edp-title">{p.title}</h3>
              <p className="edp-desc">{p.desc}</p>
              <a className="edp-link" href="#" data-cursor>자세히 보기 <Icon name="arrow-right" size={16}/></a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 동아뉴스 : horizontal scroll rail ---------- */
function NewsRail(){
  const D = window.DA;
  const railRef = useDragScroll();
  const pausedRef = useRef(false);
  const by = (d)=>{ const el=railRef.current; if(el) el.scrollBy({left:d*360,behavior:"smooth"}); };
  useEffect(()=>{ scheduleIcons(); });

  // 3s auto-advance to the left, loop back to start
  useEffect(()=>{
    const t = setInterval(()=>{
      const el = railRef.current; if(!el || pausedRef.current) return;
      const card = el.querySelector(".ed-card");
      const step = card ? card.getBoundingClientRect().width + 24 : 384;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8){
        el.scrollTo({ left:0, behavior:"smooth" });
      } else {
        el.scrollBy({ left:step, behavior:"smooth" });
      }
    }, 3000);
    return ()=>clearInterval(t);
  },[]);

  // highlight the card closest to the rail's horizontal center
  useEffect(()=>{
    const el = railRef.current; if(!el) return;
    let raf=null;
    const update=()=>{
      raf=null;
      const r=el.getBoundingClientRect();
      const cx=r.left+r.width/2;
      [...el.children].forEach(card=>{
        const cr=card.getBoundingClientRect();
        const dist=Math.abs(cr.left+cr.width/2-cx);
        card.classList.toggle("center", dist < cr.width*0.55);
      });
    };
    const onScroll=()=>{ if(!raf) raf=requestAnimationFrame(update); };
    update();
    el.addEventListener("scroll", onScroll, {passive:true});
    window.addEventListener("resize", onScroll);
    const t=setTimeout(update,300);
    return ()=>{ el.removeEventListener("scroll",onScroll); window.removeEventListener("resize",onScroll); clearTimeout(t); };
  },[]);
  return (
    <section className="sec ed-news" id="news">
      <div className="wrap ed-news-head">
        <SectionHead index="02" eyebrow="DONG-A NEWS" title="지금, <em>동아</em>에서는" />
        <div className="ed-arrows" data-reveal="right">
          <button onClick={()=>by(-1)} data-cursor aria-label="이전"><Icon name="arrow-left" size={20}/></button>
          <button onClick={()=>by(1)} data-cursor aria-label="다음"><Icon name="arrow-right" size={20}/></button>
        </div>
      </div>
      <div className="ed-rail" ref={railRef}
           onMouseEnter={()=>{pausedRef.current=true;}}
           onMouseLeave={()=>{pausedRef.current=false;}}>
        {D.news.map((n,i)=>(
          <a className="ed-card shine" href="#" key={i} data-cursor>
            <div className="ed-card-img"><image-slot id={`ed-news-${i}`} fit="cover" src={n.src} placeholder="뉴스"></image-slot></div>
            <div className="ed-card-body">
              <span className="ed-cat">{n.cat}</span>
              <h4>{n.title}</h4>
              <div className="ed-date">{n.date}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ---------- 통계 : inline horizontal band ---------- */
function StatChip({ s }){
  const [ref, val] = useCountUp(s.value, { comma: s.comma });
  return (
    <div className="eds-item">
      <div className="eds-num" ref={ref}>{val}<i>{s.suffix}</i></div>
      <div className="eds-label">{s.label}</div>
      <div className="eds-sub">{s.sub}</div>
    </div>
  );
}
function StatsBand(){
  const D = window.DA;
  return (
    <section className="sec ed-stats" id="stats">
      <div className="wrap">
        <div className="eds-band" data-reveal="up">
          {D.stats.map((s,i)=><StatChip key={i} s={s} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------- 캠퍼스 : stacked full-bleed bands ---------- */
function CampusStack(){
  const D = window.DA;
  return (
    <section className="sec ed-campus" id="campus">
      <div className="wrap"><SectionHead index="04" eyebrow="CAMPUS" title="하나의 동아, <em>세 개의 캠퍼스</em>" /></div>
      <div className="edc-stack">
        {D.campuses.map((c,i)=>(
          <div className="edc-band" key={i} data-cursor data-reveal={i%2?"wipeR":"wipeL"}>
            <div className="edc-bg" data-parallax data-pspeed="18"><image-slot id={`ed-camp-${i}`} fit="cover" src={c.src} placeholder={`${c.name}`}></image-slot></div>
            <div className="edc-grad"></div>
            <div className="wrap edc-inner">
              <span className="edc-no">CAMPUS 0{i+1}</span>
              <h3 className="edc-name">{c.name}</h3>
              <p className="edc-role">{c.role}</p>
              <div className="edc-addr"><Icon name="map-pin" size={15}/> {c.addr}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 바로가기 : B 전용 — 에디토리얼 넘버드 리스트 ---------- */
function QuickList(){
  const D = window.DA;
  useEffect(()=>{ scheduleIcons(); });
  return (
    <section className="sec ed-quick" id="quick">
      <div className="wrap">
        <SectionHead index="06" eyebrow="QUICK LINKS" title="자주 찾는 <em>바로가기</em>" />
        <div className="eq-list" data-stagger="up">
          {D.quick.map((q,i)=>(
            <a className="eq-row" href="#" key={i} data-cursor>
              <span className="eq-num">{String(i+1).padStart(2,"0")}</span>
              <span className="eq-ic"><Icon name={q.icon} size={22} stroke={1.8}/></span>
              <span className="eq-label">{q.label}</span>
              <span className="eq-go"><Icon name="arrow-right" size={20}/></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 시안2 composition ---------- */
function Layout2(){
  return (
    <main className="main main-ed">
      <Hero />
      <Ticker />
      <PrideRows />
      <NewsRail />
      <StatsBand />
      <CampusStack />
      <QuickList />
      <Footer />
    </main>
  );
}

Object.assign(window, { Layout2 });
