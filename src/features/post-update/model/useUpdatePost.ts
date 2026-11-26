'use client';

import { toast } from '@shared/ui/toast';
import { useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

import { fetchUpdatePost } from '../api/postUpdateServices';
import { UpdatePostReq } from '../api/types';

/** 게시글을 수정하고 성공하면 현재 글의 상세 화면으로 이동한다. */
export default function useUpdatePost() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  return useMutation({
    mutationFn: (req: UpdatePostReq) => fetchUpdatePost(req),
    meta: { errorMessage: '게시글을 수정하지 못했습니다.' },
    onSuccess: async () => {
      toast.success('게시글을 수정했습니다.');
      router.push(`/post/${id}`);
    },
  });
}
