'use client';

import { useDeletePost } from '@entities/post';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

import usePost from './usePost';

/** 상세 데이터와 돌아가기, 확인 후 삭제 동작을 화면에 제공한다. */
export default function usePostDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data, isError, isLoading, isFetching } = usePost();
  const { mutate, isPending, isSuccess } = useDeletePost();
  const deleteStarted = useRef(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleRedirectBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDeletePost = useCallback(() => {
    if (!deleteStarted.current) setIsDeleteConfirmOpen(true);
  }, []);

  const handleCancelDeletePost = useCallback(() => {
    setIsDeleteConfirmOpen(false);
  }, []);

  const handleConfirmDeletePost = useCallback(() => {
    if (deleteStarted.current) return;

    deleteStarted.current = true;
    setIsDeleteConfirmOpen(false);
    mutate(undefined, {
      onError: () => {
        deleteStarted.current = false;
      },
    });
  }, [mutate]);

  return {
    id,
    post: data?.data,
    isError,
    isLoading,
    isFetching,
    isDeleteDisabled: isPending || isSuccess,
    isDeleteConfirmOpen,
    handleRedirectBack,
    handleDeletePost,
    handleCancelDeletePost,
    handleConfirmDeletePost,
  };
}
