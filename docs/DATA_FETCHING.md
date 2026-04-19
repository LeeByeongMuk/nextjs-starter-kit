# Data Fetching Guide

> 대상: **TanStack Query v5** + `src/shared/lib/api.ts`의 `fetchApi` 래퍼
> 상위 문서: [`docs/CONVENTIONS.md`](./CONVENTIONS.md)

## 1. 계층 분리

| 경계 | 사용 수단 |
|---|---|
| Server Component (RSC) | `fetchApi<T>()` 직접 호출 |
| Client Component | TanStack Query 훅 (`useQuery` / `useMutation`) |
| RSC → Client 전달 | RSC에서 받은 데이터를 Client 훅의 `initialData`로 hydrate |

RSC에서 TanStack Query 사용 금지 — 의존 에러와 dehydrate boundary 관리 복잡도 때문. 대신 `fetchApi`로 직접 패칭.

---

## 2. 훅 위치 (FSD 레이어와의 관계)

- **여러 슬라이스에서 공용** → `src/entities/<e>/model/`
  - 예: `useDeletePost`가 `post-detail` / `post-update` 두 feature에서 쓰이므로 `src/entities/post/model/`
- **특정 feature 전용** → `src/features/<slice>/model/`
  - 예: `usePostList` → `src/features/post-list/model/usePostList.ts`

슬라이스 격리 규칙(`docs/FSD_GUIDE.md` §4) 위반 시 — 한 feature의 훅을 다른 feature가 import 하려 하면 — 훅을 `entities`로 끌어내려 공유한다.

---

## 3. 네이밍

| 종류 | 패턴 | 예시 |
|---|---|---|
| Query | `use<Entity>` 또는 `use<Entity><Action>` | `usePost`, `usePostList` |
| Mutation | `use<Action><Entity>` | `useCreatePost`, `useUpdatePost`, `useDeletePost` |

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
- `onError`: 현재는 `alert()` — 토스트 도입 후 중앙 핸들러로 교체 예정 (`docs/CONVENTIONS.md` §3)

```ts
useMutation({
  mutationFn: fetchCreatePost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    router.push('/post');
  },
  onError: (err) => alert(err.message), // TODO: 토스트 도입 후 교체
});
```

---

## 6. QueryClient 설정

`src/shared/api/tanstack-query/client.ts` **한 곳에서만** 변경. 개별 훅이나 Provider에서 `new QueryClient()` 생성 금지 — 테스트 환경(`jest.setup.ts`)은 예외.

---

## 7. `fetchApi` 래퍼

`src/shared/lib/api.ts` — `'use server'` 지시어 + `cookies()`로 토큰 헤더 자동 주입 + `Content-Type` 기본값 + 실패 시 throw.

```ts
export const fetchApi = async <Response>(
  url: string,
  options: RequestInit = {}
): Promise<Response> => { ... };
```

- 외부 클라이언트 라이브러리(ky/ofetch) 도입 여부: `docs/LIBRARY_DECISIONS.md` §HTTP client 참조 (현재 유지 결정)
- 모든 feature의 `api/*Service.ts` 파일은 이 `fetchApi`를 사용. 직접 `fetch()` 호출 금지

---

## 8. 참고 자료

- TanStack Query 공식: https://tanstack.com/query/v5
- QueryClient: `src/shared/api/tanstack-query/client.ts`
- `fetchApi`: `src/shared/lib/api.ts`
