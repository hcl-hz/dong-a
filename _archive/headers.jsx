/* =====================================================================
   headers.jsx — three left-oriented headers (variant A / B / C)
   ===================================================================== */

/* ---------- VARIANT A : wide left sidebar → shrinks to compact rail ---------- */
function SidebarA({ shrunk, iconAuth }){
  const D = window.DA;
  const [open, setOpen] = useState(false);
  useEffect(()=>{ scheduleIcons(); },[shrunk, open]);
  return (
    <>
      <aside className={`sb ${shrunk ? "mini" : ""}`}>
        {/* full state */}
        <div className="sb-full">
          <a className="sb-logo" href="#top">
            <img src={D.brand.logo} alt="동아대학교" className="sb-logo-img" />
          </a>
          <nav className="sb-nav">
            {D.nav.map((n,i)=>(
              <a key={i} href="#">{n.label}<Icon name="chevron-right" size={16} className="ar" /></a>
            ))}
          </nav>
          <div className="sb-foot">
            <div className={`sb-account ${iconAuth ? "icons" : ""}`}>
              {iconAuth ? (
                <>
                  <a className="sb-acc" href="#" data-cursor>로그인</a>
                  <button className="sb-acc icon" data-cursor aria-label="통합검색"><Icon name="search" size={16} /></button>
                </>
              ) : (
                <>
                  <a className="sb-acc" href="#" data-cursor>로그인</a>
                  <button className="sb-acc icon" data-cursor aria-label="통합검색"><Icon name="search" size={16} /></button>
                </>
              )}
            </div>
          </div>
        </div>
        {/* mini state */}
        <div className="sb-mini">
          <a className="sb-mark" href="#top" data-cursor><img src={D.brand.emblem} alt="동아대학교" /></a>
          <button className="sb-burger" onClick={()=>setOpen(true)} data-cursor aria-label="메뉴 열기">
            <img src="assets/menu-icon.png" alt="메뉴" className="sb-burger-img" />
          </button>
          <button className="sb-totop" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} data-cursor>
            <span className="vtext">SCROLL TOP</span><Icon name="arrow-up" size={16} />
          </button>
        </div>
      </aside>

      {/* full-screen overlay menu (opened from mini rail) */}
      <div className={`overlay from-left ${open ? "open" : ""}`}>
        <button className="ov-close" onClick={()=>setOpen(false)} data-cursor><Icon name="x" size={22} /></button>
        <div className="ov-left">
          {D.nav.map((n,i)=>(<a key={i} href="#" onClick={()=>setOpen(false)} data-cursor>{n.label}</a>))}
        </div>
        <div className="ov-right">
          <div style={{fontSize:13,letterSpacing:".2em",color:"var(--cyan)",fontWeight:700}}>QUICK LINKS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 28px"}}>
            {D.quick.map((q,i)=>(
              <a key={i} href="#" onClick={()=>setOpen(false)} data-cursor
                 style={{display:"flex",alignItems:"center",gap:12,color:"rgba(255,255,255,.85)",fontWeight:600,padding:"6px 0"}}>
                <Icon name={q.icon} size={18} style={{color:"var(--blue-300)"}} /> {q.label}
              </a>
            ))}
          </div>
          <div style={{marginTop:18,paddingTop:22,borderTop:"1px solid rgba(255,255,255,.12)",
                       fontSize:13.5,color:"rgba(255,255,255,.6)",lineHeight:1.8}}>
            {D.footer.addr}<br/>{D.footer.tel}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- 시안2 : fixed DARK editorial sidebar (always full) ---------- */
function SidebarDark(){
  const D = window.DA;
  const [open, setOpen] = useState(false);
  useEffect(()=>{ scheduleIcons(); },[open]);
  return (
    <aside className="sbd">
      <a className="sbd-logo" href="#top"><img src={D.brand.logo} alt="동아대학교" /></a>
      <nav className="sbd-nav">
        {D.nav.map((n,i)=>(
          <a key={i} href="#" data-cursor>
            <em>0{i+1}</em><span>{n.label}</span>
          </a>
        ))}
      </nav>
      <div className="sbd-foot">
        <a className="sbd-acc" href="#" data-cursor>로그인</a>
        <a className="sbd-acc" href="#" data-cursor>회원가입</a>
        <button className="sbd-acc icon" data-cursor aria-label="통합검색"><Icon name="search" size={17} /></button>
      </div>
    </aside>
  );
}

/* ---------- 시안3 : floating rounded card sidebar (light, detached) ---------- */
function SidebarFloat(){
  const D = window.DA;
  const icons = ["info","graduation-cap","building-2","library-big","calendar-days","tent-tree","megaphone"];
  useEffect(()=>{ scheduleIcons(); });
  return (
    <aside className="sbf">
      <div className="sbf-card">
        <a className="sbf-logo" href="#top"><img src={D.brand.logo} alt="동아대학교" /></a>
        <nav className="sbf-nav">
          {D.nav.map((n,i)=>(
            <a key={i} href="#" data-cursor>
              <span className="sbf-ic"><Icon name={icons[i] || "circle"} size={18} stroke={1.9} /></span>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="sbf-foot">
          <a className="sbf-acc" href="#" data-cursor>로그인</a>
          <a className="sbf-acc" href="#" data-cursor>회원가입</a>
          <button className="sbf-acc icon" data-cursor aria-label="통합검색"><Icon name="search" size={16} /></button>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { SidebarA, SidebarDark, SidebarFloat });
