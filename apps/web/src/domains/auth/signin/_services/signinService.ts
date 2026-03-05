import { cookies } from 'next/headers';

import { TOKEN_KEY } from '@domains/auth/_constants/auth';
import { SignInReq, SignInRes } from '@domains/auth/signin/_types/api';
import { fetchApi } from '@shared/utils/api';

export const fetchSignIn = async (req: SignInReq) => {
  const res: SignInRes = await fetchApi('/api/users/signin', {
    method: 'POST',
    body: JSON.stringify(req),
  });

  const { access_token } = res.data;
  cookies().set(TOKEN_KEY, access_token, {
    path: '/',
  });

  return res;
};
