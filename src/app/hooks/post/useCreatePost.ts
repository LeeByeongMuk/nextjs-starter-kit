"use client";

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { fetchPostCreate } from '@/app/api/post';
import { PostCreateReq } from '@/app/types/post';

export default function useCreatePost() {
  const router = useRouter();
  return useMutation({
    mutationFn: (req: PostCreateReq) => fetchPostCreate(req),
    onSuccess: res => {
      alert('Notice created successfully');
      router.push(`/post/${res.data.id}`);
    },
    onError: () => {
      alert('Failed to create post');
    },
  });
}
