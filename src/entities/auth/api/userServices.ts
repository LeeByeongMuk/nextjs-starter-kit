import 'server-only';

import { fetchApi } from '@shared/lib/api';

import { UserResSchema } from './types';

/** 로그인 또는 프로필 갱신에 사용할 계정 정보를 조회한다. */
export const fetchUser = (accessToken?: string) => {
  return fetchApi('/api/users', {
    method: 'GET',
    auth: accessToken ? { accessToken } : 'required',
    schema: UserResSchema,
  });
};
