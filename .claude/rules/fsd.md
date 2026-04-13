---
paths:
  - "src/**/*"
  - "eslint.config.mjs"
  - "tsconfig.json"
---

# FSD pre-flight checklist

**Canonical spec: `docs/FSD_GUIDE.md`.** This file is a Claude-only operational checklist; if it disagrees with the spec, the spec wins. Update both together.

## Decide where new code goes (walk in order, stop at first match)

1. Domain-agnostic primitive (button, spinner, date util, env config) → `src/shared/<segment>/...`
2. Domain model or domain-shared UI (Post type, AuthHeader, Pagination) → `src/entities/<entity>/<segment>/...`
3. User-facing flow (sign-in form, post-create mutation, list filter) → `src/features/<domain>-<action>/<segment>/...`
4. Composition of multiple features/entities into one UI block → `src/widgets/<widget-name>/<segment>/...`
5. Full-screen composition for a single route → `src/views/<route-name>/`
6. Next.js routing/lifecycle artifact (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts` under `src/app/**`; plus `src/middleware.ts` at src root — Next.js fixes its location) → keep thin, only import from `views` / `widgets`

Reasoning and edge cases: `docs/FSD_GUIDE.md` §7.

## Hard rules ESLint will catch (don't fight it — fix the placement)

- Reverse-direction imports (`shared` importing from `features`, etc.) — see `docs/FSD_GUIDE.md` §1
- Sibling-slice imports at the same layer (`features/post-list` → `features/post-detail`) — see §1, §4
- Deep imports past a slice's `index.ts` (`@features/post-list/ui/X`) — see §4

## Workflow rules

- New slice = create `index.ts` in the same edit (empty is fine, intentional)
- Use only the `@<layer>/*` aliases from `docs/FSD_GUIDE.md` §5; no relative imports across slices
- Inside a slice, relative imports (`./model/foo`) are fine
- App-layer files at Next.js-fixed paths (`src/middleware.ts`, `src/app/**/{page,layout,loading,error,route}.tsx?`) cannot move — but the same FSD rule applies: keep them thin and import composition from `views` / `widgets`
- `src/auth.ts` (NextAuth config) is **not** Next.js-fixed — it lives at `src/shared/api/auth/` per FSD. Import via `@shared/api/auth`

## When in doubt

Ask the user before creating files. The wrong layer creates churn that ESLint won't catch until the structure has already shipped.
