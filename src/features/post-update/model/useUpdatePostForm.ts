import { POST_FORM_DEFAULT_VALUES, PostFormSchema } from '@entities/post';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { UpdatePostFormInput, UpdatePostFormOutput } from './form';

/** 서버의 게시글 정보를 채우기 전 텍스트 입력을 초기화한다. */
export default function useUpdatePostForm() {
  return useForm<UpdatePostFormInput, unknown, UpdatePostFormOutput>({
    defaultValues: POST_FORM_DEFAULT_VALUES,
    resolver: zodResolver(PostFormSchema),
  });
}
