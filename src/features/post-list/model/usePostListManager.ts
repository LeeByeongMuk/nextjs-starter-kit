'use client';

import usePostList from '@features/post-list/model/usePostList';
import useReplaceSearchParams from '@features/post-list/model/useReplaceSearchParams';
import useSearchFilters from '@features/post-list/model/useSearchFilters';

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
