'use server';

import { getPostPath } from '@entities/post';
import { fetchApi } from '@shared/lib/api';

import { PostReq, PostRes } from './types';

/** 게시글 상세와 현재 사용자의 편집 가능 여부를 조회한다. */
export const fetchPost = async ({ id }: PostReq): Promise<PostRes> => {
  const { ok, message, data } = await fetchApi<PostRes>(getPostPath(id), {
    method: 'GET',
  });
  return {
    ok,
    message,
    data: {
      id: data.id,
      title: data.title,
      type: data.type,
      contents: data.contents,
      created_at: data.created_at,
      user_name: data.user_name,
      hit: data.hit,
      is_editable: data.is_editable,
    },
  };
};
