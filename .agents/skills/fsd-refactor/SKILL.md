---
name: fsd-refactor
description: 레거시 구조·컨벤션 위반을 프로젝트 룰(FSD 레이어·Public API·네이밍·주석)에 맞게 정리하는 리팩토링 파이프라인. 위반 인벤토리(grep 재검증) → 분류·계획 → dead 삭제·레이어 재배치·네이밍 전환 → 검증 → PR 까지 5 phase. 동작·렌더 결과·URL 은 무변경.
user-invocable: true
---

## 정체성

- **fsd-refactor** = 정리 기반. 이미 작성된 코드를 **룰에 맞게 다시 배치·정리**한다. 새 기능·새 API·동작 변경은 범위 밖 (그건 `/feature` 파이프라인 영역).

판단이 서지 않으면: "동작이 바뀌는가?" → 바뀌면 fsd-refactor 범위 밖이다.

## 원칙 (모든 Phase에 우선)

1. **본문(동작) 무변경** — 구조·이름·위치·형식만 바꾼다. 런타임 동작·렌더 결과·API 호출 path·응답 처리 로직은 그대로. 함수 본문을 "개선"하지 않는다. 변경된 모든 줄은 *룰 위반 교정*으로 추적돼야 한다.
2. **마크업 동결** — className·레이아웃·라벨·텍스트(placeholder·button label·에러 메시지)는 손대지 않는다. 컴포넌트 분리 시에도 JSX 내용은 그대로 옮긴다. 표시 텍스트 변경이 필요해 보이면 멈추고 사용자에게 확인.
3. **URL 불변** — API endpoint path·쿼리 키 값은 바꾸지 않는다.
4. **grep 재검증** — 위반 인벤토리는 grep으로 만들되, 패턴 grep은 변칙 포맷을 놓친다. 교정 후 다시 grep으로 0건을 확인하고, 변칙은 수동 정독으로 보완한다. "전부 고쳤다" 선언 전 재스캔 필수.
5. **git mv 필수** — 파일 이동·이름 변경은 `git mv`로 히스토리를 보존한다. 삭제+신규 작성으로 우회 금지.

## Phase 1 — Setup + 위반 인벤토리

1. 룰 선독 — `.agents/rules/architecture/fsd-architecture.md`, `.agents/rules/code-style/code-conventions.md`, 대상에 따라 `data-fetching.md` / `form-patterns.md` / `auth.md` / `styling.md`.
2. `git fetch origin develop && git switch develop && git merge --ff-only origin/develop` 후 브랜치: `refactor/<scope>` (branch-name-check 패턴: 소문자·슬래시 구분).
3. **위반 인벤토리 grep 스윕** — 카테고리별 후보 수집 (재검증 전제, false positive 허용):

   | 카테고리 | 탐지 |
   | --- | --- |
   | FSD 금지 폴더 | `find src -type d \( -name components -o -name stores -o -name hooks -o -name services -o -name utils -o -name constants \)` → `ui/model/api/lib/config` |
   | 레이어 역방향/deep import | `npm run lint` (boundaries 에러) |
   | `I*`/`T*` 타입 접두 | `grep -rnE '\b(interface\s+I[A-Z]|type\s+T[A-Z][A-Za-z]*\s*[=<])' src` |
   | `enum` 사용 | `grep -rnE '\benum\s' src` → as-const union |
   | 신규 `alert()` | `grep -rn 'alert(' src` |
   | `.then().catch()` 체인 | `grep -rn '\.then(' src` (병렬 combinator 제외) |
   | `defaultValues` 없는 `useForm` | `grep -rn 'useForm(' src` 후 수동 확인 |
   | 야생 `QueryClient` 생성 | `grep -rn 'new QueryClient' src` (shared/api/tanstack-query/client.ts 제외) |
   | 구분선·이력·AI 흔적 주석 | `grep -rnE '//\s*[─-]{2,}' src` |
   | dead/orphan | 미사용 export·import·임시 fixtures |

4. **확인 포인트**: 인벤토리를 카테고리·파일별 표로 사용자에게 보여주고 *어디까지 이번 범위인지* 합의.

## Phase 2 — 분류 · 계획

1. 인벤토리를 **즉시 교정 / 손댈 때 전환(레거시) / 범위 밖** 으로 분류.
2. 교정 방식 결정 — 단순 삭제(주석·dead) / 형식 치환(네이밍·async) / `git mv` 재배치 / 분리.
3. **레이어 재배치 판단** — 분할 ≠ 승격. 같은 슬라이스 내 분할은 그 자리에, 다른 슬라이스 재사용이 *실제로* 있을 때만 entities 승격 (fsd-architecture.md §7). 임의 승격 금지.
4. **확인 포인트**: 교정 계획(특히 `git mv` 대상·승격 판단)을 사용자와 합의 후 Phase 3.

## Phase 3 — 리팩토링 실행

순서: **dead 삭제 → 레이어 재배치(git mv) → 네이밍 전환 → 형식 정리**. 각 단계 후 import 경로를 갱신한다.

1. **dead / orphan 삭제** — 기존 dead code는 삭제 전 사용자에게 보고 (내가 만든 orphan만 즉시 정리).
2. **레이어 재배치 (`git mv`)** — 금지 폴더 → FSD 세그먼트 (`components/`→`ui/`, `hooks/`→`model/`, `services/`→`api/`, `utils/`→`lib/`, `constants/`→`config/`). 이동 후 Public API `index.ts` 정비, 소비처 import 갱신.
3. **네이밍 전환** — `I*`/`T*` 접두 제거, API 경계 타입은 `Req`/`Res` suffix (code-conventions.md §1.1).
4. **형식 정리 (본문 무변경 범위)** — 구분선·이력 주석 제거, `.then().catch()` → async/await (`Promise.all` 병렬 combinator는 예외), `enum` → as-const union.

## Phase 4 — 검증

1. `npm run tsc` — 이동·리네임 후 import 깨짐 0.
2. `npm run lint` — 0 errors (boundaries 레이어 경계·Public API 통과).
3. `npm test` — 기존 테스트 그대로 통과 + coverage 60% 게이트 유지 (동작 무변경 증거).
4. `npm run build` — production build 통과.
5. **grep 재검증** — Phase 1 쿼리를 다시 돌려 해당 카테고리 0건 확인.
6. **마크업 동결 diff 확인** — `git diff -M`에서 JSX·className·라벨 변경이 섞이지 않았는지, 파일 이동이 리네임(R)으로 인식되는지.
7. **선택**: 적대적 리뷰(`/code-review`) 또는 Codex 심층 리뷰 — high/medium 지적은 grep으로 직접 검증 후 수정.

## Phase 5 — 마무리

1. **커밋 시리즈** (의미 단위·카테고리별 분리, 각 커밋 트리 green):

   ```
   refactor(post): components/hooks → ui/model 레이어 재배치
   refactor(auth): I* 타입 접두 제거
   refactor(shared): .then 체인 async/await 전환
   ```

2. **PR 생성** (`gh pr create --base develop --draft`) — Summary에 인벤토리→교정 결과 표, "무변경 보증" 체크리스트(마크업·API path·기존 테스트), Test plan(4대 게이트 + grep 재검증 0건).
3. `gh pr checks`로 branch-name-check · pr-title-check · CI · coverage 통과 확인.

## DO / DON'T

**DO**: 인벤토리 → 교정 → grep 재검증 0건까지 한 사이클 · `git mv` 히스토리 보존 · 카테고리별 커밋 분리 · 레거시는 "손댈 때 전환" 기본.

**DON'T**: 동작·렌더 출력·API path 변경 · 마크업/라벨 손대기 · 분할했다고 자동 entities 승격 · 기존 dead code 무단 삭제 · grep 한 번으로 "전부 고침" 선언.

## 참고 자산 (교정 기준 SSOT)

- `.agents/rules/architecture/fsd-architecture.md` — 레이어 경계·금지 폴더·분할 vs 승격·§7 결정 트리
- `.agents/rules/code-style/code-conventions.md` — 네이밍·주석·에러 정책·프리플라이트
- `.agents/rules/architecture/data-fetching.md` — 쿼리키·훅 배치
- `.agents/rules/code-style/form-patterns.md` — RHF 3분할·defaultValues
- `.agents/rules/testing/unit-testing.md` — `*.spec.tsx`·MSW 오버라이드
