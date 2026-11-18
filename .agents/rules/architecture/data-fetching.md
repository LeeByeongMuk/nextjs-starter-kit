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
| Server Component (RSC) | 기능별 서버 조회 함수 또는 `fetchApi<T>()`                               |
| Client Component       | TanStack Query 훅 (`useQuery` / `useMutation`)에서 기능별 서버 액션 호출 |
| RSC → Client 전달      | RSC에서 받은 데이터를 Client 훅의 `initialData`로 hydrate                |

RSC에서 TanStack Query 사용 금지 — 의존 에러와 dehydrate boundary 관리 복잡도 때문. 대신 `fetchApi`로 직접 패칭.

---

## 2. 훅 위치 (FSD 레이어와의 관계)

- **여러 슬라이스에서 공용** → `src/entities/<e>/model/`
  - 예: `useDeletePost`가 `post-detail` / `post-update` 두 feature에서 쓰이므로 `src/entities/post/model/`
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

- `onSuccess`: `queryClient.invalidateQueries({ queryKey: [entity] })` + 라우팅/알림
- `onError`: 현재는 `alert()` — 토스트 도입 후 중앙 핸들러로 교체 예정 (`.agents/rules/code-style/code-conventions.md` §3)

```ts
useMutation({
  mutationFn: fetchCreatePost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    router.push('/post');
  },
  onError: err => alert(err.message), // TODO: 토스트 도입 후 교체
});
```

---

## 6. QueryClient 설정

`src/shared/api/tanstack-query/client.ts` **한 곳에서만** 변경. 개별 훅이나 Provider에서 `new QueryClient()` 생성 금지 — 테스트 환경(`jest.setup.ts`)은 예외.

---

## 7. `fetchApi` 래퍼

- `src/shared/lib/api.ts`는 `server-only` 모듈이다. `APP_API_URL`을 사용하고 리다이렉트를 차단한다. 인증이 필요한 작업에는 서버 쿠키에서 읽은 API 토큰을 전달한다.
- API의 비정상 HTTP 응답은 상태 코드가 담긴 `ApiError`로 전달한다.
- 브라우저에서 호출하는 각 `'use server'` 함수는 API 경로와 메서드를 고정한다. 동적 식별자와 폼 값을 검증한 후 허용된 필드만 요청에 포함하고, 응답도 화면에 필요한 필드로 제한한다.
- 서버 조회·서버 액션은 `fetchApi`를 통해 API에 접근한다. HTTP 클라이언트 도입 기준은 [라이브러리 결정](../infra/library-decisions.md#http-client)을 따른다.

---

## 8. 참고 자료

- TanStack Query 공식: https://tanstack.com/query/v5
- QueryClient: `src/shared/api/tanstack-query/client.ts`
- `fetchApi`: `src/shared/lib/api.ts`
