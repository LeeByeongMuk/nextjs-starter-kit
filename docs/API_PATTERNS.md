# API Patterns Guide (envelope SSOT · 매핑 금지 · 파일 배치)

> 작성일: 2026-05-27
> 대상 브랜치: `develop`
> 범위: API 응답 타입의 **단일 진실원천**, 응답 매핑 금지, fetch/hook 파일 배치. 데이터 페칭 메커니즘(`fetchApi`·TanStack)은 [`docs/DATA_FETCHING.md`](./DATA_FETCHING.md), 레이어 배치는 [`docs/FSD_GUIDE.md`](./FSD_GUIDE.md) 참조.

## 1. 응답 envelope SSOT = `@shared/api`

응답 공통 형태는 `src/shared/api/`가 단일 진실원천. 슬라이스 응답 타입은 이를 **`extends`**한다 — 슬라이스가 `ok` / `message` / `meta`를 직접 재정의하지 않는다.

| 베이스 타입 | 위치 | 용도 |
|---|---|---|
| `ApiResponse` (`{ ok, message }`) | `@shared/api/types` | 모든 응답 공통 envelope |
| `PaginationData` / `PaginationMeta` (`{ meta: { current_page, last_page, total } }`) | `@shared/api/pagination` | 페이지네이션 응답 |

```ts
// src/features/post-list/api/types.ts
import { PaginationData } from '@shared/api/pagination';
import { ApiResponse } from '@shared/api/types';

/** 게시글 목록 응답 */
export interface PostsRes extends ApiResponse, PaginationData {
  posts: Post[];
}
```

- 각 슬라이스가 `@shared/api`에서 **직접 import**한다. `extends`로 합성하고, 베이스 필드를 다시 선언하지 않는다.
- 단순 응답(추가 필드 없음)은 별칭으로 충분: `export type DeletePostRes = ApiResponse;`

## 2. 매핑 / 변환 함수 도입 금지

`fetchApi<Res>(url)`는 실패 시 throw하고 성공 시 타입 응답을 그대로 반환한다 ([`docs/DATA_FETCHING.md`](./DATA_FETCHING.md) §7). 슬라이스는 응답 필드를 **그대로 사용**한다.

- 페이지 응답은 `data.meta.current_page`, `data.meta.last_page`, `data.meta.total`를 직접 접근.
- 백엔드 필드를 "프론트 통일 모델"로 rename하는 `mapXxx` / `toFrontXxx` 류 변환 함수는 **anti-pattern** — 응답 SSOT를 흐리고 한 다리 우회만 늘린다.
- 응답이 부족하면 변환이 아니라 **명세 확인 후 타입에 필드 추가**. 응답에 없는 alias 필드(예: `meta.total`을 `totalCount`로 다시 부르기)를 코드에서 만들지 않는다.

## 3. cross-slice re-export 금지

- 한 슬라이스가 다른 슬라이스/shared의 타입을 **다시 export하지 않는다**. 필요한 곳에서 원본(`@shared/api`, `@entities/<d>`)을 직접 import.
- 같은 타입을 두 경로에서 import 가능하게 만들면 drift 위험.
- 불필요한 묶음 금지: 한 폴더만 가리키는 다단 barrel, 본문 정의 없이 import+export만 하는 alias 파일.

> 예외: FSD 슬라이스의 Public API (`entities/<d>/index.ts`, `features/<slice>/index.ts`)는 _외부 노출 통제_ 목적의 의도된 barrel. ESLint `boundaries`와 짝이라 유지 — [`docs/FSD_GUIDE.md`](./FSD_GUIDE.md) §4.

## 4. fetch service ↔ TanStack hook 파일 배치

타겟은 **fetch service와 TanStack hook을 세그먼트로 분리**한다 (noweats식 "같은 파일"과 다름).

| 종류 | 위치 | 예 |
|---|---|---|
| fetch service (`fetchApi` 호출) | `api/<name>Service(s).ts` | `features/post-list/api/postsServices.ts` |
| 응답/요청 타입 | `api/types.ts` | `features/post-list/api/types.ts` |
| TanStack hook | `model/use<...>.ts` | `features/post-list/model/usePostList.ts` |
| 도메인 모델 타입 | `entities/<d>/model/types.ts` | `entities/post/model/types.ts` |

- fetch service는 RSC에서 직접, hook은 Client에서 — RSC/Client 경계는 [`docs/DATA_FETCHING.md`](./DATA_FETCHING.md) §1.
- **분할 ≠ 슬라이스 승격.** 한 슬라이스 안에서 파일을 쪼개는 건 자유. 다른 슬라이스에서 재사용이 _실제로 발생_할 때만 `entities/<d>/`로 승격한다. 정석: `useDeletePost`가 `post-detail`·`post-update` 두 곳에서 쓰여 `entities/post/model/useDeletePost.ts`로 내려감 ([`docs/DATA_FETCHING.md`](./DATA_FETCHING.md) §2).
- 배치 결정 순서: 한 슬라이스 전용 → `features/<slice>/`, 여러 슬라이스 공용 → `entities/<d>/`. 새 코드를 무조건 `features/`에 두지 않는다.

## 5. DO / DON'T

**DO**

- 응답 타입은 `ApiResponse`(+`PaginationData`)를 `extends`
- envelope 베이스는 항상 `@shared/api`에서 직접 import
- 백엔드 필드명을 슬라이스가 그대로 접근 (`meta.current_page`)
- 공용으로 쓰이기 시작하면 hook을 `entities/<d>/model/`로 승격

**DON'T**

- `ok`/`message`/`meta`를 슬라이스에서 재정의 — `extends`로
- 백엔드 → 프론트 모델 변환 함수(`mapXxx`) 도입
- 응답에 없는 alias 필드를 코드에 추가
- 슬라이스가 다른 슬라이스/shared 타입을 re-export (slice Public API는 예외)
- 파일 분할을 슬라이스 승격으로 착각 — 재사용 발생 시에만 승격

## 6. 참고 자료

- 데이터 페칭 메커니즘: [`docs/DATA_FETCHING.md`](./DATA_FETCHING.md)
- 레이어 배치 / Public API: [`docs/FSD_GUIDE.md`](./FSD_GUIDE.md)
- 코드 스타일(JSDoc·주석·비동기): [`docs/CODE_STYLE.md`](./CODE_STYLE.md)
