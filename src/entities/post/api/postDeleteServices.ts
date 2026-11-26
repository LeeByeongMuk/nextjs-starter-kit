'use server';

import { fetchApi } from '@shared/lib/api';

import { getPostPath } from './postRequest';
import { DeletePostReq, DeletePostResSchema } from './types';

/** 글을 삭제한다. 삭제 권한은 백엔드에서 확인한다. */
export const fetchDeletePost = async ({ id }: DeletePostReq) => {
  return fetchApi(getPostPath(id), {
    method: 'DELETE',
    auth: 'required',
    schema: DeletePostResSchema,
  });
};
