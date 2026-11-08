# 제품 Brief: Next.js 스타터킷 현대화

- Run ID: `starter-modernization`
- Status: `COMPLETE`
- Updated: `2026-11-08`

## 문제

새 프로젝트를 시작하는 개발자가 실행 환경과 문서의 불일치, 불필요한 초기 설정, 정리되지 않은 예제 화면 때문에 템플릿을 바로 사용하기 어렵다.

## 원하는 결과와 성공 신호

- 호환성이 검증된 최신 스택과 일관된 실행 환경으로 설치·개발·테스트·빌드를 재현할 수 있다.
- 실제 사용하지 않는 설정과 콘텐츠를 제거하고, 인증·게시판 예제의 역할을 명확히 한다.
- 한국어 가독성·여백·색상·키보드 접근성 원칙을 스타터킷 화면에 적용한다.
- 프로젝트 품질 게이트와 실제 브라우저 흐름을 통과한 변경을 PR로 제공한다.

## 판단 원칙

- 단순한 버전 숫자보다 안정판·peer 호환성·실제 검증을 우선한다.
- 참고 저장소의 실사용 원칙을 적용하되 Next.js 앱 스타터킷의 목적을 유지한다.
- 제거는 사용처와 실행 경로를 확인한 항목에 한정한다.
- 동일 사실은 해당 규칙 또는 README에서 관리하고 이 문서는 결정·수용 조건·검증을 기록한다.

## 절대 제약과 비목표

- npm과 단일 lockfile, FSD 경계·Public API, 기존 60% 커버리지 게이트를 유지한다.
- 인증·게시판 핵심 기능과 URL을 보존한다. 참고 블로그 자체는 수정하지 않는다.
- 기존 사용자 변경 `multi-agent-setup/`은 수정·스테이징하지 않는다.
- 커밋·푸시·PR 생성은 사용자 승인 범위이며 merge·배포는 포함하지 않는다.
- 새로운 제품 기능이나 라이브러리의 불필요한 도입을 피한다.

## 수용 조건

- [x] `AC-01` 실제 registry와 공식 문서를 근거로 호환되는 의존성을 갱신하고 보류 이유를 기록한다.
- [x] `AC-02` 로컬·CI·선택적 Docker 실행 환경과 설치 문서가 일치한다.
- [x] `AC-03` 사용하지 않는 스택·설정·예제 콘텐츠를 제거하고 핵심 인증·게시판 기능을 보존한다.
- [x] `AC-04` 진입 화면(`/` → `/post`)·인증·게시판의 시각적 일관성, 모바일 레이아웃, 키보드 접근성을 실제 브라우저로 확인한다.
- [x] `AC-05` `npm run tsc`, `npm run lint`, `npm test`, `npm run build`를 통과한다.
- [x] `AC-06` Astra ultra와 Sol 6.1 xhigh 독립 검토 후 3개 병렬 작업을 수행하고 결과를 통합한다.
- [x] `AC-07` 변경에 맞춘 현재 문서를 갱신하고 사용자 본인을 assignee로 한 PR을 생성한다.

## 결정 기록

| 날짜       | 결정                                                                        | 버린 대안                          | 이유                                                                                           | 결정자         |
| ---------- | --------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------- | -------------- |
| 2026-11-08 | 두 모델 독립 검토 후 3개 병렬 구현                                          | 외부 내장 에이전트만 사용          | 사용자가 명시한 실행 방식                                                                      | 사용자         |
| 2026-11-08 | Next.js·FSD·인증·게시판 예제 유지                                           | 블로그와 같은 Astro로 전환         | Next.js 앱 스타터킷의 목적 유지                                                                | 기본 작업 가정 |
| 2026-11-08 | Node 26 LTS, Next 16.4.5, React 19.3.1 및 호환되는 동일 메이저 업데이트     | 일괄 latest 적용                   | 두 모델의 registry·peer 검토. TypeScript 7·ESLint 10·MSW 3은 호환성/마이그레이션 비용으로 보류 | 독립 검토 종합 |
| 2026-11-08 | `/`의 기존 `/post` 이동을 유지하고 가려진 홈 예제 제거                      | 별도 마케팅 홈페이지 신설          | 실제 진입 화면인 게시판에 집중하고 불필요 콘텐츠 축소                                          | 독립 검토 종합 |
| 2026-11-08 | 브라우저 MSW와 중복 ts-jest 설정 제거, 테스트 MSW·Express mock·ts-node 유지 | mock/테스트 인프라 전체 교체       | 실제 실행 경로와 필요성 구분                                                                   | 독립 검토 종합 |
| 2026-11-08 | 서버 전용 env 유지, 토큰 쿠키와 서버 로그아웃 정리                          | 클라이언트에서 인증 토큰 쿠키 삭제 | 기존 인증 동작을 유지하면서 확인된 경계 문제 해결                                              | 독립 검토 종합 |
| 2026-11-08 | 기존 선택적 AI 코드리뷰 workflow 유지                                       | 관련 외부 운영 기능 제거           | 활성 사용 여부가 확인되지 않아 불필요하다고 단정하지 않음                                      | 독립 검토 종합 |

버전 근거: [Next registry](https://registry.npmjs.org/next/latest), [React registry](https://registry.npmjs.org/react/latest), [Node 공식 배포](https://nodejs.org/dist/index.json), [TypeScript ESLint 지원 범위](https://typescript-eslint.io/users/dependency-versions/), [NextAuth registry](https://registry.npmjs.org/next-auth).

디자인 근거: 의미별 색상 토큰, 본문 폭, 한국어 줄바꿈, 포커스와 모션 감소 원칙. 현행 teal 강조색을 정돈해 적용하며 Astro·MDX·새 UI 라이브러리는 도입하지 않는다.

## 열린 제품 결정

- None. 게시글 HTML 정제의 백엔드 계약은 기존 통합 위험으로 문서화하며 에디터/HTML 형식 교체는 이번 범위에서 제외한다.

## 실행 체크포인트

- 기준 커밋: `origin/develop`의 `0efed81`. 구현 브랜치: `feat/starter-modernization`.
- Astra ultra와 Sol 6.1 xhigh가 독립 검토한 뒤, stack·cleanup/auth·design 세 격리 작업 트리에서 병렬 구현하고 통합했다.
- 통합 후 실제 production 브라우저에서 발견한 페이지 번호 이름, Toast UI sprite·대비·본문 역할·더보기 이름을 수정했다. 세션 누락·손상 시 로그아웃 정리도 별도 서버 액션으로 보완했다.
- 최종 Sol 검토는 추가 blocker 없음. 타입·lint·테스트·빌드·브라우저 검증 완료. [PR #183](https://github.com/LeeByeongMuk/nextjs-starter-kit/pull/183)을 `develop` 대상으로 생성했고 assignee는 `LeeByeongMuk`이다. 원격 CI의 최종 상태는 PR 체크를 따른다.

## 검증 증거

| AC/위험   | 검증 방법                                         | 결과                                                                                                                           |
| --------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| AC-01·02  | Node 26.13.0 / npm 11.20.0에서 lockfile 설치      | `npm ci` 통과. `classnames` 사용처 0개 확인 후 직접 의존성 제거                                                                |
| AC-05     | `npm run tsc`, `npm run lint`, `npm run prettier` | 모두 exit 0, lint 경고 없음                                                                                                    |
| AC-05     | `npm test -- --runInBand`                         | 8 suites / 54 tests 통과. statements·lines 79.22%, branches 73.89%, functions 72.53%; 기존 60% 게이트 유지                     |
| AC-05     | `npm run build`                                   | Next 16.4.5 production build 통과. 임시 빌드용 secret이 client static bundle에 포함된 횟수 0                                   |
| AC-03·04  | production 앱 + 저장소의 Express/MSW mock         | 가입·자동 로그인·보호 경로 복귀·계정 수정·탈퇴·로그아웃, 게시글 작성·상세·수정, 검색·분류·페이지 URL 상태 통과                 |
| 인증 쿠키 | 실제 Auth.js 브라우저 로그인·로그아웃             | HttpOnly·Secure·SameSite=Lax 확인. 정상·세션 쿠키 누락·손상 3가지 로그아웃 모두 API 토큰 삭제, 보호 경로 재접근 차단           |
| AC-04     | Chromium + axe, 1440/390px와 light/dark           | 일반 화면 12개 조합 + 인증/편집/오류 상태 6개, 총 18개 상태에서 WCAG 2A/AA·2.1A/AA 위반 0, 가로 넘침 0, 미처리 브라우저 오류 0 |
| AC-04     | 키보드·Toast UI 실제 편집                         | 본문 건너뛰기 포커스, 기존 HTML 로드·수정·제출, 테마 전환 중 작성 내용 보존, 44px 툴바와 sprite 표시 통과                      |
| AC-02     | `docker compose config`                           | 설정 검증 통과. Docker 데몬이 실행되지 않아 컨테이너 기동 검증은 미실행                                                        |
| AC-06     | 패널 모델 표시·독립 보고·3개 작업 통합            | Astra ultra / GPT-6.1 Sol xhigh 독립 검토와 3개 병렬 구현 완료, 통합 후 최종 검토 수행                                         |

## 남은 위험

- `npm audit`: 3 low / 27 moderate / 1 high. high는 Toast UI에 포함된 DOMPurify 보안 권고다. 외부 패키지 override만으로 내장 구현을 교체할 수 없으며, 에디터 교체·재빌드는 보류했다. 정확한 영향과 재검토 근거는 [라이브러리 결정](../../../.agents/rules/infra/library-decisions.md#toast-ui-editor--tiptaplexical)을 따른다.
- mock은 고정 응답이며 데이터 영속성·실제 비밀번호·작성자 권한·실제 검색을 검증하지 않는다. 실제 백엔드는 인증·인가·HTML 정제 계약을 보장해야 한다.
- Docker 컨테이너 실행과 실제 배포 환경 검증은 수행하지 않았다. merge·배포는 이번 요청 범위에 포함되지 않는다.
