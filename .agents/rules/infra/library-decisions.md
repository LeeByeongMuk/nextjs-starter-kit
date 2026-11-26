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

## 버전 채택 정책

- Node.js는 `.nvmrc`의 26.13.1 LTS, npm은 동봉된 11.20.0을 사용한다. `package.json`의 engines, CI, Docker가 같은 계열을 따른다.
- `@types/node`는 Node 런타임 메이저(26)에 맞춰 올린다. 그래서 Dependabot 버전 업데이트에서 `@types/node` 메이저를 제외한다.
- 설치는 `npm ci`로 재현한다. 정확한 패키지 버전은 `package-lock.json`이 정본이다. `npm run setup`도 `npm ci`를 실행하며 AI 스킬은 `--skills`로 선택 설치한다.
- 운영 의존성만 설치할 때는 같은 잠금 파일로 `npm ci --omit=dev`를 실행한다. `prepare`는 Husky가 설치된 환경에서 훅을 설정하며, `HUSKY=0`이면 건너뛴다.
- npm 11.20은 `allowScripts`에 기록되지 않은 의존성 install script도 실행하지만 설치할 때마다 경고한다. `package.json`의 `allowScripts`에 실행 여부를 기록한다. `esbuild`는 플랫폼 바이너리를 확인해 CLI에 연결하므로 승인한다. `fsevents`는 실행할 스크립트가 없고 `@parcel/watcher`는 `npm_config_build_from_source`일 때만 빌드하므로 거부한다. install script가 있는 의존성이 새로 생기면 `npm install-scripts ls`로 확인한 뒤 승인 또는 거부를 기록한다. `npm install-scripts prune`은 설치되지 않은 패키지의 항목도 지우므로 Linux에서 실행하면 macOS 전용 `fsevents` 항목이 빠진다. 이 항목이 없으면 macOS에서 설치할 때 다시 경고하므로 prune이 지운 `fsevents` 항목은 되돌린다.
- Next/React, Tailwind/PostCSS 플러그인, TanStack Query/devtools/ESLint 플러그인은 각 peer 범위에 맞춰 함께 갱신한다. 같은 메이저라도 타입·lint·테스트·production build를 통과해야 한다.
- React 19는 Toast UI wrapper의 공식 peer(`^17.0.1`) 밖이다. 기존 override를 유지하며 에디터 작성·수정·저장 흐름을 실제 브라우저에서 확인한다.

| 보류 대상          | 현재 선택과 근거                                                                                                             | 재검토 조건                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| TypeScript 7       | 6.0.3 유지. typescript-eslint 8.73.0의 TypeScript 지원 범위는 `>=4.8.4 <6.1.0`                                               | parser와 Next 도구 체인이 7 지원   |
| ESLint 10          | 9.39.5 유지. ESLint 9는 지원이 끝났지만 eslint-config-next 16.4.6이 쓰는 eslint-plugin-react 7.37.5 peer가 `^9.7`까지만 지원 | React 플러그인 및 커스텀 규칙 호환 |
| NextAuth v5 stable | 5.0.0-beta.32 유지. `latest`인 4.24.15로 내리지 않음                                                                         | v5 안정판 출시                     |
| npm 12             | Node LTS에 동봉된 npm 11.20.0으로 설치 정책 통일                                                                             | 별도 메이저 전환 검증              |

근거: [Node LTS](https://nodejs.org/en/blog/release/v26.13.1), [Next registry](https://registry.npmjs.org/next/latest), [React registry](https://registry.npmjs.org/react/latest), [TypeScript ESLint 지원](https://typescript-eslint.io/users/dependency-versions/), [React ESLint peer](https://registry.npmjs.org/eslint-plugin-react/latest), [NextAuth 태그](https://registry.npmjs.org/next-auth), [Toast UI peer](https://registry.npmjs.org/@toast-ui/react-editor/latest), [Next Jest 구성](https://nextjs.org/docs/app/guides/testing/jest), [ESLint 지원 정책](https://eslint.org/version-support).

---

## 의존성 보안 패치

- Toast UI Editor 3.2.2와 React wrapper 3.2.3은 보안 패치 대상 배포물을 고정하기 위해 정확한 버전으로 설치한다. wrapper도 같은 에디터를 사용하도록 override한다. DOMPurify는 직접 의존성 3.4.18로 고정하고 에디터의 전이 의존성에도 같은 버전을 적용한다.
- `scripts/patch-toast-ui.mjs`는 전체 설치와 운영 의존성만 설치할 때 모두 `postinstall`에서 실행된다. 에디터·뷰어의 ESM·UMD 네 파일에 내장된 DOMPurify 2.3.3을 제거한다. ESM은 설치된 DOMPurify를 import하고, UMD는 해당 버전의 CJS 구현과 라이선스를 포함한다. `customHTMLSanitizer`와 관계없이 에디터 자체의 정제 호출에도 패치가 적용된다.
- 패치는 원본·결과와 DOMPurify 배포물의 SHA-256을 검증하고, 예상하지 못한 파일에서는 실패한다. 반복 실행은 안전하다. `predev`와 `prebuild`도 적용 상태를 검사한다. `--ignore-scripts`로 설치했다면 `npm run postinstall`을 실행해야 한다. Docker는 설치 전에 패치 스크립트를 복사한다.
- Toast UI 또는 DOMPurify 버전을 올릴 때는 패치의 해시와 정제 동작을 함께 검증한다. `npm test`의 에디터 보안·HTML 왕복 테스트, 실제 브라우저의 작성·수정·저장, 타입·lint·production build를 통과해야 한다. CI는 `npm audit --omit=dev`로 운영 의존성도 검사한다.
- [minimatch 패턴 증폭](https://github.com/advisories/GHSA-g3hv-75wg-m249)은 취약 범위 `>=7 <11.0.1`에만 11.0.9를 적용한다. 기존 3.x API는 유지한다. [glob 취소 우회](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4)는 `>=9 <14.0.2`에만 14.0.6을 적용한다. typescript-eslint는 수정된 minimatch를 사용하는 8.73.0이며, Jest·test-exclude의 상위 의존성이 수정 버전을 채택하면 해당 override를 제거한다.

## 결정 요약

| 후보                                                                                | 결정                       | 재검토 조건                                    |
| ----------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------- |
| [Jest → Vitest](#jest--vitest)                                                      | **유지 (Jest 30)**         | 테스트 파일 > 30 또는 CI 테스트 시간 > 3분     |
| [폼/API 런타임 검증: Zod](#zod)                                                     | **유지**                   | 스키마 코드가 번들 사이즈 경보를 유발할 때     |
| [`classnames` → `clsx`](#classnames--clsx)                                          | **제거 (사용처 없음)**     | 복잡한 조건부 스타일·variants가 필요할 때      |
| [MSW 3](#msw-3)                                                                     | **유지**                   | —                                              |
| [Toast UI Editor → TipTap/Lexical](#toast-ui-editor--tiptaplexical)                 | **유지 (보류)**            | Editor 성능·SSR 이슈 재발 또는 협업 기능 요구  |
| [Prettier + ESLint → Biome](#prettier--eslint--biome)                               | **유지**                   | ESLint 플러그인 호환 대란 또는 lint 시간 > 30s |
| [NextAuth v5 beta → stable](#nextauth-v5-beta--stable)                              | **stable 즉시 업그레이드** | stable 릴리스 시                               |
| [HTTP client (ky/ofetch)](#http-client-kyofetch)                                    | **유지 (자체 `fetchApi`)** | 재시도/타임아웃/인터셉터 중 2개 이상 필요      |
| [npm workspaces + `packages/eslint-config`](#npm-workspaces--packageseslint-config) | **보류**                   | 두 번째 앱 또는 외부 소비자 발생 시            |
| [토스트 알림: `sonner`](#토스트-알림-sonner)                                        | **도입**                   | 스타일 주입을 막는 CSP 요구가 생길 때          |

---

## Jest → Vitest

- **현황**: Jest 30 + `next/jest` SWC, `ts-node` 설정 로더, `jest-fixed-jsdom`, MSW 3 연동. `jest.config.ts`에 ESM 패키지 transformIgnore 예외(`rettime`, `until-async`, `next-auth`, `@auth`, `msw`, `@msw`, `@mswjs`, `@open-draft`, `cookie`). 페이지 통합과 인증·에디터·설치 패치 회귀 테스트를 실행한다. 커버리지 60% 기준
- **교체 찬**: Vitest가 ESM 네이티브 + SWC/esbuild 기반으로 빠름. `transformIgnorePatterns` 같은 수동 튜닝 불필요. Vite 생태계와 호환
- **교체 반**:
  - Jest 30은 최신 메이저, 기능 결함 없음
  - 현재 테스트 규모에서 실행 시간 차이는 작음
  - NextAuth/Auth.js의 ESM 이슈가 Vitest로 옮긴다고 자동 해결되지 않음 (Vitest도 `deps.inline`/`server.deps` 튜닝 필요)
  - `next/jest` preset을 버려야 하므로 Next.js 공식 경로에서 벗어남
- **비용**: Medium — 설정 포팅 + 기존 테스트 검증 + CI 파이프라인 조정
- **결정**: **유지**
- **재검토 조건**: 테스트 파일 수가 30개를 초과하거나 CI에서 `npm test` 소요 시간이 3분을 넘을 때. Vitest v4 이상이 `next/jest` 수준의 공식 preset을 제공할 때

---

## Zod

- **현황**: `zod` 4와 `@hookform/resolvers` 7. 폼은 `model/form.ts`의 스키마를 `zodResolver`로 연결하고, 서버 액션은 `api/types.ts`의 요청 스키마로 입력을 확인한다. `fetchApi`는 `schema` 옵션으로 받은 응답 스키마로 API 응답을 검증해 선언한 필드만 반환한다. 요청·응답·폼 타입은 스키마에서 유도한다. 사용 규칙은 [폼 규칙](../code-style/form-patterns.md) §4와 [데이터 페칭 규칙](../architecture/data-fetching.md) §7을 따른다.
- **교체 찬**: 없음 — 폼 검증 규칙, 서버 액션 입력 확인, API 응답 검증, 타입 선언을 스키마 하나로 유지한다
- **교체 반**: N/A
- **비용**: N/A
- **결정**: **유지**
- **재검토 조건**: 폼 청크의 스키마 코드가 번들 사이즈 경보를 유발할 때 같은 패키지의 `zod/mini` 전환을 검토한다
- **함께 갱신**: `@hookform/resolvers`의 peer는 `react-hook-form ^7.55.0`, `zod ^3.25.0 || ^4.0.0`이다. 세 패키지는 이 범위에 맞춰 함께 올린다
- **적용하지 않는 곳**: API 오류 응답의 본문은 스키마로 읽지 않는다. `fetchApi`는 비정상 응답의 HTTP 상태만 `ApiError`로 전달하고, 서버 액션이 던진 오류의 메시지는 production 빌드에서 브라우저로 전달되지 않는다

---

## `classnames` → `clsx`

- **현황**: 조건부 스타일을 템플릿 리터럴로 표현하며 `classnames` 사용처가 없다.
- **결정**: **제거**. 사용하지 않는 직접 의존성을 제거하고 `clsx`나 cva를 새로 도입하지 않는다.
- **재검토 조건**: 반복되는 복잡한 클래스 조합이나 컴포넌트 variants가 생겨 템플릿 리터럴만으로 관리하기 어려울 때 검토한다.

---

## MSW 3

- **현황**: `msw` 3과 `@msw/serve`. 테스트/개발 모두에서 핵심 인프라. `src/shared/api/mocks/testServer.ts`(Jest의 `setupServer`), `src/shared/api/mocks/server.ts`(Express dev 서버, `@msw/serve/express`의 `createMiddleware`로 같은 핸들러를 적용), 공통 user/post 핸들러와 페이지 통합 테스트. 사용 규칙은 [unit-testing.md](../testing/unit-testing.md) §5
- **교체 찬**: 없음 — 대안(Mirage, nock)은 모두 기능/유지보수에서 MSW에 뒤짐
- **교체 반**: N/A
- **비용**: N/A
- **결정**: **유지**
- **재검토 조건**: 없음
- **함께 갱신**: `@msw/serve`의 peer는 `msw ^3.0.0`, `express ^5.0.0`이다. 세 패키지는 이 범위에 맞춰 함께 올린다
- **Jest 설정**: `msw` 3과 일부 의존성은 ESM 전용이다. Jest는 CommonJS로 실행하므로 `jest.config.ts`의 transformIgnore 예외로 변환한다 ([unit-testing.md](../testing/unit-testing.md) §2)

---

## Toast UI Editor → TipTap/Lexical

- **현황**: `@toast-ui/editor` + `@toast-ui/react-editor`. 작성·수정의 공용 `PostForm`에서 `ContentsEditor`가 `Editor`를 클라이언트 전용으로 로드한다. 게시글 상세는 저장된 HTML을 표시한다. React 19 override를 적용한다. 업스트림 저장소(nhn/tui.editor)는 2026-11-15에 유지보수 종료를 공지하고 보관되었다. 마지막 릴리스는 에디터 3.2.3과 React wrapper 3.2.4이며 내장 DOMPurify는 2.3.3 그대로다.
- **교체 찬**:
  - Toast UI 배포물의 오래된 DOMPurify는 [의존성 보안 패치](#의존성-보안-패치)로 교체한다. 상위 패키지가 수정된 정제기를 배포하기 전까지 설치 패치와 HTML 왕복 검증을 직접 유지해야 한다.
  - 번들 크기(Toast UI 3.2MB+) 큼
  - React 19 대응이 override 의존 → 장기적 리스크
  - 업스트림이 유지보수를 종료해 이후 결함·보안 수정이 제공되지 않는다
  - 현대적 대안: **TipTap**(Prosemirror, headless, 생태계 풍부), **Lexical**(Meta, 확장성 높음)
- **교체 반**:
  - 에디터 코드는 작성·수정 폼에서 동적으로 로드함
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

- **현황**: ESLint 9(flat config) + 5개 플러그인(`@tanstack/query`, `boundaries`, `prettier`, `simple-import-sort`, `unused-imports`) + 로컬 커스텀 룰 2개(`comment-conventions`, `fsd-relative-imports`) + Prettier 3. `eslint.config.mjs`는 FSD boundaries 규칙의 유일한 집행 지점
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

- **현황**: `next-auth: 5.0.0-beta.32`. v5 stable 미출시. 설정은 `src/app/auth/config.ts` (FSD app 레이어)
- **교체 찬**: beta 탈출 시 API 안정성 보장, 메이저 변경 위험 감소
- **교체 반**: 없음 — 현재 beta가 이미 메인 패키지
- **비용**: 릴리스 내용에 따라 다르나 통상 Small
- **결정**: **stable 릴리스 즉시 업그레이드**
- **재검토 조건**: `next-auth@5.0.0` (non-beta) 릴리스 시 `.agents/rules/infra/migration-history.md`에 업그레이드 기록 남기고 즉시 진행

---

## HTTP client (ky/ofetch)

- **현황**: `src/shared/lib/api.ts`의 서버 전용 래퍼(`fetchApi<Response>`)와 기능별 서버 액션을 사용한다. API 경계와 인증 헤더 정책은 [데이터 페칭 규칙](../architecture/data-fetching.md)을 따른다.
- **교체 찬**: ky/ofetch는 재시도(retry), 타임아웃, 인터셉터, 훅을 제공 → 공통 에러 처리 일원화
- **교체 반**:
  - 교체 시 서버 전용 모듈과 기능별 서버 액션의 동작을 함께 검증해야 함
  - 재시도/타임아웃 현재 요구 없음
  - 현재 요청 정책을 구현하는 데 추가 의존성이 필요하지 않음
- **비용**: Small (래퍼 교체 자체는 쉽지만 서버 액션 동작 검증 필요)
- **결정**: **유지 (자체 `fetchApi`)**
- **재검토 조건**: 다음 중 **2개 이상**이 필요해질 때
  - 자동 재시도 (transient 에러)
  - 요청 타임아웃
  - 인증 실패 시 자동 재발급 인터셉터
  - 요청/응답 로깅 훅

---

## npm workspaces + `packages/eslint-config`

- **현황**: 커스텀 ESLint 룰은 루트 `eslint-rules/`의 2파일(`comment-conventions.mjs`, `fsd-relative-imports.mjs`), FSD 정책은 `eslint.config.mjs`에 인라인. 모노레포 워크스페이스 없음
- **도입 찬**: 터보레포식 `packages/eslint-config`로 분리하면 설정이 패키지 단위로 캡슐화되고, 여러 앱이 생겼을 때 공유 가능
- **도입 반**:
  - 단일 앱 레포 — 공유할 두 번째 소비자가 없음
  - 옮길 실체가 룰 2파일 + 설정 블록뿐. workspaces를 켜면 install 호이스팅·lint-staged 경로·CI 캐시 등 관리 표면만 증가
  - "2곳 이상에서 실제 재사용될 때 승격" 원칙과 충돌
- **비용**: Small~Medium (workspaces 전환 + 경로 재배선 + CI 검증)
- **결정**: **보류** (2026-07-13)
- **재검토 조건**: 이 레포에 두 번째 앱이 생겨 모노레포로 전환하거나, 다른 레포가 이 ESLint 설정을 소비하게 될 때. 그때 npm workspaces + `packages/eslint-config`(자체 스코프 패키지)로 승격

---

## 토스트 알림 (sonner)

- **현황**: `sonner` 2. `src/shared/ui/toast/`의 래퍼(`toast`, `Toaster`)로만 사용하고 슬라이스는 `sonner`를 직접 import하지 않는다. `unstyled` 모드에 프로젝트 토큰 유틸리티를 적용하며 알림 영역은 루트 레이아웃에 한 번 둔다. 사용 규칙은 [code-conventions.md](../code-style/code-conventions.md) §3
- **도입 찬**:
  - 네이티브 `alert()`와 달리 흐름을 막지 않고 토큰·OS 다크 모드·모션 감소 설정을 따른다
  - React 18·19를 peer로 선언하고 런타임 의존성이 없다
  - `aria-live` 알림 영역, 알림 영역으로 이동하는 단축키(Alt+T), 닫기 버튼, 스와이프 닫기를 제공한다
- **도입 반**:
  - 스타일시트를 런타임에 `<style>` 요소로 주입한다. 인라인 스타일을 금지하는 CSP에서는 이 주입이 차단된다
  - 주입된 규칙은 캐스케이드 레이어 밖이라 같은 속성의 Tailwind 유틸리티보다 우선한다. 겹치는 속성(토스트의 포커스 표시)은 `!` 유틸리티로 지정한다
- **버린 대안**:
  - `react-hot-toast` — `goober` 런타임 CSS-in-JS에 의존해 유틸리티 클래스 전용 스타일 원칙([styling.md](../code-style/styling.md) §1)과 맞지 않는다
  - 자체 구현 — 라이브 영역, 타이머 일시정지, 제스처, 포커스 처리를 직접 유지해야 한다
- **비용**: Small
- **결정**: **도입**
- **재검토 조건**: 런타임 스타일 주입을 허용할 수 없는 CSP 요구가 생기거나, 사용 중인 React 메이저에 대한 peer 지원이 끊길 때

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
