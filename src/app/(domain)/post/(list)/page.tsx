'use client';

import React from 'react';

import Pagination from '@domains/post/_components/Pagination';
import PostListContainer from '@domains/post/list/_components/PostListContainer';
import ListFilter from '@domains/post/list/_components/PostListFilter';
import usePostListManager from '@domains/post/list/_hooks/usePostListManager';

export default function PostListPage() {
  const { setSearchFilters, posts, meta, isLoading, isError } =
    usePostListManager();

  return (
    <section className="py-8">
      <ListFilter setSearchFilters={setSearchFilters} />

      <PostListContainer posts={posts} isLoading={isLoading || isError} />

      <Pagination meta={meta} setSearchFilters={setSearchFilters} />
    </section>
  );
}
