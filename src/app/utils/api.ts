'use server';

import { cookies } from 'next/headers';

import { TOKEN_KEY } from '@/app/constants/auth';

const fetchApi = async <Response>(
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const cookieStore = cookies();
  const requestUrl = url.startsWith('http')
    ? url
    : `${process.env.APP_API_URL}${url}`;
  const hasAccessToken = cookieStore.has(TOKEN_KEY);

  try {
    const res = await fetch(requestUrl, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        Authorization: hasAccessToken
          ? `Bearer ${cookieStore.get(TOKEN_KEY)?.value}`
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

export { fetchApi };
