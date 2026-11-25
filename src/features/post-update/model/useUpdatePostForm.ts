import { PostFormSchema } from '@entities/post';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { UpdatePostFormInput, UpdatePostFormOutput } from './form';

/** 서버의 최신 값으로 폼을 채우고 작성 중인 필드는 보존한다. */
export default function useUpdatePostForm(values: UpdatePostFormInput) {
  return useForm<UpdatePostFormInput, unknown, UpdatePostFormOutput>({
    defaultValues: values,
    values,
    resetOptions: { keepDirtyValues: true, keepTouched: true },
    resolver: zodResolver(PostFormSchema),
  });
}
