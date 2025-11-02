# Work History

- Spec-Kit 작업 내역 기록

## 디렉토리 구조

```
.work_history/
└── YYYY-MM-DD-work-name/         # 작업 세션
    ├── concept.md                # 작업 요약 혹은 설명 (필수)
    ├── draft.md                  # 개인 메모 (선택)
    ├── prompt.md                 # 단일 프롬프트 (선택)
    ├── prompts/                  # 혹은 프롬프트 모음 (권장)
    └── references/               # 참고 자료 (선택)
```

- `concept.md` 에는 작업의 개념적인 내용을 단순하게 기록
- `draft.md` 에 개인 메모 저장
- `prompt.md` 혹은 `prompts/` 하위에 프롬프트 저장
- `references/` 에 참고 자료 저장

## 빠른 시작

```bash
mkdir -p .work_history/$(date +%Y-%m-%d)-work-name
touch .work_history/$(date +%Y-%m-%d)-work-name/{constitution,specify,plan}.md
```

디렉토리명: `YYYY-MM-DD-work-name`

- `2025-10-01-spec-kit-setup`
- `2025-10-03-database-migration`

### 실행 순서

1. constitution.md : 프로젝트의 기본 원칙과 규칙
2. specify.md : 기능 명세서 (요구 사항 혹은 작업 계획)
3. plan.md : 기술 스택 및 아키텍처 결정
4. /speckit.tasks : 작업 목록 및 구현 계획 확인
5. /speckit.implement : 코드 구현
