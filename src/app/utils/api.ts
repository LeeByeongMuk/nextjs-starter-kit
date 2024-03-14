"use server";

import { cookies } from 'next/headers';

const fetchApi = async (url: string, options: RequestInit = {}) => {
  const cookieStore = cookies();
  const requestUrl = url.startsWith('http')
    ? url
    : `${process.env.APP_API_URL}${url}`;
  const hasAccessToken = cookieStore.has('access_token');

  try {
    const res = await fetch(requestUrl, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        Authorization: hasAccessToken
          ? `Bearer ${cookieStore.get('access_token')?.value}`
          : '',
      },
    });
    return res.json();
  } catch (err) {
    return err;
  }
};

export { fetchApi };
