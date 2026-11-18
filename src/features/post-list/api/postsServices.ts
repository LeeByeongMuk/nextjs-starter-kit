'use server';

import { isPostType } from '@entities/post';
import { fetchApi } from '@shared/lib/api';

import { PostsReq, PostsRes } from './types';

/** 공개 게시글 목록과 화면에 필요한 페이지 정보를 조회한다. */
export const fetchPosts = async ({
  page,
  type,
  q,
}: PostsReq): Promise<PostsRes> => {
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    (type !== '' && !isPostType(type)) ||
    typeof q !== 'string'
  ) {
    throw new Error('게시글 검색 조건을 확인해 주세요.');
  }

  const params = new URLSearchParams({ page: String(page), type, q });
  const { ok, message, data, meta } = await fetchApi<PostsRes>(
    `/api/posts?${params}`,
    { method: 'GET' }
  );
  return {
    ok,
    message,
    data: data.map(({ id, title, type, hit, created_at, user }) => ({
      id,
      title,
      type,
      hit,
      created_at,
      user: user && {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
      },
    })),
    meta: {
      current_page: meta.current_page,
      last_page: meta.last_page,
      total: meta.total,
    },
  };
};
