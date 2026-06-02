/* =====================================================================
   layout5.jsx — 시안E "풀스크린 검색형" (고정 영상 + 좌하단 헤드라인 + 흰 블러 검색바)
   ===================================================================== */
function HeroE(){
  const D = window.DA;
  const quick = ["대학소개","입학안내","통합검색"];
  return (
    <section className="hero he" id="top">
      <div className="he-media">
        <video className="he-video" src={D.heroVideo} autoPlay loop muted playsInline></video>
        <div className="he-scrim"></div>
      </div>

      {/* center ask pill */}
      <div className="he-center">
        <a className="he-ask" href="#" data-cursor>
          동아대학교에 대해 무엇이든 물어보세요 <Icon name="message-square" size={18}/>
        </a>
        <span className="he-scroll">Scroll Down</span>
      </div>

      {/* bottom-left headline + search bar */}
      <div className="he-bottom">
        <div className="he-copy">
          <p className="he-sub">미래 사회를 선도할 강한 대학</p>
          <h1 className="he-title">THE STRONG <b>DONG-A</b></h1>
        </div>
        <div className="he-searchrow">
          <div className="he-search">
            <Icon name="search" size={18}/>
            <input type="text" placeholder="검색어를 입력하세요 · 동아대학교" />
          </div>
          <div className="he-quick">
            {quick.map((q,i)=>(<a key={i} href="#" data-cursor>{q}</a>))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 시안E composition ---------- */
function Layout5(){
  return (
    <main className="main main-e">
      <HeroE />
      <AboutD />
      <NoticeListD />
      <FooterD />
      <RightDock />
    </main>
  );
}

Object.assign(window, { HeroE, Layout5 });
