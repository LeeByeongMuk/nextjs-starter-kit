---
paths:
  - 'src/**/api/**'
  - 'src/**/model/**'
  - 'src/shared/lib/api.ts'
---

# Data Fetching Guide

> 대상: **TanStack Query v5** + `src/shared/lib/api.ts`의 `fetchApi` 래퍼
> 상위 문서: [`.agents/rules/code-style/code-conventions.md`](../code-style/code-conventions.md)

## 1. 계층 분리

| 경계                   | 사용 수단                                                                |
| ---------------------- | ------------------------------------------------------------------------ |
| Server Component (RSC) | 기능별 서버 조회 함수 또는 응답 스키마를 지정한 `fetchApi()`             |
| Client Component       | TanStack Query 훅 (`useQuery` / `useMutation`)에서 기능별 서버 액션 호출 |
| RSC → Client 전달      | RSC에서 받은 데이터를 Client 훅의 `initialData`로 hydrate                |

RSC에서 TanStack Query 사용 금지 — 의존 에러와 dehydrate boundary 관리 복잡도 때문. 대신 `fetchApi`로 직접 패칭.

---

## 2. 훅 위치 (FSD 레이어와의 관계)

- **여러 슬라이스에서 공용** → `src/entities/<e>/model/`
  - 예: `useDeletePost` → `src/entities/post/model/useDeletePost.ts`
- **특정 feature 전용** → `src/features/<slice>/model/`
  - 예: `usePostList` → `src/features/post-list/model/usePostList.ts`

슬라이스 격리 규칙(`.agents/rules/architecture/fsd-architecture.md` §4) 위반 시 — 한 feature의 훅을 다른 feature가 import 하려 하면 — 훅을 `entities`로 끌어내려 공유한다.

---

## 3. 네이밍

| 종류     | 패턴                                     | 예시                                              |
| -------- | ---------------------------------------- | ------------------------------------------------- |
| Query    | `use<Entity>` 또는 `use<Entity><Action>` | `usePost`, `usePostList`                          |
| Mutation | `use<Action><Entity>`                    | `useCreatePost`, `useUpdatePost`, `useDeletePost` |

---

## 4. 쿼리키 구조 (표준)

**`[entity, paramsObject]`** 형태로 고정. 파라미터는 **항상 객체로 감싼다** — 추후 필드가 늘어도 키 구조가 깨지지 않음.

```ts
// 리스트 (엔티티 복수형)
useQuery({ queryKey: ['posts', { ...searchFilters }], ... });

// 단건 (엔티티 단수형)
useQuery({ queryKey: ['post', { id }], ... });
```

현행 코드에 `['posts', searchFilters]`(객체 감싸기 없이)가 있으나 **신규 코드는 객체 래핑**. 점진 교정.

---

## 5. Mutation 콜백

- `onSuccess`: `toast.success(...)` 완료 알림 + 라우팅. 이동하지 않고 같은 화면에 남는 변경은 `queryClient.invalidateQueries({ queryKey: [entity] })`로 표시 중인 데이터를 다시 불러온다
- 실패 알림은 훅에 두지 않는다. `meta.errorMessage`에 문구를 지정하면 `QueryClient`의 `MutationCache`가 `toast.error`로 알린다. 문구를 지정하지 않으면 기본 문구로 알린다
- `MutationCache`는 변경 요청을 시작할 때 표시 중인 알림을 닫는다. 알림 규칙은 `.agents/rules/code-style/code-conventions.md` §3

```ts
// src/features/post-create/model/useCreatePost.ts
useMutation({
  mutationFn: (req: CreatePostReq) => fetchCreatePost(req),
  meta: { errorMessage: '게시글을 등록하지 못했습니다.' },
  onSuccess: res => {
    toast.success('게시글을 등록했습니다.');
    router.push(`/post/${res.data.id}`);
  },
});
```

---

## 6. QueryClient 설정

`src/shared/api/tanstack-query/client.ts` **한 곳에서만** 변경. 개별 훅이나 Provider에서 `new QueryClient()` 생성 금지 — 캐시를 격리하려는 테스트는 예외다 ([`unit-testing.md`](../testing/unit-testing.md) §6).

변경 요청의 실패 알림과 `meta` 타입(`errorMessage`)도 이 파일의 `MutationCache`와 `Register` 선언이 정의한다. 직접 만든 `QueryClient`에는 이 알림이 적용되지 않는다.

---

## 7. `fetchApi` 래퍼

- `src/shared/lib/api.ts`는 `server-only` 모듈이다. `APP_API_URL`을 사용하고 리다이렉트를 차단한다. 인증이 필요한 작업에는 서버 쿠키에서 읽은 API 토큰을 전달한다.
- API의 비정상 HTTP 응답은 상태 코드가 담긴 `ApiError`로 전달한다.
- `schema` 옵션에 응답 스키마를 주면 응답 본문을 검증해 스키마가 선언한 필드만 반환한다. 형식이 맞지 않는 응답은 `ZodError`로 거절한다. 서버 조회·서버 액션은 응답 스키마를 지정한다. 스키마 없이 호출하면 검증하지 않은 값을 `unknown`으로 반환하므로 호출부가 직접 확인한다.
- 브라우저에서 호출하는 각 `'use server'` 함수는 API 경로와 메서드를 고정한다. 동적 식별자와 입력은 `api/types.ts`의 요청 스키마로 확인해 선언한 필드만 요청에 포함하고, 응답은 응답 스키마가 선언한 화면에 필요한 필드로 제한한다. 입력이 맞지 않으면 API 요청 전에 거절한다.
- 요청 스키마는 값의 형식만 확인한다. 사용자 입력 규칙은 [폼 스키마](../code-style/form-patterns.md)가, 업무 규칙은 API가 확인한다.
- 요청의 성공 여부는 HTTP 상태로 판정한다. 성공 응답의 본문이 비어 있으면 스키마에 `undefined`를 전달한다. 가입·탈퇴와 게시글 수정·삭제는 빈 본문으로 완료할 수 있다. 프로필이나 새 게시글 식별자가 필요한 작업은 해당 필드를 검증한다.
- 응답 스키마는 화면과 후속 동작이 쓰는 값만 쓰는 방식대로 요구한다.
  - 목록에는 제목과 페이지 정보가, 상세에는 제목과 본문이 필요하다. 목록 행과 등록 응답의 게시글 식별자는 상세 경로와 같은 `PostIdSchema`로 확인한다. 현재 페이지는 양의 정수, 마지막 페이지와 전체 개수는 0 이상의 정수로 받는다.
  - 화면에 대체 표시가 있는 값은 비어 있어도 받는다 (분류, 작성자 이름, 닉네임, 작성일, 편집 가능 여부).
  - 화면이 쓰지 않는 값은 `@shared/api/types`의 `lenient()`로 선언한다. 형식이 맞으면 전달하고, 없거나 달라도 요청을 막지 않는다 (공통 필드 `ok`·`message`, 조회수, 수정·가입 응답의 식별자). 변경 요청은 API가 이미 처리한 뒤에 응답을 검증하므로, 쓰지 않는 값 때문에 실패로 알리지 않는다.
- 되돌릴 수 없는 변경이 화면에서 확인한 대상을 향하는지는 서버 액션이 다시 확인한다. 회원 탈퇴는 화면에서 확인한 계정과 API 토큰의 계정이 같을 때만 요청한다 ([`auth.md`](./auth.md) §5).
- 서버 조회·서버 액션은 `fetchApi`를 통해 API에 접근한다. HTTP 클라이언트 도입 기준은 [라이브러리 결정](../infra/library-decisions.md#http-client-kyofetch)을 따른다.

---

## 8. 참고 자료

- TanStack Query 공식: https://tanstack.com/query/v5
- QueryClient: `src/shared/api/tanstack-query/client.ts`
- `fetchApi`: `src/shared/lib/api.ts`
