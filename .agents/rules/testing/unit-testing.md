---
paths:
  - '**/*.spec.tsx'
  - 'jest.config.ts'
  - 'jest.setup.ts'
  - 'src/shared/api/mocks/**'
---

# Testing Guide

> 대상: **Jest 30 + Testing Library + MSW 2**
> 상위 문서: [`.agents/rules/code-style/code-conventions.md`](../code-style/code-conventions.md)

## 1. 환경 구성

- 러너: Jest 30 — `jest.config.ts`
- DOM: `jest-fixed-jsdom` (MSW 2 호환 fork)
- Setup: `jest.setup.ts` — MSW `testServer` 부트, TanStack Query `QueryClient` 리셋, `next-auth/react` 모킹
- 대화상자 mock: `jest.setup.ts`가 테스트마다 `window.alert`(빈 구현)와 `window.prompt`(`null` 반환) spy를 새로 만들고 `afterEach`의 `jest.restoreAllMocks()`로 되돌린다. 호출 기록과 반환값은 다음 테스트로 넘어가지 않는다.
  - 다른 반환값은 테스트 본문이나 그 블록의 `beforeEach`에서 `jest.spyOn(window, 'prompt').mockReturnValue('사유')`처럼 지정한다. `confirm`은 기본 mock이 없으므로 쓰는 테스트에서 직접 spy한다.
  - `global.alert = jest.fn()`처럼 전역 함수를 직접 바꿔 끼우지 않는다. `restoreAllMocks`는 `jest.spyOn`이 만든 spy만 되돌리므로 호출 기록과 반환값이 테스트 사이에 남는다.
- 변환: `next/jest`의 SWC만 사용. 별도 ts-jest preset은 두지 않는다.
- TypeScript 설정 로더: `ts-node` (`jest.config.ts` 로딩용)

---

## 2. ESM 패키지 transformIgnore 예외

`jest.config.ts`의 `extraTransformPkgs`:

```ts
const extraTransformPkgs = [
  'rettime',
  'until-async',
  'next-auth',
  '@auth',
  'msw',
  '@open-draft',
];
```

NextAuth / Auth.js 계열은 ESM 전환이 잦고, msw ≥2.15는 ESM 전용 `@open-draft/deferred-promise`를 중첩 node_modules로 끌고 온다 (중첩 경로는 바깥 패키지 `msw`도 예외 목록에 있어야 변환된다). **테스트가 갑자기 깨지면 여기를 먼저 확인**. 예외 추가 시 `npm test` 전체 재실행 필수.

---

## 3. 커버리지 기준

- 기준: **60%** (branches / functions / lines / statements)
- `collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}']` — 전 소스
- 신규 슬라이스 기여가 이 기준을 낮추면 CI 실패

---

## 4. 테스트 위치 정책

| 대상                           | 위치                                 | 네이밍            |
| ------------------------------ | ------------------------------------ | ----------------- |
| 페이지 통합 테스트 (현행)      | `src/app/**/*.spec.tsx`              | `signin.spec.tsx` |
| 훅 / 서비스 단위 테스트 (권장) | 슬라이스 내부 (`model/` 또는 `api/`) | `<file>.spec.ts`  |
| 컴포넌트 렌더 테스트           | feature view 레벨 통합으로 대체      | —                 |

UI 컴포넌트 단위 snapshot 테스트는 지양 — 렌더 구조 변경에 취약하고 가치 낮음.

테스트 파일 확장자는 `.spec.tsx` 고정. `.test.tsx` 사용 금지.

---

## 5. MSW 패턴

### 5.1 기본 핸들러

도메인별로 `src/shared/api/mocks/handlers/*.ts`에 분리:

```ts
// src/shared/api/mocks/handlers/auth.ts
export const authHandlers = [
  http.post('/api/auth/signin', () =>
    HttpResponse.json({ user: mockUser, accessToken: '...' })
  ),
];
```

### 5.2 테스트 내부 오버라이드

```ts
server.use(
  http.post('/api/auth/signin', () =>
    HttpResponse.json({ error: 'invalid' }, { status: 401 })
  )
);
```

`server.resetHandlers()`는 `jest.setup.ts`의 `afterEach`가 자동 수행.

### 5.3 개발 서버용 MSW

`src/shared/api/mocks/server.ts`는 Express 기반 독립 mock 서버다. `npm run mock`은 잠금 파일에 포함된 `tsx`로 실행하며 테스트의 `setupServer`와 분리된다. 브라우저 Service Worker는 사용하지 않는다.

---

## 6. TanStack Query 테스트 팁

- `QueryClientProvider`로 감싸기 필수
- 각 테스트마다 `new QueryClient()` 생성해 캐시 격리
- `retry: false` 옵션으로 실패 테스트의 지연 방지

```ts
const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });
```

참고: `src/shared/api/tanstack-query/client.ts` — 프로덕션 `QueryClient`는 별도.

---

## 7. 기본 체크리스트 (새 테스트 작성 전)

1. 파일명 `*.spec.tsx` 인가
2. `QueryClientProvider`로 감쌌는가 (TanStack Query 사용 시)
3. MSW 핸들러가 요청 경로와 일치하는가 (오타 방지)
4. `waitFor(...)` 또는 `findBy*` 로 비동기 상태 대기했는가
5. `confirm` / `router.push` 등 side effect는 mock 했는가 (`jest.spyOn`) — `alert`·`prompt`는 `jest.setup.ts`가 테스트마다 새 spy로 준비한다 (§1)

---

## 8. Vitest 전환?

현재 **유지 결정** — 근거와 재검토 조건은 `.agents/rules/infra/library-decisions.md` §Jest → Vitest 참조.

---

## 9. 참고 자료

- Jest: https://jestjs.io
- Testing Library: https://testing-library.com
- MSW: https://mswjs.io
