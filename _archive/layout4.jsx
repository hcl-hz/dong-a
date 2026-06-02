/* =====================================================================
   layout4.jsx — 시안D (BFC형) 섹션들
   대학공지(알림마당) / 마키 / 주요사업(자랑거리) / 로케이션 / 소셜 / 푸터
   + 우측 플로팅 도크
   ===================================================================== */

/* ---------- 섹션 헤더 (영문 키커 + 큰 타이틀, 아래→위) ---------- */
function SecHeadD({ kicker, title, sub }){
  return (
    <div className="d-head">
      <div className="d-head-row" data-reveal="up">
        <span className="d-dot"></span>
        <h2 className="d-title">{title}</h2>
      </div>
      {sub && <p className="d-sub" data-reveal="up">{sub}</p>}
    </div>
  );
}

/* ---------- 01 대학공지 (알림마당식, 풀폭 카드 슬라이드) ---------- */
function NoticeD(){
  const D = window.DA;
  const tabs = ["전체","공지사항","학사공지","장학공지","행사모집","채용"];
  const [tab, setTab] = useState("전체");
  const railRef = useDragScroll();
  const pausedRef = useRef(false);
  useEffect(()=>{ scheduleIcons(); },[tab]);
  const list = (tab==="전체" ? D.notices : D.notices.filter(n=>n.cat===tab));

  const by = (d)=>{ const el=railRef.current; if(!el) return;
    const card=el.querySelector(".dn-card"); const step=card?card.getBoundingClientRect().width+18:340;
    el.scrollBy({left:d*step,behavior:"smooth"}); };

  // 3s auto-advance, loop
  useEffect(()=>{
    const t=setInterval(()=>{
      const el=railRef.current; if(!el||pausedRef.current) return;
      const card=el.querySelector(".dn-card"); const step=card?card.getBoundingClientRect().width+18:340;
      if(el.scrollLeft+el.clientWidth>=el.scrollWidth-8) el.scrollTo({left:0,behavior:"smooth"});
      else el.scrollBy({left:step,behavior:"smooth"});
    },3000);
    return ()=>clearInterval(t);
  },[tab]);

  return (
    <section className="sec d-notice" id="notice">
      <div className="wrap">
        <SecHeadD kicker="NOTICE" title="대학공지" sub="동아대학교의 새로운 소식을 알려드립니다." />
        <div className="dn-bar" data-reveal="left">
          <div className="dn-tabs">
            {tabs.map(t=>(
              <button key={t} className={`dn-tab ${tab===t?"on":""}`} onClick={()=>setTab(t)} data-cursor>{t}</button>
            ))}
          </div>
          <div className="dn-arrows">
            <button onClick={()=>by(-1)} data-cursor aria-label="이전"><Icon name="chevron-left" size={18}/></button>
            <button onClick={()=>by(1)} data-cursor aria-label="다음"><Icon name="chevron-right" size={18}/></button>
          </div>
        </div>
        <div className="dn-rail" ref={railRef} data-reveal="left"
             onMouseEnter={()=>{pausedRef.current=true;}} onMouseLeave={()=>{pausedRef.current=false;}}>
          {list.map((n,i)=>(
            <a className="dn-card" href="#" key={n.title} data-cursor>
              <span className={`dn-cat ${n.cat}`}>{n.cat}</span>
              <h4 className="dn-ctitle">{n.title}</h4>
              <p className="dn-cdesc">{n.desc}</p>
              <div className="dn-cfoot">
                <span className="dn-date">{n.date}</span>
                <span className="dn-go"><Icon name="arrow-right" size={16}/></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 마키 밴드 (옅은 회색) ---------- */
function MarqueeD(){
  const t = "DONG-A UNIVERSITY";
  return (
    <div className="d-marq">
      <div className="d-marq-row">
        {Array.from({length:8}).map((_,i)=><span key={i}>{t}</span>)}
      </div>
    </div>
  );
}

/* ---------- 02 WHY DONG-A (에디토리얼: 예비 신입생 어필) ---------- */
function WhyDongaD(){
  const D = window.DA;
  const items = D.pride;
  const [alumniRef, alumni] = useCountUp(136000, { comma:true });
  useEffect(()=>{ scheduleIcons(); });
  return (
    <section className="sec d-why" id="works">
      <div className="wrap">
        {/* 거대 헤드라인 */}
        <div className="why-top">
          <span className="why-kicker" data-reveal="up">WHY DONG-A</span>
          <h2 className="why-mega" data-reveal="up">당신의 <em>4년</em>이<br/>달라지는 이유</h2>
        </div>

        {/* 에디토리얼 2단 */}
        <div className="why-edit">
          <div className="why-photo" data-reveal="left">
            <image-slot id="why-main" fit="cover" src={window.IMG.aerial} placeholder="동아대학교 캠퍼스"></image-slot>
            <div className="why-photo-grad"></div>
            <span className="why-photo-cap"><b>SINCE 1947</b> 동아대학교 · 승학캠퍼스</span>
          </div>

          <div className="why-content" data-reveal="right">
            <p className="why-lead"><b>개교 80년, 13개 단과대학과 의료원을 갖춘 종합대학.</b> 1947년 개교 이래 13만 동문이 사회 곳곳에서 활약하는 영남 사학의 명문입니다.</p>
            <p className="why-body">글로컬대학30에 선정되어 정부 5년 1,000억 원 지원을 받으며, 부산 대전환을 이끄는 혁신 거점으로 도약하고 있습니다. 당신의 4년을 가장 든든하게 책임지겠습니다.</p>
            <p className="why-quote">Beyond Busan, Toward the World</p>

            <div className="why-net">
              <span className="why-net-ic"><Icon name="globe" size={22}/></span>
              <div className="why-net-tx"><b>30<i>+</i> 해외 협력 대학</b><span>Global Network · Over the World</span></div>
              <span className="why-net-flags"><s>KOR</s><s>JPN</s><s>USA</s><s>CHN</s></span>
            </div>

            <div className="why-cards">
              <div className="why-c1" ref={alumniRef} data-cursor>
                <span className="wc1-num">{alumni}<i>+</i></span>
                <span className="wc1-lab">누적 졸업생 · 동문</span>
                <div className="wc1-tags">
                  {D.family.slice(0,6).map((f,i)=>(<span key={i}>{f}</span>))}
                </div>
              </div>
              <a className="why-c2" href="#life" data-cursor>
                <image-slot id="why-life" fit="cover" src={window.IMG.brickNight} placeholder="캠퍼스 라이프"></image-slot>
                <div className="why-c2-grad"></div>
                <span className="why-c2-top">CAMPUS LIFE <s>02 / 04</s></span>
                <div className="why-c2-cap">
                  <h4>동아 캠퍼스 라이프</h4>
                  <span>학생의 모든 순간을 함께</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* 핵심 강점 4선 카드 */}
        <div className="why-pride" data-stagger="up">
          {items.map((it,i)=>(
            <a className="wp-card" href="#" key={i} data-cursor>
              <span className="wp-no">{it.no}</span>
              <span className="wp-icn"><Icon name={it.icon} size={26}/></span>
              <span className="wp-tag">{it.kicker}</span>
              <h3 className="wp-h">{it.title}</h3>
              <p className="wp-d">{it.desc}</p>
              <span className="wp-arrow"><Icon name="arrow-up-right" size={18}/></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- (구) 동아대학교 소개 시네마틱 — 미사용 ---------- */
function AboutD(){
  const D = window.DA;
  const secRef = useRef(null);
  const stRef = useRef(null);
  useEffect(()=>{
    const sec = secRef.current, st = stRef.current;
    if(!sec || !st) return;
    let raf=null;
    const ss=(p,a,b)=>Math.max(0,Math.min(1,(p-a)/(b-a)));
    const update=()=>{ raf=null;
      const total = sec.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-sec.getBoundingClientRect().top,0), total);
      const p = total>0 ? scrolled/total : 0;
      st.style.setProperty("--p", p.toFixed(3));
      st.style.setProperty("--img", ss(p,0,0.42).toFixed(3));
      st.style.setProperty("--intro", (1-ss(p,0.26,0.42)).toFixed(3));
      st.style.setProperty("--l1", ss(p,0.40,0.52).toFixed(3));
      st.style.setProperty("--l2", ss(p,0.50,0.62).toFixed(3));
      st.style.setProperty("--l3", ss(p,0.60,0.72).toFixed(3));
      st.style.setProperty("--lo", ss(p,0.78,0.88).toFixed(3));
      st.style.setProperty("--st", ss(p,0.82,0.96).toFixed(3));
    };
    const onScroll=()=>{ if(!raf) raf=requestAnimationFrame(update); };
    update();
    addEventListener("scroll",onScroll,{passive:true});
    addEventListener("resize",onScroll);
    return ()=>{ removeEventListener("scroll",onScroll); removeEventListener("resize",onScroll); };
  },[]);
  return (
    <section className="sec d-story" id="works" ref={secRef}>
      <div className="story-sticky" ref={stRef}>
        <div className="story-bg"><image-slot id="story-bg" fit="cover" src={D.campuses[0].src} placeholder="캠퍼스 전경"></image-slot></div>
        <div className="story-scrim"></div>
        <div className="story-intro">
          <span className="si-eyebrow">DONG-A UNIVERSITY<br/>SINCE 1947</span>
        </div>
        <div className="story-lines">
          <span className="s-line l1">도전과 혁신의</span>
          <span className="s-line l2"><b>80년</b>을 넘어</span>
          <span className="s-line l3">내일의 가치에 투자합니다</span>
        </div>
        <div className="story-stats">
          <img className="ss-emblem" src={D.brand.emblem} alt="동아대학교" />
          <span className="ss-word">DONG-A UNIVERSITY</span>
          <span className="ss-kr">동아대학교 · 부산을 넘어 세계로</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- 03 동아 캠퍼스 라이프 (가로 스크롤 패널) ---------- */
function CampusLifeD(){
  const D = window.DA;
  const secRef = useRef(null);
  const trackRef = useRef(null);
  useEffect(()=>{ scheduleIcons(); });
  useEffect(()=>{
    const sec = secRef.current, track = trackRef.current;
    if(!sec || !track) return;
    let raf=null;
    const update=()=>{ raf=null;
      const total = sec.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-sec.getBoundingClientRect().top,0), total);
      const p = total>0 ? scrolled/total : 0;
      const maxX = Math.max(0, track.scrollWidth - window.innerWidth);
      track.style.transform = `translateX(${(-p*maxX).toFixed(1)}px)`;
    };
    const onScroll=()=>{ if(!raf) raf=requestAnimationFrame(update); };
    update();
    addEventListener("scroll",onScroll,{passive:true});
    addEventListener("resize",onScroll);
    return ()=>{ removeEventListener("scroll",onScroll); removeEventListener("resize",onScroll); };
  },[]);
  useEffect(()=>{
    const io = new IntersectionObserver((es)=>es.forEach(e=>{ e.target.classList.toggle("in", e.isIntersecting); }),{threshold:0.28});
    const els = secRef.current ? secRef.current.querySelectorAll(".cl-intro,.cl-panel") : [];
    els.forEach(el=>io.observe(el));
    return ()=>io.disconnect();
  },[]);
  return (
    <section className="sec d-cl" id="life" ref={secRef}>
      <div className="cl-sticky">
        <div className="cl-track" ref={trackRef}>
          <div className="cl-intro">
            <span className="cl-dot"></span>
            <h2 className="cl-bigtitle">동아 캠퍼스 라이프</h2>
            <div className="cl-vtag">학생의 모든 순간을 함께하는 동아대학교</div>
            <span className="cl-hint"><Icon name="arrow-right" size={18}/> SCROLL</span>
          </div>
          {D.campusLife.map((c,i)=>(
            <article className={`cl-panel lay-${i%3}`} key={i} data-cursor>
              <span className="cl-line"></span>
              <span className="cl-no">{c.no}</span>
              <div className="cl-img"><image-slot id={`cl-${i}`} fit="cover" src={c.src} placeholder={c.kr}></image-slot></div>
              <div className="cl-body">
                <span className="cl-en">{c.en}</span>
                <h3 className="cl-kr">{c.kr}</h3>
                <p className="cl-desc">{c.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function CampusStackD(){
  const D = window.DA;
  return (
    <section className="sec d-cstack" id="location">
      <div className="wrap">
        <SecHeadD kicker="CAMPUS" title="하나의 동아, 세 개의 캠퍼스" sub="승학·부민·구덕, 동아대학교의 세 캠퍼스를 스크롤하며 만나보세요." />
      </div>
      <div className="cst-wrap">
        {D.campuses.map((c,i)=>(
          <div className="cst-card" key={i} style={{ top: `calc(14vh + ${i*26}px)`, zIndex: i+1 }} data-cursor>
            <div className="cst-bg"><image-slot id={`cst-${i}`} fit="cover" src={c.src} placeholder={c.name}></image-slot></div>
            <div className="cst-grad"></div>
            <div className="cst-in">
              <span className="cst-no">CAMPUS 0{i+1}</span>
              <h3 className="cst-name">{c.name}</h3>
              <p className="cst-role">{c.role}</p>
              <div className="cst-addr"><Icon name="map-pin" size={15}/> {c.addr}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 우측 플로팅 도크 ---------- */
function RightDock(){
  const items = [
    { icon:"map-pin", label:"캠퍼스맵" },
    { icon:"book-open", label:"도서관" },
    { icon:"file-badge", label:"증명발급" },
  ];
  useEffect(()=>{ scheduleIcons(); });
  const top = ()=>window.scrollTo({top:0,behavior:"smooth"});
  return (
    <div className="d-dock">
      {items.map((it,i)=>(
        <a key={i} href="#" className="d-dock-btn" data-cursor>
          <Icon name={it.icon} size={20}/><span>{it.label}</span>
        </a>
      ))}
      <button className="d-dock-top" onClick={top} data-cursor><Icon name="arrow-up" size={18}/><span>TOP</span></button>
    </div>
  );
}

/* ---------- 새 푸터 (D 전용) ---------- */
function FooterD(){
  const D = window.DA;
  const policy = ["개인정보처리방침","입찰정보","예·결산 공고","등록금 납부안내","찾아오시는 길"];
  return (
    <footer className="d-foot">
      <div className="wrap">
        <div className="df-policy">
          {policy.map((p,i)=><a key={i} href="#" data-cursor>{p}</a>)}
        </div>
        <div className="df-main">
          <div className="df-info">
            <img src={D.brand.logo} alt="동아대학교" className="df-logo" />
            <div className="df-addr">
              <p><b>승학캠퍼스(대학본부)</b><br/>(49315) 부산 사하구 낙동대로550번길 37 (하단동) TEL : 051-200-6114</p>
              <p><b>구덕캠퍼스</b><br/>(49201) 부산시 서구 대신공원로 32(동대신동 3가)</p>
              <p><b>부민캠퍼스</b><br/>(49236) 부산시 서구 구덕로 225(부민동 2가)</p>
            </div>
          </div>
          <div className="df-selects">
            <button className="df-sel" data-cursor>DAU Links <Icon name="chevron-down" size={16}/></button>
            <button className="df-sel" data-cursor>대학 <Icon name="chevron-down" size={16}/></button>
            <button className="df-sel" data-cursor>대학원 <Icon name="chevron-down" size={16}/></button>
            <button className="df-sel" data-cursor>온라인서비스 <Icon name="chevron-down" size={16}/></button>
            <button className="df-sel" data-cursor>주요사이트 <Icon name="chevron-down" size={16}/></button>
          </div>
        </div>
        <div className="df-copy">COPYRIGHT(C) 2026 DONG-A UNIVERSITY ALLRIGHTS RESERVED.</div>
      </div>
    </footer>
  );
}

/* ---------- 04 대학공지 (게시판형: 피처 카드 + 카드 그리드) ---------- */
function NoticeListD(){
  const D = window.DA;
  const tabs = ["전체","공지사항","학사공지","장학공지","행사모집","채용"];
  const [tab,setTab] = useState("전체");
  useEffect(()=>{ scheduleIcons(); },[tab]);
  const list = (tab==="전체" ? D.notices : D.notices.filter(n=>n.cat===tab));
  const feat = list[0];
  const rest = list.slice(1, 7);
  return (
    <section className="sec d-nl" id="notice">
      <div className="wrap">
        <div className="nl-bar">
          <h2 className="nl-title" data-reveal="up"><span className="nl-dot"></span>대학 공지</h2>
          <div className="nl-tabs" data-reveal="up">
            {tabs.map(t=>(<button key={t} className={tab===t?"on":""} onClick={()=>setTab(t)} data-cursor>{t}</button>))}
          </div>
        </div>
        {feat ? (
        <div className="nl-board" key={tab}>
          <a className="nl-feat" href="#" data-cursor style={{"--d":0}}>
            <span className="nlf-badge">{feat.cat}</span>
            <span className="nlf-tag">최신 공지 · LATEST</span>
            <h3 className="nlf-tit">{feat.title}</h3>
            <p className="nlf-desc">{feat.desc}</p>
            <div className="nlf-foot">
              <span className="nlf-date">{feat.date}</span>
              <span className="nlf-go">자세히 보기 <Icon name="arrow-right" size={17}/></span>
            </div>
            <span className="nlf-watermark">NOTICE</span>
          </a>
          <div className="nl-cards">
            {rest.map((n,i)=>(
              <a className="nl-card" href="#" key={i} data-cursor style={{"--d":i+1}}>
                <span className={`nlc-badge cat-${n.cat}`}>{n.cat}</span>
                <h4 className="nlc-tit">{n.title}</h4>
                <div className="nlc-foot">
                  <span className="nlc-date">{n.date}</span>
                  <span className="nlc-arrow"><Icon name="arrow-up-right" size={16}/></span>
                </div>
              </a>
            ))}
          </div>
        </div>
        ) : <div className="nl-empty">해당 분류의 공지가 없습니다.</div>}
      </div>
      <NewsCarouselD />
    </section>
  );
}

/* ---------- 04b 뉴스 자동 슬라이드 (흰 배경) ---------- */
function NewsCardD({ n, i }){
  const ref = useTilt(7);
  return (
    <a className="nc-card" href="#" ref={ref} data-cursor>
      <div className="nc-img">
        <image-slot id={`nc-${i}`} fit="cover" src={n.src} placeholder="뉴스"></image-slot>
        <span className="nc-shine"></span>
        <div className="nc-grad"></div>
        <span className={`nc-cat cat-${n.cat}`}>{n.cat}</span>
        <div className="nc-over">
          <div className="nc-date">{n.date}</div>
          <h4 className="nc-tit">{n.title}</h4>
          <span className="nc-more">자세히 보기 <Icon name="arrow-right" size={15}/></span>
        </div>
      </div>
    </a>
  );
}
function NewsCarouselD(){
  const D = window.DA;
  const items = [...D.news, ...D.news];
  const trackRef = useRef(null);
  const idxRef = useRef(0);
  const pausedRef = useRef(false);
  useEffect(()=>{ scheduleIcons(); });
  useEffect(()=>{
    const t = setInterval(()=>{
      const el = trackRef.current; if(!el || pausedRef.current) return;
      const card = el.querySelector(".nc-card"); const step = card ? card.getBoundingClientRect().width + 26 : 380;
      idxRef.current += 1;
      if (idxRef.current > D.news.length){ idxRef.current = 1; el.scrollTo({left:0,behavior:"auto"}); }
      el.scrollBy({left:step,behavior:"smooth"});
    }, 2800);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div className="wrap nc-wrap">
      <div className="nc-badge" aria-hidden="true">
        <svg viewBox="0 0 120 120" className="rotor">
          <defs><path id="ncCirc" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
          <text><textPath href="#ncCirc" startOffset="0" textLength="276">DONG-A UNIVERSITY · 동아뉴스 · </textPath></text>
        </svg>
      </div>
      <div className="nc" data-reveal="up"
           onMouseEnter={()=>{pausedRef.current=true;}} onMouseLeave={()=>{pausedRef.current=false;}}>
        <div className="nc-track" ref={trackRef}>
        {items.map((n,i)=>(<NewsCardD key={i} n={n} i={i} />))}
        </div>
      </div>
    </div>
  );
}

/* ---------- 시안D composition ---------- */
function Layout4(){
  return (
    <main className="main main-d">
      <HeroD />
      <WhyDongaD />
      <CampusLifeD />
      <NoticeListD />
      <FooterD />
      <RightDock />
    </main>
  );
}

Object.assign(window, { Layout4 });
