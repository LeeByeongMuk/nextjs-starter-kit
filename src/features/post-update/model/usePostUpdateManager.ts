'use client';

import { isPostType } from '@entities/post';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { UpdatePostFormOutput } from './form';
import useUpdatePost from './useUpdatePost';
import useUpdatePostForm from './useUpdatePostForm';
import useUpdatePostResource from './useUpdatePostResource';

/** 편집용 데이터로 폼을 채우고 수정 동작과 조회·저장 상태를 화면에 제공한다. */
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

  const handleUpdatePost = (data: UpdatePostFormOutput) =>
    mutateAsync({
      id,
      title: data.title,
      type: data.type,
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
