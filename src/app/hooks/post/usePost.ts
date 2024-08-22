'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { fetchPost } from '@/app/api/post';
import { PostRes } from '@/app/types/post';

export default function usePost() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const postQuery = useQuery({
    initialData: {
      data: {
        contents: '',
        created_at: '',
        hit: 0,
        id: 0,
        is_edit: false,
        title: '',
        type: '',
        user: {
          name: '',
          nickname: '',
        },
      },
    } as unknown as PostRes,
    queryFn: () => fetchPost({ id }),
    queryKey: ['post', { id }],
  });
  const { isError } = postQuery;

  useEffect(() => {
    if (isError) {
      alert('Failed to fetch post');
      router.back();
    }
  }, [isError, router]);

  return postQuery;
}
