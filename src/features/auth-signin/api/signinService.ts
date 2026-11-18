import 'server-only';

import { ApiError, fetchApi } from '@shared/lib/api';

import { SignInReq, SignInRes } from './types';

/** API 인증 정보를 얻는다. API가 자격 증명을 거부하면 null을 반환한다. */
export const fetchSignIn = async ({ email, password }: SignInReq) => {
  try {
    const { data } = await fetchApi<SignInRes>('/api/users/signin', {
      method: 'POST',
      auth: 'none',
      body: JSON.stringify({ email, password }),
    });
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
};
