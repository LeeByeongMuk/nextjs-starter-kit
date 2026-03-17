# Major Dependency Migration Guide

> 작성일: 2026-03-12
> 대상 브랜치: `develop`
> 현재 Node.js 요구사항: `>=18.18.0`

## 개요

본 문서는 프로젝트의 모든 주요 의존성을 최신 메이저 버전으로 업그레이드하기 위한 마이그레이션 가이드입니다.

### 업그레이드 대상 요약

| 패키지 | 현재 | 목표 | 난이도 | 리스크 |
|---|---|---|---|---|
| react / react-dom | 18 | 19 | 낮음 | 낮음 |
| next | 15.5.10 | 16.x | 낮음 | 낮음 |
| eslint | 8.57.1 | 10.x | 중간 | 낮음 |
| eslint-config-next | 15.5.10 | 16.x | 낮음 | 낮음 |
| eslint-config-prettier | 9.1.2 | 10.x | 낮음 | 매우 낮음 |
| tailwindcss | 3.4.19 | 4.x | 낮음 | 매우 낮음 |
| jest / jest-environment-jsdom | 29.7.0 | 30.x | 중간 | 낮음~중간 |
| ts-jest / @types/jest | 29.x | 30.x | 낮음 | 낮음 |
| @types/node | 22 | 25 | 낮음 | 낮음 |
| @types/react / react-dom | 18 | 19 | 낮음 | 낮음 |
| express | 4.22.1 | 5.x | 낮음 | 낮음 |
| next-auth | 4.24.13 | 5.x (Auth.js) | **높음** | **중간** |

---

## Phase 1: Quick Wins (예상 소요: 30분)

리스크가 거의 없는 의존성을 먼저 업데이트합니다.

### 1-1. eslint-config-prettier 9 → 10

**Breaking change 없음.** `@stylistic` 규칙 지원 추가, Unicode BOM 처리 변경(Prettier 동작과 일치).

```bash
npm install eslint-config-prettier@^10 --save-dev
```

현재 설정(`plugin:prettier/recommended`)이 그대로 동작합니다. 추가 변경 불필요.

### 1-2. express 4 → 5

mock 서버(`src/lib/mocks/server.ts`)에서만 사용 중이며, deprecated API(`req.param()`, `req.host`, `app.del()` 등)를 사용하지 않습니다.

```bash
npm install express@^5 --save-dev
```

`@types/express`는 이미 `^5.0.6`이므로 변경 불필요.

**검증:**

```bash
npm run mock  # mock 서버 정상 기동 확인
```

### 1-3. @types/node 22 → 25

타입 정의만 변경되므로 영향 없음.

```bash
npm install @types/node@^25 --save-dev
```

---

## Phase 2: Tailwind CSS 3 → 4 (예상 소요: 1~2시간)

### 분석 결과

- `@apply` 디렉티브 미사용
- 커스텀 테마 확장 없음 (`theme.extend: {}`)
- `@tailwindcss/forms` 플러그인만 사용
- CSS 파일은 표준 디렉티브만 포함 (`@tailwind base/components/utilities`)

### 마이그레이션 절차

**1) 패키지 업데이트:**

```bash
npm install tailwindcss@^4 --save-dev
npm install @tailwindcss/forms@latest --save-dev
```

**2) CSS 파일 변경 — `src/styles/globals.css`:**

Tailwind v4에서는 `@tailwind` 디렉티브가 `@import`로 변경됩니다.

```css
/* Before (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* After (v4) */
@import "tailwindcss";
@plugin "@tailwindcss/forms";
```

**3) PostCSS 설정 변경 — `postcss.config.js`:**

Tailwind v4는 PostCSS 플러그인 설정이 달라집니다.

```js
// Before (v3)
module.exports = {
  plugins: {
    tailwindcss: {},
  },
};

// After (v4)
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**4) `tailwind.config.js` 처리:**

Tailwind v4는 CSS-first 설정을 사용합니다. 현재 설정이 최소한이므로:
- `content` 경로는 v4에서 자동 감지됨 → 설정 불필요
- `@tailwindcss/forms`는 CSS 파일에서 `@plugin`으로 이동
- `tailwind.config.js` 파일 삭제 가능

**5) eslint-plugin-tailwindcss 호환성 확인:**

```bash
npm install eslint-plugin-tailwindcss@latest --save-dev
```

**검증:**

```bash
npm run build    # 빌드 정상 확인
npm run dev      # 개발 서버에서 스타일 깨짐 없는지 육안 검증
npm run lint     # lint 통과 확인
```

### 주의사항

- v4에서 일부 기본 color palette가 변경됨 → 사용 중인 `teal-600`, `gray-100` 등은 유지됨
- 기본 font stack 변경 → 시각적 차이 확인 필요
- CSS specificity 규칙 변경 → 대부분의 유틸리티 클래스에는 영향 없음

---

## Phase 3: React 19 + Next.js 16 (예상 소요: 반나절)

### 분석 결과

프로젝트에서 React 19 breaking change에 해당하는 패턴이 **전혀 발견되지 않았습니다:**
- ~~forwardRef~~ 미사용
- ~~class component~~ 미사용
- ~~string ref~~ 미사용
- ~~defaultProps (function component)~~ 미사용
- ~~Legacy Context API~~ 미사용
- ~~PropTypes~~ 미사용

모든 페이지가 `'use client'`이므로 Next.js 16의 서버 컴포넌트 관련 변경에도 영향 없음.

### 마이그레이션 절차

**1) 패키지 업데이트:**

```bash
npm install react@^19 react-dom@^19
npm install @types/react@^19 @types/react-dom@^19 --save-dev
npm install next@^16
npm install eslint-config-next@^16 --save-dev
```

**2) `package.json` overrides 수정:**

`@toast-ui/react-editor`의 React peerDep override를 업데이트합니다.

```json
{
  "overrides": {
    "@toast-ui/react-editor": {
      "react": "^19"
    }
  }
}
```

> **주의:** `@toast-ui/react-editor`는 공식적으로 React 17만 지원하며, 더 이상 업데이트되지 않는 패키지입니다. React 19에서 정상 동작하는지 반드시 수동 테스트가 필요합니다.
> 동작하지 않을 경우 대체 에디터(BlockNote, TipTap 등) 전환을 검토해야 합니다.

**3) `next.config.js` 환경변수 확인:**

Next.js 16에서도 현재 설정은 호환됩니다. 변경 불필요.

```js
// 현재 설정 그대로 유지
const nextConfig = {
  reactStrictMode: true,
  distDir: 'build',
  // ...
};
```

**검증:**

```bash
npm run build          # 빌드 정상 확인
npm run dev            # 개발 서버 기동 및 전체 페이지 수동 테스트
npm test               # 테스트 통과 확인
```

**중점 테스트 항목:**
- [ ] Toast UI Editor 렌더링 및 입력 동작
- [ ] 로그인/회원가입 폼 동작
- [ ] 게시글 CRUD 전체 흐름
- [ ] useEffect 의존 로직(에러 리다이렉트 등)

---

## Phase 4: ESLint 10 Flat Config 전환 (예상 소요: 반나절)

### 분석 결과

현재 `.eslintrc.json`에서 사용 중인 모든 플러그인이 flat config를 지원합니다:
- `eslint-config-next` ≥ 15.x
- `eslint-config-prettier` ≥ 9.x
- `eslint-plugin-prettier` ≥ 5.x
- `eslint-plugin-tailwindcss` ≥ 3.x
- `@tanstack/eslint-plugin-query` ≥ 5.x

### 마이그레이션 절차

**1) 패키지 업데이트:**

```bash
npm install eslint@^10 --save-dev
npm install eslint-plugin-tailwindcss@latest --save-dev
npm install eslint-plugin-prettier@latest --save-dev
npm install @tanstack/eslint-plugin-query@latest --save-dev
```

**2) `.eslintrc.json` → `eslint.config.mjs` 전환:**

```js
// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:tailwindcss/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'plugin:prettier/recommended'
  ),
  {
    rules: {
      'no-alert': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': ['warn'],
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], 'internal', 'parent', ['sibling', 'index'], 'object'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      complexity: 'warn',
    },
  },
];
```

**3) 이전 설정 파일 삭제:**

```bash
rm .eslintrc.json
```

**4) `.eslintignore` 처리:**

ESLint 10에서는 `.eslintignore` 대신 config 파일 내 `ignores` 속성을 사용합니다. `.eslintignore`가 있다면 마이그레이션 필요.

**검증:**

```bash
npm run lint         # lint 정상 통과
npm run lint:fix     # auto-fix 정상 동작
```

---

## Phase 5: Jest 30 (예상 소요: 반나절)

### 분석 결과

- `jest-fixed-jsdom` 패키지의 Jest 30 호환성 확인 필요
- 테스트 9개 파일, MSW + React Query + Testing Library 조합
- `ts-jest` preset 사용 중

### 마이그레이션 절차

**1) jest-fixed-jsdom 호환성 확인:**

```bash
# jest-fixed-jsdom이 Jest 30을 지원하는지 확인
npm info jest-fixed-jsdom peerDependencies
```

미지원 시 대안:
- 공식 `jest-environment-jsdom@^30` 사용
- `jest.config.ts`에서 `testEnvironment: 'jest-environment-jsdom'`으로 변경

**2) 패키지 업데이트:**

```bash
npm install jest@^30 jest-environment-jsdom@^30 --save-dev
npm install ts-jest@^30 --save-dev
npm install @types/jest@^30 --save-dev
```

**3) `jest.config.ts` 수정 (jest-fixed-jsdom 미지원 시):**

```diff
  const config: Config = {
    // ...
-   testEnvironment: 'jest-fixed-jsdom',
+   testEnvironment: 'jest-environment-jsdom',
    // ...
  };
```

**4) Jest 30 주요 변경사항 대응:**

- `fakeTimers` 기본값 변경 확인
- snapshot 포맷 변경 시 스냅샷 갱신 (`npm test -- -u`)
- `jest.fn()` 타입 변경 사항 확인

**검증:**

```bash
npm test             # 전체 테스트 통과 확인
```

---

## Phase 6: next-auth 4 → 5 (Auth.js) (예상 소요: 2~3일)

### 분석 결과

가장 큰 마이그레이션 작업입니다. 아키텍처가 전면 변경됩니다.

**영향 받는 파일:**
- `src/app/api/auth/[...nextauth]/route.ts` — 설정 구조 변경
- `src/middleware.ts` — import 변경
- `src/shared/types/declare/nextAuth.d.ts` — 타입 변경
- `next.config.js` — 환경변수 prefix 변경
- 인증 관련 hooks/components (약 10개 파일)

### 마이그레이션 절차

**1) 패키지 업데이트:**

```bash
npm uninstall next-auth
npm install next-auth@^5
```

**2) 루트 설정 파일 생성 — `src/auth.ts`:**

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { fetchUser } from '@domains/auth/_services/userServices';
import { fetchSignIn } from '@domains/auth/signin/_services/signinService';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'your@mail.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const {
          data: { id },
        } = await fetchSignIn({
          email: (credentials?.email as string) || '',
          password: (credentials?.password as string) || '',
        });
        const user = await fetchUser();

        if (user) {
          return { ...user.data, id: id.toString() };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === 'update') {
        const updateUser = await fetchUser();
        return { ...token, ...user, ...updateUser.data };
      }
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = token as never;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
});
```

**3) API Route 변경 — `src/app/api/auth/[...nextauth]/route.ts`:**

```ts
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

**4) Middleware 변경 — `src/middleware.ts`:**

```ts
export { auth as middleware } from '@/auth';

export const config = {
  matcher: ['/post/create', '/post/:path*/update', '/account'],
};
```

**5) 환경변수 변경:**

```env
# Before
NEXTAUTH_URL=...
NEXTAUTH_SECRET=...

# After
AUTH_URL=...           # 또는 자동 감지 (Vercel 등에서)
AUTH_SECRET=...
```

`next.config.js`의 `env` 설정도 함께 업데이트:

```diff
  env: {
    APP_API_URL: process.env.APP_API_URL,
-   NEXTAUTH_URL: process.env.NEXTAUTH_URL,
-   NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
+   AUTH_URL: process.env.AUTH_URL,
+   AUTH_SECRET: process.env.AUTH_SECRET,
  },
```

**6) 타입 선언 변경 — `src/shared/types/declare/nextAuth.d.ts`:**

```ts
import { DefaultSession } from 'next-auth';

import { UserData } from '@domains/auth/_types/api';

declare module 'next-auth' {
  interface Session {
    user: UserData & DefaultSession['user'];
  }
}
```

타입 구조는 동일하나, import 경로가 변경될 수 있으므로 빌드 시 확인.

**7) 클라이언트 코드 변경:**

`useSession()`, `signIn()`, `signOut()`은 여전히 `next-auth/react`에서 import하며, 기본적인 사용법은 동일합니다. 다만 일부 옵션이 변경되었을 수 있으므로 확인 필요.

```ts
// 기존과 동일하게 사용 가능
import { useSession, signIn, signOut } from 'next-auth/react';
```

**8) SessionProvider 확인:**

`SessionProvider`가 사용되고 있다면 `next-auth/react`에서의 import는 유지됩니다.

**검증:**

```bash
npm run build
npm run dev
```

**중점 테스트 항목:**
- [ ] 로그인 (Credentials Provider)
- [ ] 로그아웃
- [ ] 세션 유지 및 갱신 (`trigger: 'update'`)
- [ ] 미인증 상태에서 보호 라우트 접근 시 리다이렉트
- [ ] JWT 콜백의 사용자 정보 매핑
- [ ] 회원가입 후 로그인 플로우
- [ ] 계정 정보 수정 후 세션 업데이트

---

## 마이그레이션 체크리스트

### Phase 1: Quick Wins ✅
- [x] `eslint-config-prettier` 10.x 업데이트
- [x] `express` 5.x 업데이트
- [x] `@types/node` 25 업데이트
- [x] lint, build, test 통과 확인

### Phase 2: Tailwind CSS ✅
- [x] `tailwindcss` 4.x 업데이트
- [x] `globals.css` 디렉티브 변경
- [x] `postcss.config.js` 업데이트
- [x] `tailwind.config.js` 제거
- [x] 빌드 및 스타일 검증

### Phase 3: React 19 + Next.js 16 ✅
- [x] `react`, `react-dom` 19 업데이트
- [x] `next` 16.x 업데이트
- [x] `@types/react`, `@types/react-dom` 19 업데이트
- [x] `eslint-config-next` 15.x backport 유지 (eslint 8 호환)
- [x] `overrides` 수정 (toast-ui)
- [ ] Toast UI Editor 수동 테스트
- [x] 전체 빌드 및 테스트

### Phase 4: ESLint 10
- [ ] `eslint` 10.x 업데이트
- [ ] `eslint.config.mjs` 생성 (flat config)
- [ ] `.eslintrc.json` 삭제
- [ ] lint 통과 확인

### Phase 5: Jest 30
- [ ] `jest-fixed-jsdom` 호환성 확인
- [ ] `jest`, `ts-jest`, `@types/jest` 30.x 업데이트
- [ ] `jest.config.ts` 수정 (필요 시)
- [ ] 전체 테스트 통과 확인

### Phase 6: next-auth 5
- [ ] `src/auth.ts` 생성
- [ ] API route 변경
- [ ] `middleware.ts` 변경
- [ ] 환경변수 마이그레이션 (`NEXTAUTH_*` → `AUTH_*`)
- [ ] `next.config.js` 환경변수 업데이트
- [ ] 타입 선언 확인
- [ ] 인증 전체 플로우 테스트

---

## 참고 사항

### @toast-ui/react-editor 관련

이 패키지는 3.2.3이 최종 버전이며 더 이상 유지보수되지 않습니다.
React 19에서 정상 동작하지 않을 경우 아래 대안을 검토해야 합니다:

| 대안 | 특징 |
|---|---|
| [BlockNote](https://github.com/TypeCellOS/BlockNote) | Notion 스타일, React-first, 활발한 개발 |
| [TipTap](https://tiptap.dev/) | ProseMirror 기반, 확장성 우수 |
| [Plate](https://platejs.org/) | Slate 기반, React 전용, 플러그인 아키텍처 |

### 롤백 전략

각 Phase를 별도 브랜치/PR로 진행하여, 문제 발생 시 개별 롤백이 가능하도록 합니다.
`package-lock.json`은 각 Phase 완료 시점에 커밋하여 의존성 상태를 보존합니다.
