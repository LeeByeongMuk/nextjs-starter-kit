import { useForm } from 'react-hook-form';

import { CreatePostFormInput } from '@domains/post/create/_types/form';

export default function useCreatePostForm() {
  return useForm<CreatePostFormInput>();
}
