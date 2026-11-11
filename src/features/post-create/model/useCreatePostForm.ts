import { useForm } from 'react-hook-form';

import { CreatePostFormInput } from './form';

/** 게시글 작성 입력을 초기화하고 유형·공개 여부는 직접 선택하게 한다. */
export default function useCreatePostForm() {
  return useForm<CreatePostFormInput>({
    defaultValues: {
      title: '',
      contents: '',
    },
  });
}
