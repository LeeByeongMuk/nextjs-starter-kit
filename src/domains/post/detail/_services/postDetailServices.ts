'use server';

import { PostReq, PostRes } from '@domains/post/detail/_types/api';
import { fetchApi } from '@shared/utils/api';

export const fetchPost = async ({ id }: PostReq) => {
  return (await fetchApi(`/api/posts/${id}`, {
    method: 'GET',
  })) as PostRes;
};
