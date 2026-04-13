'use client';

import React from 'react';

import { Pagination } from '@entities/post';
import {
  PostListContainer,
  PostListFilter,
  usePostListManager,
} from '@features/post-list';

export default function PostListView() {
  const { setSearchFilters, posts, meta, isLoading, isError } =
    usePostListManager();

  return (
    <section className="py-8">
      <PostListFilter setSearchFilters={setSearchFilters} />

      <PostListContainer posts={posts} isLoading={isLoading || isError} />

      <Pagination meta={meta} setSearchFilters={setSearchFilters} />
    </section>
  );
}
