# Feature-Sliced Design (FSD) Guide

> 작성일: 2026-04-13
> 대상 브랜치: `develop`
> 참고: 본 프로젝트는 Next.js 16 App Router 기반이며, FSD 표준의 `pages` 레이어는 **`views`** 로 네이밍한다 (라우팅 계층인 `src/app`과 명확히 구분).

## 개요

Feature-Sliced Design은 프런트엔드 코드를 **계층(layer) → 슬라이스(slice) → 세그먼트(segment)** 의 3단계로 조직하는 아키텍처 방법론이다. 본 문서는 이 프로젝트에 적용되는 규칙·네이밍·import 방향을 정의한다.

해결하려는 문제:
- 기능 단위 응집도를 강제해 도메인 코드가 흩어지는 현상 차단
- import 방향을 한쪽으로 고정해 순환 참조·의도치 않은 결합 제거
- 신규 인원과 Claude가 동일한 의사결정 트리로 새 코드를 배치

---

## 1. 레이어 정의

상위 레이어는 하위 레이어만 import 할 수 있다. 동일 레이어의 다른 슬라이스끼리도 직접 import 금지(공유물은 한 단계 아래로 끌어내림).

| 레이어 | 디렉터리 | 책임 | 비고 |
|---|---|---|---|
| `app` | `src/app/`, `src/middleware.ts` | Next.js 라우팅·생명주기 아티팩트(`page`/`layout`/`loading`/`error`/`route`/`middleware` 등) | **얇게** 유지. 실제 합성은 `views`/`widgets`로 위임. 위치는 Next.js가 강제하므로 옮기지 않는다 |
| `views` | `src/views/` | 화면 단위 합성 (FSD 표준의 `pages`) | App Router `page.tsx`가 import |
| `widgets` | `src/widgets/` | 여러 features/entities를 묶는 독립 UI 블록 | 단일 features만 사용한다면 widget 불필요 |
| `features` | `src/features/` | 사용자 인터랙션 단위 (signin form, post-create flow) | 슬라이스명: `<도메인>-<액션>` (e.g. `auth-signin`) |
| `entities` | `src/entities/` | 도메인 모델 + 도메인 공용 UI/타입 | User, Post 등 비즈니스 엔티티 |
| `shared` | `src/shared/` | 도메인 무관 재사용 자산 | UI 프리미티브, 유틸, 설정 |

### Import 방향 (요약)

```
app  →  views  →  widgets  →  features  →  entities  →  shared
```

화살표 반대 방향 import는 ESLint(`boundaries/element-types`)가 차단한다.

---

## 2. 슬라이스 명명 규칙

- **kebab-case**: `post-list`, `auth-signin`, `auth-account`
- features는 `<도메인>-<액션>` 형태 권장 (검색·grouping 용이)
- entities는 단일 명사 (`auth`, `post`, `user`)
- views는 라우트와 직관적으로 매핑되는 이름 (`post-detail`, `signin`, `home`)

---

## 3. 세그먼트 표준

각 슬라이스 내부는 다음 세그먼트로 분리한다.

| 세그먼트 | 내용 | 예시 |
|---|---|---|
| `ui/` | 컴포넌트 (React) | `SignInForm.tsx`, `PostListItem.tsx` |
| `model/` | 상태/훅/뷰모델/폼 타입 | `useSignInForm.ts`, `usePostListManager.ts`, `form.ts` |
| `api/` | 서버 통신, 요청/응답 타입 | `signinService.ts`, `api.ts`(Req/Res) |
| `lib/` | 슬라이스 로컬 헬퍼 (외부 비공개) | 날짜 포맷터, validators |
| `config/` | 상수, enum, constants | `TOKEN_KEY`, `PostType` |

세그먼트는 모두 선택. 사용 안 하면 폴더를 만들지 않는다.

---

## 4. 공개 API 규칙 (Public API)

각 슬라이스 루트에 `index.ts`를 둬 외부에 노출할 심볼만 re-export 한다.

```ts
// src/features/auth-signin/index.ts
export { SignInForm } from './ui/SignInForm';
export { useSignInForm } from './model/useSignInForm';
export type { SignInRequest } from './api/types';
```

외부에서는 슬라이스 루트 import만 허용:

```ts
//  허용
import { SignInForm } from '@features/auth-signin';

//  금지 — 내부 경로 직접 접근
import { SignInForm } from '@features/auth-signin/ui/SignInForm';
```

ESLint `boundaries/entry-point` + `boundaries/no-private`가 강제한다.

---

## 5. Path Alias 규칙

`tsconfig.json`에 정의된 alias만 사용. 상대경로(`../../../`)는 슬라이스 내부로만 허용.

| Alias | 매핑 |
|---|---|
| `@app/*` | `src/app/*` |
| `@views/*` | `src/views/*` |
| `@widgets/*` | `src/widgets/*` |
| `@features/*` | `src/features/*` |
| `@entities/*` | `src/entities/*` |
| `@shared/*` | `src/shared/*` |
| `@styles/*` | `src/styles/*` |
| `@public/*` | `public/*` |

---

## 6. Next.js 통합 규칙

- **`src/app/**/page.tsx`는 `views/`만 import**. 비즈니스 로직·합성은 view에 위임.
  ```tsx
  // src/app/(domain)/post/(list)/page.tsx
  import { PostListView } from '@views/post-list';
  export default PostListView;
  ```
- 메타데이터(`export const metadata`, `generateMetadata`)는 `page.tsx` 또는 `layout.tsx`에 둔다(Next.js가 이 두 파일에서만 인식).
- `layout.tsx`도 `page.tsx`와 동일 원칙: 얇게 유지, 합성 로직이 자라면 view 또는 widget으로 추출하고 import만 한다.
- 클라이언트/서버 컴포넌트 분기(`'use client'`)는 view 또는 widget에서 결정.
- `src/middleware.ts`는 Next.js가 위치를 `src/` 루트로 강제하므로 옮기지 않는다(`src/app/` 안에 두지 못함). app 레이어 멤버이며, 다른 routing 파일과 동일하게 얇게 유지한다.
- `src/app/api/**/route.ts`는 라우트 핸들러로서 app 레이어 멤버. 비즈니스 로직은 features/entities/shared로 위임한다.
- Route Group(`(domain)`, `(auth)` 등) 네이밍은 라우팅 표현이며 FSD 슬라이스와 1:1 매핑하지 않는다.

### NextAuth 설정 위치

NextAuth v5는 `auth.ts`의 위치를 강제하지 않는다. 본 프로젝트는 NextAuth 설정을 **app 레이어 (`src/app/auth/config.ts`)에 둔다**. 이유: 이 파일은 인증 플로우(`fetchSignIn`, `fetchUser`)를 오케스트레이션하므로 features/entities를 호출할 권한이 필요하고, 이는 app 레이어에서만 허용되기 때문. middleware와 route handler는 `@app/auth/config`로 import.

---

## 7. 결정 가이드 — "이 코드는 어디에 둬야 하나"

위에서부터 순서대로 답하고, 처음 매칭되는 곳에서 멈춘다.

1. **도메인과 무관한가?** (버튼, 스피너, 날짜 유틸, 환경 설정 등) → `shared/<segment>/`
2. **특정 도메인의 모델/공용 UI인가?** (Post 타입, AuthHeader, Pagination) → `entities/<entity>/<segment>/`
3. **사용자 인터랙션/플로우인가?** (폼 제출, 리스트 필터링, 뮤테이션) → `features/<도메인>-<액션>/<segment>/`
4. **여러 features/entities를 묶는 독립 UI 블록인가?** → `widgets/<widget-name>/<segment>/`
5. **하나의 라우트 화면 전체 합성인가?** → `views/<route-name>/`
6. **Next.js 라우팅·생명주기 아티팩트인가?** (`page`/`layout`/`loading`/`error`/`route` under `src/app/**`, `src/middleware.ts`) → `app` 레이어. 위치는 Next.js가 강제하므로 옮기지 않고, 합성은 `views`/`widgets`에서 import만 한다

같은 코드가 여러 features에서 쓰이면 하단 레이어로 끌어내려 공유한다(entities 또는 shared).

---

## 8. 마이그레이션 매핑 표

현재 → 목표 (Phase C에서 단계적 적용):

| 현재 위치 | 이동 후 |
|---|---|
| `src/domains/auth/_components/AuthHeader.tsx` | `src/entities/auth/ui/AuthHeader.tsx` |
| `src/domains/auth/_components/AuthForm/*` | `src/entities/auth/ui/AuthForm/*` |
| `src/domains/auth/_constants/auth.ts` (TOKEN_KEY) | `src/shared/config/auth.ts` (cross-cutting cookie key) |
| `src/domains/auth/_services/userServices.ts` | `src/entities/auth/api/userServices.ts` |
| `src/domains/auth/_types/api.ts` | `src/entities/auth/api/types.ts` |
| `src/domains/auth/signin/**` | `src/features/auth-signin/{ui,model,api}/` |
| `src/domains/auth/signup/**` | `src/features/auth-signup/{ui,model,api}/` |
| `src/domains/auth/account/**` | `src/features/auth-account/{ui,model,api}/` |
| `src/domains/post/_components/Pagination.tsx` | `src/entities/post/ui/Pagination.tsx` |
| `src/domains/post/_components/{Editor,Form/*}` | `src/entities/post/ui/*` |
| `src/domains/post/_constants/post.ts` | `src/entities/post/config/post.ts` |
| `src/domains/post/_types/postType.ts` | `src/entities/post/model/types.ts` |
| `src/domains/post/list/**` | `src/features/post-list/{ui,model,api}/` |
| `src/domains/post/detail/**` | `src/features/post-detail/{ui,model,api}/` |
| `src/domains/post/create/**` | `src/features/post-create/{ui,model,api}/` |
| `src/domains/post/update/**` | `src/features/post-update/{ui,model,api}/` |
| `src/shared/components/{Layout,Provider,Spinner,Error}` | `src/shared/ui/{layout,provider,spinner,error}/` |
| `src/shared/utils/{api,date,url}.ts` | `src/shared/lib/{api,date,url}/` |
| `src/shared/types/{api,pagination}.ts` | `src/shared/api/types.ts` |
| `src/shared/types/declare/*` | `src/shared/config/declare/*` |
| `src/lib/tanstackQuery/*` | `src/shared/api/tanstack-query/*` |
| `src/lib/mocks/*` | `src/shared/api/mocks/*` |
| `src/tests/mocks/*` | `src/shared/lib/testing/*` |
| `src/auth.ts` | `src/app/auth/config.ts` (NextAuth orchestration belongs to app layer) |
| `src/app/(domain)/.../page.tsx` 합성 로직 | `src/views/<route>/` (page.tsx는 view import만) |
| `src/app/(domain)/.../layout.tsx` 합성 로직 | `src/views/<route>/` 또는 `src/widgets/<name>/` (layout.tsx는 import만) |
| `src/middleware.ts` | (이동 없음) — Next.js 강제. 내부 로직은 entities/shared로 추출 후 import |

widgets 후보: `PostListContainer + PostListFilter` 묶음 → `src/widgets/post-list-container/` (Phase C-5에서 결정).

---

## 9. ESLint 강제 규칙

`eslint-plugin-boundaries`로 다음을 차단한다:

- 레이어 방향 위반 (`shared`가 `features` import 등) — `boundaries/element-types`
- 동일 레이어 슬라이스 간 직접 import (`features/post-list`가 `features/post-detail` import) — `boundaries/element-types` + `boundaries/no-private`
- 슬라이스 내부 경로 deep import (`@features/auth-signin/ui/SignInForm`) — `boundaries/entry-point`
- 어느 레이어에도 속하지 않는 디렉터리 추가 — `boundaries/no-unknown-files`

마이그레이션 진행 중에는 `severity: 'warn'`, Phase C 완료 시 `'error'`로 승격한다.

---

## 10. 참고 자료

- 공식 문서: https://feature-sliced.design
- Next.js 통합 가이드: https://feature-sliced.design/docs/guides/tech/with-nextjs
- `eslint-plugin-boundaries`: https://github.com/javierbrea/eslint-plugin-boundaries
