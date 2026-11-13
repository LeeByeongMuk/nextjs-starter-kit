---
paths:
  - 'package.json'
---

# Major Dependency Migration History

> 작성일: 2026-03-12 · 최종 갱신: 2026-11-12
> 대상 브랜치: `develop` · 현재 실행 환경과 보류 근거: [library-decisions.md](./library-decisions.md)

## 개요

2026-03 ~ 2026-07에 걸쳐 완료된 메이저 의존성 마이그레이션의 이력과 핵심 결정을 기록한다. 원본은 Phase별 절차서였으나 전 Phase 완료 후 요약본으로 압축했다. 향후 업그레이드 판단(도입/보류)은 [library-decisions.md](./library-decisions.md)가 정본이다.

## 실행 환경·도구 정리 (2026-11-08)

- Node 26.13.0 LTS와 동봉 npm 11.20.0으로 로컬·CI·Docker를 통일했다.
- Next 16.4.5, React 19.3.1, Query 5.107.1, RHF 7.91.0, Tailwind 4.3.5, Jest 30.5.2 및 호환되는 동일 메이저 개발 의존성을 반영했다. 정확한 설치 버전은 `package-lock.json`을 따른다.
- ts-jest preset과 의존성을 제거하고 `next/jest`의 SWC만 남겼다. `ts-node`는 TypeScript Jest 설정 로더로 유지한다.
- `tsx`를 직접 개발 의존성으로 고정해 mock 실행 중 임의 패키지를 받지 않게 했다.
- `src/middleware.ts`를 `src/proxy.ts`로 옮기고 인증 matcher·authorized 콜백 및 FSD 분류를 유지했다.
- 서버 환경변수의 `next.config.js` 강제 주입과 MSW webpack 분기를 제거했다. 브라우저 MSW 설정은 제거하고 테스트·Express mock 경로를 유지한다.
- CI의 자동 수정·커밋을 없애고 동일 SHA를 검사한다. 이후 #184에서 lint·build·coverage 작업을 단일 `check` 작업으로 합쳤다.

## 의존성 갱신 (2026-11-12)

- Node 26.13.1(26 LTS 보안 릴리스)로 올렸다. 동봉 npm은 11.20.0 그대로다.
- next·eslint-config-next 16.4.6, react-hook-form 7.92.0, prettier 3.10.0으로 올리고 범위 안의 하위 의존성을 갱신했다. mock 미들웨어의 qs가 6.16.2가 되어 qs 보안 권고가 해소됐다.
- eslint-plugin-simple-import-sort 14와 @testing-library/jest-dom 7로 올렸다. 두 메이저 모두 코드 수정 없이 lint와 테스트를 통과했다.
- 의존성 install script 4개의 실행 여부를 `allowScripts`에 기록했다. esbuild는 승인하고 기본 설치에서 할 일이 없는 나머지 3개는 거부했다.
- Dependabot 버전 업데이트에서 보류 중인 TypeScript·ESLint·MSW 메이저와 `@types/node` 메이저를 제외한다.

## 완료된 마이그레이션 요약

| 마이그레이션             | 이전 → 이후       | 핵심 결정 · 포인트                                                                                                                                          | PR   |
| ------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| eslint-config-prettier   | 9 → 10            | breaking change 없음                                                                                                                                        | #141 |
| express                  | 4 → 5             | mock 서버(`src/shared/api/mocks/server.ts`) 전용, deprecated API 미사용이라 무변경 통과                                                                     | #141 |
| Tailwind CSS             | 3.4 → 4           | CSS-first 전환: `@import "tailwindcss"` + `@plugin "@tailwindcss/forms"`, PostCSS 플러그인 `@tailwindcss/postcss`, `tailwind.config.js` 삭제 (v4 자동 스캔) | #141 |
| React                    | 18 → 19           | breaking 패턴(forwardRef, class component 등) 전무 — 코드 무변경                                                                                            | #141 |
| Next.js                  | 15.5 → 16         | `next.config.js` 호환 유지. 이전에 #127에서 DoS advisory 대응으로 15.5 정합 선행                                                                            | #141 |
| ESLint                   | 8 → 9             | flat config 전환(`eslint.config.mjs`), `FlatCompat` 미사용, `.eslintrc.json`/`.eslintignore` 삭제                                                           | #141 |
| Jest                     | 29 → 30           | `jest-fixed-jsdom` 호환 확인, transformIgnore 예외 추가, `next-auth/react` mock 도입                                                                        | #141 |
| next-auth                | 4 → 5.0.0-beta    | 아키텍처 전면 변경 — 아래 상세. 현행 규칙은 [auth.md](../architecture/auth.md)                                                                              | #141 |
| TypeScript               | 5 → 6             | ts-jest peer(`>=4.3 <7`) 범위 내라 무리 없음                                                                                                                | #143 |
| @types/node              | 25 → 26           | 타입 전용, 영향 없음 (원 계획의 목표는 25였고 이후 26으로 재상향)                                                                                           | #155 |
| eslint-plugin-boundaries | 6 → 7             | FSD 린트 강화와 함께 적용 — 강제 항목은 [fsd-architecture.md](../architecture/fsd-architecture.md) §9 참조                                                  | #155 |
| 패키지 매니저            | 혼재 → npm 단일화 | `pnpm-lock.yaml` 삭제, `packageManager: npm@11.6.2` 명시                                                                                                    | #155 |

이후 마이너/패치는 Dependabot이 담당한다 (예: next 16.2.3 → 16.2.6, #151).

### next-auth 4 → 5 상세 (최대 규모 작업)

- 설정을 루트 단일 파일로 집약 — 당시 `src/auth.ts`, FSD 이관 후 현행은 `src/app/auth/config.ts`
- API route는 `handlers` re-export, `src/middleware.ts`는 `auth as middleware` 한 줄 re-export
- 환경변수 prefix 변경: `NEXTAUTH_URL`/`NEXTAUTH_SECRET` → `AUTH_URL`/`AUTH_SECRET` (`next.config.js` env 동기화)
- 세션 타입 선언 — 당시 `src/shared/types/declare/nextAuth.d.ts`, 현행은 `src/entities/auth/config/nextAuth.d.ts`
- 클라이언트 API(`useSession`, `signIn`, `signOut`)는 `next-auth/react` 그대로 사용

## 트러블슈팅 기록 (재발 방지)

- **msw ESM 의존성 호이스팅**: msw는 2.13.4부터 ESM 전용 `@open-draft/deferred-promise` 3.x를 쓰고 `@mswjs/interceptors`는 2.x를 쓴다. 어느 버전이 최상위로 호이스팅되는지는 잠금 파일에 따라 바뀐다. 2026-11-12 의존성 갱신 전에는 3.x가 `node_modules/msw/node_modules` 아래에 있어 `msw`와 `@open-draft` 중 하나만 빠져도 테스트가 실패했다. 갱신 후에는 3.x가 최상위에 있어 `msw`를 빼도 통과하지만 `@open-draft`를 빼면 전체 suite가 `Must use import to load ES Module`로 실패한다. 다시 중첩될 수 있으므로 `jest.config.ts` transformIgnorePatterns 예외에 둘 다 유지한다. 전체 예외 목록: `rettime`, `until-async`, `next-auth`, `@auth`, `msw`, `@open-draft`
- **ts-jest 버전 오해**: "Jest 30이니 ts-jest도 30" 이 아니다. ts-jest는 29.4부터 Jest 30을 지원하며 30 메이저가 없다. 원 계획서의 `ts-jest@^30` 목표는 오기였고, 당시에는 `^29.4.x`를 사용했다. 현재는 `next/jest` SWC로 단일화해 ts-jest를 제거했다
- **@toast-ui/react-editor**: 3.2.3이 최종 버전(유지보수 중단). `overrides`로 `react: "^19"` 강제 설치 중이며, 동작 이상 시 대체 에디터(BlockNote, TipTap, Plate) 전환 검토 — [library-decisions.md](./library-decisions.md) 참조
- **next-auth/react 테스트 mock**: jsdom에서 세션 프로바이더 모킹용 — 당시 `src/tests/mocks/`, 현행은 `src/shared/lib/testing/nextAuthReact.tsx` (`jest.config.ts` moduleNameMapper로 매핑)

## 보류 중인 메이저

현재 채택·보류 사유와 재검토 조건은 [library-decisions.md](./library-decisions.md)의 버전 채택 정책을 따른다.

## 롤백 전략

각 마이그레이션은 별도 브랜치/PR로 진행해 개별 롤백이 가능하도록 한다. `package-lock.json`은 각 단계 완료 시점에 함께 커밋해 의존성 상태를 보존한다.
