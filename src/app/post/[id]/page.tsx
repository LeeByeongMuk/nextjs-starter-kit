'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { fetchPost } from '@/app/api/post';
import ListFilter from '@/app/components/Post/ListFilter';
import Detail from '@/app/components/Post/PostDetail';

export default function PostDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const {
    data: { data: post },
    isError,
    isLoading,
    isFetching,
  } = useQuery({
    initialData: {
      data: {
        contents: '',
        created_at: '',
        hit: 0,
        id: 0,
        title: '',
        type: '',
        user: {
          name: '',
          nickname: '',
        },
      },
    },
    queryFn: () => fetchPost({ id }),
    queryKey: ['posts', { id }],
  });

  useEffect(() => {
    if (isError) {
      alert('Failed to fetch post');
      router.back();
    }
  }, [isError, router]);

  return (
    <section className="pb-8 pt-8">
      <ListFilter />

      <Detail post={post} isLoading={isFetching || isLoading || isError} />
    </section>
  );
}
