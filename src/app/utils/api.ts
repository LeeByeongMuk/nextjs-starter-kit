'use server';

import { cookies } from 'next/headers';

import { TOKEN_KEY } from '@/app/constants/auth';

const fetchApi = async <Response = any>(
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

    return (await res.json()) as Response;
  } catch (err: any) {
    return err;
  }
};

export { fetchApi };
