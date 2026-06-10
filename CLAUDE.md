# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요

**동아대학교(東亞大學校) 홈페이지 리뉴얼 시안**입니다. 프레임워크·빌드 단계·패키지 매니저·테스트가 전혀 없는 순수 바닐라 HTML/CSS/JS이며, 콘텐츠와 코드 주석은 모두 한글입니다. 실제 노출되는 페이지는 **시안 D**입니다 (`.site`의 `data-variant="d"`).

## 실행

빌드/개발 명령어가 없습니다. `index.html`을 직접 열거나, 상대 경로 에셋과 `<image-slot>` 사이드카가 제대로 동작하도록 루트에서 정적 서버로 띄웁니다.

```bash
python3 -m http.server 8000   # http://localhost:8000 접속
```

HTML 파일은 **반드시 프로젝트 루트에 있어야 합니다** — `image-slot.js`의 영속화와 에셋 경로가 이를 전제로 합니다.

## 주요 파일

- `index.html` — 메인 페이지 (시안 D). `index copy.html`는 학교소개 하위 페이지입니다.
- `app.js` — 모든 인터랙션 (하나의 큰 IIFE).
- `image-slot.js` — `<image-slot>` 웹 컴포넌트 (아래 참고).
- `_archive/` — 예전의 다중 시안 통합 프로토타입. 실제 페이지와 무관합니다.
- `assets/` — 실제 사용 이미지/영상. `uploads/`, `screenshots/` — 작업용 스크래치/참고 이미지.

## CSS 구조

스타일시트는 `index.html`의 `<head>`에 적힌 순서대로 캐스케이드 로드되며, 컴포넌트 단위가 아니라 **역할 단위**로 계층화되어 있습니다:

1. `colors_and_type.css` — 디자인 토큰: 포인트 컬러 `#006ee9`, 폰트 Paperlogy(제목)·Pretendard(본문/UI). 변수는 여기서 수정하고 섹션마다 따로 정의하지 않습니다.
2. `homepage.css` — 기본 리셋, 모션, 헤더, 히어로.
3. `sections.css` — 콘텐츠 섹션 (`.wrap`, `.sec`, 섹션 헤더).
4. `layouts.css` — 구 시안 2/3의 사이드바·섹션 스타일.
5. `layout4.css` — 시안 D (실제 디자인).
6. `layout5.css` — 시안 E (풀스크린 검색형).

`layout*.css`가 여러 개인 이유는 원본이 시안 전환 기능을 지원했기 때문입니다. 실제 페이지는 D만 쓰지만 나머지도 여전히 링크되어 있습니다.

## app.js 구조

`"use strict"` 하나의 IIFE 안에 약 30개의 번호 매겨진 `init*` 모듈(`initReveal`, `initHero`, `initCampusLife`, `initNews` 등)이 들어 있고, 각각 한 섹션을 담당합니다. 모든 모듈은 파일 끝의 단일 `boot()` 함수에서 순차 호출되며, `boot()`는 `document.readyState` 검사로 `DOMContentLoaded`에 한 번 실행됩니다. **새 섹션 모듈을 추가하려면 `init*` 함수를 정의하고 `boot()`에 호출 한 줄을 더하세요.** 스크롤 관련 작업을 건드리기 전에 반드시 이해해야 할 두 개의 공유 기반 함수가 있습니다:

- **`visGate(el, wake)`** — `IntersectionObserver`를 감싸 `{active}`를 반환합니다. 스크롤/스크럽 핸들러는 `state.active`를 확인하고 섹션이 화면 밖이면 즉시 빠져나가야 합니다. 그래야 화면 밖 핸들러가 매 스크롤 프레임마다 강제 리플로우를 일으키지 않습니다. 핵심 성능 게이트입니다.
- **`scrubScroll` / `scrubDrift()`** — Lerp 기반 **가상** 스크롤 값. 네이티브 스크롤은 그대로 두고, 스크럽 애니메이션은 이 보간된 값을 읽어서 휠을 휙 돌려도 뚝 끊기지 않고 부드러운 곡선으로 따라옵니다. 프레임별 구독은 `scrubScroll.sub(fn)`. `prefers-reduced-motion`을 존중합니다.

스크롤 등장 애니메이션은 JS에 하드코딩되지 않고 **HTML 속성으로 구동**됩니다: `data-reveal="up|right|scale|scaleUp"`, `data-reveal-delay`, `data-stagger`, `data-count`(숫자 카운트업), 그 외 슬라이더용 `data-*` 훅들. `initReveal`이 `data-rv` 속성을 토글하면 CSS가 애니메이션을 처리합니다. 애니메이션 추가는 새 JS를 작성하는 게 아니라 마크업에 속성을 다는 방식입니다.

아이콘은 인라인 `<svg class="lucide ...">`(Lucide 마크업을 HTML에 붙여넣음)입니다 — 호출할 Lucide 런타임 스크립트가 없습니다.

## `<image-slot>` 컴포넌트

`image-slot.js`는 사용자가 채우는 이미지 플레이스홀더를 정의합니다: 드래그&드롭 또는 클릭으로 채우고, `fit="cover"`일 때 더블클릭으로 리프레임할 수 있습니다. 드롭한 이미지는 **omelette 호스트 런타임**을 통해 `.image-slots.state.json` 사이드카에 영속화됩니다. 런타임 밖에서는 읽기 전용입니다(`src` 속성은 그대로 렌더링). 영속화를 위해 각 슬롯에는 **고유한 `id`**가 필요합니다. 전체 속성 문서는 `image-slot.js` 상단 주석 블록에 있습니다.
