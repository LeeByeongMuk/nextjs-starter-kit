'use server';

import { fetchApi } from '@shared/lib/api';

import { SignUpReq, SignUpRes } from './types';

/** 회원가입 결과 중 화면에서 사용할 수 있는 계정 식별자만 전달한다. */
export const fetchSignUp = async (req: SignUpReq): Promise<SignUpRes> => {
  const { email, name, nickname, password } = req ?? {};
  if (
    typeof email !== 'string' ||
    typeof name !== 'string' ||
    typeof nickname !== 'string' ||
    typeof password !== 'string'
  ) {
    throw new Error('회원가입 입력을 확인해 주세요.');
  }

  const {
    ok,
    message,
    data: { id },
  } = await fetchApi<SignUpRes>('/api/users/signup', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify({ email, name, nickname, password }),
  });
  return { ok, message, data: { id } };
};
