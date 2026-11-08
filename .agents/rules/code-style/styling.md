---
paths:
  - 'src/**/*.tsx'
  - 'src/styles/**'
---

# Styling Guide

> 대상: **Tailwind v4**
> 상위 문서: [`.agents/rules/code-style/code-conventions.md`](../code-style/code-conventions.md)

## 1. 원칙: 유틸리티 클래스 직접 작성

Tailwind 유틸리티를 JSX의 `className`에 리터럴로 작성한다. `cn()` / `clsx` / `tailwind-variants` 같은 래퍼 **도입 금지**.

`classnames` 신규 사용은 금지한다. 조건부 스타일은 아래 템플릿 리터럴로 작성한다.

조건부 클래스는 템플릿 리터럴 + 삼항으로 처리:

```tsx
<button className={`px-4 py-2 ${isActive ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
```

재검토 조건은 `.agents/rules/infra/library-decisions.md` §classnames → clsx 참조.

---

## 2. 다크 모드

`src/styles/globals.css`의 의미별 토큰이 `prefers-color-scheme: dark`에 따라 전환된다. UI는 `bg-paper`, `text-ink`, `border-line` 등 동일한 유틸리티를 사용한다. 밝은 테마 고정 색상과 `dark:` 팔레트를 혼용하지 않는다.

---

## 3. 레이아웃 기본

| 용도           | 클래스                                                           |
| -------------- | ---------------------------------------------------------------- |
| 앱 컨테이너    | `mx-auto w-full max-w-[1120px] px-5 sm:px-8`                     |
| 읽기·작성 영역 | `mx-auto w-full max-w-[760px]`                                   |
| 인증 폼        | `mx-auto w-full max-w-md` — 테두리 카드 대신 제목·구분선·여백    |
| 폼 필드        | `min-h-12 w-full rounded border border-line bg-surface text-ink` |

기본 글꼴은 system-ui와 한국어 OS fallback이다. 한국어는 단어 단위로 줄바꿈하고 긴 URL·제목은 `overflow-wrap: anywhere`로 감싼다. 링크·버튼·선택 라벨의 터치 영역은 최소 44px, 주요 입력 높이는 48px이다. 본문은 16px(큰 화면 17px), 행간 1.9를 사용한다.

화면은 한 `main`과 한 `h1`을 가진다. 공통 레이아웃에 본문 건너뛰기 링크를 두고 `focus-visible` 포커스를 유지한다. 로딩은 `status`, 오류는 `alert`로 알리며 필드 오류는 `aria-invalid`와 `aria-describedby`로 연결한다. OS 모션 감소 설정을 준수한다.

---

## 4. 색 팔레트 (디자인 토큰)

| 토큰 / 유틸리티   | 밝음      | OS 다크   |
| ----------------- | --------- | --------- |
| `paper`           | `#faf9f6` | `#151b1d` |
| `surface`         | `#ffffff` | `#1c2528` |
| `ink`             | `#202c2d` | `#edf2f0` |
| `muted`           | `#596664` | `#b3c0bd` |
| `line`            | `#ced7d2` | `#475854` |
| `accent` / 포커스 | `#0f766e` | `#83d5c7` |
| `accent-hover`    | `#115e59` | `#afe8dc` |
| `accent-soft`     | `#e5f1ec` | `#233d37` |
| `inverse`         | `#ffffff` | `#14231e` |
| `danger`          | `#b42332` | `#ffb3bb` |
| `skeleton`        | `#e1e7e2` | `#34443f` |

새 색상 도입 시 본 섹션을 먼저 업데이트.

---

## 5. Tailwind v4 설정

- PostCSS: `@tailwindcss/postcss` — `postcss.config.*`
- CSS import: `src/styles/globals.css`에서 `@import "tailwindcss"` (v4 방식)
- `@tailwindcss/forms` 플러그인 활성 — form 기본 스타일 리셋
- 공통 토큰은 `@theme inline`으로 Tailwind에 노출한다. 글로벌 CSS의 별도 선택자는 기본 접근성, 서버 HTML 본문(`.post-content`), ToastUI 내부 DOM(`.post-editor`)에 한정한다. 화면 레이아웃은 JSX 유틸리티로 작성한다.

v3 방식(`tailwind.config.js`의 `content` 배열)은 쓰지 않는다 — v4 자동 스캔으로 전환됨.

---

## 6. 참고 자료

- Tailwind v4 공식: https://tailwindcss.com/docs
- 디자인 시스템 강화 여부: `.agents/rules/infra/library-decisions.md` 기타 섹션 (Storybook 등)
