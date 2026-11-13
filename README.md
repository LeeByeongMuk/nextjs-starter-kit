# Next.js 스타터 킷

자체 API에 연결하는 로그인·계정 관리·게시판 예제입니다. Next.js App Router와 Feature-Sliced Design(FSD)을 사용하며, 백엔드가 없어도 Express mock 서버로 화면을 실행할 수 있습니다. `/`는 `/post`로 이동합니다.

## 실행 환경과 설치

- Node.js **26.13.1 LTS** (`.nvmrc`), npm **11.20.0**
- 패키지 매니저는 npm, 재설치 기준은 `package-lock.json`입니다.

```bash
nvm install
nvm use
npm ci
cp .env.example .env
```

`.env`의 빈 `AUTH_SECRET`에 안전하게 생성한 난수를 설정하세요. 실제 인증값은 커밋하지 않습니다. 로컬 API 주소는 `APP_API_URL=http://127.0.0.1:9090`, 앱 주소는 `AUTH_URL=http://localhost:3000`입니다.

첫 번째 터미널에서 mock API를 실행합니다.

```bash
npm run mock
```

두 번째 터미널에서 앱을 실행한 뒤 `http://localhost:3000`에 접속합니다.

```bash
npm run dev
```

Docker는 선택 사항입니다. Docker를 사용한다면 로컬 mock/dev 프로세스를 종료하고 아래 명령으로 두 서비스를 실행합니다. Compose는 컨테이너 내부 API 주소를 설정합니다.

```bash
docker compose up --build
```

의존성을 갱신한 뒤에는 `docker compose up --build --renew-anon-volumes`로 컨테이너의 `node_modules` 볼륨도 새로 만듭니다.

AI 에이전트 스킬 설치는 `npm run setup -- --skills`로 선택할 수 있습니다. 일반 앱 실행에는 스킬 설치가 필요하지 않습니다.

## 기술 스택과 구조

| 역할 | 선택 |
| --- | --- |
| 앱·UI | Next.js 16 · React 19 · TypeScript 6 · Tailwind CSS 4 |
| API·폼 | TanStack Query 5 · 자체 `fetchApi` · React Hook Form 7 |
| 인증·본문 입력 | NextAuth 5 beta · Toast UI Editor |
| 테스트·개발 API | Jest 30 · Testing Library · MSW 2 · Express |

FSD 레이어는 `app → views → widgets → features → entities → shared` 순서로 의존합니다. 슬라이스 외부에서는 루트 `index.ts`의 Public API를 사용합니다. [아키텍처 규칙](.agents/rules/architecture/fsd-architecture.md), [라이브러리 유지·전환 결정](.agents/rules/infra/library-decisions.md), [최신화 범위와 검증 기록](docs/workflows/starter-modernization/brief.md)을 참고하세요. 정확한 패키지 버전은 lockfile이 결정합니다.

TypeScript 7·ESLint 10·MSW 3의 일괄 도입은 호환성과 마이그레이션 비용 때문에 보류합니다. NextAuth는 v5 beta를 유지하며, 안정판 확인 없이 `@latest`를 설치하지 않습니다.

## mock과 실제 API의 계약

Express 개발 서버와 Jest는 같은 MSW 핸들러를 사용합니다. 브라우저 Service Worker는 사용하지 않습니다. Query Devtools는 개발 환경에서만 로드합니다.

mock의 계정·토큰·게시글은 모두 **데모 데이터**입니다. 핸들러는 미리 정한 응답을 반환하므로 실제 비밀번호 인증·작성자 권한·검색·페이지네이션·데이터 영속성을 검증하지 않습니다. 가입·작성·수정·삭제 결과도 서버에 저장되지 않습니다. 실제 서비스에서는 API 서버가 인증·인가·입력 검증을 수행해야 합니다.

실제 API에 연결하려면 서버에서 접근 가능한 `APP_API_URL`을 설정합니다. `fetchApi`는 서버에서 API 토큰 쿠키를 읽어 요청 헤더에 전달합니다. 로그인 시 토큰을 `httpOnly`, `sameSite=lax` 쿠키로 저장하고 production에서는 `secure`를 적용합니다. 로그아웃과 회원 탈퇴는 서버 액션으로 API 토큰을 삭제한 뒤 Auth.js 로그아웃을 진행합니다. 세션 쿠키 누락·손상 시에도 정리되며, Auth.js 로그아웃 이벤트에도 같은 처리를 연결합니다.

게시글 본문은 HTML로 저장·렌더링합니다. **API 서버는 저장하거나 반환하는 HTML을 정제하고 허용 태그·속성·URL 정책을 보장해야 합니다.** 에디터와 타입 선언만으로 이 계약을 대신할 수 없습니다. 이번 템플릿은 별도의 HTML sanitizer를 포함하지 않습니다. Toast UI에 포함된 DOMPurify의 보안 권고와 교체 보류 이유는 [라이브러리 결정](.agents/rules/infra/library-decisions.md#toast-ui-editor--tiptaplexical)에 기록되어 있습니다.

## 디자인과 접근성

한국어 가독성·여백·의미별 색상·키보드 접근성 원칙을 적용합니다. teal 강조색과 제한된 본문 폭, 반응형 여백, 긴 제목·URL 줄바꿈을 사용합니다. 라이트·다크 대비, 본문 건너뛰기, 보이는 포커스, 오류·로딩·빈 결과 구분을 확인합니다. 구체적인 토큰과 화면 규칙은 [스타일 규칙](.agents/rules/code-style/styling.md)이 기준입니다.

## 디자인 스킬

[Impeccable](https://github.com/pbakaus/impeccable)을 `.agents/skills/impeccable`에 설치합니다. Claude Code는 기존 `.claude/skills` 심볼릭 링크를 통해 같은 원본을 사용합니다. 설치 후 다음 대화에서 스킬을 사용할 수 있습니다.

- 설치 버전: 스킬 4.8.2. 원본 커밋과 설치 CLI 버전은 `scripts/setup.mjs`에 고정되어 있습니다.
- Codex: `$impeccable critique src/views/post-list/PostListView.tsx`로 디자인을 검토하고, `$impeccable polish src/views/post-list/PostListView.tsx`로 다듬습니다.
- Claude Code: 같은 요청을 `/impeccable critique src/views/post-list/PostListView.tsx` 또는 `/impeccable polish src/views/post-list/PostListView.tsx`로 실행합니다.
- 실제 UI 변경에는 프로젝트의 FSD·Tailwind 규칙을 우선하고 데스크톱·모바일 렌더링을 확인합니다. 접근성·인터랙션 검토에는 기존 `web-design-guidelines`를 함께 사용합니다.

벤더링 파일은 Git에서 제외하며 `npm run setup -- --skills`로 복원합니다. 첫 실행 시 런처가 체크섬으로 검증한 플랫폼 엔진을 사용자 캐시에 내려받을 수 있습니다. 설치는 자동 실행 훅을 활성화하지 않습니다.

## CI 계약

GitHub Actions의 `build.yml`은 `.nvmrc`에 지정된 Node.js에서 단일 `check` 작업으로 `npm ci`를 한 번 실행한 뒤 타입·ESLint·Prettier·테스트(커버리지 60%)·production build를 검증합니다. 문서만 변경한 PR은 앱 검사를 생략합니다.

`pr-policy.yml`은 브랜치 이름과 PR 제목을 검사합니다. CodeQL은 GitHub default setup으로 유지합니다.

Dependabot은 npm과 GitHub Actions를 월간 확인하고 minor·patch 업데이트를 묶습니다. npm 보안 업데이트는 별도 그룹으로 묶으며 메이저 업데이트는 개별 검토합니다. [라이브러리 결정](.agents/rules/infra/library-decisions.md)에서 보류한 TypeScript·ESLint·MSW 메이저와 Node 런타임 메이저를 따르는 `@types/node` 메이저는 버전 업데이트에서 제외합니다. 버전 업데이트 PR 상한은 npm 3개, GitHub Actions 2개입니다.

## 검증

```bash
npm run tsc
npm run lint
npm test -- --runInBand
npm run build
```

Jest는 branches·functions·lines·statements 각각 **60%** 커버리지를 요구합니다. FSD 경계 규칙을 포함한 ESLint 검사는 CI를 차단합니다. 빌드한 앱은 `npm start`로 실행합니다.

릴리스 전에는 실제 브라우저에서 가입·로그인·보호 경로 복귀·계정 변경·로그아웃, 게시글 CRUD·검색·필터·페이지 이동을 확인합니다. 모바일·데스크톱, 라이트·다크, 키보드 포커스와 가로 넘침도 확인합니다. Jest의 Auth.js 모킹과 데모 API 통과가 실제 백엔드 및 배포 환경의 인증 검증을 대신하지 않습니다.

프로젝트 규칙의 원본은 [`.agents/rules/`](.agents/rules)이며 에이전트 진입점은 [`AGENTS.md`](AGENTS.md)입니다. `CLAUDE.md`·`GEMINI.md`는 이 파일을 가리킵니다.
