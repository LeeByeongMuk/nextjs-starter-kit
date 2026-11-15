'use client';

import usePostList from './usePostList';
import useSearchFilters from './useSearchFilters';

/** URL 필터로 게시글 목록을 조회하고 필터 변경 함수를 함께 제공한다 */
export default function usePostListManager() {
  const { searchFilters, setSearchFilters } = useSearchFilters();

  const {
    data: { data: posts, meta },
    isLoading,
    isError,
    isFetching,
  } = usePostList({ searchFilters });

  return {
    searchFilters,
    setSearchFilters,
    posts,
    meta,
    isLoading: isFetching || isLoading,
    isError,
  };
}
