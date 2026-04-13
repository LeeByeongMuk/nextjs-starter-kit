import { DeletePostReq, DeletePostRes } from '@domains/post/update/_types/api';
import { fetchApi } from '@shared/lib/api';

export const fetchDeletePost = async ({ id }: DeletePostReq) => {
  return (await fetchApi(`/api/posts/${id}`, {
    method: 'DELETE',
  })) as DeletePostRes;
};
