export const fetchApi = async <Response>(
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const requestUrl = url.startsWith('http')
    ? url
    : `${process.env.APP_API_URL}${url}`;

  try {
    const res = await fetch(requestUrl, {
      ...options,
    });

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch (err: unknown) {
    console.log(err);
    throw new Error((err as Error).message);
  }
};
