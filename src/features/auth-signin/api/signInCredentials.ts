import { type SignInReq } from './types';

type SignInResult = 'success' | 'invalid-credentials' | 'unavailable';

const requestOptions = {
  cache: 'no-store',
  credentials: 'same-origin',
  redirect: 'error',
} satisfies RequestInit;

/** Auth.js의 CSRF 검증과 이메일 인증 결과를 페이지 이동 없이 처리한다. */
export async function signInCredentials(
  { email, password }: SignInReq,
  origin: string
): Promise<SignInResult> {
  const csrf = await fetch(new URL('/api/auth/csrf', origin), requestOptions);
  if (!csrf.ok) return 'unavailable';

  const csrfData = (await csrf.json()) as { csrfToken?: unknown } | null;
  const csrfToken = csrfData?.csrfToken;
  if (typeof csrfToken !== 'string' || !csrfToken) return 'unavailable';

  const response = await fetch(
    new URL('/api/auth/callback/credentials', origin),
    {
      ...requestOptions,
      method: 'POST',
      headers: { 'X-Auth-Return-Redirect': '1' },
      body: new URLSearchParams({
        email,
        password,
        csrfToken,
        callbackUrl: '/',
      }),
    }
  );
  if (!response.ok) return 'unavailable';

  const result = (await response.json()) as { url?: unknown } | null;
  if (typeof result?.url !== 'string') return 'unavailable';

  const resultUrl = new URL(result.url);
  if (
    (resultUrl.protocol !== 'http:' && resultUrl.protocol !== 'https:') ||
    resultUrl.username ||
    resultUrl.password
  ) {
    return 'unavailable';
  }

  if (
    resultUrl.pathname === '/signin' &&
    resultUrl.searchParams.get('error') === 'CredentialsSignin'
  ) {
    return 'invalid-credentials';
  }
  return resultUrl.href === `${resultUrl.origin}/` ? 'success' : 'unavailable';
}
