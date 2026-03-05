import { CreatePostReq, CreatePostRes } from '@domains/post/create/_types/api';
import { fetchApi } from '@shared/utils/api';

export const fetchCreatePost = async ({
  title,
  type,
  contents,
  is_open,
}: CreatePostReq) => {
  return (await fetchApi('/api/posts', {
    method: 'POST',
    body: JSON.stringify({
      title,
      type: type || null,
      contents,
      is_open,
    }),
  })) as CreatePostRes;
};
