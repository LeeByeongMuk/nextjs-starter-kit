'use server';

import { fetchApi } from '@shared/lib/api';

import { PostsReq, PostsReqSchema, PostsRes, PostsResSchema } from './types';

/** 공개 게시글 목록과 화면에 필요한 페이지 정보를 조회한다. */
export const fetchPosts = async (req: PostsReq): Promise<PostsRes> => {
  const parsed = PostsReqSchema.safeParse(req);
  if (!parsed.success) {
    throw new Error('게시글 검색 조건을 확인해 주세요.');
  }

  const { page, type, q } = parsed.data;
  const params = new URLSearchParams({ page: String(page), type, q });
  return fetchApi(`/api/posts?${params}`, {
    method: 'GET',
    schema: PostsResSchema,
  });
};
