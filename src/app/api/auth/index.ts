'use server';

import { cookies } from 'next/headers';

import { TOKEN_KEY } from '@/app/constants/auth';
import {
  SignInReq,
  SignInRes,
  SignUpReq,
  SignUpRes,
  DeleteAccountReq,
  DeleteAccountRes,
  UserRes,
  UpdateAccountReq,
  UpdateAccountRes,
} from '@/app/types/auth';
import { fetchApi } from '@/app/utils/api';

const fetchUser = async () => {
  return (await fetchApi('/api/users', {
    method: 'GET',
  })) as UserRes;
};

const fetchSignUp = async (req: SignUpReq) => {
  return (await fetchApi('/api/users/signup', {
    method: 'POST',
    body: JSON.stringify(req),
  })) as SignUpRes;
};

const fetchSignIn = async (req: SignInReq) => {
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

const fetchUpdateAccount = async (req: UpdateAccountReq) => {
  return (await fetchApi('/api/users', {
    method: 'PUT',
    body: JSON.stringify(req),
  })) as UpdateAccountRes;
};

const fetchDeleteAccount = async (req: DeleteAccountReq) => {
  const params = new URLSearchParams();
  params.append('deleted_reason', req.deleted_reason.toString());
  const url = `/api/users?${params.toString()}`;

  return (await fetchApi(url, {
    method: 'DELETE',
    body: JSON.stringify(req),
  })) as DeleteAccountRes;
};

export {
  fetchUser,
  fetchSignUp,
  fetchSignIn,
  fetchUpdateAccount,
  fetchDeleteAccount,
};
