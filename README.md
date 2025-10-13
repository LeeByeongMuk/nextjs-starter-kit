# Next.js 스타터 킷

## 개요

- 이 템플릿은 **Next.js** 를 활용하여 자체 로그인 및 게시판 기능을 구현합니다.
- **MSW (Mock Service Worker)** 를 사용하여 백엔드 API 요청을 모킹합니다.
- MSW 는 개발 및 테스트 환경에서 백엔드 없이도 API 요청을 처리할 수 있도록 돕는 도구입니다.

### 기술스택

- **Next.js** 14
- **React** 18
- **TypeScript**
- **Tailwind CSS**
- **React Query**
- **React Hook Form**
- **Jest**
- **MSW (Mock API)**

### 설치 및 실행

- Docker 를 사용하여 로컬 환경을 설정합니다.
- Docker 가 설치되어 있지 않은 경우 [Docker Desktop](https://www.docker.com/products/docker-desktop)에서 다운로드하세요.

다음 명령어를 실행하여 의존성을 설치하고 환경 변수 파일을 복사한 후, Docker 컨테이너를 시작합니다

```bash
npm install
cp .env.example .env
docker compose up -d
```
