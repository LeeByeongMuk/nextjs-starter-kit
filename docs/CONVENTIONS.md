# Coding Conventions Guide

> 작성일: 2026-04-19
> 대상 브랜치: `develop`
> 범위: **가로지르는** 코드 컨벤션 (TypeScript, 파일 네이밍, 에러/피드백 정책). 라이브러리별 사용 규칙은 아래 하위 문서에서 다룬다.

## 하위 문서

| 주제 | 문서 |
|---|---|
| 데이터 페칭 (TanStack Query, `fetchApi`) | [`docs/DATA_FETCHING.md`](./DATA_FETCHING.md) |
| 폼 (React Hook Form) | [`docs/FORMS.md`](./FORMS.md) |
| 인증 (NextAuth v5) | [`docs/AUTH.md`](./AUTH.md) |
| 스타일링 (Tailwind v4) | [`docs/STYLING.md`](./STYLING.md) |
| 테스팅 (Jest / RTL / MSW) | [`docs/TESTING.md`](./TESTING.md) |

파일 배치(어떤 레이어에 두는가)는 `docs/FSD_GUIDE.md`. 라이브러리 교체 여부는 `docs/LIBRARY_DECISIONS.md`.

---

## 개요

본 문서가 해결하려는 문제:

- 같은 종류의 코드가 슬라이스마다 다른 스타일로 작성되는 것
- 암묵지화된 컨벤션이 신규 인원/Claude에게 전달되지 않아 PR 리뷰가 반복되는 것

원칙: **현존 코드에서 다수를 차지하는 패턴을 표준으로 채택**. 소수 불일치는 향후 리팩터링으로 수렴시킨다 — "구 코드 따라가기"는 하지 않는다.

---

## 1. TypeScript

- `tsconfig.json`: `strict: true`, `noEmit: true` (tsc는 타입체크 전용, 빌드는 Next.js가 수행)
- `moduleResolution: bundler`, `module: esnext`, `isolatedModules: true` — 신규 파일은 항상 ESM 문법 사용
- import 순서: ESLint `import/order` 자동 정렬 (`npm run lint:fix`)에 위임. 수동 조정 금지

### 1.1 요청/응답 타입: `interface` + `Req`/`Res` suffix

API 경계를 넘나드는 타입은 `interface`로 선언하고 `Req`/`Res` suffix를 붙인다.

```ts
// src/features/auth-signin/api/types.ts
export interface SignInReq {
  email: string;
  password: string;
}

export interface SignInRes extends ApiResponse {
  accessToken: string;
  user: User;
}
```

근거 파일: `src/features/auth-signin/api/types.ts`, `src/features/post-list/api/types.ts`.

### 1.2 도메인 모델 / 폼 입력: `interface` + `PascalCase`

도메인 모델(`Post`, `User`), 폼 입력 타입(`CreatePostFormInput`)은 `interface`. 이유: 추후 선언 병합·확장 여지.

### 1.3 단순 별칭 / 유니온: `type`

```ts
export type DeletePostRes = ApiResponse;
export type PostType = 'notice' | 'general';
```

### 1.4 `enum` 대신 as-const union

런타임 객체를 불필요하게 만드는 TS `enum`은 사용하지 않는다.

```ts
export const POST_TYPES = ['notice', 'general'] as const;
export type PostType = (typeof POST_TYPES)[number];
```

---

## 2. 파일 / 디렉터리 네이밍

| 대상 | 네이밍 | 예시 |
|---|---|---|
| 컴포넌트 파일 | `PascalCase.tsx` | `PostListItem.tsx` |
| 훅 파일 | `camelCase.ts`, `use` 접두사 | `useCreatePostForm.ts` |
| 서비스 / 유틸 | `camelCase.ts` | `signinService.ts`, `fetchApi.ts` |
| API 타입 전용 | `types.ts` | `src/features/*/api/types.ts` |
| 폼 타입 전용 | `form.ts` | `src/features/*/model/form.ts` |
| 상수 | `<domain>.ts` | `src/entities/post/config/post.ts` |
| 슬라이스 barrel | `index.ts` (고정) | `src/features/post-list/index.ts` |
| 테스트 | `<file>.spec.tsx` | `signin.spec.tsx` |

슬라이스 이름 자체의 규칙(kebab-case, `<도메인>-<액션>`)은 `docs/FSD_GUIDE.md` §2 참조.

---

## 3. 에러 / 피드백 정책

### 3.1 현행

- Mutation 성공: `router.push(...)` + `alert('완료되었습니다.')`
- Mutation 실패: `alert(error.message)`
- 입력 검증 실패: RHF `errors` 객체 → 폼 필드 아래 텍스트 렌더

### 3.2 문제

브라우저 네이티브 `alert()`는 접근성(포커스 강탈), 스타일 커스텀 불가, 비동기 제어(UX 흐름 끊김) 모두 취약. 프로덕션 표준이 될 수 없음.

### 3.3 목표 (후속 PR)

- 토스트 라이브러리 도입 (`sonner` 또는 `react-hot-toast` — 선정은 별도 PR)
- `src/shared/ui/toast/` 래퍼 레이어 → 슬라이스는 `toast.success(...)` / `toast.error(...)` 호출
- 중앙 Mutation 에러 핸들러: `QueryClient`의 `defaultOptions.mutations.onError`에서 토스트 자동 표시

### 3.4 지금의 규칙

- **신규 코드에서 `alert()` 도입 금지**
- 기존 `alert()` 호출은 토스트 도입 PR에서 일괄 교체 — 개별 PR에서 섞지 않음

---

## 4. 참고 자료

- FSD 배치 규칙: [`docs/FSD_GUIDE.md`](./FSD_GUIDE.md)
- 라이브러리 교체 판단: [`docs/LIBRARY_DECISIONS.md`](./LIBRARY_DECISIONS.md)
- 의존성 마이그레이션 이력: [`docs/MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md)
