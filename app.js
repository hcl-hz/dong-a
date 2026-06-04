/* =====================================================================
   app.js — 순수 바닐라 JS 인터랙션 (React/Babel 제거 버전)
   동아대학교 홈페이지 리뉴얼 시안 D (정적)
   ===================================================================== */
(function () {
  "use strict";
  var EASE = "cubic-bezier(.22,.61,.36,1)";
  var coarse = window.matchMedia("(pointer:coarse)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 공통: 섹션이 뷰포트 근처일 때만 스크럽 실행 (스크롤 버벅임 방지) ----------
     화면 밖 섹션의 핸들러가 매 스크롤마다 레이아웃을 읽고 쓰면서 생기는
     강제 리플로우를 차단한다. 반환된 state.active로 게이트. */
  function visGate(el, wake) {
    var state = { active: true };
    if ("IntersectionObserver" in window && el) {
      state.active = false;
      new IntersectionObserver(function (es) {
        state.active = es[0].isIntersecting;
        if (state.active && wake) wake(); // 다시 보이면 즉시 한 번 갱신
      }, { rootMargin: "150px 0px" }).observe(el);
    }
    return state;
  }

  /* ---------- 1. 스크롤 등장 (data-reveal → data-rv) ---------- */
  function initReveal() {
    var els = $$("[data-reveal],[data-stagger]");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.setAttribute("data-rv", ""); });
      $$(".nl-row-anim").forEach(function (el) { el.classList.add("show"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.setAttribute("data-rv", ""); io.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -4% 0px" });
    els.forEach(function (el) { io.observe(el); });
    // 리스트 row 개별 등장
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("show"); io2.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    $$(".nl-row-anim").forEach(function (el) { io2.observe(el); });
  }

  /* ---------- 2. 숫자 카운트업 (동문 136,000+) ---------- */
  function animateNumber(el, target, comma, dec) {
    var fmt = function (v) {
      if (dec) return v.toFixed(dec);
      var n = Math.round(v);
      return comma ? n.toLocaleString("en-US") : String(n);
    };
    var token = (el._cu = (el._cu || 0) + 1); // 같은 요소에 중복 실행 시 이전 카운트 중단
    el.textContent = fmt(0);
    var dur = 1700, t0 = performance.now();
    var tick = function (t) {
      if (el._cu !== token) return;
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function countUp(el, target, comma, dec) {
    if (!el) return;
    var started = false;
    el.textContent = dec ? (0).toFixed(dec) : "0";
    var run = function () { animateNumber(el, target, comma, dec); };
    if (!("IntersectionObserver" in window)) { el.textContent = dec ? target.toFixed(dec) : (comma ? target.toLocaleString("en-US") : String(target)); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !started) { started = true; run(); io.disconnect(); }
      });
    }, { threshold: 0.5 });
    io.observe(el);
  }
  function initCounts() {
    // [data-count] 요소의 선행 텍스트(숫자)만 카운트, 접미(<b>개/+</b>)는 보존
    $$("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      if (isNaN(target)) return;
      var comma = el.getAttribute("data-comma") === "1";
      var dec = parseInt(el.getAttribute("data-dec"), 10) || 0;
      var span = document.createElement("span");
      var first = el.firstChild;
      if (first && first.nodeType === 3) {
        el.insertBefore(span, first);
        el.removeChild(first);
      } else {
        el.insertBefore(span, el.firstChild);
      }
      countUp(span, target, comma, dec);
    });
  }

  /* ---------- 3. 커서 FX ---------- */
  function initCursor() {
    if (coarse) return;
    var ring = $(".cur-ring"), dot = $(".cur-dot");
    if (!ring || !dot) return;
    document.documentElement.classList.add("has-cursor-fx");
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, hover = false;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      var t = e.target.closest("[data-cursor],a,button");
      var nh = !!t;
      if (nh !== hover) { hover = nh; ring.classList.toggle("hover", hover); }
    });
    (function loop() {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 4. 스크롤 진행바 ---------- */
  function initProgress() {
    var bar = $(".scroll-prog");
    if (!bar) return;
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      var p = h > 0 ? Math.min(1, scrollY / h) : 0;
      bar.style.transform = "scaleX(" + p + ")";
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
  }

  /* ---------- 5. 사이드바 축소 + 오버레이 메뉴 ---------- */
  function initSidebar() {
    var site = $(".site"), sb = $(".sb"), overlay = $(".overlay.from-left");
    var onScroll = function () {
      var shrunk = scrollY > innerHeight * 0.5;
      if (site) site.setAttribute("data-shrunk", shrunk ? "true" : "false");
      if (sb) sb.classList.toggle("mini", shrunk);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    var burger = $(".sb-burger"), close = $(".ov-close");
    if (burger && overlay) burger.addEventListener("click", function () { overlay.classList.add("open"); });
    if (close && overlay) close.addEventListener("click", function () { overlay.classList.remove("open"); });
    if (overlay) $$(".ov-left a, .ov-right a", overlay).forEach(function (a) {
      a.addEventListener("click", function () { overlay.classList.remove("open"); });
    });
    var totop = $(".sb-totop");
    if (totop) totop.addEventListener("click", function () { scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---------- 6. 히어로 글자 + 아이브로우 등장 ---------- */
  function initHero() {
    var title = $(".hd-title");
    if (!title) return;
    var chs = $$(".hd-ch", title);
    chs.forEach(function (c) { c.classList.remove("on"); });
    var idxs = [];
    chs.forEach(function (c, i) {
      if (c.textContent.trim() === "") c.classList.add("on"); // 공백/nbsp 즉시
      else idxs.push(i);
    });
    for (var i = idxs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = idxs[i]; idxs[i] = idxs[j]; idxs[j] = tmp;
    }
    var k = 0;
    var t = setInterval(function () {
      if (k >= idxs.length) {
        clearInterval(t);
        setTimeout(function () {
          var eb = $(".hd-eyebrow"); if (eb) eb.classList.add("on");
        }, 260);
        return;
      }
      chs[idxs[k]].classList.add("on"); k++;
    }, 130);
  }

  /* ---------- 공통: 드래그 가로 스크롤 ---------- */
  function enableDrag(el) {
    if (!el) return;
    var down = false, moved = false, sx = 0, sl = 0;
    el.addEventListener("mousedown", function (e) { down = true; moved = false; sx = e.pageX; sl = el.scrollLeft; el.classList.add("grabbing"); });
    window.addEventListener("mousemove", function (e) { if (!down) return; var d = e.pageX - sx; if (Math.abs(d) > 4) moved = true; el.scrollLeft = sl - d; });
    window.addEventListener("mouseup", function () { down = false; el.classList.remove("grabbing"); });
    el.addEventListener("click", function (e) { if (moved) e.preventDefault(); }, true);
  }

  /* ---------- 7. 히어로 하단 공지 자동 슬라이드 ---------- */
  function initHeroNotices() {
    var hdn = $(".hdn");
    if (!hdn) return;
    var track = $(".hdn-track", hdn);
    var page = $(".hdn-page", hdn);
    var cards = $$(".hdn-card", track);
    var n = cards.length;
    if (!n) return;
    var idx = 0, paused = false;
    function cardW() { var c = $(".hdn-card", track); return c ? c.getBoundingClientRect().width + 16 : 320; }
    function go(i) { idx = (i + n) % n; track.scrollTo({ left: idx * cardW(), behavior: "smooth" }); setPage(); }
    function setPage() { if (page) page.innerHTML = String(idx + 1).padStart(2, "0") + ' <s>/ ' + String(n).padStart(2, "0") + "</s>"; }
    setInterval(function () { if (!paused) go(idx + 1); }, 3000);
    hdn.addEventListener("mouseenter", function () { paused = true; });
    hdn.addEventListener("mouseleave", function () { paused = false; });
    var btns = $$(".hdn-ctrl button", hdn);
    if (btns[0]) btns[0].addEventListener("click", function () { go(idx - 1); });
    if (btns[1]) btns[1].addEventListener("click", function () { go(idx + 1); });
    enableDrag(track);
  }

  /* ---------- 7b. 스토리 시퀀스: 스크롤에 따라 문구·이미지가 단계별로 교체 ---------- */
  function initStories() {
    var sec = $(".d-stories");
    if (!sec) return;
    var slides = $$(".ds-slide", sec);
    var n = slides.length;
    if (!n) return;
    var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var smooth = function (v) { v = clamp01(v); return v * v * (3 - 2 * v); };
    var finale = $(".ds-finale", sec);
    var finImg = $(".ds-finale-img", sec);
    var finCap = $(".ds-finale-cap", sec);
    var SLIDE_END = 0.64; // 슬라이드 시퀀스가 끝나는 지점(이후는 피날레)
    var mx = 0, my = 0; // 마우스 위치(-0.5~0.5)
    // 슬라이드별 요소 캐시
    var data = slides.map(function (sl) {
      return {
        el: sl,
        center: $(".ds-center", sl),
        imgs: $$(".ds-img", sl).map(function (im) {
          var fx = parseFloat(im.getAttribute("data-fx")) || 0;
          var fy = parseFloat(im.getAttribute("data-fy")) || 0;
          return {
            el: im,
            fx: fx,
            fy: fy,
            gx: parseFloat(im.getAttribute("data-gx")) || 0,
            gy: parseFloat(im.getAttribute("data-gy")) || 0,
            depth: parseFloat(im.getAttribute("data-depth")) || 1,
            rot: fx !== 0 ? (fx < 0 ? -8 : 8) : fy < 0 ? -5 : 5, // 등장 회전각
          };
        }),
      };
    });
    var raf = null;
    function update() {
      raf = null;
      var total = sec.offsetHeight - innerHeight;
      var scrolled = Math.min(Math.max(-sec.getBoundingClientRect().top, 0), total);
      var p = total > 0 ? scrolled / total : 0;
      // 슬라이드는 앞 구간(0~SLIDE_END), 피날레는 뒤 구간
      var ps = clamp01(p / SLIDE_END);
      var pf = clamp01((p - SLIDE_END) / (1 - SLIDE_END));
      var fade = smooth(clamp01(pf * 1.25)); // 피날레가 차오르며 슬라이드 페이드아웃
      data.forEach(function (d, i) {
        var isFirst = i === 0, isLast = i === n - 1;
        var lt = ps * n - i; // 슬라이드 i 내 진행도 (0~1, 밖이면 비활성)
        var inProg = isFirst ? 1 : smooth(lt / 0.3);
        var outProg = isLast ? 0 : smooth((lt - 0.7) / 0.3);
        var a = Math.min(inProg, 1 - outProg);
        if (isLast) a *= 1 - fade;
        if (lt < -0.25 || lt > 1.25) a = 0;
        d.el.style.opacity = a.toFixed(3);
        d.el.style.zIndex = a > 0.04 ? Math.round(2 + a * 10) : 0;
        d.el.style.pointerEvents = a > 0.6 ? "auto" : "none";
        if (d.center) {
          var ty = (1 - inProg) * 48 - outProg * 48;
          var cmx = mx * 18, cmy = my * 12; // 헤드라인도 살짝 마우스 추종
          d.center.style.transform = "translate3d(" + cmx.toFixed(1) + "px," + (ty + cmy).toFixed(1) + "px,0)";
        }
        var par = (lt - 0.5) * 70; // 슬라이드 내내 이어지는 미세 드리프트
        d.imgs.forEach(function (im) {
          var mox = mx * 30 * im.depth, moy = my * 30 * im.depth; // 마우스 패럴랙스
          var x = im.fx * (1 - inProg) + im.gx * outProg + mox;
          var y = im.fy * (1 - inProg) + im.gy * outProg + par * im.depth + moy;
          var rot = im.rot * (1 - inProg) + im.rot * 0.5 * outProg;
          var sc = 0.84 + 0.16 * inProg * (1 - outProg);
          im.el.style.transform =
            "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" + rot.toFixed(2) + "deg) scale(" + sc.toFixed(3) + ")";
        });
      });
      // 피날레: 이미지가 가운데에서 풀스크린으로 차오르고, 카피가 뒤이어 등장
      if (finImg) {
        var fe = smooth(pf);
        var fmx = mx * 16, fmy = my * 16; // 피날레도 살짝 마우스 반응
        finImg.style.opacity = clamp01(pf * 1.5).toFixed(3);
        finImg.style.transform =
          "translate3d(" + fmx.toFixed(1) + "px," + fmy.toFixed(1) + "px,0) scale(" + (0.32 + 0.68 * fe).toFixed(3) + ")";
      }
      if (finCap) {
        var capA = smooth(clamp01((pf - 0.55) / 0.45));
        finCap.style.opacity = capA.toFixed(3);
        finCap.style.transform = "translateY(" + ((1 - capA) * 30).toFixed(1) + "px)";
        finCap.style.pointerEvents = capA > 0.6 ? "auto" : "none";
      }
    }
    var onScroll = function () { if (gate.active && !raf) raf = requestAnimationFrame(update); };
    var gate = visGate(sec, onScroll);
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    if (!coarse) {
      addEventListener("mousemove", function (e) {
        mx = e.clientX / innerWidth - 0.5;
        my = e.clientY / innerHeight - 0.5;
        if (gate.active && !raf) raf = requestAnimationFrame(update);
      });
    }
  }

  /* ---------- 7c. 키네틱 타이포: 스크롤하면 텍스트 띠가 추가로 흐름 ---------- */
  function initKinetic() {
    var sec = $(".d-kine");
    if (!sec) return;
    var rows = $$(".kine-row", sec);
    var raf = null;
    function update() {
      raf = null;
      var r = sec.getBoundingClientRect();
      var prog = (innerHeight - r.top) / (innerHeight + r.height);
      prog = Math.max(0, Math.min(1, prog));
      var shift = (prog - 0.5) * 2; // -1 ~ 1
      rows.forEach(function (row, i) {
        var dir = row.getAttribute("data-dir") === "right" ? 1 : -1;
        var amt = i % 2 === 0 ? 90 : 140;
        row.style.transform = "translate3d(" + (shift * dir * amt).toFixed(1) + "px,0,0)";
      });
    }
    var onScroll = function () { if (gate.active && !raf) raf = requestAnimationFrame(update); };
    var gate = visGate(sec, onScroll);
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
  }

  /* ---------- 7d. 히어로 성과 롤링 티커 (한 줄씩 위로) ---------- */
  function initHeroStats() {
    var wrap = $("[data-hs-slide]");
    if (!wrap) return;
    var roll = $("[data-hs-roll]", wrap);
    if (!roll) return;
    var STATS = [
      { label: "재학생", target: 23000, comma: 1, suffix: "명 +" },
      { label: "졸업 동문", target: 136000, comma: 1, suffix: "명 +" },
      { label: "해외 협력 대학", target: 30, suffix: "개국 +" },
      { label: "단과대학", target: 13, suffix: "개" },
      { label: "개교", target: 80, suffix: "주년" },
      { label: "캠퍼스", target: 3, suffix: "개 캠퍼스" },
      { label: "장학금 수혜율", target: 72, suffix: "%" },
      { label: "취업률", target: 68.5, dec: 1, suffix: "%" },
      { label: "산학협력 기업", target: 500, suffix: "개 +" }
    ];
    var n = STATS.length;
    var idx = 1, busy = false, auto; // 초기 가운데: 졸업 동문
    function stat(i) { return STATS[((i % n) + n) % n]; }
    function fmtVal(s) {
      return s.dec ? s.target.toFixed(s.dec) : (s.comma ? s.target.toLocaleString("en-US") : String(s.target));
    }
    function rowHTML(i, cls) {
      var s = stat(i);
      return '<div class="hs-row ' + cls + '"><span class="hs-label">' + s.label +
        '</span><span class="hs-val"><span class="hs-num">' + fmtVal(s) + "</span>" + s.suffix + "</span></div>";
    }
    function render(extra) {
      var html = "";
      if (extra === "prev") html += rowHTML(idx - 2, "hs-sm");
      html += rowHTML(idx - 1, "hs-sm") + rowHTML(idx, "hs-main") + rowHTML(idx + 1, "hs-sm");
      if (extra === "next") html += rowHTML(idx + 2, "hs-sm");
      roll.innerHTML = html;
    }
    function playCenter() {
      var s = stat(idx);
      var numEl = $(".hs-main .hs-num", roll);
      if (numEl) animateNumber(numEl, s.target, s.comma === 1, s.dec || 0);
    }
    function go(dir) {
      if (busy) return;
      busy = true;
      render(dir > 0 ? "next" : "prev");
      var rows = $$(".hs-row", roll);
      var rowH = rows[0].offsetHeight;
      if (dir < 0) {
        // 위에 한 줄 미리 붙이고 한 줄 올라간 상태에서 시작 → 아래로 내려옴
        roll.style.transition = "none";
        roll.style.transform = "translateY(-" + rowH + "px)";
        void roll.offsetHeight;
      }
      idx = ((idx + dir) % n + n) % n;
      // 새 가운데 행 강조 (font-size/color 트랜지션으로 자연스럽게)
      rows.forEach(function (r) { r.classList.remove("hs-main"); r.classList.add("hs-sm"); });
      var center = dir > 0 ? rows[2] : rows[1];
      center.classList.remove("hs-sm");
      center.classList.add("hs-main");
      // 가운데로 올라오기 시작하는 순간부터 0 → 목표값 카운트 (슬라이드와 동시 진행)
      var s = stat(idx);
      var numEl = $(".hs-num", center);
      if (numEl) animateNumber(numEl, s.target, s.comma === 1, s.dec || 0);
      roll.style.transition = "transform .45s var(--ease)";
      roll.style.transform = dir > 0 ? "translateY(-" + rowH + "px)" : "translateY(0)";
      setTimeout(function () {
        roll.style.transition = "none";
        // 다시 그리지 않고 화면 밖 행만 제거 → 카운트 중인 요소 보존
        if (dir > 0) roll.removeChild(roll.firstElementChild);
        else roll.removeChild(roll.lastElementChild);
        roll.style.transform = "";
        busy = false;
      }, 470);
    }
    render();
    // 히어로 등장 애니메이션(2.85s 딜레이)이 끝나 바가 보이는 순간 첫 카운트 + 자동 롤링 시작
    var statsBar = wrap.closest(".hero-stats");
    var started = false;
    function start() {
      if (started) return;
      started = true;
      playCenter();
      auto = setInterval(function () { go(1); }, 4000);
    }
    if (statsBar) {
      statsBar.addEventListener("animationstart", function (e) { if (e.target === statsBar) start(); });
      setTimeout(start, 3200); // 애니메이션 미지원/미발동 폴백
    } else start();
    $$("[data-hs-dir]", wrap).forEach(function (btn) {
      btn.addEventListener("click", function () {
        go(btn.getAttribute("data-hs-dir") === "prev" ? -1 : 1);
        clearInterval(auto);
        auto = setInterval(function () { go(1); }, 4000);
      });
    });
  }

  /* ---------- 7e. WHY 타이핑 애니메이션 ---------- */
  function initWhyType() {
    var el = $("[data-why-type]");
    if (!el) return;
    // HTML을 글자 단위로 쪼개기 (br 보존)
    var html = el.innerHTML;
    var result = "";
    var inTag = false;
    for (var i = 0; i < html.length; i++) {
      var c = html[i];
      if (c === "<") { inTag = true; result += c; continue; }
      if (c === ">") { inTag = false; result += c; continue; }
      if (inTag) { result += c; continue; }
      if (c === " ") { result += " "; }
      else { result += '<span class="wt-char">' + c + "</span>"; }
    }
    el.innerHTML = result;
    var chars = $$(".wt-char", el);
    var started = false;
    function run() {
      var k = 0;
      var t = setInterval(function () {
        if (k >= chars.length) {
          clearInterval(t);
          return;
        }
        chars[k].classList.add("on");
        k++;
      }, 55);
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !started) { started = true; run(); io.disconnect(); }
        });
      }, { threshold: 0.3 });
      io.observe(el);
    } else { chars.forEach(function (c) { c.classList.add("on"); }); }
  }

  /* ---------- 7f. 공지 리스트 — 커서 따라다니는 이미지 ---------- */
  function initNlThumb() {
    var rows = $$(".nl-row");
    if (!rows.length || coarse) return;
    rows.forEach(function (row) {
      var thumb = $(".nl-thumb", row);
      if (!thumb) return;
      row.addEventListener("mousemove", function (e) {
        thumb.style.left = (e.clientX + 20) + "px";
        thumb.style.top = (e.clientY - 60) + "px";
      });
    });
  }

  /* ---------- 7f. 공지+뉴스 합친 섹션 — 뉴스 카드 슬라이드 ---------- */
  function initNlNews() {
    var wrap = $("[data-nl-news]");
    if (!wrap) return;
    var cards = $$(".nln-card", wrap);
    var n = cards.length;
    if (n < 2) return;
    var idx = 0;
    function go(dir) {
      var nextIdx = ((idx + dir) % n + n) % n;
      if (nextIdx === idx) return;
      cards[idx].style.display = "none";
      cards[idx].classList.remove("nln-enter-right", "nln-enter-left");
      idx = nextIdx;
      cards[idx].style.display = "";
      cards[idx].classList.remove("nln-enter-right", "nln-enter-left");
      void cards[idx].offsetHeight;
      cards[idx].classList.add(dir > 0 ? "nln-enter-right" : "nln-enter-left");
    }
    $$("[data-nln-dir]", wrap).forEach(function (btn) {
      btn.addEventListener("click", function () {
        go(btn.getAttribute("data-nln-dir") === "next" ? 1 : -1);
      });
    });
    setInterval(function () { go(1); }, 5000);
  }

  /* ---------- 7f. WHY 카드 미니 슬라이드 + 왼쪽 카운터 전환 ---------- */
  function initWhySlide() {
    var wrap = $("[data-why-slide]");
    if (!wrap) return;
    var slides = $$(".wc2-slide", wrap);
    var page = $(".wc2-page", wrap);
    var n = slides.length;
    if (n < 2) return;
    var idx = 0, busy = false;
    function go(next) {
      if (busy) return;
      var nextIdx = ((next % n) + n) % n;
      if (nextIdx === idx) return;
      busy = true;
      var old = slides[idx];
      var cur = slides[nextIdx];
      cur.style.display = "";
      cur.setAttribute("data-entering", "");
      old.setAttribute("data-leaving", "");
      if (page) page.textContent = String(nextIdx + 1).padStart(2, "0") + "/" + String(n).padStart(2, "0");
      setTimeout(function () {
        old.style.display = "none";
        old.removeAttribute("data-leaving");
        cur.removeAttribute("data-entering");
        idx = nextIdx;
        busy = false;
      }, 550);
    }

    // 왼쪽 카드 숫자 전환
    var numEl = $(".wc1-num");
    var labEl = $(".wc1-lab");
    var stats = [
      { value: 136000, comma: true, suffix: "+", label: "누적 졸업생 · 동문" },
      { value: 23000, comma: true, suffix: "+", label: "재학생" },
      { value: 80, comma: false, suffix: "주년", label: "개교 역사" },
      { value: 30, comma: false, suffix: "+", label: "해외 협력 대학" },
      { value: 13, comma: false, suffix: "개", label: "단과대학" }
    ];
    var si = 0;
    function fmt(v, comma) { return comma ? v.toLocaleString("en-US") : String(v); }
    function animateNum(target, comma, suffix) {
      var dur = 1200, t0 = performance.now();
      var tick = function (t) {
        var p = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(target * eased);
        numEl.innerHTML = fmt(val, comma) + "<i>" + suffix + "</i>";
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    function switchStat() {
      si = (si + 1) % stats.length;
      var s = stats[si];
      numEl.classList.add("switching");
      labEl.classList.add("switching");
      setTimeout(function () {
        numEl.classList.remove("switching");
        labEl.classList.remove("switching");
        labEl.textContent = s.label;
        animateNum(s.value, s.comma, s.suffix);
      }, 300);
    }

    setInterval(function () { go(idx + 1); switchStat(); }, 3500);
  }

  /* ---------- 7f. Global Partnership Network — 연도 카운트 + 스크롤 텍스트 채움 ---------- */
  function initGPN() {
    var yearEl = $("[data-count-year]");
    var fillEl = $("[data-gpn-fill]");

    // 연도 카운트업 1946 → 2026
    if (yearEl) {
      var started = false;
      var FROM = 1946, TO = 2026;
      var run = function () {
        var dur = 2200, t0 = performance.now();
        var tick = function (t) {
          var p = Math.min(1, (t - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          yearEl.textContent = Math.round(FROM + (TO - FROM) * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting && !started) { started = true; run(); io.disconnect(); }
          });
        }, { threshold: 0.3 });
        io.observe(yearEl);
      } else { yearEl.textContent = TO; }
    }

    // 스크롤에 따라 텍스트 색 채움
    if (fillEl) {
      var raf = null;
      var sec = fillEl.closest(".gpn");
      var update = function () {
        raf = null;
        var rect = sec.getBoundingClientRect();
        // 섹션 스크롤 진행도: 섹션 top이 뷰포트 하단 → 0, 섹션 bottom이 뷰포트 하단 → 1
        var total = rect.height + window.innerHeight;
        var scrolled = window.innerHeight - rect.top;
        var raw = scrolled / total;
        // 진행 40%~70% 구간에서 채움 완료 (섹션 끝나기 전 완료)
        var p = (raw - 0.35) / 0.35;
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        // background-position: 100% = 전부 회색, 0% = 전부 진한색
        var pos = 100 - p * 100;
        fillEl.style.backgroundPosition = pos + "% 0";
      };
      var onScroll = function () { if (gate.active && !raf) raf = requestAnimationFrame(update); };
      var gate = visGate(sec, onScroll);
      update();
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onScroll);
    }
  }

  /* ---------- 8. 캠퍼스 라이프 가로 스크롤 ---------- */
  function initCampusLife() {
    var sec = $(".d-cl");
    if (!sec) return;
    var track = $(".cl-track", sec);
    var raf = null;
    function update() {
      raf = null;
      var total = sec.offsetHeight - innerHeight;
      var scrolled = Math.min(Math.max(-sec.getBoundingClientRect().top, 0), total);
      var p = total > 0 ? scrolled / total : 0;
      var maxX = Math.max(0, track.scrollWidth - innerWidth);
      track.style.transform = "translateX(" + (-p * maxX).toFixed(1) + "px)";
    }
    var onScroll = function () { if (gate.active && !raf) raf = requestAnimationFrame(update); };
    var gate = visGate(sec, onScroll);
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.target.classList.toggle("in", e.isIntersecting); });
      }, { threshold: 0.28 });
      $$(".cl-intro,.cl-panel", sec).forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- 9. 뉴스 자동 캐러셀 + 틸트 ---------- */
  function initNews() {
    var nc = $(".nc");
    if (!nc) return;
    var track = $(".nc-track", nc);
    var paused = false, i = 0;
    var real = $$(".nc-card", track).length / 2; // 데이터가 2배로 복제됨
    setInterval(function () {
      if (paused) return;
      var card = $(".nc-card", track);
      var step = card ? card.getBoundingClientRect().width + 26 : 380;
      i += 1;
      if (i > real) { i = 1; track.scrollTo({ left: 0, behavior: "auto" }); }
      track.scrollBy({ left: step, behavior: "smooth" });
    }, 2800);
    nc.addEventListener("mouseenter", function () { paused = true; });
    nc.addEventListener("mouseleave", function () { paused = false; });

    if (!coarse) $$(".nc-card", track).forEach(function (el) {
      var max = 7;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateY(" + (px * max) + "deg) rotateX(" + (-py * max) + "deg)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = "perspective(900px) rotateY(0) rotateX(0)"; });
    });
  }

  /* ---------- 10. 우측 도크 TOP ---------- */
  function initDock() {
    var top = $(".dq-top") || $(".d-dock-top");
    if (top) top.addEventListener("click", function () { scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---------- 11. 대학공지 탭 필터 (게시판 재구성) ---------- */
  var NOTICES = [
    { cat: "학사공지", date: "2026.06.01", title: "2026학년도 2학기 재학생 수강신청 일정 및 유의사항 안내", desc: "2학기 수강신청 기간과 정정·취소 절차, 학년별 신청 시간대 및 유의사항을 안내합니다." },
    { cat: "장학공지", date: "2026.05.30", title: "2학기 교내·외 장학금 신청 안내 (성적·복지·근로 장학)", desc: "성적우수·생활복지·근로장학 등 2학기 교내외 장학금의 신청 자격과 제출 서류를 확인하세요." },
    { cat: "채용", date: "2026.05.29", title: "2026년 상반기 교직원(행정·기술) 신규채용 공고", desc: "행정·기술직 신규 교직원 채용 분야와 지원 자격, 전형 일정 및 접수 방법을 공고합니다." },
    { cat: "공지사항", date: "2026.05.27", title: "여름방학 중 중앙도서관 운영시간 및 시설 이용 변경 안내", desc: "방학 기간 도서관 개관시간과 열람실·자료실 운영, 시설 이용 변경 사항을 안내합니다." },
    { cat: "학사공지", date: "2026.05.26", title: "계절학기(하계) 개설 교과목 및 수강신청 안내", desc: "하계 계절학기 개설 교과목과 수강신청·등록 일정, 수업 운영 방식을 안내합니다." },
    { cat: "행사모집", date: "2026.05.23", title: "석당박물관 특별기획전 ‘기록으로 보는 동아 75년’ 개최", desc: "동아대학교 역사를 담은 기록물을 한자리에 모은 석당박물관 특별기획전에 여러분을 초대합니다." },
    { cat: "행사모집", date: "2026.05.21", title: "제2회 DONG-A 창업 아이디어 경진대회 참가자 모집", desc: "혁신적인 창업 아이디어를 가진 재학생을 대상으로 경진대회 참가팀을 모집합니다." },
    { cat: "장학공지", date: "2026.05.19", title: "국가장학금 2차 신청 기간 및 서류제출 방법 안내", desc: "한국장학재단 국가장학금 2차 신청 기간과 가구원 동의, 서류 제출 방법을 안내합니다." },
    { cat: "공지사항", date: "2026.05.16", title: "2026 글로컬대학30 비전 선포식 및 기념 행사 개최 안내", desc: "글로컬대학30 선정을 기념하는 비전 선포식과 부대 행사 일정을 안내합니다." },
    { cat: "채용", date: "2026.05.14", title: "산학협력단 연구원(계약직) 채용 인재풀 상시 등록 안내", desc: "산학협력 연구 과제 수행을 위한 연구원 인재풀을 상시 모집·등록합니다." }
  ];
  var SVG_AR = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide" style="width:17px;height:17px;display:inline-flex"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';
  var SVG_UR = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide" style="width:16px;height:16px;display:inline-flex"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>';
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function renderBoard(board, tab) {
    var list = (tab === "전체") ? NOTICES : NOTICES.filter(function (n) { return n.cat === tab; });
    if (!list.length) { board.outerHTML = '<div class="nl-empty">해당 분류의 공지가 없습니다.</div>'; return; }
    var feat = list[0], rest = list.slice(1, 7);
    var html = '<a class="nl-feat" href="#" data-cursor style="--d:0">' +
      '<span class="nlf-badge">' + esc(feat.cat) + '</span>' +
      '<span class="nlf-tag">최신 공지 · LATEST</span>' +
      '<h3 class="nlf-tit">' + esc(feat.title) + '</h3>' +
      '<p class="nlf-desc">' + esc(feat.desc) + '</p>' +
      '<div class="nlf-foot"><span class="nlf-date">' + esc(feat.date) + '</span>' +
      '<span class="nlf-go">자세히 보기 ' + SVG_AR + '</span></div>' +
      '<span class="nlf-watermark">NOTICE</span></a>' +
      '<div class="nl-cards">';
    rest.forEach(function (n, i) {
      html += '<a class="nl-card" href="#" data-cursor style="--d:' + (i + 1) + '">' +
        '<span class="nlc-badge cat-' + esc(n.cat) + '">' + esc(n.cat) + '</span>' +
        '<h4 class="nlc-tit">' + esc(n.title) + '</h4>' +
        '<div class="nlc-foot"><span class="nlc-date">' + esc(n.date) + '</span>' +
        '<span class="nlc-arrow">' + SVG_UR + '</span></div></a>';
    });
    html += '</div>';
    board.innerHTML = html;
  }
  function initNoticeTabs() {
    var bar = $(".nl-tabs");
    var board = $(".nl-board");
    if (!bar || !board) return;
    $$("button", bar).forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$("button", bar).forEach(function (b) { b.className = ""; });
        btn.className = "on";
        renderBoard(board, btn.textContent.trim());
      });
    });
  }

  /* ---------- 12. 부드러운 앵커 스크롤 ---------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        var t = document.querySelector(id);
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth", block: "start" }); }
      });
    });
  }

  /* ---------- 히어로 비디오: 섹션에 덮여 안 보일 때 일시정지 (디코딩 비용 절약) ----------
     히어로가 fixed 배경이라 IntersectionObserver로는 감지 불가 → 스크롤 위치로 판단 */
  function initVideoPause() {
    var vid = $(".hd-video");
    if (!vid) return;
    var paused = false;
    var check = function () {
      var hidden = window.scrollY > innerHeight * 1.2; // 히어로가 완전히 덮인 지점
      if (hidden && !paused) { paused = true; vid.pause(); }
      else if (!hidden && paused) {
        paused = false;
        var p = vid.play();
        if (p && p.catch) p.catch(function () {});
      }
    };
    check();
    addEventListener("scroll", check, { passive: true });
  }

  /* ---------- 부트 ---------- */
  function boot() {
    // 캡처/디버그 모드(?cap): 등장 효과·스냅·스티키 비활성화하여 정적 캡처
    if (/[?&]cap\b/.test(location.search)) {
      var s = document.createElement("style");
      s.textContent =
        '[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}' +
        '[data-stagger]>*{opacity:1!important;transform:none!important}' +
        "html.d-snap{scroll-snap-type:none!important}" +
        '.site[data-variant="d"] .hero.hd{position:relative!important}';
      document.head.appendChild(s);
    }
    initReveal();
    initCounts();
    initGPN();
    initHeroStats();
    initWhySlide();
    initNlNews();
    initNlThumb();
    initWhyType();
    initCursor();
    initProgress();
    initSidebar();
    initHero();
    initHeroNotices();
    initKinetic();
    initCampusLife();
    initCampusStack();
    initNews();
    initDock();
    initNoticeTabs();
    initNlTabs();
    initCalendar();
    initNewsSlider();
    initAnchors();
    initVideoPause();
  }

  /* ---------- Scroll Stack — 3 Campuses ---------- */
  function initCampusStack() {
    var section = $(".cs-scroll-area");
    if (!section) return;
    var cards = $$(".cs-card", section);
    var n = cards.length;
    if (!n) return;

    // Card 0: full → shrinks & moves up. Card 1 rises ON TOP → full → shrinks & moves up. etc.
    // Later cards = higher z-index. Shrunk cards peek out above as strips.
    var SCALE_STEP = 0.08;   // each layer shrinks 8% more
    var PEEK_GAP = 32;       // px between each strip at the top

    cards.forEach(function (card, i) {
      card.style.zIndex = i + 1;
    });

    // Pre-compute each card's riseT (0→1) for reuse
    function getRiseT(i, progress, segments) {
      if (i === 0) return 1;
      var s = (i - 1) / segments, e = i / segments;
      return Math.max(0, Math.min(1, (progress - s) / (e - s)));
    }

    function update() {
      var rect = section.getBoundingClientRect();
      var total = section.offsetHeight - window.innerHeight;
      var scroll = -rect.top;
      var progress = Math.max(0, Math.min(1, scroll / total));
      var segments = n - 1;
      if (segments < 1) return;

      // Collect all riseT values first
      var riseTs = [];
      for (var k = 0; k < n; k++) riseTs.push(getRiseT(k, progress, segments));

      cards.forEach(function (card, i) {
        var riseT = riseTs[i];

        // "weight above" = sum of riseT of all cards above this one (j > i)
        // This is continuous: as card j rises (0→1), it smoothly pushes card i up
        var weightAbove = 0;
        for (var j = i + 1; j < n; j++) weightAbove += riseTs[j];

        // Peek Y: each card above pushes this one up by PEEK_GAP, smoothly
        var peekY = -weightAbove * PEEK_GAP;

        // Scale: each card above shrinks this one by SCALE_STEP, smoothly
        var sc = 1 - weightAbove * SCALE_STEP;

        // Rise: card enters from 100% below → 0
        var yRise = (1 - riseT) * 100;

        if (i > 0 && riseT < 1) {
          card.style.transform = "translateY(calc(" + yRise.toFixed(2) + "% + " + peekY + "px)) scale(" + sc.toFixed(4) + ")";
        } else {
          card.style.transform = "translateY(" + peekY + "px) scale(" + sc.toFixed(4) + ")";
        }

        card.style.opacity = (i === 0 || riseT > 0) ? 1 : 0;
      });
    }

    var ticking = false;
    var onScroll = function () {
      if (!gate.active || ticking) return;
      requestAnimationFrame(function () { update(); ticking = false; });
      ticking = true;
    };
    var gate = visGate(section, onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  /* ---------- 메인 탭 전환 (공지사항 / 일정 / 뉴스) ---------- */
  function initNlTabs() {
    var btns = $$(".nmt");
    var slots = $$(".nl-slot");
    var box = $(".nl-box");
    if (!btns.length || !box) return;
    // 공지사항 탭 기준 높이 고정
    requestAnimationFrame(function () {
      box.style.height = box.offsetHeight + "px";
    });
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-nmt");
        btns.forEach(function (b) { b.classList.toggle("on", b === btn); });
        slots.forEach(function (s) {
          s.style.display = s.getAttribute("data-slot") === key ? "" : "none";
        });
      });
    });
    // 카테고리 필터 + 뉴스 전환
    var allCats = $$(".nl-cat, .nl-cat-full");
    var rightViews = $$("[data-right-view]");
    allCats.forEach(function (btn) {
      btn.addEventListener("click", function () {
        allCats.forEach(function (b) { b.classList.toggle("on", b === btn); });
        var isNews = btn.getAttribute("data-nlcat") === "news";
        rightViews.forEach(function (v) {
          v.style.display = v.getAttribute("data-right-view") === (isNews ? "news" : "list") ? "" : "none";
        });
      });
    });
  }

  /* ---------- 캘린더 ---------- */
  function initCalendar() {
    var grid = $("[data-cal-grid]");
    var monthEl = $(".nl-cal-month");
    if (!grid) return;
    var now = new Date();
    var year = now.getFullYear(), month = now.getMonth();
    // 일정 리스트("MM.DD ~ MM.DD")의 시작일을 파싱해 이벤트 날짜로 사용
    var eventStarts = [];
    $$('[data-slot="schedule"] .nl-row-cat').forEach(function (el) {
      var m = el.textContent.match(/(\d{2})\.(\d{2})\s*~/);
      if (!m) return;
      eventStarts.push({ month: +m[1] - 1, day: +m[2] });
    });
    function hasEvent(m, d) {
      return eventStarts.some(function (e) { return e.month === m && e.day === d; });
    }

    function render() {
      monthEl.textContent = year + "." + String(month + 1).padStart(2, "0");
      var first = new Date(year, month, 1);
      var last = new Date(year, month + 1, 0);
      var startDay = first.getDay();
      var html = "";
      // 이전 달 빈칸
      var prevLast = new Date(year, month, 0).getDate();
      for (var i = startDay - 1; i >= 0; i--) {
        html += '<span class="nl-cal-day other">' + (prevLast - i) + "</span>";
      }
      // 이번 달
      for (var d = 1; d <= last.getDate(); d++) {
        var cls = "nl-cal-day";
        var dow = new Date(year, month, d).getDay();
        if (dow === 0) cls += " sun";
        if (dow === 6) cls += " sat";
        if (d === now.getDate() && month === now.getMonth() && year === now.getFullYear()) cls += " today";
        if (hasEvent(month, d)) cls += " has-event";
        html += '<span class="' + cls + '">' + d + "</span>";
      }
      // 다음 달 채움
      var remaining = 7 - ((startDay + last.getDate()) % 7);
      if (remaining < 7) {
        for (var j = 1; j <= remaining; j++) {
          html += '<span class="nl-cal-day other">' + j + "</span>";
        }
      }
      grid.innerHTML = html;
    }
    render();
    $$("[data-cal-dir]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        month += btn.getAttribute("data-cal-dir") === "next" ? 1 : -1;
        if (month > 11) { month = 0; year++; }
        if (month < 0) { month = 11; year--; }
        render();
      });
    });
  }

  /* ---------- 뉴스 가로 스크롤 ---------- */
  function initNewsSlider() {
    var wrap = $("[data-news2]");
    if (!wrap) return;
    var track = $(".nn2-track", wrap);
    var card = $(".nn2-card", track);
    if (!track || !card) return;
    function scrollOne(dir) {
      var step = card.getBoundingClientRect().width + 16;
      track.scrollBy({ left: dir * step, behavior: "smooth" });
    }
    $$("[data-nn2-dir]", wrap).forEach(function (btn) {
      btn.addEventListener("click", function () {
        scrollOne(btn.getAttribute("data-nn2-dir") === "next" ? 1 : -1);
      });
    });
    setInterval(function () {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollOne(1);
      }
    }, 5000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
