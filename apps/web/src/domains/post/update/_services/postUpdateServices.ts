import {
  UpdatePostReq,
  UpdatePostRes,
  UpdatePostResourceReq,
  UpdatePostResourceRes,
} from '@domains/post/update/_types/api';
import { fetchApi } from '@shared/utils/api';

export const fetchUpdatePost = async ({
  id,
  title,
  type,
  contents,
  is_open,
}: UpdatePostReq) => {
  return (await fetchApi(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title,
      type: type || null,
      contents,
      is_open,
    }),
  })) as UpdatePostRes;
};

export const fetchUpdatePostResource = async ({
  id,
}: UpdatePostResourceReq) => {
  return (await fetchApi(`/api/posts/${id}/edit`, {
    method: 'GET',
  })) as UpdatePostResourceRes;
};
