'use client';

import React from 'react';

import Pagination from '@/domains/post/components/Pagination';
import List from '@/domains/post/components/PostList/PostListContainer';
import usePostList from '@/domains/post/hooks/usePostList';
import useReplaceSearchParams from '@/domains/post/hooks/useReplaceSearchParams';
import useSearchFilters from '@/domains/post/hooks/useSearchFilters';

import ListFilter from '../../../../domains/post/components/PostList/PostListFilter';

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
    <section className="py-8">
      <ListFilter setSearchFilters={setSearchFilters} />

      <List posts={posts} isLoading={isFetching || isLoading || isError} />

      <Pagination meta={meta} setSearchFilters={setSearchFilters} />
    </section>
  );
}
