'use client';

import { useRouter, useParams } from 'next/navigation';
import { useCallback } from 'react';

import usePost from '@domains/post/detail/_hooks/usePost';
import useDeletePost from '@domains/post/update/_hooks/useDeletePost';

export default function usePostDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data, isError, isLoading, isFetching } = usePost();
  const { mutate } = useDeletePost();

  const handleRedirectBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDeletePost = useCallback(() => {
    const confirm = window.confirm(
      'Are you sure you want to delete this post?'
    );
    if (confirm) {
      mutate();
    }
  }, [mutate]);

  return {
    id,
    post: data?.data,
    isError,
    isLoading,
    isFetching,
    handleRedirectBack,
    handleDeletePost,
  };
}
