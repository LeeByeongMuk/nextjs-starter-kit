'use client';

import usePostList from '@domains/post/list/_hooks/usePostList';
import useReplaceSearchParams from '@domains/post/list/_hooks/useReplaceSearchParams';
import useSearchFilters from '@domains/post/list/_hooks/useSearchFilters';

export default function usePostListManager() {
  const { searchFilters, setSearchFilters } = useSearchFilters();

  const {
    data: { data: posts, meta },
    isLoading,
    isError,
    isFetching,
  } = usePostList({ searchFilters });

  useReplaceSearchParams({ searchFilters });

  return {
    searchFilters,
    setSearchFilters,
    posts,
    meta,
    isLoading: isFetching || isLoading,
    isError,
  };
}
