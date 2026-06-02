/* =====================================================================
   data.jsx — 동아대학교 홈페이지 콘텐츠 데이터 (한국어)
   실제 동아대 기준 · 입학 콘텐츠 제외 · 자랑거리(achievements) 중심
   실제 캠퍼스 사진 사용
   ===================================================================== */

const IMG = {
  seunghak: "assets/campus-seunghak.jpg",
  brickDay: "assets/campus-brick-day.jpg",
  stoneHall: "assets/campus-stone-hall.jpg",
  aerial: "assets/campus-aerial.jpg",
  brickNight: "assets/campus-brick-night.jpg",
};

const DA = {
  brand: {
    kr: "동아대학교",
    en: "DONG-A UNIVERSITY",
    logo: "assets/donga-logo.png",
    emblem: "assets/donga-emblem.png",
    slogan: "열린 미래, 꿈이 있는 대학",
    sloganSub: "무한대로 이어지는 도전과 혁신의 역사",
    since: "SINCE 1947",
  },

  // 실제 1-depth 글로벌 내비게이션
  nav: [
    { label: "학교소개", sub: ["인사말", "동아 DNA", "연혁·상징", "캠퍼스 안내", "찾아오시는 길"] },
    { label: "입학안내", sub: ["수시모집", "정시모집", "입학설명회", "전형자료실", "입학처 홈"] },
    { label: "대학", sub: ["13개 단과대학", "학부·학과", "교양교육", "전공안내", "교직과정"] },
    { label: "대학원", sub: ["일반대학원", "전문대학원", "특수대학원", "법학전문대학원", "연구과정"] },
    { label: "학사안내", sub: ["학사일정", "수강신청", "교육과정", "비교과 프로그램", "증명발급"] },
    { label: "대학생활", sub: ["동아리·학생회", "기숙사", "장학·복지", "중앙도서관", "국제교류"] },
    { label: "동아광장", sub: ["대학공지", "동아뉴스", "행사·일정", "채용정보", "홍보센터"] },
  ],

  util: ["SmartDONGA 포털", "중앙도서관", "통합검색", "ENGLISH"],

  // 메인 비주얼 슬라이드 (3) — 실사진
  hero: [
    {
      tag: "GLOCAL UNIVERSITY 30",
      kicker: "DONG-A DNA",
      title: ["무한대로 이어지는", "도전과 혁신의 역사"],
      desc: "글로컬대학30 선정 — 정부 5년 1,000억 지원으로 부산의 미래 산업을 이끄는 혁신 거점이 됩니다.",
      cta: "동아 DNA 보기",
      slot: "hero-1", src: IMG.aerial,
    },
    {
      tag: "SINCE 1947",
      kicker: "개교 80주년",
      title: ["80년의 전통 위에", "내일을 세우다"],
      desc: "1947년 개교 이래 80년, 13개 단과대학과 의료원을 갖춘 종합대학으로 13만 동문이 세계를 무대로 활약합니다.",
      cta: "동아대 역사",
      slot: "hero-2", src: IMG.brickNight,
    },
    {
      tag: "BEYOND BUSAN",
      kicker: "글로벌 동아",
      title: ["부산을 넘어", "세계의 중심으로"],
      desc: "승학·부민·구덕 세 개의 캠퍼스가 인문, 공학, 의료를 잇는 융합과 글로벌 교류의 거점이 됩니다.",
      cta: "캠퍼스 둘러보기",
      slot: "hero-3", src: IMG.seunghak,
    },
  ],

  // 동아대 성과 (D 히어로 롤링 카운터)
  heroAchieve: [
    { label: "개교 이래 함께한 시간", value: 29200, suffix: "일 +", note: "1947.05.01 기준" },
    { label: "누적 졸업생 · 동문", value: 136000, suffix: "명 +", note: "2026.02 기준", comma: true },
    { label: "재학생 수", value: 23000, suffix: "명 +", note: "2026.03 기준", comma: true },
    { label: "단과대학", value: 13, suffix: "개", note: "2026 기준" },
    { label: "해외 협력 대학", value: 30, suffix: "개교 +", note: "2026 기준" },
  ],

  // 동아뉴스 — 실사진 기본
  news: [
    { cat: "대표뉴스", date: "2026.05.28", title: "동아대, ‘글로컬대학30’ 혁신모델로 지역 산업 대전환 본격 시동", slot: "news-1", src: IMG.aerial, big: true },
    { cat: "연구성과", date: "2026.05.22", title: "공과대학 연구팀, 차세대 이차전지 소재 국제학술지 표지 논문 게재", slot: "news-2", src: IMG.brickDay },
    { cat: "의료", date: "2026.05.19", title: "동아대학교병원, 권역응급의료센터 평가 최우수 등급 획득", slot: "news-3", src: IMG.stoneHall },
    { cat: "국제교류", date: "2026.05.14", title: "해외 30개 대학과 글로벌 공동학위 트랙 신설… 교환학생 확대", slot: "news-4", src: IMG.seunghak },
    { cat: "수상", date: "2026.05.09", title: "동아대 학생 창업팀, 전국 대학생 창업경진대회 대상 수상", slot: "news-5", src: IMG.brickNight },
  ],

  // 특성화 분야 (D 시안 — 캠퍼스 라이프 대체)
  fields: [
    { name: "AI·소프트웨어", tag: "FUTURE", desc: "인공지능·데이터로 미래 산업을 선도하는 핵심 인재 양성", src: IMG.aerial, big: true },
    { name: "의생명·헬스케어", tag: "MEDICAL", desc: "의과대학·대학병원과 연계한 바이오·의료 융합 분야", src: IMG.stoneHall },
    { name: "글로컬 첨단산업", tag: "GLOCAL", desc: "부산 대전환을 이끄는 모빌리티·반도체 특성화", src: IMG.brickDay },
    { name: "디자인·콘텐츠", tag: "CREATIVE", desc: "예술·디자인과 디지털 콘텐츠를 잇는 창의 분야", src: IMG.seunghak },
    { name: "글로벌 비즈니스", tag: "GLOBAL", desc: "국제 감각을 갖춘 경영·통상 전문가로 성장", src: IMG.brickNight },
    { name: "인문·사회", tag: "HUMANITIES", desc: "80년 인문 전통 위에 융합적 사고를 키우는 토대", src: IMG.brickDay },
  ],

  // A시안 히어로 하단 공지사항 슬라이더 (10건, 파란 박스)
  heroVideo: "assets/hero-flow.mp4",
  heroNotices: [
    { dday: "D-7",  type: "학사", title: "2026학년도 2학기 재학생 수강신청 일정 안내", desc: "정정·취소 절차와 학년별 신청 시간대를 확인하세요.", from: "2026.06.01", to: "2026.06.14" },
    { dday: "D-12", type: "장학", title: "2학기 교내·외 장학금 신청 접수 (성적·복지·근로)", desc: "장학금별 신청 자격과 제출 서류를 안내합니다.", from: "2026.06.02", to: "2026.06.19" },
    { dday: "상시", type: "채용", title: "2026년 상반기 교직원(행정·기술) 신규채용 공고", desc: "채용 분야와 지원 자격, 전형 일정을 공고합니다.", from: "2026.05.29", to: "2026.06.30" },
    { dday: "D-3",  type: "행사", title: "제2회 DONG-A 창업 아이디어 경진대회 참가자 모집", desc: "재학생 대상 창업 아이디어 경진대회 참가팀을 모집합니다.", from: "2026.05.23", to: "2026.06.04" },
    { dday: "D-21", type: "일반", title: "여름방학 중 중앙도서관 운영시간 및 시설 이용 안내", desc: "방학 중 개관시간과 열람실·시설 이용 변경을 안내합니다.", from: "2026.06.10", to: "2026.07.01" },
    { dday: "수시", type: "학사", title: "계절학기(하계) 개설 교과목 및 수강신청 안내", desc: "하계 계절학기 개설 교과목과 수강신청 일정을 안내합니다.", from: "2026.06.05", to: "2026.06.20" },
    { dday: "D-9",  type: "장학", title: "국가장학금 2차 신청 기간 및 서류제출 안내", desc: "신청 기간과 가구원 동의, 서류 제출 방법을 안내합니다.", from: "2026.06.03", to: "2026.06.16" },
    { dday: "상시", type: "채용", title: "산학협력단 연구원(계약직) 채용 인재 Pool 등록", desc: "연구 과제 수행을 위한 연구원 인재풀을 상시 모집합니다.", from: "2026.05.20", to: "2026.12.31" },
    { dday: "D-15", type: "행사", title: "석당박물관 특별기획전 ‘기록으로 보는 동아 75년’", desc: "동아 80년의 기록을 한자리에 모은 특별기획전에 초대합니다.", from: "2026.06.01", to: "2026.08.31" },
    { dday: "D-5",  type: "일반", title: "2026 글로컬대학30 비전 선포식 및 기념 행사 안내", desc: "글로컬대학30 선정 기념 비전 선포식과 부대 행사를 안내합니다.", from: "2026.05.30", to: "2026.06.10" },
  ],

  // 대학공지
  notices: [
    { cat: "학사공지", date: "2026.06.01", title: "2026학년도 2학기 재학생 수강신청 일정 및 유의사항 안내", desc: "2학기 수강신청 기간과 정정·취소 절차, 학년별 신청 시간대 및 유의사항을 안내합니다.", isNew: true },
    { cat: "장학공지", date: "2026.05.30", title: "2학기 교내·외 장학금 신청 안내 (성적·복지·근로 장학)", desc: "성적우수·생활복지·근로장학 등 2학기 교내외 장학금의 신청 자격과 제출 서류를 확인하세요.", isNew: true },
    { cat: "채용", date: "2026.05.29", title: "2026년 상반기 교직원(행정·기술) 신규채용 공고", desc: "행정·기술직 신규 교직원 채용 분야와 지원 자격, 전형 일정 및 접수 방법을 공고합니다.", isNew: true },
    { cat: "공지사항", date: "2026.05.27", title: "여름방학 중 중앙도서관 운영시간 및 시설 이용 변경 안내", desc: "방학 기간 도서관 개관시간과 열람실·자료실 운영, 시설 이용 변경 사항을 안내합니다." },
    { cat: "학사공지", date: "2026.05.26", title: "계절학기(하계) 개설 교과목 및 수강신청 안내", desc: "하계 계절학기 개설 교과목과 수강신청·등록 일정, 수업 운영 방식을 안내합니다." },
    { cat: "행사모집", date: "2026.05.23", title: "석당박물관 특별기획전 ‘기록으로 보는 동아 75년’ 개최", desc: "동아대학교 역사를 담은 기록물을 한자리에 모은 석당박물관 특별기획전에 여러분을 초대합니다." },
    { cat: "행사모집", date: "2026.05.21", title: "제2회 DONG-A 창업 아이디어 경진대회 참가자 모집", desc: "혁신적인 창업 아이디어를 가진 재학생을 대상으로 경진대회 참가팀을 모집합니다." },
    { cat: "장학공지", date: "2026.05.19", title: "국가장학금 2차 신청 기간 및 서류제출 방법 안내", desc: "한국장학재단 국가장학금 2차 신청 기간과 가구원 동의, 서류 제출 방법을 안내합니다." },
    { cat: "공지사항", date: "2026.05.16", title: "2026 글로컬대학30 비전 선포식 및 기념 행사 개최 안내", desc: "글로컬대학30 선정을 기념하는 비전 선포식과 부대 행사 일정을 안내합니다." },
    { cat: "채용", date: "2026.05.14", title: "산학협력단 연구원(계약직) 채용 인재풀 상시 등록 안내", desc: "산학협력 연구 과제 수행을 위한 연구원 인재풀을 상시 모집·등록합니다." },
  ],

  // 동아대학교 자랑거리 (PRIDE / achievements)
  pride: [
    { no: "01", kicker: "GLOCAL UNIVERSITY 30", title: "글로컬대학30 선정", desc: "정부 5년 1,000억 원 지원. 지역과 대학이 함께 성장하는 부산 대전환의 거점.", icon: "rocket", src: IMG.aerial },
    { no: "02", kicker: "MEDICAL", title: "의과대학 · 대학병원", desc: "부산 권역 의료를 책임지는 동아대학교병원과 권역응급의료센터를 운영합니다.", icon: "heart-pulse", src: IMG.stoneHall },
    { no: "03", kicker: "LAW SCHOOL", title: "법학전문대학원", desc: "부산·경남을 대표하는 로스쿨로 매년 우수한 법조 인재를 배출합니다.", icon: "scale", src: IMG.brickDay },
    { no: "04", kicker: "SINCE 1947", title: "개교 80주년의 전통", desc: "1947년 개교 이래 80년, 13만 동문이 사회 곳곳에서 활약하는 영남 사학의 명문.", icon: "landmark", src: IMG.brickNight },
  ],

  // 주요 통계 (숫자 카운터) — 자랑 지표
  stats: [
    { value: 1947, suffix: "", label: "개교 연도", sub: "Since 1947", plain: true },
    { value: 13, suffix: "개", label: "단과대학", sub: "Colleges" },
    { value: 23000, suffix: "+", label: "재학생", sub: "Students", comma: true },
    { value: 136000, suffix: "+", label: "동문", sub: "Alumni", comma: true },
  ],

  // 바로가기 퀵메뉴 (입학 제외)
  quick: [
    { label: "학사일정", icon: "calendar-days" },
    { label: "수강신청", icon: "list-checks" },
    { label: "SmartDONGA", icon: "layout-grid" },
    { label: "중앙도서관", icon: "book-open" },
    { label: "증명서 발급", icon: "file-badge" },
    { label: "동아대학교병원", icon: "heart-pulse" },
    { label: "석당박물관", icon: "landmark" },
    { label: "캠퍼스맵", icon: "map" },
  ],

  // 3개 캠퍼스 — 실사진
  campuses: [
    { name: "승학캠퍼스", role: "인문·사회·공학·예술", addr: "부산 사하구 낙동대로550번길 37", src: IMG.seunghak },
    { name: "부민캠퍼스", role: "법학·경영·국제 / 도심·문화", addr: "부산 서구 구덕로 225", src: IMG.brickDay },
    { name: "구덕캠퍼스", role: "의과·의료원 / 메디컬", addr: "부산 서구 대신공원로 26", src: IMG.stoneHall },
  ],

  // 주요 사업식 — 동아대 자랑거리 6선 (D 시안 전용)
  majorWorks: [
    { no: "01", kicker: "GLOCAL 30", title: "글로컬대학30 선정", desc: "정부 5년 1,000억 원 지원. 부산 대전환을 이끄는 혁신 거점 대학으로 선정되었습니다.", icon: "rocket", src: IMG.aerial, big: true },
    { no: "02", kicker: "MEDICAL", title: "의과대학 · 대학병원", desc: "부산 권역 의료의 중심, 동아대학교병원과 권역응급의료센터를 운영합니다.", icon: "heart-pulse" },
    { no: "03", kicker: "LAW SCHOOL", title: "법학전문대학원", desc: "부산·경남을 대표하는 로스쿨로 우수한 법조 인재를 배출합니다.", icon: "scale" },
    { no: "04", kicker: "MUSEUM", title: "석당박물관 · 국보 소장", desc: "국보·보물 다수를 소장한 대학박물관, 80년 학술 자산의 보고.", icon: "landmark" },
    { no: "05", kicker: "13 COLLEGES", title: "13개 단과대학", desc: "인문·사회·공학·예술·의료를 아우르는 종합대학의 깊이와 폭.", icon: "building-2" },
    { no: "06", kicker: "GLOBAL", title: "글로벌 네트워크", desc: "해외 30여 개 대학과 공동학위·교환학생 트랙으로 세계를 잇습니다.", icon: "globe" },
  ],

  // 캠퍼스 라이프 — D 시안 전용
  locations: [
    { name: "중앙도서관", tag: "학술", desc: "수백만 장서와 24시간 열람실, 지식의 거점", src: IMG.aerial, big: true },
    { name: "한림생활관", tag: "기숙사", desc: "쾌적한 주거와 커뮤니티가 있는 캠퍼스 라이프", src: IMG.brickDay },
    { name: "학생회관", tag: "동아리", desc: "200여 개 동아리와 학생 활동의 중심", src: IMG.brickNight },
    { name: "대운동장·체육관", tag: "스포츠", desc: "활기찬 캠퍼스를 채우는 체육·여가 공간", src: IMG.seunghak },
    { name: "석당박물관", tag: "문화", desc: "국보를 품은 대학박물관에서 즐기는 전시", src: IMG.stoneHall },
    { name: "대학 축제 한마당", tag: "축제", desc: "봄·가을 캠퍼스를 물들이는 청춘의 무대", src: IMG.aerial },
  ],

  // 캠퍼스 라이프 — D 시안 (가로 스크롤 패널)
  campusLife: [
    { no:"01", kr:"장학·등록금 지원", en:"SCHOLARSHIP", desc:"성적우수·생활복지·근로 등 폭넓은 교내외 장학 제도를 운영합니다. 등록금 부담을 덜고 오직 학업과 성장에만 집중할 수 있도록 든든하게 지원합니다.", src:IMG.aerial },
    { no:"02", kr:"글로벌·교환학생", en:"GLOBAL", desc:"해외 30여 개 협력 대학과 교환학생·공동학위 트랙을 운영합니다. 다양한 글로벌 경험을 통해 세계를 무대로 활약하는 인재로 성장할 수 있습니다.", src:IMG.seunghak },
    { no:"03", kr:"취업·창업 지원", en:"CAREER", desc:"대학일자리플러스센터와 창업지원단이 진로 설계의 시작부터 끝까지 함께합니다. 취업 역량 강화부터 창업 보육까지 단계별 맞춤 프로그램을 제공합니다.", src:IMG.brickDay },
    { no:"04", kr:"캠퍼스 라이프", en:"CAMPUS LIFE", desc:"쾌적한 기숙사와 200여 개 동아리, 계절마다 펼쳐지는 축제까지. 배움을 넘어 잊지 못할 청춘의 일상이 동아대학교 캠퍼스에서 시작됩니다.", src:IMG.brickNight },
    { no:"05", kr:"중앙도서관·학술", en:"LIBRARY", desc:"수백만 권의 장서와 24시간 열람실, 다양한 학습·연구 공간을 갖추고 있습니다. 지식의 깊이를 더하고 학문의 여정을 이어가도록 든든히 돕습니다.", src:IMG.stoneHall },
    { no:"06", kr:"의료·복지", en:"MEDICAL & CARE", desc:"부산 권역 의료의 중심 동아대학교병원과 촘촘한 학생 복지 제도를 갖추고 있습니다. 건강과 생활 전반을 세심하게 살펴 안심하고 학업에 임할 수 있습니다.", src:IMG.aerial },
  ],

  family: [
    "동아대학교병원", "중앙도서관", "대학일자리플러스센터", "산학협력단",
    "국제교류처", "평생교육원", "대학원", "SmartDONGA 포털", "석당박물관", "총동문회",
  ],

  footer: {
    addr: "(49236) 부산광역시 서구 구덕로 225 (부민동2가) 동아대학교",
    tel: "대표전화 051-200-6114",
    copy: "© DONG-A UNIVERSITY. All Rights Reserved.",
  },
};

window.DA = DA;
window.IMG = IMG;
