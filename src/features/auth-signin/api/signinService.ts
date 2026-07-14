import { TOKEN_KEY } from '@shared/config/auth';
import { fetchApi } from '@shared/lib/api';
import { cookies } from 'next/headers';

import { SignInReq, SignInRes } from './types';

export const fetchSignIn = async (req: SignInReq) => {
  const res: SignInRes = await fetchApi('/api/users/signin', {
    method: 'POST',
    body: JSON.stringify(req),
  });

  const { access_token } = res.data;
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_KEY, access_token, {
    path: '/',
  });

  return res;
};
