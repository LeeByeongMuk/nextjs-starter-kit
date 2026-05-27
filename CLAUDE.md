# Project conventions for Claude

Stack: **Next.js 16 (App Router) · React 19 · TanStack Query v5 · NextAuth v5 (beta) · Tailwind v4 · TypeScript 6 · Jest 30**.

## Architecture

This codebase follows Feature-Sliced Design. **Canonical spec: `docs/FSD_GUIDE.md`** — read it before adding any new file. The bullets below are a cheat-sheet that points back to the spec; if anything here disagrees with the spec, the spec wins.

Critical rules:

- Layer order top → bottom only: `app → views → widgets → features → entities → shared` — see `docs/FSD_GUIDE.md` §1
- FSD's standard "pages" layer is named `views` here, because Next.js owns `src/app` for routing — see §6
- Slice isolation: same-layer slices cannot import each other; push shared code one layer down — see §1, §7
- Public API only: each slice exposes via its root `index.ts`; deep imports forbidden — see §4
- Standard segments inside a slice: `ui / model / api / lib / config` (skip empty) — see §3

When deciding where new code goes, walk the decision tree in `docs/FSD_GUIDE.md` §7. When in doubt, ask before creating files.

Path aliases — full table in `docs/FSD_GUIDE.md` §5. Use only the configured `@<layer>/*` aliases; no relative imports across slices.

## Conventions beyond FSD

FSD만으로는 **파일 위치**만 정해진다. 슬라이스 안쪽의 코딩 스타일은 주제별 문서에 분리돼 있다. 신규 코드 작성 전 해당 문서 확인:

- 가로지르는 원칙 (TypeScript / 네이밍 / 에러 정책) — `docs/CONVENTIONS.md`
- 코드 스타일 (JSDoc / 주석 금지 규칙 / async-await / 불변 구성) — `docs/CODE_STYLE.md`
- API 패턴 (응답 `ApiResponse` extends / 매핑 함수 금지 / Service·hook 배치) — `docs/API_PATTERNS.md`
- 데이터 페칭 (TanStack Query, `fetchApi`) — `docs/DATA_FETCHING.md`
- 폼 (React Hook Form, `defaultValues` 필수) — `docs/FORMS.md`
- 인증 (NextAuth v5, deep-import 예외) — `docs/AUTH.md`
- 스타일링 (Tailwind v4) — `docs/STYLING.md`
- 테스팅 (Jest / RTL / MSW) — `docs/TESTING.md`

라이브러리 전환 판단은 `docs/LIBRARY_DECISIONS.md` 참조. 새 의존성 추가 제안 전에 그 문서에서 이미 기각/보류된 후보인지 확인.

## Quality gates (PR-ready)

```
npm run tsc      # type check
npm run lint     # includes boundaries rules
npm test         # jest, 7 suites
npm run build    # next production build
```

`boundaries/*` violations are CI-blocking. Don't disable them — fix the placement.

## Conventions

- **Branches**: `^[a-z]+/[a-z0-9][a-z0-9._-]*(/[a-z0-9][a-z0-9._-]*)*$` — lowercase, slash-separated segments (e.g. `refactor/fsd-extract-entities`, `fix/post/duplicate-id`)
- **PR titles**: semantic, lowercase subject — `<type>(<scope>): <subject>`
- **Commits**: many small commits per slice during the FSD migration; each commit must leave the tree green

## Related docs

- `docs/FSD_GUIDE.md` — canonical FSD spec (layers, segments, public API, mapping table)
- `docs/CONVENTIONS.md` — cross-cutting coding conventions (index of topic docs below)
- `docs/CODE_STYLE.md` — JSDoc, comment bans, async/await, immutable construction
- `docs/API_PATTERNS.md` — response envelope SSOT (`ApiResponse` extends), no-mapping rule, fetch/hook placement
- `docs/DATA_FETCHING.md` — TanStack Query v5 + `fetchApi` wrapper
- `docs/FORMS.md` — React Hook Form 7 patterns
- `docs/AUTH.md` — NextAuth v5 config, deep-import exceptions, session/JWT
- `docs/STYLING.md` — Tailwind v4 conventions
- `docs/TESTING.md` — Jest / RTL / MSW patterns and coverage gate
- `docs/LIBRARY_DECISIONS.md` — keep/replace decisions for dependencies (Jest, Zod, Biome, …)
- `docs/MIGRATION_GUIDE.md` — historical major-dependency upgrade record
