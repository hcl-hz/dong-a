/* =====================================================================
   sec-rest.jsx — 자랑거리(Pride) / 공지(Notices) / 캠퍼스 / 퀵메뉴 / 푸터
   (시안1 — 인터랙티브 사이드바 레이아웃용)
   ===================================================================== */

/* ---------- 동아대학교 자랑거리 (Pride) — A 전용 임팩트 레이아웃 ---------- */
function Pride(){
  const D = window.DA;
  const [active, setActive] = useState(0);
  useEffect(()=>{ scheduleIcons(); },[active]);
  const cur = D.pride[active];
  return (
    <section className="sec pride2" id="pride">
      <div className="wrap">
        <div className="prx">
          {/* left: bold statement + giant 80 */}
          <div className="prx-intro" data-reveal="left">
            <span className="prx-eyebrow">SINCE 1947 · 개교 80주년</span>
            <h2 className="prx-title">동아대는,<br/><em>이런 대학입니다</em></h2>
            <p className="prx-lead">1947년 개교 이래 80년. 부산을 대표하는 종합대학으로,
              지금 이 순간에도 새로운 길을 열어가고 있습니다.</p>
            <div className="prx-big"><b>80</b><span>YEARS<br/>1947–2027</span></div>
          </div>

          {/* right: featured stage + selectable list */}
          <div className="prx-main" data-reveal="right">
            <div className="prx-stage">
              {D.pride.map((p,i)=>(
                <div className={`prx-layer ${i===active?"on":""}`} key={i}>
                  <image-slot id={`pride-${p.no}`} fit="cover" src={p.src} placeholder="이미지"></image-slot>
                </div>
              ))}
              <div className="prx-stage-grad"></div>
              <div className="prx-stage-body" key={active}>
                <span className="prx-ic"><Icon name={cur.icon} size={28} stroke={1.7} /></span>
                <span className="prx-kick">{cur.kicker}</span>
                <h3 className="prx-st-title">{cur.title}</h3>
                <p className="prx-st-desc">{cur.desc}</p>
              </div>
            </div>
            <div className="prx-list">
              {D.pride.map((p,i)=>(
                <button key={i} className={`prx-item ${i===active?"on":""}`}
                        onMouseEnter={()=>setActive(i)} onClick={()=>setActive(i)} data-cursor>
                  <span className="prx-inum">{p.no}</span>
                  <span className="prx-iname">{p.title}</span>
                  <span className="prx-iarrow"><Icon name="arrow-up-right" size={16}/></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 대학공지 — A 전용 새 스타일 (번호 리스트 + NEW + featured) ---------- */
function Notices(){
  const D = window.DA;
  const tabs = ["전체","공지사항","학사공지","장학공지","행사모집","채용"];
  const [tab, setTab] = useState("전체");
  useEffect(()=>{ scheduleIcons(); },[tab]);
  const list = (tab==="전체" ? D.notices : D.notices.filter(n=>n.cat===tab));
  const feat = list[0];
  const rest = list.slice(1, 7);
  return (
    <section className="sec notice3" id="notice">
      <div className="wrap">
        <SectionHead index="03" eyebrow="NOTICE" title="대학<em>공지</em>" more="공지 전체보기" />
        <div className="n3-tabs" data-reveal="left">
          {tabs.map(t=>(
            <button key={t} className={`n3-tab ${tab===t?"on":""}`} onClick={()=>setTab(t)} data-cursor>{t}</button>
          ))}
        </div>
        <div className="n3-grid">
          {feat ? (
            <a className="n3-feat" href="#" data-cursor data-reveal="left">
              <span className={`n3-cat ${feat.cat}`}>{feat.cat}</span>
              <h3 className="n3-feat-title">{feat.title}</h3>
              <div className="n3-feat-foot">
                <span className="n3-date">{feat.date}</span>
                <span className="n3-feat-go">자세히 보기 <Icon name="arrow-right" size={16}/></span>
              </div>
              {feat.isNew && <span className="n3-new">NEW</span>}
            </a>
          ) : null}
          <ul className="n3-list" data-stagger="right">
            {rest.length ? rest.map((n,i)=>(
              <li key={i}>
                <a className="n3-row" href="#" data-cursor>
                  <span className={`n3-cat sm ${n.cat}`}>{n.cat}</span>
                  <p><span className="ptext">{n.title}</span>{n.isNew && <i className="n3-dot"></i>}</p>
                  <span className="n3-date">{n.date}</span>
                </a>
              </li>
            )) : <li className="n3-empty">해당 분류의 공지가 없습니다.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 캠퍼스 : A 전용 — 3D 플립 카드 ---------- */
function CampusFlip(){
  const D = window.DA;
  useEffect(()=>{ scheduleIcons(); });
  return (
    <section className="sec campus-flip" id="campus">
      <div className="wrap">
        <SectionHead index="04" eyebrow="CAMPUS" title="하나의 동아, <em>세 개의 캠퍼스</em>" more="캠퍼스맵" />
        <div className="cf-grid" data-stagger="up">
          {D.campuses.map((c,i)=>(
            <div className="cf-card" key={i} data-cursor tabIndex={0}>
              <div className="cf-inner">
                {/* front */}
                <div className="cf-face cf-front">
                  <div className="cf-bg"><image-slot id={`cf-${i}`} fit="cover" src={c.src} placeholder={c.name}></image-slot></div>
                  <div className="cf-front-grad"></div>
                  <div className="cf-front-body">
                    <span className="cf-no">CAMPUS 0{i+1}</span>
                    <h3 className="cf-name">{c.name}</h3>
                    <span className="cf-hint"><Icon name="repeat" size={14}/> 마우스를 올려보세요</span>
                  </div>
                </div>
                {/* back */}
                <div className="cf-face cf-back">
                  <span className="cf-bno">0{i+1}</span>
                  <h3 className="cf-bname">{c.name}</h3>
                  <p className="cf-brole">{c.role}</p>
                  <div className="cf-baddr"><Icon name="map-pin" size={15}/> {c.addr}</div>
                  <a className="cf-blink" href="#" data-cursor>캠퍼스 둘러보기 <Icon name="arrow-right" size={15}/></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 캠퍼스 : 가로 확장 패널 (legacy, unused) ---------- */
function Campuses(){
  const D = window.DA;
  const [open, setOpen] = useState(0);
  useEffect(()=>{ scheduleIcons(); },[open]);
  return (
    <section className="sec campus2" id="campus">
      <div className="wrap">
        <SectionHead index="04" eyebrow="CAMPUS" title="하나의 동아, <em>세 개의 캠퍼스</em>" more="캠퍼스맵" />
        <div className="camp-panels" data-reveal="scale">
          {D.campuses.map((c,i)=>(
            <div className={`camp-panel ${open===i?"open":""}`} key={i}
                 onMouseEnter={()=>setOpen(i)} onClick={()=>setOpen(i)} data-cursor>
              <div className="cp-bg"><image-slot id={`camp-${i}`} fit="cover" src={c.src} placeholder={`${c.name} 사진`}></image-slot></div>
              <div className="cp-grad"></div>
              <div className="cp-collapsed"><span className="cp-num">0{i+1}</span><span className="cp-vname">{c.name}</span></div>
              <div className="cp-open">
                <span className="cp-onum">CAMPUS 0{i+1}</span>
                <h3 className="cp-oname">{c.name}</h3>
                <p className="cp-orole">{c.role}</p>
                <div className="cp-oaddr"><Icon name="map-pin" size={15}/> {c.addr}</div>
                <span className="cp-link" data-cursor>둘러보기 <Icon name="arrow-right" size={15}/></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 바로가기 퀵메뉴 : magnetic + spotlight ---------- */
function QuickTile({ q }){
  const ref = useMagnetic(0.28);
  return (
    <a className="q-tile" href="#" data-cursor>
      <span className="q-mag" ref={ref}>
        <span className="q-ic"><Icon name={q.icon} size={26} stroke={1.9} /></span>
        <span className="q-label">{q.label}<Icon name="arrow-up-right" size={16}/></span>
      </span>
    </a>
  );
}
function Quick(){
  const D = window.DA;
  const gridRef = useRef(null);
  useEffect(()=>{
    const el = gridRef.current; if(!el) return;
    const onMove=(e)=>{const r=el.getBoundingClientRect();
      el.style.setProperty("--sx",(e.clientX-r.left)+"px");
      el.style.setProperty("--sy",(e.clientY-r.top)+"px");
      el.classList.add("lit");};
    const onLeave=()=>el.classList.remove("lit");
    el.addEventListener("mousemove",onMove); el.addEventListener("mouseleave",onLeave);
    return ()=>{el.removeEventListener("mousemove",onMove);el.removeEventListener("mouseleave",onLeave);};
  },[]);
  return (
    <section className="sec quick2" id="quick">
      <div className="wrap">
        <SectionHead index="05" eyebrow="QUICK LINKS" title="자주 찾는 <em>바로가기</em>" center />
        <div className="q-grid" ref={gridRef} data-reveal="scale">
          <div className="q-spot"></div>
          {D.quick.map((q,i)=><QuickTile key={i} q={q} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer(){
  const D = window.DA;
  return (
    <footer className="foot2">
      <div className="wrap">
        <div className="f2-cta" data-reveal="up">
          <h2>당신의 가능성이<br/><em>동아에서 시작</em>됩니다.</h2>
          <a className="f2-btn" href="#" data-cursor>동아대학교 둘러보기 <Icon name="arrow-right" size={20}/></a>
        </div>
        <div className="f2-family">
          {D.family.map((f,i)=><button key={i} data-cursor>{f}<Icon name="external-link" size={13}/></button>)}
        </div>
        <div className="f2-top">
          <div className="f2-brand">
            <img src={D.brand.logo} alt="동아대학교" className="f2-logo" />
            <div className="sl">{D.brand.slogan}<br/>{D.brand.sloganSub}</div>
          </div>
          <div className="f2-links">
            <div className="f2-col"><h5>BARO</h5><a href="#">대학소개</a><a href="#">학사안내</a><a href="#">단과대학</a><a href="#">대학생활</a></div>
            <div className="f2-col"><h5>SERVICE</h5><a href="#">SmartDONGA</a><a href="#">중앙도서관</a><a href="#">증명서 발급</a><a href="#">캠퍼스맵</a></div>
            <div className="f2-col"><h5>CONTACT</h5><a href="#">찾아오시는 길</a><a href="#">정보공개</a><a href="#">개인정보처리방침</a><a href="#">사이트맵</a></div>
          </div>
        </div>
        <div className="f2-bottom">
          <div className="addr">{D.footer.addr}<br/>{D.footer.tel}</div>
          <div className="copy">{D.footer.copy}</div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Pride, Notices, Campuses, CampusFlip, Quick, Footer });
