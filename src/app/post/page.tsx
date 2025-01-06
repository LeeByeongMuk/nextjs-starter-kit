'use client';

import React from 'react';

import ListFilter from '@/components/Post/ListFilter';
import Pagination from '@/components/Post/Pagination';
import usePostList from '@/hooks/post/usePostList';
import useReplaceSearchParams from '@/hooks/post/useReplaceSearchParams';
import useSearchFilters from '@/hooks/post/useSearchFilters';

import List from '@/components/Post/List';

export default function PostList() {
  const { searchFilters, setSearchFilters } = useSearchFilters();
  const {
    data: { data: posts, meta },
    isLoading,
    isError,
    isFetching,
  } = usePostList({ searchFilters });

  useReplaceSearchParams({ searchFilters });

  return (
    <section className="pb-8 pt-8">
      <ListFilter setSearchFilters={setSearchFilters} />

      <List posts={posts} isLoading={isFetching || isLoading || isError} />

      <Pagination meta={meta} setSearchFilters={setSearchFilters} />
    </section>
  );
}
