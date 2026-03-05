import { SignUpReq, SignUpRes } from '@domains/auth/signup/_types/api';
import { fetchApi } from '@shared/utils/api';

export const fetchSignUp = async (req: SignUpReq) => {
  return (await fetchApi('/api/users/signup', {
    method: 'POST',
    body: JSON.stringify(req),
  })) as SignUpRes;
};
