---
paths:
  - 'src/app/auth/**'
  - 'src/app/api/auth/**'
  - 'src/features/auth-*/**'
  - 'src/entities/auth/**'
  - 'src/proxy.ts'
---

# Auth Guide

> 대상: **NextAuth v5 (beta)** + 토큰 쿠키 기반 인증
> 상위 문서: [`.agents/rules/code-style/code-conventions.md`](../code-style/code-conventions.md)

## 1. 설정 위치

NextAuth 설정은 **`src/app/auth/config.ts`** — app 레이어 멤버.

이유: NextAuth config가 인증 플로우 오케스트레이션을 담당하며 `fetchSignIn`(features) + `fetchUser`(entities)를 호출해야 한다 → app 레이어에서만 해당 호출이 허용된다. 자세한 배경은 `.agents/rules/architecture/fsd-architecture.md` §6 "NextAuth 설정 위치" 참조.

### 관련 파일

- `src/proxy.ts` — Node.js 런타임에서 인증을 적용: `import { auth as proxy } from '@app/auth/config'`
- `src/app/api/auth/[...nextauth]/route.ts` — 동일하게 `@app/auth/config`에서 import

---

## 2. Deep-import 허용 예외

`src/app/auth/config.ts`는 서버 전용 모듈을 다음 **슬라이스 내부 경로**로 직접 import한다:

| 함수                | 경로                                      | 이유                                                                      |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------------- |
| `fetchUser`         | `@entities/auth/api/userServices`         | `next/headers`(server-only) 사용 → barrel로 내보내면 클라이언트 번들 오염 |
| `fetchSignIn`       | `@features/auth-signin/api/signinService` | 로그인 API와 서버 쿠키 설정                                               |
| `deleteAccessToken` | `@shared/lib/api`                         | 로그아웃·탈퇴·Auth.js 이벤트의 공통 API 토큰 정리                         |

호출부에는 반드시 다음을 같이 적는다:

```ts
// server-only — excluded from @features/auth-signin barrel to keep client bundle clean
// eslint-disable-next-line boundaries/dependencies
import * as signInService from '@features/auth-signin/api/signinService';
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

`authorize`는 이메일·비밀번호가 빈 문자열이 아닌지 확인하고 `signInService.fetchSignIn()`으로 API 로그인을 수행한다. 이어서 `fetchUser()`로 사용자 정보를 조회해 문자열 `id`와 함께 반환한다.

`authorize`가 `null`을 반환하면 로그인 실패다. 반환된 user 객체는 JWT 콜백의 `user` 파라미터로 전달된다.

---

## 5. 토큰 쿠키

- Auth.js 세션 쿠키와 자체 API의 `TOKEN_KEY` 쿠키는 서로 다르다.
- 키: `TOKEN_KEY` 상수 (`src/shared/config/auth.ts`) — cross-cutting이라 shared 레이어.
- `signinService.ts`의 `fetchSignIn`만 API 응답의 토큰을 저장한다. `httpOnly`, `sameSite: 'lax'`, `path: '/'`를 적용하고 production에서 `secure`를 활성화한다.
- `fetchApi`는 서버에서 `cookies().get(TOKEN_KEY)`를 읽어 API 요청에 주입한다.
- 헤더 로그아웃과 회원 탈퇴는 `@shared/lib/api`의 `deleteAccessToken` 서버 액션을 호출한 뒤 Auth.js 로그아웃을 진행한다. 세션 쿠키가 없거나 손상되면 Auth.js 이벤트가 생략될 수 있으므로 이벤트에만 의존하지 않는다. `events.signOut`에도 같은 정리 함수를 연결한다. 클라이언트의 `document.cookie`로 인증 쿠키를 조작하지 않는다.

---

## 6. 보호 라우트

`src/proxy.ts`의 `matcher`:

```ts
export const config = {
  matcher: ['/post/create', '/post/:path*/update', '/account'],
};
```

여기 추가/제거는 proxy 한 곳에서만. page.tsx 내부에서 수동 `redirect()` 금지 — 일관성/중복 방지.

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

## 7. 서버 환경변수

- `AUTH_SECRET`, `AUTH_URL`, `APP_API_URL`은 서버 런타임의 환경변수 또는 `.env`에서 읽는다.
- `next.config.js`의 `env`나 `NEXT_PUBLIC_*`로 노출하지 않는다.
- 로컬·Docker 주소와 비밀값 생성 방법은 `.env.example`과 `README.md`를 따른다.

---

## 8. 참고 자료

- NextAuth v5 공식: https://authjs.dev
- stable 전환 계획: `.agents/rules/infra/library-decisions.md` §NextAuth v5 beta → stable
