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
- Setup: `jest.setup.ts` — MSW `testServer` 부트와 핸들러 초기화, `console.error` 억제, 알림·`sessionStorage` 비우기, `<dialog>` 보완
- `next-auth/react` 모킹: `jest.config.ts`의 `moduleNameMapper`가 `src/shared/lib/testing/nextAuthReact.tsx`로 연결한다
- 알림·대화상자: 앱이 네이티브 `alert`·`confirm`·`prompt`를 쓰지 않으므로 mock하지 않고, 화면에 렌더된 결과를 단언한다.
  - 알림을 확인하는 테스트는 `render(<Toaster />)`로 알림 영역(`@shared/ui/toast/Toaster`)을 함께 렌더하고 `findByText`로 문구를 찾는다. 떠 있는 알림은 `@shared/lib/testing/toast`의 `queryToasts()`로 센다. 알림은 한 박자 늦게 렌더되므로, 알림이 뜨지 않아야 하는 흐름은 화면 조회 대신 같은 모듈의 `spyOnToast()`로 알림 요청이 없었는지 확인한다. 화면과 `renderHook`의 wrapper에 넣으면 알림이 중복 렌더되므로 `Toaster`는 별도로 한 번만 렌더한다.
  - 변경 요청(mutation)의 실패 알림은 `getQueryClient()`가 만든 클라이언트에서만 표시된다. 직접 만든 `QueryClient`로 감싼 테스트에서는 나타나지 않는다.
  - 알림 상태는 전역이다. `jest.setup.ts`의 `afterEach`가 `toast.dismiss()`와 `sessionStorage.clear()`로 테스트마다 비운다.
  - 대화상자는 `getByRole('dialog' | 'alertdialog', { name })`로 찾고 안쪽 요소는 `within(dialog)`로 고른다. 닫힌 대화상자의 내용은 역할 조회에 잡히지 않는다.
  - jsdom은 `<dialog>`의 `showModal()`·`close()`를 구현하지 않아 `jest.setup.ts`가 열림 상태, 닫힐 때의 초점, `close` 이벤트를 보완한다. 닫히면 열기 전에 초점이 있던 요소로 되돌리고, 그 요소를 쓸 수 없으면 초점을 내려놓는다. `fireEvent.click`은 초점을 옮기지 않으므로 여는 버튼으로 돌아오는지 확인하려면 먼저 `focus()`한다. 브라우저가 Esc로 직접 닫는 경우는 테스트에서 `dialog.close()`를 호출해 재현한다. `close` 이벤트는 브라우저처럼 나중에 전달되므로 결과는 `waitFor`로 기다린다. 초점 가두기와 배경 비활성화는 실제 브라우저에서 확인한다.
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

NextAuth / Auth.js 계열은 ESM 전환이 잦다. msw가 쓰는 ESM 전용 `@open-draft/deferred-promise` 3.x는 `@mswjs/interceptors`가 쓰는 2.x와 함께 설치되므로 npm 호이스팅에 따라 위치가 바뀐다. 현재 잠금 파일에서는 최상위 `node_modules/@open-draft`에 있어 `@open-draft` 예외로 변환된다. `node_modules/msw/node_modules` 아래로 중첩되면 바깥 패키지 `msw`도 예외 목록에 있어야 변환되므로 두 예외를 함께 유지한다. **테스트가 갑자기 깨지면 여기를 먼저 확인**. 예외 추가 시 `npm test` 전체 재실행 필수.

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
| 훅 / 서비스 단위 테스트 (권장) | 슬라이스 내부 (`model/` 또는 `api/`) | `<file>.spec.tsx` |
| 컴포넌트 테스트                | 컴포넌트 옆 (`ui/`)                  | `<file>.spec.tsx` |

화면에 그려지는 결과는 페이지 통합 테스트로 확인한다. 컴포넌트 테스트는 화면 흐름으로 만들기 어려운 상태를 가진 공용 컴포넌트(대화상자, 알림 영역, 편집기, 게시글 폼의 이미지 읽기)에만 둔다. UI 컴포넌트 단위 snapshot 테스트는 지양 — 렌더 구조 변경에 취약하고 가치 낮음.

폼 스키마의 오류 문구는 `@shared/lib/testing/form`의 `resolveFormErrors(schema, values)`로 단언한다. 화면과 같은 `zodResolver`가 고른 필드별 오류를 돌려주며, 이 값은 `safeParse`의 `issues[0]`과 다를 수 있다. 필드 하나의 규칙은 `z.object({ value: schema })`로 감싸 확인한다.

테스트 파일 확장자는 `.spec.tsx` 고정. `.test.tsx` 사용 금지.

---

## 5. MSW 패턴

### 5.1 기본 핸들러

도메인별로 `src/shared/api/mocks/handlers/*.ts`에 분리하고 `handlers/index.ts`에서 합친다. 경로는 `getHandlerURI()`로 만든다:

```ts
// src/shared/api/mocks/handlers/userHandler.ts
export const userHandler = [
  http.post(getHandlerURI('/api/users/signin'), () =>
    HttpResponse.json(userData.signin)
  ),
];
```

### 5.2 테스트 내부 오버라이드

```ts
server.use(
  http.post(
    getHandlerURI('/api/users/signin'),
    () => new HttpResponse(null, { status: 401 })
  )
);
```

`server.resetHandlers()`는 `jest.setup.ts`의 `afterEach`가 자동 수행.

### 5.3 개발 서버용 MSW

`src/shared/api/mocks/server.ts`는 Express 기반 독립 mock 서버다. `npm run mock`은 잠금 파일에 포함된 `tsx`로 실행하며 테스트의 `setupServer`와 분리된다. 브라우저 Service Worker는 사용하지 않는다.

---

## 6. TanStack Query 테스트 팁

- `QueryClientProvider`로 감싸기 필수
- 조회만 검증하는 테스트는 `new QueryClient()`를 만들어 캐시를 격리한다
- 변경 요청의 실패 알림까지 검증하는 테스트는 앱의 `getQueryClient()`를 쓴다 (§1)
- `retry: false` 옵션으로 실패 테스트의 지연 방지

```ts
const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });
```

참고: `src/shared/api/tanstack-query/client.ts` — 앱의 `QueryClient`와 변경 요청 실패 알림 설정.

---

## 7. 기본 체크리스트 (새 테스트 작성 전)

1. 파일명 `*.spec.tsx` 인가
2. `QueryClientProvider`로 감쌌는가 (TanStack Query 사용 시)
3. MSW 핸들러가 요청 경로와 일치하는가 (오타 방지)
4. `waitFor(...)` 또는 `findBy*` 로 비동기 상태 대기했는가
5. `router.push` 등 side effect는 mock 했는가 (`jest.spyOn`·`jest.fn`). 알림을 단언한다면 `<Toaster />`를 렌더했는가 (§1)

---

## 8. Vitest 전환?

현재 **유지 결정** — 근거와 재검토 조건은 `.agents/rules/infra/library-decisions.md` §Jest → Vitest 참조.

---

## 9. 참고 자료

- Jest: https://jestjs.io
- Testing Library: https://testing-library.com
- MSW: https://mswjs.io
