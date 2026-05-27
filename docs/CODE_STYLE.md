# Code Style Guide (JSDoc · 주석 · 비동기 · 불변 구성)

> 작성일: 2026-05-27
> 대상 브랜치: `develop`
> 범위: 슬라이스 **내부** 코드 작성 스타일. 타입/네이밍/에러 정책은 [`docs/CONVENTIONS.md`](./CONVENTIONS.md), API 응답·envelope 규칙은 [`docs/API_PATTERNS.md`](./API_PATTERNS.md) 참조.

## 개요

`docs/CONVENTIONS.md`가 **무엇을 어떻게 부를지**(타입·네이밍·에러)를 정한다면, 본 문서는 **코드를 어떻게 쓸지**(주석·비동기 흐름·객체 구성)를 정한다. ESLint가 잡지 못하는, 리뷰에서 반복되는 종류의 드리프트를 줄이는 것이 목적.

원칙: **코드에 이미 있는 정보를 주석으로 반복하지 않는다.** 의미만 한 줄.

---

## 1. JSDoc

- 모든 export 대상(타입·함수·컴포넌트·상수)에 JSDoc 한 줄. 형식은 `/** ... */`만 (단일 라인 포함 — IDE hover 인식 위해 `//`는 쓰지 않는다).
- 인터페이스/타입은 자체와 각 필드 모두 JSDoc. API 명세 출처면 명세 표현 그대로.
- 한 줄로 충분하면 한 줄. 부연이 필요하면 두 줄 (빈 줄 없이 바로 아래). 한 줄에 `—`로 욱여넣지 않는다.
- `TODO`는 `TODO(추적키): 사유` 형식만. 추적 키 없는 `TODO` 금지.

```ts
/** 게시글 query key 묶음 */
export const postKeys = { ... };

/**
 * 게시글 상세 조회 훅
 * `id`가 null이면 비활성화.
 */
export function usePost(id: string | null) { ... }
```

---

## 2. 주석 — 금지 패턴

### 2.1 구분선 주석 절대 금지

`// ── Fetch ──`, `// ── Mutation Hooks ──`, `// ===== Types =====` 어떤 형태든 금지. 코드 구조는 export 순서·들여쓰기로 충분.

### 2.2 method/path 메타 주석 금지

```ts
// ❌ 바로 아래 호출에 method+path가 있어 100% 중복
/** GET /api/posts */
async function fetchPosts() { ... }

// ✅ 의미만
/** 게시글 목록 조회 */
async function fetchPosts() { ... }
```

### 2.3 파일 헤더 거대 블록 금지

파일 헤더는 필요하면 한 줄만. 거대 `/** @title ... 출처 ... 응답 ... */` 블록(여러 줄 출처·역할 묶음) 금지. main export에 이미 JSDoc이 있으면 파일 헤더는 생략.

### 2.4 작업 이력 / AI 흔적 / 호출자 맥락 주석 절대 금지

- ❌ `// PR #123에서 추가`, `// v2로 변경`, `// AI가 작성`
- ❌ `// 기존엔 X였으나 Y로 변경` — 변경 이력의 SSOT는 git
- ❌ `// PostList에서 사용` — 호출자 맥락은 코드 변경에 쉽게 거짓이 됨
- ❌ `T<Name>` / `I<Name>` 접두 (TS 커뮤니티 표준 — `docs/CONVENTIONS.md` §1)

---

## 3. 비동기 — async/await 우선

- 비동기 흐름은 **async/await + try/catch/finally**로 작성한다. `.then().catch().finally()` 체인 금지.
- `Promise.all` / `Promise.allSettled` / `Promise.race` 같은 **병렬 combinator는 그대로 사용**한다 (체인이 아니라 결과를 `await`로 받는다).

```ts
// ❌ then/catch 체인
fetchPost(id)
  .then((post) => render(post))
  .catch((e) => alert(e.message));

// ✅ async/await + try/catch
try {
  const post = await fetchPost(id);
  render(post);
} catch (e) {
  // 에러 피드백 정책: docs/CONVENTIONS.md §3 (신규 alert 금지)
}

// ✅ 병렬은 combinator + await
const results = await Promise.allSettled(ids.map((id) => fetchPost(id)));
```

- 이벤트 핸들러처럼 async 함수를 쓸 수 없는 자리에서 비동기를 트리거할 땐 `void (async () => { ... })()` 즉시실행 래퍼를 쓴다 (떠다니는 promise·미처리 거부 방지).
- mutation은 가능하면 훅의 `onSuccess`/`onError` 콜백을 쓰고, 컴포넌트에서 직접 기다려야 하면 `mutateAsync` + `await` ([`docs/DATA_FETCHING.md`](./DATA_FETCHING.md) §5).

---

## 4. 3항 연산자 · 불변 구성 (가독성)

- **3항 연산자는 진짜 단순한 값일 때만.** 함수 호출·여러 줄 표현식·`.filter().map()` 같은 계산 블록이 분기에 들어가면 `if`/early return으로 푼다.

```ts
// ✅ 단순 값
isPending ? '불러오는 중…' : post.title;

// ❌ 분기 안에 계산 블록
const next = cond ? list.filter((b) => b.on).map(toItem) : current;
// ✅ if 단일 할당
let next = current;
if (cond) next = list.filter((b) => b.on).map(toItem);
```

- **객체는 불변 구성.** spread로 한 번에 만들어 return한다. 만든 뒤 `obj.field = ...`로 mutate하지 않는다.

```ts
// ❌ 만든 뒤 mutate
const req = { ...filters };
req.page = page;
if (keyword) req.keyword = keyword;
return req;

// ✅ 불변 구성 + 조건부 spread
return { ...filters, page, ...(keyword && { keyword }) };
```

- **조건부 spread 안에 inline 계산 금지.** 계산은 named const로 빼고 spread는 변수만 참조한다.
- 로컬 누적기(`const out = []; for (...) out.push(...)`)는 허용 — 공유/반환 객체를 만든 뒤 mutate하는 것과 구분한다.

---

## 5. DO / DON'T

**DO**

- export 대상에 JSDoc 한 줄, 의미만
- async/await + try/catch (병렬은 combinator + await)
- 객체는 spread 불변 구성, 조건부 spread는 named const 참조

**DON'T**

- 구분선 주석 / method·path 메타 주석 / 파일 헤더 거대 블록
- 작업 이력·AI 흔적·호출자 맥락 주석 (`// PR #123`, `// X에서 사용`)
- `.then().catch()` Promise 체인 (combinator는 예외)
- 분기에 계산 블록이 들어가는 3항 연산자
- 객체 생성 후 `obj.field = ...` mutate → spread 불변 구성으로

## 6. 참고 자료

- 타입·네이밍·에러 정책: [`docs/CONVENTIONS.md`](./CONVENTIONS.md)
- API 응답·envelope·배치: [`docs/API_PATTERNS.md`](./API_PATTERNS.md)
- 데이터 페칭: [`docs/DATA_FETCHING.md`](./DATA_FETCHING.md)
