'use client';

import { fetchCreatePost } from '@features/post-create/api/postCreateServices';
import { CreatePostReq } from '@features/post-create/api/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export default function useCreatePost() {
  const router = useRouter();
  return useMutation({
    mutationFn: (req: CreatePostReq) => fetchCreatePost(req),
    onSuccess: res => {
      alert('Post created successfully');
      router.push(`/post/${res.data.id}`);
    },
    onError: () => {
      alert('Failed to create post');
    },
  });
}
