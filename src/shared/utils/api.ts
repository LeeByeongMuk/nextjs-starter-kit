'use server';

import { cookies } from 'next/headers';

import { TOKEN_KEY } from '@domains/auth/_constants/auth';

export const fetchApi = async <Response>(
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const cookieStore = cookies();
  const hasAccessToken = cookieStore.has(TOKEN_KEY);
  const requestUrl = url.startsWith('http')
    ? url
    : `${process.env.APP_API_URL}${url}`;

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
