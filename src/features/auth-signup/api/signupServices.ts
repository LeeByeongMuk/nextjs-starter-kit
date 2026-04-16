import { fetchApi } from '@shared/lib/api';

import { SignUpReq, SignUpRes } from './types';

export const fetchSignUp = async (req: SignUpReq) => {
  return (await fetchApi('/api/users/signup', {
    method: 'POST',
    body: JSON.stringify(req),
  })) as SignUpRes;
};
