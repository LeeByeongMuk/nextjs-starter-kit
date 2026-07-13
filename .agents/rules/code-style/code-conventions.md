---
paths:
  - 'src/**/*'
  - 'jest.config.ts'
  - 'jest.setup.ts'
---

# Coding Conventions Guide

## 프리플라이트 (새 코드 작성 전 순서대로 확인)

1. **Type 이름**: API 경계 타입이면 `interface` + `Req`/`Res` suffix — §1.1
2. **TanStack Query 훅** — [`data-fetching.md`](../architecture/data-fetching.md)
   - 위치: 여러 슬라이스 공용 → `entities/<e>/model/`, 한 슬라이스 전용 → `features/<slice>/model/`
   - 쿼리키: `[entity, paramsObject]` 고정 (파라미터는 항상 객체 래핑)
3. **React Hook Form** — [`form-patterns.md`](../code-style/form-patterns.md)
   - 파일 3분할: `model/form.ts` + `model/use<Slice>Form.ts` + `ui/<Slice>Form.tsx`
   - `useForm()` 호출에 **`defaultValues` 필수**
   - `FormProvider` + `useFormContext()` (prop drilling 금지)
4. **에러 피드백**: **신규 `alert()` 호출 금지** — §3.4
5. **NextAuth deep-import**: `src/app/auth/config.ts`에서만 허용. 다른 곳에서 복제 금지 — [`auth.md`](../architecture/auth.md) §2
6. **테스트**: 파일명 `*.spec.tsx` 고정, MSW 오버라이드는 `server.use(http....)` — [`unit-testing.md`](../testing/unit-testing.md)

**Hard rules** (ESLint가 못 잡는 것 포함).

- `useForm()`에서 `defaultValues` 누락 → 작성 전에 반드시 추가
- `alert()` 신규 호출 → 작성 금지 (기존 호출은 교체 대상)
- TS `enum` 사용 → as-const union으로 대체 — §1.4
- `QueryClient` 새로 생성 → `src/shared/api/tanstack-query/client.ts`만 사용
- `classnames` 신규 import → 금지 (기존 2곳 외 확산 방지) — [`styling.md`](./styling.md) §1

**라이브러리 추가**: 새 런타임 의존성을 제안하기 전에 [`library-decisions.md`](../infra/library-decisions.md) 결정 테이블을 확인한다. "유지" 결정이 박힌 후보의 역(교체)을 무단 제안하지 말 것. 재검토 조건이 충족됐다면 그 조건을 인용해 사용자에게 확인 요청. 예외: **Zod**는 "도입" 결정이므로 후속 PR에서 능동 적용 가능.

**When in doubt**: 새 패턴을 도입하기 전에 사용자에게 묻는다. 컨벤션에서 벗어난 한 줄은 수개월 후 표준을 오염시킨다.

---

> 작성일: 2026-04-19
> 대상 브랜치: `develop`
> 범위: **가로지르는** 코드 컨벤션 (TypeScript, 파일 네이밍, 에러/피드백 정책). 라이브러리별 사용 규칙은 아래 하위 문서에서 다룬다.

## 하위 문서

| 주제                                     | 문서                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| 데이터 페칭 (TanStack Query, `fetchApi`) | [`.agents/rules/architecture/data-fetching.md`](../architecture/data-fetching.md) |
| 폼 (React Hook Form)                     | [`.agents/rules/code-style/form-patterns.md`](../code-style/form-patterns.md)     |
| 인증 (NextAuth v5)                       | [`.agents/rules/architecture/auth.md`](../architecture/auth.md)                   |
| 스타일링 (Tailwind v4)                   | [`.agents/rules/code-style/styling.md`](../code-style/styling.md)                 |
| 테스팅 (Jest / RTL / MSW)                | [`.agents/rules/testing/unit-testing.md`](../testing/unit-testing.md)             |

파일 배치(어떤 레이어에 두는가)는 `.agents/rules/architecture/fsd-architecture.md`. 라이브러리 교체 여부는 `.agents/rules/infra/library-decisions.md`.

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
- import 순서: ESLint `simple-import-sort` 자동 정렬 (`npm run lint:fix`)에 위임. 수동 조정 금지

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

### 1.5 `I*`/`T*` 타입 접두사 금지 (ESLint 강제)

헝가리안 접두사(`IProps`, `TResult`)를 쓰지 않는다. interface/typeAlias/class/enum 이름은 접두사 없는 PascalCase — `@typescript-eslint/naming-convention`이 error로 잡는다. 역할은 suffix로 구분한다 (`Req`/`Res`, `<컴포넌트>Props`, `FormInput`).

---

## 2. 파일 / 디렉터리 네이밍

| 대상            | 네이밍                       | 예시                               |
| --------------- | ---------------------------- | ---------------------------------- |
| 컴포넌트 파일   | `PascalCase.tsx`             | `PostListItem.tsx`                 |
| 훅 파일         | `camelCase.ts`, `use` 접두사 | `useCreatePostForm.ts`             |
| 서비스 / 유틸   | `camelCase.ts`               | `signinService.ts`, `fetchApi.ts`  |
| API 타입 전용   | `types.ts`                   | `src/features/*/api/types.ts`      |
| 폼 타입 전용    | `form.ts`                    | `src/features/*/model/form.ts`     |
| 상수            | `<domain>.ts`                | `src/entities/post/config/post.ts` |
| 슬라이스 barrel | `index.ts` (고정)            | `src/features/post-list/index.ts`  |
| 테스트          | `<file>.spec.tsx`            | `signin.spec.tsx`                  |

슬라이스 이름 자체의 규칙(kebab-case, `<도메인>-<액션>`)은 `.agents/rules/architecture/fsd-architecture.md` §2 참조.

### 2.1 import 규칙 (ESLint 강제)

- **정렬**: `simple-import-sort`가 import/export 순서를 강제한다 — 위반은 `npm run lint:fix`로 자동 정렬
- **미사용 import**: `unused-imports/no-unused-imports`가 error — 자동 제거됨
- **같은 슬라이스 내부는 상대 경로**: 자기 슬라이스를 `@features/post-list/...` alias로 import하면 `fsd/relative-imports`가 error — `./`, `../` 사용
- 레이어 경계·Public API 규칙은 `boundaries/dependencies` (v7 policies) — `.agents/rules/architecture/fsd-architecture.md` §1, §4

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

- FSD 배치 규칙: [`.agents/rules/architecture/fsd-architecture.md`](../architecture/fsd-architecture.md)
- 라이브러리 교체 판단: [`.agents/rules/infra/library-decisions.md`](../infra/library-decisions.md)
- 의존성 마이그레이션 이력: [`.agents/rules/infra/migration-history.md`](../infra/migration-history.md)
