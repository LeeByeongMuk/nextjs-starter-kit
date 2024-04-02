'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { fetchPost } from '@/app/api/post';
import Detail from '@/app/components/Post/PostDetail';
import { PostRes } from '@/app/types/post';

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
    } as unknown as PostRes,
    queryFn: () => fetchPost({ id }),
    queryKey: ['posts', { id }],
  });

  useEffect(() => {
    if (isError) {
      alert('Failed to fetch post');
      router.back();
    }
  }, [isError, router]);

  const redirectBack = () => {
    router.back();
  };

  return (
    <section className="pb-8 pt-8">
      {/*<ListFilter />*/}

      <Detail post={post} isLoading={isFetching || isLoading || isError} />

      <div className="mt-5 flex justify-center gap-2.5">
        <button
          type="button"
          className="inline-block rounded border border-teal-600 bg-teal-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-teal-600 focus:outline-none focus:ring active:text-teal-500"
          onClick={redirectBack}
        >
          back
        </button>
      </div>
    </section>
  );
}
