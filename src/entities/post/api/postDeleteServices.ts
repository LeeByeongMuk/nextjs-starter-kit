import { fetchApi } from '@shared/lib/api';

import { DeletePostReq, DeletePostRes } from './types';

export const fetchDeletePost = async ({ id }: DeletePostReq) => {
  return (await fetchApi(`/api/posts/${id}`, {
    method: 'DELETE',
  })) as DeletePostRes;
};
