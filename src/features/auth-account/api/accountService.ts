'use server';

import { fetchApi } from '@shared/lib/api';

import {
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

/** 로그인한 회원의 탈퇴를 요청한다. */
export const fetchDeleteAccount = async (
  req: DeleteAccountReq
): Promise<DeleteAccountRes> => {
  const parsed = DeleteAccountReqSchema.safeParse(req);
  if (!parsed.success) {
    throw new Error('회원 탈퇴 사유를 확인해 주세요.');
  }

  const params = new URLSearchParams(parsed.data);
  return fetchApi(`/api/users?${params}`, {
    method: 'DELETE',
    auth: 'required',
    body: JSON.stringify(parsed.data),
    schema: DeleteAccountResSchema,
  });
};
