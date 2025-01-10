'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import useUpdatePost from '@domains/post/update/_hooks/useUpdatePost';
import useUpdatePostForm from '@domains/post/update/_hooks/useUpdatePostForm';
import useUpdatePostResource from '@domains/post/update/_hooks/useUpdatePostResource';

import { UpdatePostFormInput } from '../_types/form';

export function useUpdatePostManager() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const methods = useUpdatePostForm();
  const { setValue } = methods;

  const { mutate, isPending } = useUpdatePost();

  const {
    data: { data: post },
    isSuccess,
    isError,
    isLoading,
    isFetching,
  } = useUpdatePostResource();

  useEffect(() => {
    if (isSuccess) {
      setValue('title', post.title);
      setValue('contents', post.contents);
      setValue('type', post.type);
      setValue('isOpen', post.is_open ? '1' : '0');
    }
  }, [isSuccess, setValue, post]);

  const handleUpdatePost = (data: UpdatePostFormInput) => {
    mutate({
      id,
      title: data.title,
      type: data.type || null,
      contents: data.contents,
      is_open: data.isOpen === '1',
    });
  };

  return {
    methods,
    handleUpdatePost,
    isPending,
    isLoading,
    isFetching,
    isError,
  };
}
