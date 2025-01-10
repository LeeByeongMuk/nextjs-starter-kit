'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { fetchPost } from '@domains/post/detail/_services/postDetailServices';
import { PostRes } from '@domains/post/detail/_types/api';

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
        is_editable: false,
        title: '',
        type: '',
        user_name: '',
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
