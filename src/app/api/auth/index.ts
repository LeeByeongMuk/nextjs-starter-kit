'use server';

import { cookies } from 'next/headers';

import {
  SignInReq,
  SignInRes,
  SignUpReq,
  SignUpRes,
  UserRes,
} from '@/app/types/auth';
import { fetchApi } from '@/app/utils/api';

const fetchUser = async () => {
  return (await fetchApi('/api/accounts', {
    method: 'GET',
  })) as UserRes;
};

const fetchSignUp = async (req: SignUpReq) => {
  return (await fetchApi('/api/accounts/signup', {
    method: 'POST',
    body: JSON.stringify(req),
  })) as SignUpRes;
};

const fetchSignIn = async (req: SignInReq) => {
  const res: SignInRes = await fetchApi('/api/accounts/signin', {
    method: 'POST',
    body: JSON.stringify(req),
  });

  const { access_token } = res.data;
  cookies().set('access_token', access_token, {
    path: '/',
  });

  return res;
};

export { fetchUser, fetchSignUp, fetchSignIn };
