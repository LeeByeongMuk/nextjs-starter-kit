---
paths:
  - 'src/app/auth/**'
  - 'src/app/api/auth/**'
  - 'src/features/auth-*/**'
  - 'src/entities/auth/**'
  - 'src/middleware.ts'
---

# Auth Guide

> 대상: **NextAuth v5 (beta)** + 토큰 쿠키 기반 인증
> 상위 문서: [`.agents/rules/code-style/code-conventions.md`](../code-style/code-conventions.md)

## 1. 설정 위치

NextAuth 설정은 **`src/app/auth/config.ts`** — app 레이어 멤버.

이유: NextAuth config가 인증 플로우 오케스트레이션을 담당하며 `fetchSignIn`(features) + `fetchUser`(entities)를 호출해야 한다 → app 레이어에서만 해당 호출이 허용된다. 자세한 배경은 `.agents/rules/architecture/fsd-architecture.md` §6 "NextAuth 설정 위치" 참조.

### 관련 파일

- `src/middleware.ts` — 한 줄 재-export: `import { auth as middleware } from '@app/auth/config'`
- `src/app/api/auth/[...nextauth]/route.ts` — 동일하게 `@app/auth/config`에서 import

---

## 2. Deep-import 허용 예외

`src/app/auth/config.ts`는 다음 두 함수를 **슬라이스 내부 경로**로 직접 import한다:

| 함수          | 경로                                      | 이유                                                                      |
| ------------- | ----------------------------------------- | ------------------------------------------------------------------------- |
| `fetchUser`   | `@entities/auth/api/userServices`         | `next/headers`(server-only) 사용 → barrel로 내보내면 클라이언트 번들 오염 |
| `fetchSignIn` | `@features/auth-signin/api/signinService` | 동일                                                                      |

호출부에는 반드시 다음을 같이 적는다:

```ts
// server-only — excluded from @features/auth-signin barrel to keep client bundle clean
// eslint-disable-next-line boundaries/dependencies
import { fetchSignIn } from '@features/auth-signin/api/signinService';
```

**이 예외는 `src/app/auth/config.ts`에서만 허용.** 다른 곳에서 복제 금지.

---

## 3. 세션 / JWT 콜백

```ts
callbacks: {
  async jwt({ token, user, trigger }) {
    if (trigger === 'update') {
      const updateUser = await fetchUser();
      return { ...token, ...user, ...updateUser.data };
    }
    return { ...token, ...user };
  },
  async session({ session, token }) {
    session.user = { ...session.user, ...token };
    return session;
  },
},
```

- `jwt` 콜백: `trigger === 'update'` 감지 시 `fetchUser()`로 세션 정보 갱신 (프로필 수정 후 즉시 반영 용도)
- `session` 콜백: token에 쌓인 user 정보를 `session.user`로 머지

세션 타입 선언: `src/entities/auth/config/nextAuth.d.ts`.

---

## 4. Credentials Provider

```ts
providers: [
  Credentials({
    async authorize(credentials) {
      const res = await fetchSignIn(credentials as SignInReq);
      return res.user ?? null;
    },
  }),
],
```

`authorize`가 `null`을 반환하면 로그인 실패. 반환된 user 객체는 JWT 콜백의 `user` 파라미터로 전달된다.

---

## 5. 토큰 쿠키

- 키: `TOKEN_KEY` 상수 (`src/shared/config/auth.ts`) — cross-cutting이라 shared 레이어
- 사용처: `src/shared/lib/api.ts`의 `fetchApi`가 `cookies().get(TOKEN_KEY)`로 자동 주입
- 쿠키 세팅/삭제: NextAuth가 관리. 직접 `cookies().set(TOKEN_KEY, ...)` 호출 금지

---

## 6. 보호 라우트

`src/middleware.ts`의 `matcher`:

```ts
export const config = {
  matcher: ['/post/create', '/post/:path*/update', '/account'],
};
```

여기 추가/제거는 middleware 한 곳에서만. page.tsx 내부에서 수동 `redirect()` 금지 — 일관성/중복 방지.

미인증 차단은 `config.ts`의 `callbacks.authorized`가 담당한다 — `false`를 반환하면 NextAuth 미들웨어가 `pages.signIn`(`/signin`)으로 리다이렉트한다. 이 콜백이 없으면 미들웨어는 세션만 노출하고 차단하지 않으므로 삭제 금지.

```ts
callbacks: {
  authorized({ auth }) {
    return !!auth?.user;
  },
  ...
}
```

---

## 7. 참고 자료

- NextAuth v5 공식: https://authjs.dev
- stable 전환 계획: `.agents/rules/infra/library-decisions.md` §NextAuth v5 beta → stable
