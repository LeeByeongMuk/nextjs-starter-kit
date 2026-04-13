# FSD enforcement checklist

Use this as a pre-flight check whenever you (Claude) add, move, or rename code in this repo. Full spec: `docs/FSD_GUIDE.md`.

## Before creating a new file

Walk this in order, stop at the first match:

1. Domain-agnostic primitive (button, spinner, date util, env config) → `src/shared/<segment>/...`
2. A concept tied to a domain entity but reusable across features (Post type, AuthHeader, Pagination) → `src/entities/<entity>/<segment>/...`
3. A user-facing flow / interaction (sign-in form, post-create mutation, list filter) → `src/features/<domain>-<action>/<segment>/...`
4. A composition of multiple features/entities into one UI block (post list with filters + pagination + items) → `src/widgets/<widget-name>/<segment>/...`
5. The full screen for a single route → `src/views/<route-name>/`
6. Next.js routing artifact (`page.tsx`, `layout.tsx`, `loading.tsx`, `route.ts`, `middleware.ts`) → `src/app/...` (thin — only imports from `views`)

## Slice naming

- kebab-case: `auth-signin`, `post-list`, `post-detail`
- Features: `<domain>-<action>`. Entities: single noun.

## Segments inside a slice

Use only these folders, skip what you don't need:

```
ui/      components (.tsx)
model/   hooks, state, view-model types, form schemas
api/     server calls + request/response types
lib/     slice-local helpers (not exported)
config/  constants, enums
```

## Public API

Every slice must have an `index.ts` at its root. Re-export only what consumers need:

```ts
// src/features/auth-signin/index.ts
export { SignInForm } from './ui/SignInForm';
export { useSignInForm } from './model/useSignInForm';
export type { SignInRequest } from './api/types';
```

When you create a new slice, create `index.ts` in the same edit. Empty `index.ts` is fine and intentional.

## Import rules

- Use aliases only: `@app/* @views/* @widgets/* @features/* @entities/* @shared/* @styles/* @public/*`
- Never deep-import another slice: `@features/post-list` ✓, `@features/post-list/ui/PostListItem` ✗
- Never import a sibling at the same layer: a `features/*` slice cannot import another `features/*`. Push shared code down to `entities/` or `shared/` instead.
- Within a slice, relative imports (`./model/foo`) are fine.

## Layer direction (cheat sheet)

```
app  →  views  →  widgets  →  features  →  entities  →  shared
```

Allowed: any layer imports anything to its right.
Blocked (by `eslint-plugin-boundaries`): any import going leftward.

## Next.js specifics

- `src/app/**/page.tsx` body should be ≤5 lines: import a view, re-export it as default, optionally export `metadata` / `generateMetadata`.
- `'use client'` directive lives on the view or widget that needs it, not on `page.tsx`.
- `src/app/api/**/route.ts` and `src/middleware.ts` are exempt from FSD layering — keep them as-is.

## When in doubt

If a placement isn't obvious from rule 1–6, ask the user before creating files. Prefer questioning over guessing — the wrong layer creates churn that ESLint won't catch until later.
