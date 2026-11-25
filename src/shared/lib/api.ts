import 'server-only';

import type { ZodType } from 'zod';

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

/**
 * 서버에서 설정한 API에 요청하고 필요에 따라 API 인증 정보를 전달한다.
 * 스키마를 주면 응답을 검증해 선언한 필드만 반환하고, 없으면 검증하지 않은 값을 unknown으로 반환한다.
 */
export async function fetchApi<Response>(
  path: string,
  options: ApiRequestOptions & { schema: ZodType<Response> }
): Promise<Response>;
export async function fetchApi(
  path: string,
  options?: ApiRequestOptions
): Promise<unknown>;
export async function fetchApi(
  path: string,
  {
    auth = 'optional',
    schema,
    ...options
  }: ApiRequestOptions & { schema?: ZodType } = {}
): Promise<unknown> {
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

  const body: unknown = await res.json();
  return schema ? schema.parse(body) : body;
}
