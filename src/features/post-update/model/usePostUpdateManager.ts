'use client';

import { isPostType } from '@entities/post';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { type UpdatePostResourceRes } from '../api/types';
import { UpdatePostFormOutput } from './form';
import useUpdatePost from './useUpdatePost';
import useUpdatePostForm from './useUpdatePostForm';

/** 편집용 데이터로 폼을 채우고 수정 동작과 저장 상태를 화면에 제공한다. */
export function useUpdatePostManager(post: UpdatePostResourceRes['data']) {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const methods = useUpdatePostForm({
    title: post.title,
    contents: post.contents,
    type: isPostType(post.type) ? post.type : '',
    isOpen: post.is_open ? '1' : '0',
  });
  const { mutateAsync, isPending } = useUpdatePost();
  const {
    trigger,
    formState: { isSubmitted },
  } = methods;
  const merged = useRef(post);

  // 서버 값을 병합하면 표시 중인 오류가 낡을 수 있다. 제출한 적이 있는 폼은 병합한 값으로 다시 검증한다.
  useEffect(() => {
    if (merged.current === post) return;

    merged.current = post;
    if (isSubmitted) void trigger();
  }, [post, isSubmitted, trigger]);

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
  };
}
