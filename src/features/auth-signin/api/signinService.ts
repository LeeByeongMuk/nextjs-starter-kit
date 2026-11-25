import 'server-only';

import { ApiError, fetchApi } from '@shared/lib/api';

import { SignInReqSchema, SignInResSchema } from './types';

/**
 * 자격 증명을 확인하고 API 인증 정보를 얻는다.
 * 입력 형식이 맞지 않거나 API가 자격 증명을 거부하거나 쓸 수 있는 인증 정보를 주지 않으면 null을 반환한다.
 */
export const fetchSignIn = async (credentials: unknown) => {
  const req = SignInReqSchema.safeParse(credentials);
  if (!req.success) return null;

  try {
    const { data } = await fetchApi('/api/users/signin', {
      method: 'POST',
      auth: 'none',
      body: JSON.stringify(req.data),
      schema: SignInResSchema,
    });
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
};
