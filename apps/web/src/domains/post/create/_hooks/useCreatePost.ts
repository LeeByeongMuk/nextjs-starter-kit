'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { fetchCreatePost } from '@domains/post/create/_services/postCreateServices';
import { CreatePostReq } from '@domains/post/create/_types/api';

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
