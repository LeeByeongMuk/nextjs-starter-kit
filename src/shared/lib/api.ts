import 'server-only';

import { getAccessToken } from './accessToken';

interface ApiRequestOptions extends RequestInit {
  auth?: 'optional' | 'required' | 'none' | { accessToken: string };
}

/** API가 반환한 HTTP 상태를 호출부에 보존한다. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** 서버에서 설정한 API에 요청하고 필요에 따라 API 인증 정보를 전달한다. */
export const fetchApi = async <Response>(
  path: string,
  { auth = 'optional', ...options }: ApiRequestOptions = {}
): Promise<Response> => {
  if (!/^\/(?![/\\])/.test(path)) {
    throw new Error('API 요청 경로가 올바르지 않습니다.');
  }

  const base = process.env.APP_API_URL;
  if (!base) {
    throw new Error('APP_API_URL 설정이 필요합니다.');
  }
  const requestUrl = `${base.replace(/\/$/, '')}${path}`;

  const accessToken =
    typeof auth === 'object'
      ? auth.accessToken
      : auth === 'none'
        ? undefined
        : await getAccessToken();
  if (auth === 'required' && !accessToken) {
    throw new Error('로그인이 필요합니다.');
  }

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.delete('Authorization');
  if (accessToken) headers.set('Authorization', accessToken);

  const res = await fetch(requestUrl, {
    ...options,
    headers,
    redirect: 'error',
  });
  if (!res.ok) {
    throw new ApiError(res.status, res.statusText);
  }

  return res.json();
};
