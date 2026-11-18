'use server';

import { clearAccessToken } from './accessToken';

/** Auth.js 세션 상태와 관계없이 로그아웃 요청의 API 인증 정보를 제거한다. */
export async function deleteAccessToken() {
  await clearAccessToken();
}
