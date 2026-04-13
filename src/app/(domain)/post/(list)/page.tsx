'use client';

import Pagination from '@entities/post/ui/Pagination';
import PostListContainer from '@features/post-list/ui/PostListContainer';
import ListFilter from '@features/post-list/ui/PostListFilter';
import usePostListManager from '@features/post-list/model/usePostListManager';
import React from 'react';

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
