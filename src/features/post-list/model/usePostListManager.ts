'use client';

import usePostList from './usePostList';
import useReplaceSearchParams from './useReplaceSearchParams';
import useSearchFilters from './useSearchFilters';

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
