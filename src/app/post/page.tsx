'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { fetchPosts } from '@/app/api/post';
import ListFilter from '@/app/components/Post/ListFilter';
import ListTable from '@/app/components/Post/ListTable';
import Pagination from '@/app/components/Post/Pagination';

export default function PostList() {
  const [page, setPage] = useState(1);

  const {
    data: { data: posts, meta },
  } = useQuery({
    queryKey: ['posts', { page }],
    queryFn: () => fetchPosts({ page }),
    initialData: {
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
      },
      links: {},
    },
  });

  return (
    <section className="pb-8 pt-8">
      <ListFilter />

      <ListTable posts={posts} />

      <Pagination meta={meta} setPage={setPage} />
    </section>
  );
}
