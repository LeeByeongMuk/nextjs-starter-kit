import { fetchApi } from '@shared/lib/api';

import { CreatePostReq, CreatePostRes } from './types';

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
