---
paths:
  - 'package.json'
---

# Major Dependency Migration History

> 작성일: 2026-03-12 · 최종 갱신: 2026-07-20 (완료 이력으로 재정리)
> 대상 브랜치: `develop` · Node.js 요구사항: `>=18.18.0` (CI는 20.x)

## 개요

2026-03 ~ 2026-07에 걸쳐 완료된 메이저 의존성 마이그레이션의 이력과 핵심 결정을 기록한다. 원본은 Phase별 절차서였으나 전 Phase 완료 후 요약본으로 압축했다. 향후 업그레이드 판단(도입/보류)은 [library-decisions.md](./library-decisions.md)가 정본이다.

## 현재 버전 현황 (2026-07-20, package.json 기준)

| 패키지                             | 버전                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| next / eslint-config-next          | ^16.2.10                                                     |
| react / react-dom                  | ^19.2.7                                                      |
| typescript                         | ^6.0.3                                                       |
| tailwindcss / @tailwindcss/postcss | ^4.3.2                                                       |
| jest / jest-environment-jsdom      | ^30.4.2 / ^30.4.1                                            |
| ts-jest                            | ^29.4.11 (29.4부터 Jest 30 지원 — 30 메이저는 존재하지 않음) |
| @types/jest / @types/node          | ^30.0.0 / ^26.1.1                                            |
| eslint                             | ^9.39.5 (flat config)                                        |
| eslint-plugin-boundaries           | ^7.0.2                                                       |
| next-auth                          | 5.0.0-beta.31 (stable 대기 — library-decisions.md 참조)      |
| @tanstack/react-query              | ^5.101.2                                                     |
| react-hook-form                    | ^7.81.0                                                      |
| msw / express                      | ^2.15.0 / ^5.2.1                                             |

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

- **msw ≥2.15 ESM 중첩 의존성**: `@open-draft/deferred-promise`(ESM 전용)를 `node_modules/msw/node_modules` 아래로 끌고 온다. `jest.config.ts` transformIgnorePatterns 예외에 `msw`, `@open-draft` 두 홉 모두 필요. 전체 예외 목록: `rettime`, `until-async`, `next-auth`, `@auth`, `msw`, `@open-draft`
- **ts-jest 버전 오해**: "Jest 30이니 ts-jest도 30" 이 아니다. ts-jest는 29.4부터 Jest 30을 지원하며 30 메이저가 없다. 원 계획서의 `ts-jest@^30` 목표는 오기였고, 실제는 `^29.4.x` 유지가 정답
- **@toast-ui/react-editor**: 3.2.3이 최종 버전(유지보수 중단). `overrides`로 `react: "^19"` 강제 설치 중이며, 동작 이상 시 대체 에디터(BlockNote, TipTap, Plate) 전환 검토 — [library-decisions.md](./library-decisions.md) 참조
- **next-auth/react 테스트 mock**: jsdom에서 세션 프로바이더 모킹용 — 당시 `src/tests/mocks/`, 현행은 `src/shared/lib/testing/nextAuthReact.tsx` (`jest.config.ts` moduleNameMapper로 매핑)

## 보류 중인 메이저 (재검토 조건 포함)

| 후보             | 보류 사유                                                          | 재검토 조건                         |
| ---------------- | ------------------------------------------------------------------ | ----------------------------------- |
| TypeScript 7     | ts-jest peer `>=4.3 <7`                                            | ts-jest가 TS7 지원 릴리스           |
| ESLint 10        | eslint-config-next(16.2.10)에 번들된 eslint-plugin-react 호환 문제 | eslint-config-next가 ESLint 10 지원 |
| next-auth stable | 5.0.0 stable 미출시 (beta.31이 최신)                               | stable 릴리스 시 즉시 업그레이드    |

## 롤백 전략

각 마이그레이션은 별도 브랜치/PR로 진행해 개별 롤백이 가능하도록 한다. `package-lock.json`은 각 단계 완료 시점에 함께 커밋해 의존성 상태를 보존한다.
