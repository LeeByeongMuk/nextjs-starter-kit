# Styling Guide

> 대상: **Tailwind v4**
> 상위 문서: [`docs/CONVENTIONS.md`](./CONVENTIONS.md)

## 1. 원칙: 유틸리티 클래스 직접 작성

Tailwind 유틸리티를 JSX의 `className`에 리터럴로 작성한다. `cn()` / `clsx` / `tailwind-variants` 같은 래퍼 **도입 금지**.

현존 `classnames` 사용처(2곳)는 유지하되 **신규 확산 금지**:

- `src/entities/post/ui/TypeSelect.tsx`
- `src/entities/post/ui/Pagination.tsx`

조건부 클래스는 템플릿 리터럴 + 삼항으로 처리:

```tsx
<button className={`px-4 py-2 ${isActive ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
```

재검토 조건은 `docs/LIBRARY_DECISIONS.md` §classnames → clsx 참조.

---

## 2. 다크 모드

`dark:` prefix 사용. 예: `bg-white dark:bg-gray-700`.

참고 파일: `src/entities/post/ui/PostDetail.tsx`.

---

## 3. 레이아웃 기본

| 용도 | 클래스 |
|---|---|
| 루트 컨테이너 | `container mx-auto` — `src/app/(domain)/layout.tsx` |
| 폼 카드 | `border-2 border-teal-600 px-6 py-12 lg:px-8` |
| 폼 필드 | `block w-full rounded-md border-0 ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600` |

---

## 4. 색 팔레트 (디자인 토큰)

| 용도 | 팔레트 |
|---|---|
| Primary | `teal-600` |
| Form focus ring | `indigo-600` |
| Neutral | `gray-300`, `gray-700`, `gray-900` |
| Error | 미정 — 토스트 도입 시 정의 (`docs/CONVENTIONS.md` §3) |

새 색상 도입 시 본 섹션을 먼저 업데이트.

---

## 5. Tailwind v4 설정

- PostCSS: `@tailwindcss/postcss` — `postcss.config.*`
- CSS import: `src/styles/globals.css`에서 `@import "tailwindcss"` (v4 방식)
- `@tailwindcss/forms` 플러그인 활성 — form 기본 스타일 리셋

v3 방식(`tailwind.config.js`의 `content` 배열)은 쓰지 않는다 — v4 자동 스캔으로 전환됨.

---

## 6. 참고 자료

- Tailwind v4 공식: https://tailwindcss.com/docs
- 디자인 시스템 강화 여부: `docs/LIBRARY_DECISIONS.md` 기타 섹션 (Storybook 등)
