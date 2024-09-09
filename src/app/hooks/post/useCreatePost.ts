'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { fetchCreatePost } from '@/app/api/post';
import { CreatePostReq } from '@/app/types/api/post';

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
