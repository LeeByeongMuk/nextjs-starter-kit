'use server';

import { cookies } from 'next/headers';

import { TOKEN_KEY } from '@/app/constants/auth';
import {
  SignInReq,
  SignInRes,
  SignUpReq,
  SignUpRes,
  UserDeleteReq,
  UserDeleteRes,
  UserRes,
  UserUpdateReq,
  UserUpdateRes,
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
  cookies().set(TOKEN_KEY, access_token, {
    path: '/',
  });

  return res;
};

const fetchUserUpdate = async (req: UserUpdateReq) => {
  return (await fetchApi('/api/accounts', {
    method: 'PUT',
    body: JSON.stringify(req),
  })) as UserUpdateRes;
};

const fetchUserDelete = async (req: UserDeleteReq) => {
  return (await fetchApi('/api/accounts/delete', {
    method: 'POST',
    body: JSON.stringify(req),
  })) as UserDeleteRes;
};

export {
  fetchUser,
  fetchSignUp,
  fetchSignIn,
  fetchUserUpdate,
  fetchUserDelete,
};
