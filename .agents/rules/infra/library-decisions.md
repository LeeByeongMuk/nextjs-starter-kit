---
paths:
  - 'package.json'
---

# Library Decisions

> 작성일: 2026-04-19
> 대상 브랜치: `develop`
> 목적: "라이브러리 X를 Y로 바꾸자"는 논의가 반복되지 않도록 **왜 지금 하지 않는가**(또는 **왜 하는가**)를 근거와 재검토 조건과 함께 기록한다.

각 후보는 다음 형식으로 서술:

- **현황** — 지금 이 레포에서 어떻게 쓰이고 있는가
- **교체 찬** — 바꿀 때 얻는 것
- **교체 반** — 지금 안 바꾸는 이유
- **비용** — small / medium / large (공수 + 회귀 리스크)
- **결정** — 유지 / 도입 / 보류
- **재검토 조건** — 어떤 상황이 되면 이 결정을 다시 연다

---

## 결정 요약

| 후보                                                                                | 결정                       | 재검토 조건                                    |
| ----------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------- |
| [Jest → Vitest](#jest--vitest)                                                      | **유지 (Jest 30)**         | 테스트 파일 > 30 또는 CI 테스트 시간 > 3분     |
| [폼/API 런타임 검증: Zod](#zod-도입)                                                | **도입 (별도 PR)**         | 즉시 유효 — 후속 `feat/zod-validation`         |
| [`classnames` → `clsx`](#classnames--clsx)                                          | **유지**                   | 사용처 5개 이상 또는 번들 최적화 패스          |
| [MSW 2](#msw-2)                                                                     | **유지**                   | —                                              |
| [Toast UI Editor → TipTap/Lexical](#toast-ui-editor--tiptaplexical)                 | **유지 (보류)**            | Editor 성능·SSR 이슈 재발 또는 협업 기능 요구  |
| [Prettier + ESLint → Biome](#prettier--eslint--biome)                               | **유지**                   | ESLint 플러그인 호환 대란 또는 lint 시간 > 30s |
| [NextAuth v5 beta → stable](#nextauth-v5-beta--stable)                              | **stable 즉시 업그레이드** | stable 릴리스 시                               |
| [HTTP client (ky/ofetch)](#http-client-kyofetch)                                    | **유지 (자체 `fetchApi`)** | 재시도/타임아웃/인터셉터 중 2개 이상 필요      |
| [npm workspaces + `packages/eslint-config`](#npm-workspaces--packageseslint-config) | **보류**                   | 두 번째 앱 또는 외부 소비자 발생 시            |

---

## Jest → Vitest

- **현황**: Jest 30 + ts-jest, `jest-fixed-jsdom`, MSW 2 연동. `jest.config.ts`에 ESM 패키지 transformIgnore 예외(`rettime`, `until-async`, `next-auth`, `@auth`). 테스트 파일 7개 (`src/app/**/*.spec.tsx`). 커버리지 60% 기준
- **교체 찬**: Vitest가 ESM 네이티브 + SWC/esbuild 기반으로 빠름. `transformIgnorePatterns` 같은 수동 튜닝 불필요. Vite 생태계와 호환
- **교체 반**:
  - Jest 30은 최신 메이저, 기능 결함 없음
  - 현재 테스트 7개 — 속도 gain 체감 미미 (초 단위)
  - NextAuth/Auth.js의 ESM 이슈가 Vitest로 옮긴다고 자동 해결되지 않음 (Vitest도 `deps.inline`/`server.deps` 튜닝 필요)
  - `next/jest` preset을 버려야 하므로 Next.js 공식 경로에서 벗어남
- **비용**: Medium — 설정 포팅 + 7개 테스트 검증 + CI 파이프라인 조정
- **결정**: **유지**
- **재검토 조건**: 테스트 파일 수가 30개를 초과하거나 CI에서 `npm test` 소요 시간이 3분을 넘을 때. Vitest v4 이상이 `next/jest` 수준의 공식 preset을 제공할 때

---

## Zod 도입

- **현황**: 런타임 검증 **없음**. `React Hook Form`의 `register()` 인라인 룰(regex, required)만 존재. API 응답은 `interface`로 타입 단언만 — 스키마 부재
- **교체 찬** (도입 찬):
  - **폼 검증 단일화**: `zodResolver(schema)`로 RHF + Zod 연동 → 검증 룰을 한 곳에서 관리
  - **API 경계 안전성**: `fetchApi<Schema>()`가 응답을 런타임 파싱 → 서버 스펙 변경 시 즉시 감지
  - **에러 포맷 표준화**: `ApiError` 스키마 → `onError`에서 일관된 메시지 추출
  - **타입 추론 통합**: `z.infer<typeof SignInReqSchema>` → 수동 `interface` 제거
- **교체 반**: 없음 — 런타임 검증이 아예 없는 것이 문제
- **비용**: Small (2~4h)
- **결정**: **도입** (별도 PR `feat/zod-validation`)
- **재검토 조건**: 즉시 유효

### Zod 도입 체크리스트 (후속 PR)

1. `npm i zod @hookform/resolvers`
2. 각 `src/features/*/api/types.ts`를 Zod 스키마로 재작성하고 기존 `interface`는 `z.infer<...>`로 대체
   - 우선순위: `auth-signin` → `auth-signup` → `post-create` → `post-update` → `post-list`
3. `src/features/*/model/use<Slice>Form.ts`에 `zodResolver(schema)` 연결
4. `src/shared/lib/api.ts`의 `fetchApi<T>()`에 optional `schema?: ZodSchema<T>` 파라미터 추가 → 있으면 `schema.parse(json)`
5. `src/shared/api/types.ts`에 `ApiErrorSchema` 정의 → 중앙 에러 핸들러 기반 확보
6. 테스트: 기존 7개 `*.spec.tsx` 통과 + 신규 스키마 단위 테스트(`*.schema.spec.ts`)

---

## `classnames` → `clsx`

- **현황**: `classnames` 2곳 사용 (`src/entities/post/ui/TypeSelect.tsx`, `src/entities/post/ui/Pagination.tsx`). 나머지는 Tailwind 유틸리티 리터럴
- **교체 찬**: `clsx`는 더 가볍고(1.4KB vs 4.7KB) API 호환. cva는 컴포넌트 variants에 유용
- **교체 반**: 2곳만 쓰는 라이브러리의 교체는 순수 기회비용. `classnames` 유지비가 0에 가까움. cva는 현재 디자인 시스템에 비하면 과투자
- **비용**: Small (2파일)
- **결정**: **유지**
- **재검토 조건**: `classnames` 사용처가 5개 이상으로 늘거나, 번들 사이즈 최적화 패스를 할 때 함께 정리

---

## MSW 2

- **현황**: 테스트/개발 모두에서 핵심 인프라. `src/shared/api/mocks/testServer.ts`(Jest), `src/shared/api/mocks/server.ts`(Express dev 서버), 6개 핸들러 파일, 7개 테스트에서 12회 import
- **교체 찬**: 없음 — 대안(Mirage, nock)은 모두 기능/유지보수에서 MSW에 뒤짐
- **교체 반**: N/A
- **비용**: N/A
- **결정**: **유지**
- **재검토 조건**: 없음

---

## Toast UI Editor → TipTap/Lexical

- **현황**: `@toast-ui/editor` + `@toast-ui/react-editor`. 사용처는 `src/entities/post/ui/Editor.tsx`(읽기 전용 뷰어) + `src/entities/post/ui/ContentsEditor.tsx`(입력). React 19 override로 강제 설치. FSD 마이그레이션 중 SSR에서 DOM globals 참조로 이슈 발생 → barrel에서 제외, deep-import + ESLint disable 코멘트로 해결
- **교체 찬**:
  - 번들 크기(Toast UI 3.2MB+) 큼
  - React 19 대응이 override 의존 → 장기적 리스크
  - 현대적 대안: **TipTap**(Prosemirror, headless, 생태계 풍부), **Lexical**(Meta, 확장성 높음)
- **교체 반**:
  - 현재 SSR 이슈는 해결된 상태 (barrel 제외로 번들 오염 차단)
  - 에디터 교체는 API·툴바·마크다운 시리얼라이즈 전부 재작성 — 위험도 높음
  - 기능 요구사항 변화 없음 (단순 포스트 작성/표시)
- **비용**: Large (재작성 + 콘텐츠 마이그레이션 + 재테스트)
- **결정**: **유지 (보류)**
- **재검토 조건**:
  - React 19+ override가 에러를 재발시킬 때
  - 실시간 협업·멘션·임베드 같은 현재 에디터가 지원하지 못하는 기능이 요구될 때
  - 에디터 청크가 번들 사이즈 경보를 유발할 때

---

## Prettier + ESLint → Biome

- **현황**: ESLint 9(flat config) + 3개 플러그인(`@tanstack/query`, `boundaries`, `prettier`) + Prettier 3. `eslint.config.mjs`는 FSD boundaries 규칙의 유일한 집행 지점
- **교체 찬**: Biome는 linter + formatter 통합 + Rust 기반 고속. 도구 수 감소
- **교체 반**:
  - Biome가 `eslint-plugin-boundaries` 같은 생태계 플러그인을 대체 못 함 → FSD 경계 강제 불가
  - `@tanstack/query` ESLint 플러그인도 마찬가지
  - Prettier 호환성 일부 미완 — 포맷 변동 시 전체 diff 노이즈
- **비용**: Medium (설정 재작성 + boundaries 룰 대체재 확보 + 전체 포맷팅 diff)
- **결정**: **유지**
- **재검토 조건**:
  - Biome가 FSD boundaries 동급 플러그인을 공식 지원
  - `npm run lint` 소요 시간이 30초를 넘을 때
  - ESLint 10+ 이 breaking change로 플러그인 호환성 대란을 일으킬 때

---

## NextAuth v5 beta → stable

- **현황**: `next-auth: 5.0.0-beta.30`. 수 개월째 beta. 설정은 `src/app/auth/config.ts` (FSD app 레이어)
- **교체 찬**: beta 탈출 시 API 안정성 보장, 메이저 변경 위험 감소
- **교체 반**: 없음 — 현재 beta가 이미 메인 패키지
- **비용**: 릴리스 내용에 따라 다르나 통상 Small
- **결정**: **stable 릴리스 즉시 업그레이드**
- **재검토 조건**: `next-auth@5.0.0` (non-beta) 릴리스 시 `.agents/rules/infra/migration-history.md`에 업그레이드 기록 남기고 즉시 진행

---

## HTTP client (ky/ofetch)

- **현황**: `src/shared/lib/api.ts`의 자체 래퍼(`fetchApi<Response>`). 36줄. `'use server'` 지시어, `cookies()`로 `TOKEN_KEY` 헤더 주입, `Content-Type` 기본값, `!res.ok` 시 throw
- **교체 찬**: ky/ofetch는 재시도(retry), 타임아웃, 인터셉터, 훅을 제공 → 공통 에러 처리 일원화
- **교체 반**:
  - 현재 래퍼가 **Next.js 서버 액션 경계**(`'use server'` + `next/headers`)에 맞춰 짜여 있음 — 외부 클라이언트는 이 경계와 충돌할 수 있음
  - 재시도/타임아웃 현재 요구 없음
  - 36줄짜리를 의존성으로 교체하는 것은 BLOAT
- **비용**: Small (래퍼 교체 자체는 쉽지만 서버 액션 동작 검증 필요)
- **결정**: **유지 (자체 `fetchApi`)**
- **재검토 조건**: 다음 중 **2개 이상**이 필요해질 때
  - 자동 재시도 (transient 에러)
  - 요청 타임아웃
  - 인증 실패 시 자동 재발급 인터셉터
  - 요청/응답 로깅 훅

---

## npm workspaces + `packages/eslint-config`

- **현황**: 커스텀 ESLint 룰은 루트 `eslint-rules/fsd-relative-imports.mjs` 1파일, FSD 정책은 `eslint.config.mjs`에 인라인. 모노레포 워크스페이스 없음
- **도입 찬**: 터보레포식 `packages/eslint-config`로 분리하면 설정이 패키지 단위로 캡슐화되고, 여러 앱이 생겼을 때 공유 가능
- **도입 반**:
  - 단일 앱 레포 — 공유할 두 번째 소비자가 없음
  - 옮길 실체가 룰 1파일 + 설정 블록뿐. workspaces를 켜면 install 호이스팅·lint-staged 경로·CI 캐시 등 관리 표면만 증가
  - "2곳 이상에서 실제 재사용될 때 승격" 원칙과 충돌
- **비용**: Small~Medium (workspaces 전환 + 경로 재배선 + CI 검증)
- **결정**: **보류** (2026-07-13)
- **재검토 조건**: 이 레포에 두 번째 앱이 생겨 모노레포로 전환하거나, 다른 레포가 이 ESLint 설정을 소비하게 될 때. 그때 npm workspaces + `packages/eslint-config`(자체 스코프 패키지)로 승격

---

## 기타 (논의 여지 있으나 본 문서에서 제외)

- **State manager (Zustand/Jotai 등)**: TanStack Query가 서버 상태를 커버하고, 현재 클라이언트 상태는 폼(RHF)과 로컬 `useState`로 충분. 도입 필요성 없음 — 복잡한 클라이언트 상태 요구가 생기면 재검토
- **Storybook**: 디자인 시스템 규모가 작고 단일 앱. 도입 시 유지 비용 대비 이득 불분명
- **Playwright / Cypress (E2E)**: 페이지 단위 통합 테스트가 MSW 기반 RTL로 커버되고 있음. 브라우저 E2E는 배포 전 수동 스모크로 대체

---

## 참고 자료

- 가로지르는 컨벤션: `.agents/rules/code-style/code-conventions.md`
- 데이터 페칭: `.agents/rules/architecture/data-fetching.md`
- 폼: `.agents/rules/code-style/form-patterns.md`
- 인증: `.agents/rules/architecture/auth.md`
- 스타일링: `.agents/rules/code-style/styling.md`
- 테스팅: `.agents/rules/testing/unit-testing.md`
- FSD: `.agents/rules/architecture/fsd-architecture.md`
- 의존성 마이그레이션 이력: `.agents/rules/infra/migration-history.md`
