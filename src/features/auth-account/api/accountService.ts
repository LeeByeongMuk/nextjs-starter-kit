'use server';

import { fetchApi } from '@shared/lib/api';

import {
  AccountIdResSchema,
  DeleteAccountReq,
  DeleteAccountReqSchema,
  DeleteAccountRes,
  DeleteAccountResSchema,
  UpdateAccountReq,
  UpdateAccountReqSchema,
  UpdateAccountRes,
  UpdateAccountResSchema,
} from './types';

/** 로그인한 회원의 프로필을 수정하고 갱신된 공개 필드를 전달한다. */
export const fetchUpdateAccount = async (
  req: UpdateAccountReq
): Promise<UpdateAccountRes> => {
  const parsed = UpdateAccountReqSchema.safeParse(req);
  if (!parsed.success) {
    throw new Error('회원 정보 입력을 확인해 주세요.');
  }

  return fetchApi('/api/users', {
    method: 'PUT',
    auth: 'required',
    body: JSON.stringify(parsed.data),
    schema: UpdateAccountResSchema,
  });
};

/** 화면에서 탈퇴를 확인한 계정으로 로그인되어 있을 때만 그 회원의 탈퇴를 요청한다. */
export const fetchDeleteAccount = async (
  req: DeleteAccountReq
): Promise<DeleteAccountRes> => {
  const parsed = DeleteAccountReqSchema.safeParse(req);
  if (!parsed.success) {
    throw new Error('회원 탈퇴 사유를 확인해 주세요.');
  }
  const { deleted_reason, user_id } = parsed.data;

  // 다른 탭에서 계정을 바꾼 뒤 이전 화면의 확인이 도착하면 API 토큰은 이미 다른 계정의 것이다.
  const { data: account } = await fetchApi('/api/users', {
    method: 'GET',
    auth: 'required',
    schema: AccountIdResSchema,
  });
  if (account.id !== user_id) {
    throw new Error('탈퇴를 확인한 계정으로 로그인되어 있지 않습니다.');
  }

  const params = new URLSearchParams({ deleted_reason });
  return fetchApi(`/api/users?${params}`, {
    method: 'DELETE',
    auth: 'required',
    body: JSON.stringify({ deleted_reason }),
    schema: DeleteAccountResSchema,
  });
};
