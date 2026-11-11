'use server';

import { TOKEN_KEY } from '@shared/config/auth';
import { cookies } from 'next/headers';

/** Auth.js 세션의 존재 여부와 관계없이 API 토큰 쿠키를 삭제한다. */
export const deleteAccessToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_KEY);
};

export const fetchApi = async <Response>(
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // '//'는 프로토콜 상대 URL이라 외부로 나갈 수 있어 함께 차단 (SSRF)
  if (!url.startsWith('/') || url.startsWith('//')) {
    throw new Error(`fetchApi는 '/'로 시작하는 상대 경로만 허용합니다: ${url}`);
  }

  const cookieStore = await cookies();
  const hasAccessToken = cookieStore.has(TOKEN_KEY);
  const requestUrl = `${process.env.APP_API_URL}${url}`;

  try {
    const res = await fetch(requestUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: hasAccessToken
          ? `${cookieStore.get(TOKEN_KEY)?.value}`
          : '',
      },
    });

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch (err: unknown) {
    throw new Error((err as Error).message);
  }
};
