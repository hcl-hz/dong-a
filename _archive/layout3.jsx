/* =====================================================================
   layout3.jsx — 시안3 "벤토 모듈러 / 플로팅 사이드바"
   완전히 다른 레이아웃: 모든 콘텐츠를 하나의 모듈러 그리드 모자이크로
   ===================================================================== */

function BentoStat({ s }){
  const [ref, val] = useCountUp(s.value, { comma: s.comma });
  return (
    <div className="bt bt-stat" data-cursor>
      <div className="bt-num" ref={ref}>{val}<i>{s.suffix}</i></div>
      <div className="bt-slabel">{s.label}</div>
      <div className="bt-ssub">{s.sub}</div>
    </div>
  );
}

function Bento(){
  const D = window.DA;
  const feat = D.news[0];
  const noticeList = D.notices.slice(0,5);
  const gridRef = useRef(null);
  useEffect(()=>{ scheduleIcons(); });
  useEffect(()=>{
    const grid = gridRef.current; if(!grid || window.matchMedia("(pointer:coarse)").matches) return;
    let cur = null;
    const onMove = (e)=>{
      const r = grid.getBoundingClientRect();
      grid.style.setProperty("--sx",(e.clientX-r.left)+"px");
      grid.style.setProperty("--sy",(e.clientY-r.top)+"px");
      grid.classList.add("lit");
      const tile = e.target.closest(".bt");
      if(cur && cur!==tile){ cur.style.transform=""; cur=null; }
      if(tile){
        const tr = tile.getBoundingClientRect();
        const px = (e.clientX-tr.left)/tr.width - 0.5;
        const py = (e.clientY-tr.top)/tr.height - 0.5;
        tile.style.transform = `perspective(900px) rotateY(${px*5}deg) rotateX(${-py*5}deg) translateY(-5px)`;
        cur = tile;
      }
    };
    const onLeave = ()=>{ grid.classList.remove("lit"); if(cur){ cur.style.transform=""; cur=null; } };
    grid.addEventListener("mousemove", onMove);
    grid.addEventListener("mouseleave", onLeave);
    return ()=>{ grid.removeEventListener("mousemove", onMove); grid.removeEventListener("mouseleave", onLeave); };
  },[]);
  return (
    <section className="sec bento" id="bento">
      <div className="wrap">
        <SectionHead index="01" eyebrow="DONG-A AT A GLANCE" title="한눈에 보는 <em>동아대학교</em>" />
        <div className="bento-grid" ref={gridRef} data-stagger="scale">
          <div className="bento-spot"></div>

          {/* featured news — large */}
          <a className="bt bt-news shine" href="#" data-cursor>
            <div className="bt-news-img"><image-slot id="bt-news" fit="cover" src={feat.src} placeholder="대표뉴스"></image-slot></div>
            <div className="bt-news-grad"></div>
            <div className="bt-news-body">
              <span className="bt-badge">{feat.cat}</span>
              <h3>{feat.title}</h3>
              <div className="bt-date">{feat.date}</div>
            </div>
          </a>

          {/* pride 01 */}
          <a className="bt bt-pride p1" href="#" data-cursor>
            <div className="bt-pr-bg"><image-slot id="bt-pr1" fit="cover" src={D.pride[0].src} placeholder="이미지"></image-slot></div>
            <div className="bt-pr-in">
              <span className="bt-ic"><Icon name={D.pride[0].icon} size={24}/></span>
              <div>
                <span className="bt-kick">{D.pride[0].kicker}</span>
                <h4>{D.pride[0].title}</h4>
              </div>
            </div>
          </a>

          {/* two stats */}
          <BentoStat s={D.stats[2]} />
          <BentoStat s={D.stats[1]} />

          {/* notice list */}
          <div className="bt bt-notice" data-cursor>
            <div className="bt-h"><Icon name="bell" size={17}/> 대학공지</div>
            <ul>
              {noticeList.map((n,i)=>(
                <li key={i}><span className={`bt-tag ${n.cat}`}>{n.cat}</span><p>{n.title}</p></li>
              ))}
            </ul>
          </div>

          {/* pride 02 */}
          <a className="bt bt-pride p2" href="#" data-cursor>
            <div className="bt-pr-bg"><image-slot id="bt-pr2" fit="cover" src={D.pride[1].src} placeholder="이미지"></image-slot></div>
            <div className="bt-pr-in">
              <span className="bt-ic"><Icon name={D.pride[1].icon} size={24}/></span>
              <div>
                <span className="bt-kick">{D.pride[1].kicker}</span>
                <h4>{D.pride[1].title}</h4>
              </div>
            </div>
          </a>

          {/* campus image */}
          <a className="bt bt-campus shine" href="#" data-cursor>
            <div className="bt-cam-bg"><image-slot id="bt-cam" fit="cover" src={D.campuses[0].src} placeholder="캠퍼스"></image-slot></div>
            <div className="bt-cam-grad"></div>
            <div className="bt-cam-body"><span>CAMPUS</span><h4>승학캠퍼스</h4></div>
          </a>

          {/* quick links */}
          <div className="bt bt-quick">
            <div className="bt-h"><Icon name="grid-3x3" size={17}/> 바로가기</div>
            <div className="bt-qgrid">
              {D.quick.slice(0,6).map((q,i)=>(
                <a key={i} href="#" data-cursor><span className="bt-q-ic"><Icon name={q.icon} size={20}/></span>{q.label}</a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ---------- 캠퍼스 : C 전용 — 탭 스위처 + 썸네일 ---------- */
function CampusSwitch(){
  const D = window.DA;
  const [sel, setSel] = useState(0);
  const cur = D.campuses[sel];
  useEffect(()=>{ scheduleIcons(); },[sel]);
  return (
    <section className="sec camp-sw" id="campus">
      <div className="wrap">
        <SectionHead index="02" eyebrow="CAMPUS" title="하나의 동아, <em>세 개의 캠퍼스</em>" />
        <div className="csw" data-reveal="up">
          {/* tabs */}
          <div className="csw-tabs">
            {D.campuses.map((c,i)=>(
              <button key={i} className={`csw-tab ${sel===i?"on":""}`} onClick={()=>setSel(i)} data-cursor>
                <span className="csw-thumb"><image-slot id={`csw-th-${i}`} fit="cover" src={c.src} placeholder=""></image-slot></span>
                <span className="csw-tinfo">
                  <span className="csw-tname">{c.name}</span>
                  <span className="csw-trole">{c.role}</span>
                </span>
                <span className="csw-tgo"><Icon name="arrow-right" size={16}/></span>
                <span className="csw-tprog"></span>
              </button>
            ))}
          </div>
          {/* stage */}
          <div className="csw-stage">
            {D.campuses.map((c,i)=>(
              <div className={`csw-layer ${sel===i?"on":""}`} key={i}>
                <image-slot id={`csw-${i}`} fit="cover" src={c.src} placeholder={c.name}></image-slot>
              </div>
            ))}
            <div className="csw-grad"></div>
            <div className="csw-info" key={sel}>
              <span className="csw-tag">CAMPUS 0{sel+1}</span>
              <h3 className="csw-name">{cur.name}</h3>
              <p className="csw-role">{cur.role}</p>
              <div className="csw-addr"><Icon name="map-pin" size={15}/> {cur.addr}</div>
              <a className="csw-link" href="#" data-cursor>캠퍼스맵 보기 <Icon name="arrow-up-right" size={16}/></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 시안3 composition ---------- */
function Layout3(){
  return (
    <main className="main main-bento">
      <Hero />
      <Ticker />
      <Bento />
      <CampusSwitch />
      <Footer />
    </main>
  );
}

Object.assign(window, { Bento, CampusSwitch, Layout3 });
