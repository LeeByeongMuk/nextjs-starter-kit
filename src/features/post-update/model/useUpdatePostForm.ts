import { isPostType, PostFormSchema } from '@entities/post';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { type UpdatePostResourceRes } from '../api/types';
import { UpdatePostFormInput, UpdatePostFormOutput } from './form';

/** 서버의 최신 값으로 폼을 채우고 작성 중인 필드와 제출 여부는 보존한다. */
export default function useUpdatePostForm(post: UpdatePostResourceRes['data']) {
  const defaults = useMemo<UpdatePostFormInput>(
    () => ({
      title: post.title,
      contents: post.contents,
      type: isPostType(post.type) ? post.type : '',
      isOpen: post.is_open ? '1' : '0',
    }),
    [post]
  );
  const methods = useForm<UpdatePostFormInput, unknown, UpdatePostFormOutput>({
    defaultValues: defaults,
    resolver: zodResolver(PostFormSchema),
  });
  const {
    getFieldState,
    getValues,
    setValue,
    resetDefaultValues,
    trigger,
    formState: { isSubmitted },
  } = methods;
  const merged = useRef(defaults);

  // 폼 전체를 reset하면 진행 중인 제출도 취소된다. 편집하지 않은 필드와 변경 비교의 기준값만 갱신한다.
  useEffect(() => {
    if (merged.current === defaults) return;
    merged.current = defaults;
    for (const name of Object.keys(defaults) as (keyof UpdatePostFormInput)[]) {
      if (!getFieldState(name).isDirty && getValues(name) !== defaults[name]) {
        setValue(name, defaults[name]);
      }
    }
    resetDefaultValues(defaults);
    if (isSubmitted) void trigger();
  }, [
    defaults,
    getFieldState,
    getValues,
    isSubmitted,
    resetDefaultValues,
    setValue,
    trigger,
  ]);

  return methods;
}
