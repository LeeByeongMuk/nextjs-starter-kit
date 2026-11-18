'use client';

import { isPostType } from '@entities/post';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { UpdatePostFormInput } from './form';
import useUpdatePost from './useUpdatePost';
import useUpdatePostForm from './useUpdatePostForm';
import useUpdatePostResource from './useUpdatePostResource';

export function useUpdatePostManager() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const methods = useUpdatePostForm();
  const { reset } = methods;

  const { mutateAsync, isPending } = useUpdatePost();

  const {
    data: { data: post },
    isSuccess,
    isError,
    isLoading,
    isFetching,
  } = useUpdatePostResource();

  useEffect(() => {
    if (isSuccess) {
      reset({
        title: post.title,
        contents: post.contents,
        type: isPostType(post.type) ? post.type : '',
        isOpen: post.is_open ? '1' : '0',
      });
    }
  }, [isSuccess, post, reset]);

  const handleUpdatePost = (data: UpdatePostFormInput) =>
    mutateAsync({
      id,
      title: data.title,
      type: data.type || null,
      contents: data.contents,
      is_open: data.isOpen === '1',
    });

  return {
    methods,
    handleUpdatePost,
    isPending,
    isLoading,
    isFetching,
    isError,
  };
}
