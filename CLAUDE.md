# Project conventions for Claude

Stack: **Next.js 16 (App Router) · React 19 · TanStack Query v5 · NextAuth v5 (beta) · Tailwind v4 · TypeScript 6 · Jest 30**.

## Architecture — Feature-Sliced Design

This codebase follows FSD. Full spec: `docs/FSD_GUIDE.md`. **Read it before adding any new file.**

Five rules you must never break:

1. **Layer order (top → bottom only)**: `app → views → widgets → features → entities → shared`. Reverse imports are blocked by `eslint-plugin-boundaries`.
2. **Pages = `views/`**: FSD's "pages" layer is named `views` here. `src/app/**/page.tsx` is a thin adapter that imports a `views/<slice>` and re-exports it. Business logic never lives in `app/`.
3. **Slice isolation**: a slice (e.g. `features/post-list`) cannot import from a sibling slice (`features/post-detail`). If they share code, push it down to `entities/` or `shared/`.
4. **Public API only**: every slice exposes via its root `index.ts`. Outside the slice, `import { X } from '@features/post-list'` only — never `@features/post-list/ui/Foo`.
5. **Standard segments**: inside a slice use `ui/` (components), `model/` (state, hooks, view-model types), `api/` (server calls + req/res types), `lib/` (slice-local helpers), `config/` (constants). Skip empty segments.

When deciding where new code goes, walk the decision tree in `docs/FSD_GUIDE.md` §7. When in doubt, ask.

## Path aliases

Use these only — no relative imports across slices:

`@app/* @views/* @widgets/* @features/* @entities/* @shared/* @styles/* @public/*`

## Quality gates (PR-ready)

Run before pushing:

```
npm run tsc      # type check
npm run lint     # includes boundaries rules
npm test         # jest, 7 suites
npm run build    # next production build
```

`boundaries/*` violations are CI-blocking. Don't disable them — fix the placement.

## Conventions

- **Branches**: `^[a-z]+/[a-z0-9][a-z0-9._-]*(/...)?$` (e.g. `refactor/fsd-extract-entities`).
- **PR titles**: semantic, lowercase subject — `<type>(<scope>): <subject>`.
- **Commits**: prefer many small commits per slice during the FSD migration; bundle related moves so each commit leaves the tree green.

## Related docs

- `docs/FSD_GUIDE.md` — full FSD spec for this project (layers, segments, mapping table)
- `docs/MIGRATION_GUIDE.md` — historical major-dependency upgrade record
