---
paths:
  - "src/**/*"
  - "jest.config.ts"
  - "jest.setup.ts"
---

# Coding conventions pre-flight

**Canonical specs**:

- 가로지르는 원칙 — `docs/CONVENTIONS.md`
- 코드 스타일 (JSDoc·주석·비동기·불변 구성) — `docs/CODE_STYLE.md` (체크리스트: `code-style.md`)
- API 패턴 (envelope SSOT·매핑 금지·파일 배치) — `docs/API_PATTERNS.md` (체크리스트: `api-patterns.md`)
- 데이터 페칭 — `docs/DATA_FETCHING.md`
- 폼 — `docs/FORMS.md`
- 인증 — `docs/AUTH.md`
- 스타일 — `docs/STYLING.md`
- 테스팅 — `docs/TESTING.md`

This file is a Claude-only operational checklist; if it disagrees with any spec above, the spec wins. Update both together.

## Before writing new code (walk in order)

1. **Type 이름**: API 경계 타입이면 `interface` + `Req`/`Res` suffix — `docs/CONVENTIONS.md` §1.1
2. **TanStack Query 훅** — `docs/DATA_FETCHING.md`
   - 위치: 여러 슬라이스 공용 → `entities/<e>/model/`, 한 슬라이스 전용 → `features/<slice>/model/`
   - 쿼리키: `[entity, paramsObject]` 고정 (파라미터는 항상 객체 래핑)
3. **React Hook Form** — `docs/FORMS.md`
   - 파일 3분할: `model/form.ts` + `model/use<Slice>Form.ts` + `ui/<Slice>Form.tsx`
   - `useForm()` 호출에 **`defaultValues` 필수**
   - `FormProvider` + `useFormContext()` (prop drilling 금지)
4. **에러 피드백**: **신규 `alert()` 호출 금지** — `docs/CONVENTIONS.md` §3.4
5. **NextAuth deep-import**: `src/app/auth/config.ts`에서만 허용. 다른 곳에서 복제 금지 — `docs/AUTH.md` §2
6. **테스트**: 파일명 `*.spec.tsx` 고정, MSW 오버라이드는 `server.use(http....)` — `docs/TESTING.md`
7. **코드 스타일**: export에 JSDoc, 구분선·이력·호출자 주석 금지, async/await(`.then` 체인 금지) — `code-style.md` / `docs/CODE_STYLE.md`
8. **API 패턴**: 응답은 `ApiResponse` `extends`, 매핑 함수(`mapXxx`) 금지, fetch service↔hook 세그먼트 분리 — `api-patterns.md` / `docs/API_PATTERNS.md`

## Hard rules

- `useForm()`에서 `defaultValues` 누락 → 작성 전에 반드시 추가
- `alert()` 신규 호출 → 작성 금지 (기존 호출은 교체 대상)
- TS `enum` 사용 → as-const union으로 대체 — `docs/CONVENTIONS.md` §1.4
- `QueryClient` 새로 생성 → `src/shared/api/tanstack-query/client.ts`만 사용
- `classnames` 신규 import → 금지 (기존 2곳 외 확산 방지) — `docs/STYLING.md` §1

## Library additions

새 런타임 의존성을 제안하기 전에 `docs/LIBRARY_DECISIONS.md` 결정 테이블을 확인한다. "유지" 결정이 박힌 후보의 역(교체)을 무단 제안하지 말 것. **재검토 조건**이 충족됐다면 그 조건을 인용해 사용자에게 확인 요청.

예외: **Zod**는 "도입" 결정이 박혀 있으므로 후속 PR에서 능동적으로 적용 가능 (체크리스트: `docs/LIBRARY_DECISIONS.md` §Zod 도입).

## When in doubt

Ask the user before introducing a new pattern. 컨벤션에서 벗어난 한 줄은 수개월 후 표준을 오염시킨다 — ESLint가 잡지 못하는 종류의 드리프트.
