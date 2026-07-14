'use client';

import { Pagination } from '@entities/post';
import {
  PostListContainer,
  PostListFilter,
  usePostListManager,
} from '@features/post-list';
import React from 'react';

export default function PostListView() {
  const { setSearchFilters, posts, meta, isLoading, isError } =
    usePostListManager();

  return (
    <section className="py-8">
      <PostListFilter setSearchFilters={setSearchFilters} />

      <PostListContainer posts={posts} isLoading={isLoading || isError} />

      <Pagination
        meta={meta}
        onPageChange={page => setSearchFilters(prev => ({ ...prev, page }))}
      />
    </section>
  );
}
