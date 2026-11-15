import { LIST_TYPE_OPTIONS, type PostType } from '@entities/post';

import { PostsReq } from '../api/types';

/** URL 검색 조건을 목록 필터로 읽고 허용되지 않는 분류와 페이지는 기본값으로 바꾼다 */
export const parseSearchFilters = (search: string): PostsReq => {
  const searchParams = new URLSearchParams(search);
  const type = searchParams.get('type') ?? '';
  const page = Number(searchParams.get('page'));

  return {
    type: (LIST_TYPE_OPTIONS.some(option => option.value === type)
      ? type
      : '') as PostType,
    q: searchParams.get('q') ?? '',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
};

/** 목록 필터를 type, q, page 순서의 URL 검색 조건 문자열로 만든다 */
export const stringifySearchFilters = ({ type, q, page }: PostsReq) =>
  new URLSearchParams({ type, q, page: String(page) }).toString();
