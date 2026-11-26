---
paths:
  - 'src/**/*'
  - 'jest.config.ts'
  - 'jest.setup.ts'
---

# Coding Conventions Guide

## 프리플라이트 (새 코드 작성 전 순서대로 확인)

1. **Type 이름**: API 경계 값은 `api/types.ts`의 `<이름>Schema`와 거기서 유도한 `Req`/`Res` 타입 — §1.1
2. **TanStack Query 훅** — [`data-fetching.md`](../architecture/data-fetching.md)
   - 위치: 여러 슬라이스 공용 → `entities/<e>/model/`, 한 슬라이스 전용 → `features/<slice>/model/`
   - 쿼리키: `[entity, paramsObject]` 고정 (파라미터는 항상 객체 래핑)
3. **React Hook Form** — [`form-patterns.md`](../code-style/form-patterns.md)
   - 파일 3분할: `model/form.ts`(Zod 스키마·입력 타입·기본값) + `model/use<Slice>Form.ts`(`zodResolver` 연결) + `ui/<Slice>Form.tsx`. `register()` 인라인 룰 금지
   - `useForm()` 호출에 **`defaultValues` 필수**
   - `FormProvider` + `useFormContext()` (prop drilling 금지)
4. **피드백**: 완료·실패 알림은 `@shared/ui/toast`의 `toast`, 확인은 `@shared/ui/dialog/ConfirmDialog` — 네이티브 `alert()`·`confirm()`·`prompt()` 금지 — §3
5. **NextAuth deep-import**: `src/app/auth/config.ts`에서만 허용. 다른 곳에서 복제 금지 — [`auth.md`](../architecture/auth.md) §2
6. **테스트**: 파일명 `*.spec.tsx` 고정, MSW 오버라이드는 `server.use(http....)` — [`unit-testing.md`](../testing/unit-testing.md)

**Hard rules** (ESLint가 못 잡는 것 포함).

- `useForm()`에서 `defaultValues` 누락 → 작성 전에 반드시 추가
- `alert()`·`confirm()`·`prompt()` 호출 → 금지 (ESLint `no-alert`가 error). 알림은 `toast`, 확인·입력은 대화상자 — §3
- TS `enum` 사용 → as-const union으로 대체 — §1.4
- `QueryClient` 새로 생성 → `src/shared/api/tanstack-query/client.ts`만 사용
- `classnames` 신규 import → 금지 (사용처가 없어 의존성 제거) — [`styling.md`](./styling.md) §1

**라이브러리 추가**: 새 런타임 의존성을 제안하기 전에 [`library-decisions.md`](../infra/library-decisions.md) 결정 테이블을 확인한다. "유지" 결정이 박힌 후보의 역(교체)을 무단 제안하지 말 것. 재검토 조건이 충족됐다면 그 조건을 인용해 사용자에게 확인 요청.

**When in doubt**: 새 패턴을 도입하기 전에 사용자에게 묻는다. 컨벤션에서 벗어난 한 줄은 수개월 후 표준을 오염시킨다.

---

> 작성일: 2026-04-19
> 대상 브랜치: `develop`
> 범위: **가로지르는** 코드 컨벤션 (TypeScript, 파일 네이밍, 에러/피드백 정책). 라이브러리별 사용 규칙은 아래 하위 문서에서 다룬다.

## 하위 문서

| 주제                                     | 문서                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| 데이터 페칭 (TanStack Query, `fetchApi`) | [`.agents/rules/architecture/data-fetching.md`](../architecture/data-fetching.md) |
| 폼 (React Hook Form, Zod)                | [`.agents/rules/code-style/form-patterns.md`](../code-style/form-patterns.md)     |
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

### 1.1 요청/응답 타입: 스키마에서 유도 + `Req`/`Res` suffix

API 경계를 넘나드는 값은 `api/types.ts`에 Zod 스키마로 선언하고 타입은 스키마에서 유도한다. 스키마는 `<이름>Schema`, 타입은 `Schema`를 뺀 같은 이름을 쓰며 `Req`/`Res` suffix로 끝낸다.

```ts
// src/features/auth-signup/api/types.ts
/** 회원가입 응답 스키마 — 화면에서 쓰는 계정 식별자만 남긴다 */
export const SignUpResSchema = ApiResponseSchema.extend({
  data: z.object({ id: z.number() }),
});

/** 회원가입 응답 */
export type SignUpRes = z.infer<typeof SignUpResSchema>;
```

- 요청 스키마는 서버 액션이 받는 값의 형식을, 응답 스키마는 화면이 쓰는 필드를 선언한다 — [`data-fetching.md`](../architecture/data-fetching.md) §7
- 사용자 입력 규칙은 요청 스키마가 아니라 폼 스키마에 둔다 — [`form-patterns.md`](./form-patterns.md) §4
- 스키마로 검증하지 않는 요청 형태(식별자만 받는 `DeletePostReq` 등)는 `interface`로 선언한다. 쓰이지 않는 스키마는 만들지 않는다

근거 파일: `src/features/auth-signup/api/types.ts`, `src/features/post-list/api/types.ts`.

### 1.2 폼 입력 타입 / 스키마가 없는 객체 타입

- 폼 입력 타입은 `model/form.ts`의 폼 스키마에서 유도한다 (`SignUpFormInput`, `PostFormInput`) — [`form-patterns.md`](./form-patterns.md) §4.2
- 스키마가 없는 객체 타입(컴포넌트 props, 훅 인자, 검증하지 않는 요청 형태)은 `interface` + `PascalCase`로 선언한다

### 1.3 단순 별칭 / 유니온: `type`

```ts
export type CreatePostReq = PostBody;
type SignInResult = 'success' | 'invalid-credentials' | 'unavailable';
```

### 1.4 `enum` 대신 as-const union

런타임 객체를 불필요하게 만드는 TS `enum`은 사용하지 않는다. 검증에도 쓰는 값 집합은 `z.enum()`에서 타입을 유도한다.

```ts
// src/entities/post/model/types.ts
export const PostTypeSchema = z.enum(['notice', 'faq', 'free']);
export type PostType = z.infer<typeof PostTypeSchema>;
```

### 1.5 `I*`/`T*` 타입 접두사 금지 (ESLint 강제)

헝가리안 접두사(`IProps`, `TResult`)를 쓰지 않는다. interface/typeAlias/class/enum 이름은 접두사 없는 PascalCase — `@typescript-eslint/naming-convention`이 error로 잡는다. 역할은 suffix로 구분한다 (`Req`/`Res`, `<컴포넌트>Props`, `FormInput`).

---

## 2. 파일 / 디렉터리 네이밍

| 대상            | 네이밍                       | 예시                               |
| --------------- | ---------------------------- | ---------------------------------- |
| 컴포넌트 파일   | `PascalCase.tsx`             | `PostListItem.tsx`                 |
| 훅 파일         | `camelCase.ts`, `use` 접두사 | `useCreatePostForm.ts`             |
| 서비스 / 유틸   | `camelCase.ts`               | `signinService.ts`, `date.ts`      |
| API 스키마·타입 | `types.ts`                   | `src/features/*/api/types.ts`      |
| 폼 스키마·타입  | `form.ts`                    | `src/features/*/model/form.ts`     |
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

## 2.2 주석 / JSDoc 원칙

**원칙: 코드에 이미 있는 정보를 주석에 반복하지 마라.** 의미만 한 줄, 부연이 필요하면 두 줄.

- **export 대상(타입·함수·컴포넌트·상수)에는 JSDoc 한 줄** — `/** ... */` 형식만 (단일 라인 포함, IDE hover 인식). 기존 코드는 손댈 때 전환
  ```ts
  /** 게시글 삭제 mutation 훅 — 성공 시 목록으로 이동 */
  export function useDeletePost() { ... }
  ```
- **파일 헤더 주석은 두지 않는다** — export JSDoc과 중복. 파일은 `import`부터 시작한다. 헤더 한 줄은 **export JSDoc만으로 파일 역할이 안 드러나는 경우에 한해** 허용 (예: export 없는 스크립트, 여러 fetch를 묶은 api 파일). 이 경우에도 한 줄만
- 본문 주석은 **코드가 보여주지 못하는 제약**을 적을 때만 (예: "msw가 쓰는 cookie 2는 node_modules/msw 아래에 중첩 설치된다. 예외는 경로의 node_modules 구간마다 판정하므로 안쪽 패키지 이름도 둔다")
- TODO는 `TODO(추적키): 사유` 형식만. 추적 키 없는 TODO 금지
- `eslint-disable`은 반드시 **사유 주석과 함께, 해당 라인에만** (`-next-line`). 파일 전체 disable 금지

**절대 금지.**

- 다음 줄이 뭘 하는지 반복하는 주석, `/** GET /api/... */` 류 method/path 메타 주석 (코드와 100% 중복)
- `// ── 섹션 ────` 구분선 주석 — 코드 구조는 export 순서·들여쓰기로 충분
- 작업 이력·리뷰 맥락·AI 흔적 주석 (`// TASK-123에서 추가`, `// 기존엔 X였으나 Y로 변경` — 이력은 git이 SSOT)
- `// X 컴포넌트에서 사용` 호출자 맥락 주석 (코드 변경에 쉽게 거짓이 됨)

---

## 3. 에러 / 피드백 정책

### 3.1 알림 (토스트)

- 동작의 완료·실패는 `@shared/ui/toast`의 `toast.success(...)` / `toast.error(...)`로 알린다. 슬라이스에서 `sonner`를 직접 import하지 않는다 (라이브러리 선정 근거는 [`library-decisions.md`](../infra/library-decisions.md) §토스트 알림)
- 알림 영역 `@shared/ui/toast/Toaster`는 루트 레이아웃(`src/app/(domain)/layout.tsx`)에 한 번만 둔다
- 성공 알림은 잠시 뒤 사라진다. 오류 알림은 닫기 버튼을 누르거나 다음 요청을 시작할 때까지 남는다 — 변경 요청(mutation)과 로그인 시도는 시작할 때 표시 중인 알림을 닫는다
- Mutation 실패는 `QueryClient`가 한곳에서 알린다. 각 mutation은 `meta.errorMessage`에 문구만 지정한다 — [`data-fetching.md`](../architecture/data-fetching.md) §5
- 알림 직후 전체 문서 이동(Auth.js `signIn`·`signOut` 리다이렉트)이 이어지면 `toast.success(message, { survivesNavigation: true })`를 쓴다. 표시를 마치기 전에 문서가 바뀌면 다음 문서에서 한 번 더 표시한다
- 새 변경 요청은 표시 중인 알림을 닫으므로, 요청이 진행 중일 때는 같은 동작을 다시 제출하지 않게 막는다. 렌더된 `isPending`은 연속 제출을 막지 못하므로 제출 순간 잠그는 ref를 쓴다 (`SignUpView`의 가입 요청)
- 문구는 고정 문자열로 쓰고 서버 오류 원문을 넣지 않는다. 알림은 `aria-live="polite"` 영역으로 전달된다

### 3.2 확인과 추가 입력 (대화상자)

- 되돌릴 수 없는 동작은 `@shared/ui/dialog/ConfirmDialog`로 확인받는다. 열리면 취소에 초점을 둔다
- 확인에 입력이 필요하면 `@shared/ui/dialog/Dialog` 안에 폼을 둔다 (예: `src/features/auth-account/ui/DeleteAccountDialog.tsx`)
- 대화상자는 네이티브 `<dialog>`의 모달 동작(배경 비활성화, Esc 닫기, 닫힌 뒤 초점 복귀)을 쓰고, 열림 상태는 상위가 `open`으로 제어한다
- 대화상자가 열린 동안 바깥의 알림 영역은 조작할 수 없다. 대화상자 안에서 생긴 오류는 대화상자 안에 표시한다
- 대화상자의 열림 상태와 입력은 그것을 연 대상에 묶는다. 대상이 바뀌면 닫고 입력을 버린다 — 탈퇴 대화상자는 연 계정의 세션이 끝나거나 다른 계정으로 바뀌면 닫힌다 (`useAccountManager`). 입력은 `key`로 대화상자를 새로 만들지 않고 `reset()`으로 비운다. 열린 `<dialog>`를 DOM에서 그냥 제거하면 브라우저가 초점을 되돌리지 않는다
- 확인 뒤 요청하는 동안 여는 버튼이 비활성화되면 브라우저가 초점을 되돌리지 못한다. 요청이 실패해 버튼을 다시 쓸 수 있게 되면 한 번만, 사용자가 그사이 옮기지 않은 초점을 직접 되돌린다 (`useAccountManager`)

### 3.3 화면 안의 상태

- 입력 검증 실패: RHF `errors` → 필드 아래 `ValidationError` (`aria-invalid`·`aria-describedby` 연결)
- 조회 실패·빈 결과·로딩은 해당 화면 안에 표시한다. 토스트로 대체하지 않는다

### 3.4 금지

- 네이티브 `alert()`·`confirm()`·`prompt()` — 초점을 빼앗고 스타일을 맞출 수 없으며 흐름을 막는다. ESLint `no-alert`가 error로 막는다

---

## 4. 참고 자료

- FSD 배치 규칙: [`.agents/rules/architecture/fsd-architecture.md`](../architecture/fsd-architecture.md)
- 라이브러리 교체 판단: [`.agents/rules/infra/library-decisions.md`](../infra/library-decisions.md)
- 의존성 마이그레이션 이력: [`.agents/rules/infra/migration-history.md`](../infra/migration-history.md)
