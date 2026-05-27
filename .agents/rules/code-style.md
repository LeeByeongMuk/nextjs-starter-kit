---
paths:
  - "src/**/*"
---

# Code style pre-flight

**Canonical spec: `docs/CODE_STYLE.md`.** This file is a Claude-only operational checklist; if it disagrees with the spec, the spec wins. Update both together.

## Before writing new code (walk in order)

1. **JSDoc**: 모든 export(타입·함수·컴포넌트·상수)에 `/** ... */` 한 줄. 인터페이스는 필드까지 — `docs/CODE_STYLE.md` §1
2. **주석**: 의미만. 아래 금지 패턴 확인 — §2
3. **비동기**: async/await + try/catch. `.then().catch()` 체인 금지 (`Promise.all/allSettled` combinator는 예외) — §3
4. **객체 구성**: spread 불변 구성. 생성 후 `obj.field = ...` mutate 금지 — §4

## Hard rules (don't write these)

- `//` 형식 JSDoc → `/** ... */`로 (IDE hover)
- 구분선 주석 (`// ── XXX ──`, `// ===== =====`) → 금지
- method/path 메타 주석 (`/** GET /api/posts */`) → 바로 아래 코드와 중복, 금지
- 작업 이력·AI 흔적·호출자 맥락 주석 (`// PR #123`, `// X에서 사용`) → 금지 (이력 SSOT는 git)
- `T<Name>` / `I<Name>` 타입 접두 → 금지 (`docs/CONVENTIONS.md` §1)
- `.then().catch().finally()` 체인 → async/await로
- 분기에 계산 블록(`.filter().map()`·함수 호출)이 든 3항 연산자 → if/early return으로
- 객체 생성 후 mutate → spread 불변 구성으로

## When in doubt

Ask before introducing a new pattern. 스타일 드리프트는 ESLint가 잡지 못한다.
