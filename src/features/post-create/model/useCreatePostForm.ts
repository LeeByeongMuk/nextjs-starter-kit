import { useForm } from 'react-hook-form';

import { CreatePostFormInput } from './form';

export default function useCreatePostForm() {
  return useForm<CreatePostFormInput>();
}
