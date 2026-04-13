import { DeletePostReq, DeletePostRes } from '@features/post-update/api/types';
import { fetchApi } from '@shared/lib/api';

export const fetchDeletePost = async ({ id }: DeletePostReq) => {
  return (await fetchApi(`/api/posts/${id}`, {
    method: 'DELETE',
  })) as DeletePostRes;
};
