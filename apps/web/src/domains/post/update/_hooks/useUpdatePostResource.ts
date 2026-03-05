'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { fetchUpdatePostResource } from '@domains/post/update/_services/postUpdateServices';
import { UpdatePostResourceRes } from '@domains/post/update/_types/api';

export default function useUpdatePostResource() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const updatePostResource = useQuery({
    queryKey: ['posts', { id }],
    queryFn: () => fetchUpdatePostResource({ id }),
    initialData: {
      data: {
        title: '',
        contents: '',
        type: null,
        is_open: null,
      },
    } as unknown as UpdatePostResourceRes,
  });

  const { isError } = updatePostResource;

  useEffect(() => {
    if (isError) {
      alert('Failed to fetch post');
      router.push('/post');
    }
  }, [isError, router]);

  return updatePostResource;
}
