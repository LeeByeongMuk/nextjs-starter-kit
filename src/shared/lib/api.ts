'use server';

import { TOKEN_KEY } from '@shared/config/auth';
import { cookies } from 'next/headers';

export const fetchApi = async <Response>(
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // API 서버 밖으로 나가는 요청 차단 (SSRF) — '/' 시작 상대 경로만 허용, '//'는 프로토콜 상대 URL이라 제외
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
