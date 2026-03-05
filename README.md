# Next.js 스타터 킷 (Turborepo 모노레포)

## 개요

- 이 템플릿은 **Turborepo** 기반 모노레포 구조로 구성되어 있습니다.
- **Next.js** 를 활용하여 자체 로그인 및 게시판 기능을 구현합니다.
- **MSW (Mock Service Worker)** 를 사용하여 백엔드 API 요청을 모킹합니다.
- MSW 는 개발 및 테스트 환경에서 백엔드 없이도 API 요청을 처리할 수 있도록 돕는 도구입니다.

### 기술스택

- **Turborepo** (모노레포 빌드 시스템)
- **Next.js** 15
- **React** 18
- **TypeScript**
- **Tailwind CSS**
- **React Query**
- **React Hook Form**
- **Jest**
- **MSW (Mock API)**

### 프로젝트 구조

```
├── apps/
│   └── web/                  # Next.js 웹 애플리케이션
├── packages/
│   ├── eslint-config/        # 공유 ESLint 설정
│   └── typescript-config/    # 공유 TypeScript 설정
├── docker/                   # Docker 설정 파일
├── turbo.json                # Turborepo 파이프라인 설정
├── package.json              # 루트 워크스페이스 설정
└── docker-compose.yml
```

### 설치 및 실행

- Docker 를 사용하여 로컬 환경을 설정합니다.
- Docker 가 설치되어 있지 않은 경우 [Docker Desktop](https://www.docker.com/products/docker-desktop)에서 다운로드하세요.

다음 명령어를 실행하여 의존성을 설치하고 환경 변수 파일을 복사한 후, Docker 컨테이너를 시작합니다

```bash
npm install
cp apps/web/.env.example apps/web/.env
docker compose up -d
```

### Turborepo 명령어

```bash
# 전체 빌드
npm run build

# 개발 서버 시작
npm run dev

# 린트 실행
npm run lint

# 테스트 실행
npm run test

# 타입 체크
npm run tsc

# 특정 워크스페이스에서만 실행
npx turbo run build --filter=@repo/web
```
