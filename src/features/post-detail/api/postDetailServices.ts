'use server';

import { PostReq, PostRes } from '@features/post-detail/api/types';
import { fetchApi } from '@shared/lib/api';

export const fetchPost = async ({ id }: PostReq) => {
  return (await fetchApi(`/api/posts/${id}`, {
    method: 'GET',
  })) as PostRes;
};
