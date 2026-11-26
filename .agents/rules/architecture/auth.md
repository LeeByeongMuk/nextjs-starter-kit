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

| 함수          | 경로                                      | 이유                                                  |
| ------------- | ----------------------------------------- | ----------------------------------------------------- |
| `fetchUser`   | `@entities/auth/api/userServices`         | 로그인 및 세션 갱신에서 사용하며 `server-only`로 보호 |
| `fetchSignIn` | `@features/auth-signin/api/signinService` | API 로그인으로 발급된 토큰을 서버에서 전달            |

호출부에는 반드시 다음을 같이 적는다:

```ts
// server-only — excluded from @features/auth-signin barrel to keep client bundle clean
// eslint-disable-next-line boundaries/dependencies
import { fetchSignIn } from '@features/auth-signin/api/signinService';
```

**이 예외는 `src/app/auth/config.ts`에서만 허용.** 다른 곳에서 복제 금지.

---

## 3. 세션 / JWT 콜백

- `jwt` 콜백은 로그인 시 확정한 절대 만료 시각을 JWT에 저장한다. 만료 시각이 지났거나 API 토큰 쿠키가 누락된 경우 세션을 종료한다.
- 클라이언트는 `update({})`로 세션 갱신을 요청한다. `trigger === 'update'`에서는 `fetchUser()`로 조회한 서버의 프로필 값을 반영하고 기존 만료 시각을 유지한다.
- 계정 폼은 PUT 응답을 저장 기준값으로 사용한다. 세션이 일시적으로 끊기면 폼을 숨기고 재확인을 제공한다. 같은 계정이 확인되면 편집을 복구하고, 계정이 바뀌면 새 프로필로 폼을 초기화한다.
- 세션 갱신 중 프로필 조회에 일시적인 API 또는 네트워크 오류가 발생하면 기존 세션과 만료 시각을 유지한다. JWT에 갱신 대기를 기록하고 다음 Auth.js 세션 요청(`/api/auth/session`)에서 조회를 재시도한다. 프로필 조회의 HTTP 401·403은 API 토큰 쿠키를 지우고 세션을 종료한다.
- `session` 콜백은 사용자 `id`, `email`, `name`, `nickname`과 세션 만료 시각을 반환한다.

세션 타입 선언: `src/entities/auth/config/nextAuth.d.ts`.

---

## 4. Credentials Provider

`authorize`는 `fetchSignIn()`으로 API 로그인을 수행한다. `fetchSignIn()`은 이메일·비밀번호가 공백이 아닌 문자열인지 스키마로 확인하고 맞지 않으면 로그인 실패로 처리한다. 응답의 인증 정보(`data`)에 회원 식별자와 API 토큰이 모두 있어야 로그인하며, 인증 정보를 쓸 수 없으면 로그인 실패로 처리한다. 응답이 인증 정보를 아예 싣지 않으면 오류를 전달하고 로그인 화면은 요청 실패로 안내한다. 새 API 토큰으로 `fetchUser()`를 호출한다. 두 요청에 성공한 경우 토큰 쿠키를 저장하고 프로필과 절대 만료 시각을 반환한다.

`authorize`는 API 로그인이 HTTP 401을 반환하면 Auth.js에 자격 증명 실패(`CredentialsSignin`)를 알린다. 로그인 성공 시 반환된 user 객체는 JWT 콜백의 `user` 파라미터로 전달된다.

이메일 로그인 폼은 같은 출처의 `GET /api/auth/csrf`에서 토큰을 받은 뒤 `POST /api/auth/callback/credentials`에 전송한다. Auth.js 응답 URL의 호스트는 서버 설정을 따를 수 있으며, 응답 URL로 인증 성공과 자격 증명 오류를 판정한다. 인증이 확인되면 브라우저 출처를 기준으로 검증한 복귀 주소로 이동한다.

---

## 5. 토큰 쿠키

- Auth.js JWT 세션과 `TOKEN_KEY` API 토큰 쿠키는 `src/shared/config/auth.ts`의 `SESSION_MAX_AGE`(30일)를 사용한다. API 쿠키의 절대 만료는 로그인 시점에 정한다. 유효한 API 토큰을 발급·폐기하는 책임은 API에 있다.
- `@shared/lib/accessToken`은 쿠키 저장, 읽기, 삭제를 담당한다. `httpOnly`, `sameSite: 'lax'`, `path: '/'`, 만료 시각을 설정하고 production에서는 `secure`를 활성화한다.
- `fetchApi`는 서버에서 API 토큰을 읽는다. 회원가입·로그인은 익명으로 요청하고 보호 작업에는 API 토큰이 필요하다. 게시글 수정·삭제 등 리소스 권한은 API가 확인한다.
- 이전 버전의 `access_token` 쿠키 및 만료 시각이 없는 JWT 세션에는 재로그인이 필요하다. 새 로그인은 `api_access_token` 쿠키를 발급하고 이전 쿠키를 정리한다.
- 헤더 로그아웃과 회원 탈퇴는 `@shared/lib/deleteAccessToken`의 서버 액션으로 현재·이전 API 토큰 쿠키를 지운 뒤 Auth.js 로그아웃을 호출한다. Auth.js `events.signOut`도 같은 쿠키 정리를 수행한다.
- 가입·탈퇴 API가 성공하면 같은 화면에서 재제출을 막는다. 가입 후에는 Auth.js가 로그인 성공을 반환하면 홈으로 이동하고, 실패하면 로그인 링크로 안내한다. 탈퇴 후 로그아웃에 실패하면 헤더의 로그아웃으로 안내한다.
- 화면의 세션과 API 토큰 쿠키는 다른 탭에서 계정을 바꾸면 잠시 어긋날 수 있다. 회원 탈퇴 서버 액션은 화면에서 탈퇴를 확인한 계정(`user_id`)을 함께 받아 API 토큰의 계정(`GET /api/users`)과 같을 때만 삭제를 요청한다. 화면도 대화상자를 연 계정의 세션이 끝나거나 바뀌면 확인을 버린다.

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
