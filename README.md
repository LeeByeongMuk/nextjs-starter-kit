다음은 개선된 전체 내용입니다:

---

# Next.js 스타터 킷

## 설명

이 템플릿은 **Next.js**와 **Express.js**를 활용하여 자체 로그인 및 게시판 기능을 구현합니다.

### 프론트엔드 (FE)
- **Next.js** 14
- **React** 18
- **TypeScript**
- **Tailwind CSS**
- **React Query**
- **React Hook Form**
- **Jest**

### 백엔드 (BE)
- **Express**
- **MySQL**
- **Prisma** (ORM)

## 개발 서버 실행

Docker를 사용하여 로컬 환경을 설정합니다. Docker가 설치되어 있지 않은 경우 [Docker Desktop](https://www.docker.com/products/docker-desktop)에서 다운로드하세요.

### 설치 및 실행

다음 명령어를 실행하여 의존성을 설치하고 환경 변수 파일을 복사한 후, Docker 컨테이너를 시작합니다:

```bash
npm install
cp .env.example .env
docker compose up -d
```

### 마이그레이션 실행

컨테이너가 실행되면 데이터베이스 스키마를 설정하기 위해 마이그레이션을 실행합니다:

```bash
docker-compose exec express-js npx prisma migrate deploy
```

### 애플리케이션 접근

프론트엔드는 [http://localhost:3000](http://localhost:3000)에서, Express API는 [http://localhost:80](http://localhost:80)에서 접근할 수 있습니다.
