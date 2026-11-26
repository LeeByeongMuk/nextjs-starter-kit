'use client';

import { toast } from '@shared/ui/toast';
import { useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

import { fetchDeletePost } from '../api/postDeleteServices';

/** 현재 경로의 게시글을 삭제하고 성공하면 홈으로 이동한다. */
export default function useDeletePost() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  return useMutation({
    mutationFn: () => fetchDeletePost({ id }),
    meta: { errorMessage: '게시글을 삭제하지 못했습니다.' },
    onSuccess: () => {
      toast.success('게시글을 삭제했습니다.');
      router.push('/');
    },
  });
}
