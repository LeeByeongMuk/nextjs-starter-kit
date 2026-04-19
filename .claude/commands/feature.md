---
description: "기능 개발 파이프라인: 설계 → 구현 → 테스트 → 리뷰 자동 실행"
---

사용자가 요청한 기능을 다음 파이프라인으로 처리한다. 각 단계를 순서대로 실행하고, 이전 단계 결과를 다음 단계에 전달한다.

## 입력

$ARGUMENTS

## 파이프라인

### 1단계: 설계 (fsd-architect)

fsd-architect 에이전트를 호출하여 다음을 결정한다:

- FSD 레이어/슬라이스 배치 (`docs/FSD_GUIDE.md` §7 결정 트리)
- 생성할 파일 목록과 세그먼트 구성
- RSC vs Client Component 판단
- Public API (index.ts) 노출 심볼
- 의존 관계 (`@<layer>/<slice>`에서 import할 항목)

설계 결과를 정리한 뒤 다음 단계로 넘긴다.

### 2단계: 구현 (feature-dev)

feature-dev 에이전트를 호출하여 1단계 설계에 따라 코드를 작성한다:

- 슬라이스 디렉토리 + index.ts 생성
- UI 컴포넌트, TanStack Query 훅, API 서비스, 타입 구현
- 기존 코드 수정이 필요하면 함께 처리
- `npm run tsc`로 타입 체크 통과 확인

### 3단계: 테스트 (test-writer)

test-writer 에이전트를 호출하여 2단계에서 구현한 코드의 테스트를 작성한다:

- 컴포넌트 테스트 (렌더링 + 인터랙션)
- 훅 테스트 (TanStack Query 훅)
- 필요 시 MSW 핸들러 추가
- `npm test`로 전체 테스트 통과 확인

### 4단계: 리뷰 (code-reviewer)

code-reviewer 에이전트를 호출하여 전체 변경 사항을 검증한다:

- FSD 레이어 방향 위반
- Public API 규칙
- RSC/Client 경계
- 타입 안전성
- Path alias 규칙

위반 사항이 있으면 직접 수정한 뒤 다시 리뷰한다.

### 5단계: 최종 검증

모든 품질 게이트를 통과하는지 확인한다:

```bash
npm run tsc
npm run lint
npm test
```

모두 통과하면 변경 요약을 보고한다.
