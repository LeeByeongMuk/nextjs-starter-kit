'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { fetchPosts } from '@/app/api/post';
import ListFilter from '@/app/components/Post/ListFilter';
import ListTable from '@/app/components/Post/ListTable';
import Pagination from '@/app/components/Post/Pagination';
import { PostsReq, PostsRes } from '@/app/types/post';

export default function PostList() {
  const [searchFilters, setSearchFilters] = useState<PostsReq>({
    type: '',
    q: '',
    page: 1,
  });

  const {
    data: { data: posts, meta },
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ['posts', searchFilters],
    queryFn: () => fetchPosts(searchFilters),
    initialData: {
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
      },
      links: {},
    } as unknown as PostsRes,
  });

  return (
    <section className="pb-8 pt-8">
      <ListFilter setSearchFilters={setSearchFilters} />

      <ListTable posts={posts} isLoading={isFetching || isLoading || isError} />

      <Pagination meta={meta} setSearchFilters={setSearchFilters} />
    </section>
  );
}
