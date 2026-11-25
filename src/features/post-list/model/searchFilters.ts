import { z } from 'zod';

import { PostsReq, PostsReqSchema } from '../api/types';

const SearchFiltersSchema = z.object({
  type: PostsReqSchema.shape.type.catch(''),
  q: PostsReqSchema.shape.q.catch(''),
  page: z.coerce.number().pipe(PostsReqSchema.shape.page).catch(1),
});

/** URL 검색 조건을 목록 필터로 읽고 허용되지 않는 분류와 페이지는 기본값으로 바꾼다 */
export const parseSearchFilters = (search: string): PostsReq => {
  const searchParams = new URLSearchParams(search);

  return SearchFiltersSchema.parse({
    type: searchParams.get('type'),
    q: searchParams.get('q'),
    page: searchParams.get('page'),
  });
};

/** 목록 필터를 type, q, page 순서의 URL 검색 조건 문자열로 만든다 */
export const stringifySearchFilters = ({ type, q, page }: PostsReq) =>
  new URLSearchParams({ type, q, page: String(page) }).toString();
