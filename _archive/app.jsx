/* =====================================================================
   app.jsx — 3개 좌측 사이드바 시안 (인터랙티브 / 에디토리얼 / 벤토)
   ===================================================================== */
function VariantSwitcher({ variant, setVariant }){
  const opts = [
    { id:"d", label:"시네마틱", sub:"Cinematic scroll" },
    { id:"e", label:"검색형", sub:"Search hero" },
  ];
  return (
    <div className="vswitch">
      <div className="vswitch-label">시안 비교<b>LAYOUT</b></div>
      <div className="vswitch-opts">
        {opts.map(o=>(
          <button key={o.id} className={variant===o.id?"on":""} onClick={()=>setVariant(o.id)} data-cursor>
            <span className="vk">{o.id.toUpperCase()}</span>
            <span className="vl">{o.label}<i>{o.sub}</i></span>
          </button>
        ))}
      </div>
    </div>
  );
}

function App(){
  const [variant, setVariant] = useState("d");
  const [navShrunk, setNavShrunk] = useState(false);
  useReveal(variant);
  useParallax(variant);

  useEffect(() => { window.scrollTo({ top:0 }); scheduleIcons();
    document.documentElement.classList.add("d-snap");
  }, [variant]);

  useEffect(() => {
    const onScroll = () => setNavShrunk(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener("scroll", onScroll, { passive:true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="site" data-variant={variant} data-shrunk={navShrunk ? "true" : "false"}>
      {variant === "d" && <><SidebarA shrunk={navShrunk} iconAuth={true} /><Layout4 /></>}
      {variant === "e" && <><SidebarA shrunk={navShrunk} iconAuth={true} /><Layout5 /></>}

      <ScrollProgress />
      <CursorFX />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
