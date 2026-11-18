/** API 호출용 토큰을 담는 HttpOnly 쿠키 이름. */
export const TOKEN_KEY = 'api_access_token';

/** Auth.js 세션과 API 토큰 쿠키의 공통 유효 기간(초). */
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
