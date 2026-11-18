'use server';

import { fetchApi } from '@shared/lib/api';

import {
  DeleteAccountReq,
  DeleteAccountRes,
  UpdateAccountReq,
  UpdateAccountRes,
} from './types';

/** 로그인한 회원의 프로필을 수정하고 갱신된 공개 필드를 전달한다. */
export const fetchUpdateAccount = async (
  req: UpdateAccountReq
): Promise<UpdateAccountRes> => {
  const { email, name, nickname } = req ?? {};
  if (
    typeof email !== 'string' ||
    typeof name !== 'string' ||
    typeof nickname !== 'string'
  ) {
    throw new Error('회원 정보 입력을 확인해 주세요.');
  }

  const { ok, message, data } = await fetchApi<UpdateAccountRes>('/api/users', {
    method: 'PUT',
    auth: 'required',
    body: JSON.stringify({ email, name, nickname }),
  });
  return {
    ok,
    message,
    data: {
      id: String(data.id),
      email: data.email,
      name: data.name,
      nickname: data.nickname,
    },
  };
};

/** 로그인한 회원의 탈퇴를 요청한다. */
export const fetchDeleteAccount = async (
  req: DeleteAccountReq
): Promise<DeleteAccountRes> => {
  const { deleted_reason } = req ?? {};
  if (typeof deleted_reason !== 'string') {
    throw new Error('회원 탈퇴 사유를 확인해 주세요.');
  }

  const params = new URLSearchParams({ deleted_reason });
  const { ok, message } = await fetchApi<DeleteAccountRes>(
    `/api/users?${params}`,
    {
      method: 'DELETE',
      auth: 'required',
      body: JSON.stringify({ deleted_reason }),
    }
  );
  return { ok, message };
};
