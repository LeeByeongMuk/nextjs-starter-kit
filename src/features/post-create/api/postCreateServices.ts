'use server';

import { getPostRequestBody } from '@entities/post';
import { fetchApi } from '@shared/lib/api';

import { CreatePostReq, CreatePostRes } from './types';

/** 게시글을 등록하고 상세 화면 이동에 필요한 식별자를 전달한다. */
export const fetchCreatePost = async (req: CreatePostReq) => {
  const { ok, message, data } = await fetchApi<CreatePostRes>('/api/posts', {
    method: 'POST',
    auth: 'required',
    body: getPostRequestBody(req),
  });
  return { ok, message, data: { id: data.id } };
};
