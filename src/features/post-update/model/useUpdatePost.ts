'use client';

import { fetchUpdatePost } from '@features/post-update/api/postUpdateServices';
import { UpdatePostReq } from '@features/post-update/api/types';
import { useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

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
