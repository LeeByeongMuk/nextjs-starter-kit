'use client';

import { useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

import { fetchUpdatePost } from '@/api/post';
import { UpdatePostReq } from '@/app/post/_types/api';

export default function useUpdatePost() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  return useMutation({
    mutationFn: (req: UpdatePostReq) => fetchUpdatePost(req),
    onSuccess: async () => {
      alert('Post updated successfully');
      router.push(`/post/${id}`);
    },
    onError: () => {
      alert('Failed to update post');
    },
  });
}
