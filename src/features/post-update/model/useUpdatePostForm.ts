import { useForm } from 'react-hook-form';

import { UpdatePostFormInput } from './form';

/** 서버의 게시글 정보를 채우기 전 텍스트 입력을 초기화한다. */
export default function useUpdatePostForm() {
  return useForm<UpdatePostFormInput>({
    defaultValues: {
      title: '',
      contents: '',
    },
  });
}
