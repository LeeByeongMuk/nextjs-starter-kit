# next-starter-kit AI Agent Guide

모든 답변은 한국어로 한다. 이 파일이 AI 에이전트(Claude/Codex/Gemini) 공통 진입점이며, 상세 규칙은 `.agents/rules/**`가 단일 원본(SSOT)이다. 여기 요약과 규칙 문서가 어긋나면 규칙 문서가 이긴다.

## 기술 스택

| 영역          | 선택                                     |
| ------------- | ---------------------------------------- |
| 프레임워크    | Next.js 16 (App Router) · React 19       |
| 데이터 페칭   | TanStack Query v5 + `fetchApi` 래퍼      |
| 폼            | React Hook Form 7 (`defaultValues` 필수) |
| 인증          | NextAuth v5 (beta)                       |
| 스타일        | Tailwind CSS v4                          |
| 언어/테스트   | TypeScript 6 · Jest 30 + RTL + MSW       |
| 패키지 매니저 | npm (단일 lockfile: `package-lock.json`) |

## 아키텍처 — Feature-Sliced Design

> 정본: `.agents/rules/architecture/fsd-architecture.md` — 새 파일을 추가하기 전에 반드시 읽는다.

- 레이어 순서(상→하 단방향): `app → views → widgets → features → entities → shared`
- FSD 표준 "pages" 레이어는 여기서 `views` — Next.js가 `src/app`을 라우팅에 점유하기 때문
- 같은 레이어의 슬라이스끼리 import 금지. 공유가 필요하면 한 레이어 아래로 내린다
- 슬라이스는 루트 `index.ts`(Public API)로만 노출. deep import 금지
- 슬라이스 내부 세그먼트: `ui / model / api / lib / config` (빈 것은 생략)
- Path alias는 설정된 `@<layer>/*`만 사용. 슬라이스를 가로지르는 상대 import 금지

새 코드의 배치가 애매하면 fsd-architecture.md §7 결정 트리를 따르고, 그래도 애매하면 파일을 만들기 전에 사용자에게 묻는다.

## 코딩 컨벤션

FSD는 파일 위치만 정한다. 슬라이스 안쪽 스타일은 주제별 규칙 문서를 따른다.

> 가로지르는 원칙 (TypeScript / 네이밍 / 에러 정책): `.agents/rules/code-style/code-conventions.md`
> 데이터 페칭 (TanStack Query, `fetchApi`): `.agents/rules/architecture/data-fetching.md`
> 폼 (React Hook Form, `defaultValues` 필수): `.agents/rules/code-style/form-patterns.md`
> 인증 (NextAuth v5, deep-import 예외): `.agents/rules/architecture/auth.md`
> 스타일링 (Tailwind v4): `.agents/rules/code-style/styling.md`
> 테스팅 (Jest / RTL / MSW): `.agents/rules/testing/unit-testing.md`

**주석은 최소화한다.** 코드가 보여주지 못하는 제약만 주석으로 적는다. 파일 헤더 주석 금지(export JSDoc 한 줄로 대체), 구분선·이력·"다음 줄 설명" 주석 금지 — `src/`는 ESLint(`comments/comment-conventions`)가 error로 강제하며, src 밖 파일도 동일 원칙을 적용한다 (`.agents/rules/code-style/code-conventions.md` §2.2).

라이브러리 전환/도입 판단은 `.agents/rules/infra/library-decisions.md`를 먼저 확인한다. 이미 기각/보류된 후보를 재제안하지 말 것. 과거 메이저 업그레이드 이력은 `.agents/rules/infra/migration-history.md`.

## 품질 게이트 (PR-ready)

```
npm run tsc      # type check
npm run lint     # boundaries 규칙 포함
npm test         # jest (coverage 60% 게이트 포함)
npm run build    # next production build
```

`boundaries/*` 위반은 CI-blocking이다. 룰을 끄지 말고 배치를 고친다.

## Git 컨벤션

- **브랜치**: `^[a-z]+/[a-z0-9][a-z0-9._-]*(/[a-z0-9][a-z0-9._-]*)*$` — 소문자, 슬래시 구분 (예: `refactor/fsd-extract-entities`, `fix/post/duplicate-id`)
- **PR 제목**: 시맨틱, 소문자 subject — `<type>(<scope>): <subject>`
- **커밋**: 논리 단위별 작은 커밋. 각 커밋은 트리를 green으로 유지

## 에이전트 자산

- `.agents/rules/**` — 규칙 SSOT (이 문서가 가리키는 모든 규칙)
- `.agents/skills/` — 스킬. `fsd-refactor`(자작, 커밋됨) + vercel 벤더링 스킬(gitignore, `npm run setup`으로 설치)
- `.claude/rules`, `.claude/skills` — `.agents/*`로 향하는 심볼릭 링크
- `.claude/agents/` — 서브에이전트 정의 (fsd-architect, feature-dev, test-writer, code-reviewer)
- `CLAUDE.md` / `GEMINI.md` — 이 파일로 향하는 심볼릭 링크

처음 클론했다면 `npm run setup`으로 의존성과 벤더링 스킬을 설치한다.
