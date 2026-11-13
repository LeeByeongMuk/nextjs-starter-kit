'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { fetchCreatePost } from '../api/postCreateServices';
import { CreatePostReq } from '../api/types';

/** 게시글을 등록하고 성공하면 등록한 글의 상세 화면으로 이동한다. */
export default function useCreatePost() {
  const router = useRouter();
  return useMutation({
    mutationFn: (req: CreatePostReq) => fetchCreatePost(req),
    onSuccess: res => {
      alert('게시글을 등록했습니다.');
      router.push(`/post/${res.data.id}`);
    },
    onError: () => {
      alert('게시글을 등록하지 못했습니다.');
    },
  });
}
