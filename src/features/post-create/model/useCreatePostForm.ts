import { POST_FORM_DEFAULT_VALUES, PostFormSchema } from '@entities/post';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { CreatePostFormInput, CreatePostFormOutput } from './form';

/** 게시글 작성 입력을 초기화하고 유형·공개 여부는 직접 선택하게 한다. */
export default function useCreatePostForm() {
  return useForm<CreatePostFormInput, unknown, CreatePostFormOutput>({
    defaultValues: POST_FORM_DEFAULT_VALUES,
    resolver: zodResolver(PostFormSchema),
  });
}
