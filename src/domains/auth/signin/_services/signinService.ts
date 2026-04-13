import { TOKEN_KEY } from '@entities/auth/config/auth';
import { SignInReq, SignInRes } from '@domains/auth/signin/_types/api';
import { fetchApi } from '@shared/lib/api';
import { cookies } from 'next/headers';

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
