import 'server-only';

import { TOKEN_KEY } from '@shared/config/auth';
import { cookies } from 'next/headers';

const LEGACY_TOKEN_KEY = 'access_token';

/** 만료 정책이 적용된 API 토큰 쿠키를 읽는다. */
export async function getAccessToken() {
  return (await cookies()).get(TOKEN_KEY)?.value;
}

/** 로그인과 프로필 조회가 성공한 후 API 인증 정보를 저장한다. */
export async function setAccessToken(accessToken: string, expiresAt: number) {
  const cookieStore = await cookies();
  cookieStore.delete(LEGACY_TOKEN_KEY);
  cookieStore.set(TOKEN_KEY, accessToken, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(expiresAt),
  });
}

/** 로그아웃 시 현재 토큰과 이전 버전의 토큰을 제거한다. */
export async function clearAccessToken() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_KEY);
  cookieStore.delete(LEGACY_TOKEN_KEY);
}
