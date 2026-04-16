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
- `docs/MIGRATION_GUIDE.md` — historical major-dependency upgrade record
