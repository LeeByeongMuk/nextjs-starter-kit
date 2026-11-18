'use server';

import { fetchApi } from '@shared/lib/api';

import { getPostPath } from './postRequest';
import { DeletePostReq, DeletePostRes } from './types';

/** 글을 삭제한다. 삭제 권한은 백엔드에서 확인한다. */
export const fetchDeletePost = async ({ id }: DeletePostReq) => {
  const { ok, message } = await fetchApi<DeletePostRes>(getPostPath(id), {
    method: 'DELETE',
    auth: 'required',
  });
  return { ok, message };
};
