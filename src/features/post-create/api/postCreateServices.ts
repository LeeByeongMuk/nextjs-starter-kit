'use server';

import { getPostRequestBody } from '@entities/post';
import { fetchApi } from '@shared/lib/api';

import { CreatePostReq, CreatePostResSchema } from './types';

/** 게시글을 등록하고 상세 화면 이동에 필요한 식별자를 전달한다. */
export const fetchCreatePost = async (req: CreatePostReq) => {
  return fetchApi('/api/posts', {
    method: 'POST',
    auth: 'required',
    body: getPostRequestBody(req),
    schema: CreatePostResSchema,
  });
};
