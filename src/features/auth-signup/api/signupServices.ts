'use server';

import { fetchApi } from '@shared/lib/api';

import {
  SignUpReq,
  SignUpReqSchema,
  SignUpRes,
  SignUpResSchema,
} from './types';

/** 회원가입 결과 중 화면에서 사용할 수 있는 계정 식별자만 전달한다. */
export const fetchSignUp = async (req: SignUpReq): Promise<SignUpRes> => {
  const parsed = SignUpReqSchema.safeParse(req);
  if (!parsed.success) {
    throw new Error('회원가입 입력을 확인해 주세요.');
  }

  return fetchApi('/api/users/signup', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify(parsed.data),
    schema: SignUpResSchema,
  });
};
