'use server';

import { fetchApi } from '@shared/lib/api';

import { PostReq, PostRes } from './types';

export const fetchPost = async ({ id }: PostReq) => {
  return (await fetchApi(`/api/posts/${id}`, {
    method: 'GET',
  })) as PostRes;
};
