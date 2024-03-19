'use client';

import { useState } from 'react';
import useSWR from 'swr';

import ListFilter from '@/app/components/Post/ListFilter';
import ListTable from '@/app/components/Post/ListTable';
import Pagination from '@/app/components/Post/Pagination';
import { fetchApi } from '@/app/utils/api';

export default function PostList() {
  const [page, setPage] = useState(1);
  const {
    data: { data: posts, meta },
  } = useSWR(
    `/api/posts?page=${page}`,
    async url => {
      return await fetchApi(url, {
        method: 'GET',
      });
    },
    {
      fallbackData: {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
        },
        links: {},
      },
    }
  );

  return (
    <section className="pb-8 pt-8">
      <ListFilter />

      <ListTable posts={posts} />

      <Pagination meta={meta} setPage={setPage} />
    </section>
  );
}
