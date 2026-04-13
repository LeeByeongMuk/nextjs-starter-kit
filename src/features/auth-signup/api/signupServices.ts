import { SignUpReq, SignUpRes } from '@features/auth-signup/api/types';
import { fetchApi } from '@shared/lib/api';

export const fetchSignUp = async (req: SignUpReq) => {
  return (await fetchApi('/api/users/signup', {
    method: 'POST',
    body: JSON.stringify(req),
  })) as SignUpRes;
};
