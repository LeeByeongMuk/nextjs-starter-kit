'use client';

import React from 'react';

import ListFilter from '@/app/post/(list)/_components/ListFilter';
import Pagination from '@/app/post/_components/Pagination';
import usePostList from '@/app/post/_hooks/usePostList';
import useReplaceSearchParams from '@/app/post/_hooks/useReplaceSearchParams';
import useSearchFilters from '@/app/post/_hooks/useSearchFilters';

import List from '_components';

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
