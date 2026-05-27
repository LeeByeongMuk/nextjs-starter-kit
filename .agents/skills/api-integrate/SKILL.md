---
name: api-integrate
description: 백엔드 API 명세(+선택적 퍼블리싱 시안)가 준비된 상태에서 프론트 통합 작업. 명세 fetch → 시안↔명세 차이 매핑 → 타입/Service/TanStack 훅/MSW/폼 일괄 작성 → 검증 → 커밋·PR 마무리까지 5 phase 가이드. Next.js 16 + fetchApi + TanStack Query + NextAuth + RHF 스택 기준.
user-invocable: true
---

## 원칙 (모든 Phase에 우선)

1. **퍼블리싱(디자인)은 동결** — 시안 컴포넌트의 마크업·className·레이아웃·**라벨·텍스트·문구**(상태 라벨·toast·dialog title·placeholder·button label 포함)는 수정하지 않는다. props 인터페이스·이벤트 핸들러·데이터 바인딩만 명세에 맞춰 갱신한다. UI/텍스트 변경이 필요해 보이면 멈추고 사용자에게 확인.
2. **디자인 외 프론트 코드는 프로젝트 룰 기준으로 정합** — api Service·타입·model 훅·mocks는 시안 단계 임시 구현을 그대로 두지 않고 `docs/CODE_STYLE.md` · `docs/API_PATTERNS.md` · `docs/FSD_GUIDE.md` · `docs/DATA_FETCHING.md` · `docs/FORMS.md` + `CLAUDE.md` 컨벤션에 맞게 다시 쓴다.
3. **MSW ↔ 실제 API 동기** — 명세가 바뀌면 같은 PR에서 응답 타입(`api/types.ts`) + Service(`api/*Service.ts`) + MSW handler(`src/shared/api/mocks/handlers/`)·data(`src/shared/api/mocks/data/`)를 **반드시 함께** 수정한다. path·응답 shape가 세 곳에서 일치해야 한다. mock만 갱신 또는 service만 갱신 금지.
4. **응답 envelope 그대로 사용 — 매핑 금지** — `fetchApi<Res>(url)`는 실패 시 throw, 성공 시 타입 응답 반환. 응답 타입은 `ApiResponse`(`@shared/api/types`)를 `extends`(페이지면 `PaginationData`도). `mapXxx` 변환 함수 도입 금지. 응답 부족 시 명세 확인 후 타입에 필드 추가. 상세: `docs/API_PATTERNS.md`.
5. **RSC/Client 경계 준수** — `fetchApi`는 Server Component에서 직접, TanStack 훅은 Client Component에서. RSC에서 받은 데이터는 Client 훅의 `initialData`로 hydrate. 상세: `docs/DATA_FETCHING.md` §1.

## 입력 받기 (대화형)

다음을 사용자에게 물어 시작:

- **명세 출처**: API 명세 URL 또는 문서 경로
- **작업 슬라이스/도메인**: 예 `post`, `auth` — 그리고 화면(view) 단위인지 기능(feature) 단위인지

## Phase 1 — Setup

1. 프로젝트 룰을 먼저 읽는다 — `.agents/rules/{code-style,api-patterns,fsd,conventions}.md` + `docs/CODE_STYLE.md` · `docs/API_PATTERNS.md` · `docs/DATA_FETCHING.md` · `docs/FORMS.md`. 이후 모든 작성물은 이 룰을 따른다.
2. `git fetch origin develop && git checkout develop && git merge --ff-only origin/develop`
3. 새 브랜치: `feat/<scope>` (소문자 prefix, 슬래시 구분 — `^[a-z]+/[a-z0-9][a-z0-9._-]*(/[a-z0-9][a-z0-9._-]*)*$`, `.github/workflows`의 branch-name 검증 패턴)
4. 명세를 `WebFetch`로 가져와 핵심 추출 — 엔드포인트 path / 요청·응답 shape / 에러 케이스
5. **확인 포인트**: 추출한 엔드포인트·응답을 사용자에게 보여주고 동의 받기

## Phase 2 — 시안 ↔ 명세 차이 매핑

1. `Explore` 에이전트로 작업 슬라이스의 시안 자체 정의 + 사용처 파악 (자체 타입·임시 mock·하드코딩 값)
2. 매핑 보고서 작성 (표):
   - 요청/응답 필드명 (시안 임시 vs 명세)
   - **새 API의 FSD 레이어 배치** — 재사용 범위 기준으로 `views/<route>/api/`(이 화면만) / `features/<slice>/api/`(기능 단위) / `entities/<domain>/`(여러 슬라이스 공용) 중 결정. 같은 도메인 훅이 이미 다른 슬라이스에 있으면 entities로 승격하거나 import (`docs/API_PATTERNS.md` §4).
   - **MSW handler 위치** — `src/shared/api/mocks/handlers/<domain>Handler.ts` + data `src/shared/api/mocks/data/<domain>.json`. `handlers/index.ts`에 등록 필요.
3. **확인 포인트**: FSD 레이어 배치 + 시안 임시 정의 처리 방침 — 명세 도착분은 명세대로, 미수령 영역은 mock 유지하되 path는 명세 컨벤션 따르기

## Phase 3 — 구현

`docs/CODE_STYLE.md`·`docs/API_PATTERNS.md` 컨벤션을 그대로 따른다.

### 타입 (`api/types.ts`)
- 요청: `<도메인><동작>Req`, 응답: `<도메인><동작>Res extends ApiResponse` (페이지면 `, PaginationData`). `interface` + `Req`/`Res` suffix (`docs/CONVENTIONS.md` §1.1).
- 도메인 모델(`Post`, `User`)은 `entities/<domain>/model/types.ts`. UI enum 등 한 슬라이스 전용은 슬라이스 내부.
- envelope 베이스(`ApiResponse`, `PaginationData`)는 `@shared/api`에서 직접 import — re-export 금지.

### Service (`api/<name>Service.ts`)
- `fetchApi<Res>(url, options)` 호출. 실패 throw는 호출부(훅)에서 처리. 매핑/변환 함수 금지 — 응답 그대로 반환.
- RSC에서 직접 호출 가능 (Service는 `'use server'` 경계의 `fetchApi`를 거침).

### TanStack 훅 (`model/use*.ts`)
- Query: `use<Entity>` / `use<Entity><Action>`, Mutation: `use<Action><Entity>` (`docs/DATA_FETCHING.md` §3).
- 쿼리키 `[entity, paramsObject]` 고정 (파라미터는 항상 객체 래핑).
- Mutation `onSuccess`에서 `queryClient.invalidateQueries({ queryKey: [entity] })`. `onError`는 **신규 `alert()` 금지** (`docs/CONVENTIONS.md` §3).
- `QueryClient` 새로 생성 금지 — `src/shared/api/tanstack-query/client.ts`만.

### MSW (`src/shared/api/mocks/`)
- handler → `handlers/<domain>Handler.ts`, 시드 데이터 → `data/<domain>.json`. `handlers/index.ts`에 import 추가(누락 시 동작 안 함).
- 명세 path·응답 shape를 그대로 흉내. 명세 도착 시 mock만 끄면 자동 전환되도록.
- 테스트 오버라이드는 `server.use(http....)` (`docs/TESTING.md`).

### 폼 (RHF) — 입력 화면이면
- 3분할: `model/form.ts`(스키마·`defaultValues`) + `model/use<Slice>Form.ts`(`useForm` 래핑) + `ui/<Slice>Form.tsx`. **`useForm()`에 `defaultValues` 필수** (`docs/FORMS.md`).
- `FormProvider` + `useFormContext()` — prop drilling 금지.

## Phase 4 — 검증

1. `npm run tsc` — 타입체크
2. `npm run lint` — `boundaries` 포함 0 errors (`npm run lint:fix`로 자동 수정)
3. `npm test` — jest 통과 (신규/변경 로직 테스트 동반, `*.spec.tsx`)
4. `npm run build` — 프로덕션 빌드
5. 정합 점검 체크리스트:
   - **FSD 레이어 배치** — Service/훅이 재사용 범위에 맞는 레이어에, `index.ts` Public API로만 노출, 역방향 import 없음
   - **RSC/Client 경계** — `fetchApi`는 RSC, 훅은 Client. `'use client'` 누락/오용 없음
   - **MSW ↔ api drift** — 바뀐 엔드포인트가 handler·data에도 동일 반영, `handlers/index.ts` 등록 누락 없음
   - **퍼블리싱 동결** — `git diff`에서 시안 마크업·className·라벨 변경이 섞이지 않음 (props/handler/binding 한정)
   - **매핑 금지** — `mapXxx` 변환 함수, 응답에 없는 alias 필드 없음
6. **확인 포인트**: 사용자가 `npm run dev`에서 시나리오 통과 확인

## Phase 5 — 마무리

### 커밋 시리즈 (의미 단위, 각 커밋 green)
```
feat(<scope>): MSW 핸들러 + 응답 타입
feat(<scope>): API Service + TanStack 훅
feat(<scope>): 폼/UI 바인딩 정합
```
각 커밋은 conventional commits, PR 제목은 `<type>(<scope>): <subject>` (소문자). `develop` 직접 커밋 금지 — 반드시 feature 브랜치.

### PR — **사용자가 명시 요청할 때만 생성**
`gh pr create --base develop`. 본문 템플릿:
```markdown
## Summary
- <한 줄 요약>

## 정합 정리
- (Phase 2 매핑 결과)

## Test plan
- [ ] npm run tsc
- [ ] npm run lint (0 errors)
- [ ] npm test
- [ ] npm run build
- [ ] MSW 모드 시나리오 (Phase 4)
```

## DO

- 명세 변경 = 같은 PR에서 `api/types.ts` + `api/*Service.ts` + `mocks/handlers`·`data` 동시 갱신
- 응답 타입은 `ApiResponse`(+`PaginationData`) `extends`, 백엔드 필드 직접 사용
- 명세 path를 mock에서도 그대로 — 명세 도착 시 MSW만 끄면 전환
- 시안 컴포넌트는 props·이벤트·바인딩만 교체, 마크업·className·라벨 보존
- 한 슬라이스 전용은 `features/`, 공용은 `entities/`로

## DON'T

- 시안 UI 마크업·레이아웃·className·라벨 손대기 — 인터페이스만 갱신
- mock만 갱신하거나 service만 갱신 — drift 발생
- 백엔드 → 프론트 모델 변환 함수(`mapXxx`) 도입 — 응답 SSOT 흐려짐
- 응답에 없는 alias 필드를 코드에 추가
- 슬라이스가 다른 슬라이스/shared 타입을 re-export (slice Public API는 예외)
- 신규 `alert()` 호출, `QueryClient` 새로 생성
- 파일 분할을 슬라이스 승격으로 착각 — 재사용 실제 발생 시에만 승격

## 참고 자산

- 코드 스타일: `docs/CODE_STYLE.md` (`.agents/rules/code-style.md`)
- API 패턴: `docs/API_PATTERNS.md` (`.agents/rules/api-patterns.md`)
- 데이터 페칭: `docs/DATA_FETCHING.md` — `fetchApi`(`src/shared/lib/api.ts`), QueryClient(`src/shared/api/tanstack-query/client.ts`)
- 폼: `docs/FORMS.md`
- FSD 배치: `docs/FSD_GUIDE.md`
- envelope SSOT: `src/shared/api/types.ts`(`ApiResponse`), `src/shared/api/pagination.ts`(`PaginationData`)
- MSW: `src/shared/api/mocks/{browser,server,testServer}.ts` + `handlers/` + `data/`
