'use server';

import { getPostPath } from '@entities/post';
import { fetchApi } from '@shared/lib/api';

import { PostReq, PostRes, PostResSchema } from './types';

/** 게시글 상세와 현재 사용자의 편집 가능 여부를 조회한다. */
export const fetchPost = async ({ id }: PostReq): Promise<PostRes> => {
  return fetchApi(getPostPath(id), {
    method: 'GET',
    schema: PostResSchema,
  });
};
