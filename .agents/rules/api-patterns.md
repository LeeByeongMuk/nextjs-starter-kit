---
paths:
  - "src/**/api/**"
  - "src/**/model/**"
  - "src/shared/api/**"
---

# API patterns pre-flight

**Canonical spec: `docs/API_PATTERNS.md`.** This file is a Claude-only operational checklist; if it disagrees with the spec, the spec wins. Update both together.

## Before writing API code (walk in order)

1. **응답 타입**: `ApiResponse`(`@shared/api/types`)를 `extends`. 페이지면 `PaginationData`(`@shared/api/pagination`)도 — `docs/API_PATTERNS.md` §1
   - 예: `export interface PostsRes extends ApiResponse, PaginationData { posts: Post[] }`
2. **매핑 금지**: `fetchApi`는 타입 응답을 그대로 반환. 백엔드 필드(`meta.current_page`) 직접 사용. `mapXxx` 변환 함수 도입 금지 — §2
3. **파일 배치**: fetch service → `api/<name>Service.ts`, TanStack hook → `model/use*.ts`, 타입 → `api/types.ts` — §4
4. **레이어**: 한 슬라이스 전용 → `features/<slice>/`, 여러 슬라이스 공용 → `entities/<d>/`. 분할 ≠ 승격 — §4

## Hard rules

- `ok`/`message`/`meta`를 슬라이스에서 재정의 → `extends`로
- 백엔드 → 프론트 모델 변환 함수(`mapXxx`) 도입 → 금지
- 응답에 없는 alias 필드 추가 → 금지 (명세 SSOT)
- 슬라이스가 다른 슬라이스/shared 타입을 re-export → 금지 (slice `index.ts` Public API는 예외)
- 파일 분할을 슬라이스 승격으로 착각 → 재사용 실제 발생 시에만 `entities/`로

## When in doubt

배치가 애매하면 가장 좁은 범위(`features/<slice>/`)에서 시작하고, 재사용이 생기면 승격한다.
