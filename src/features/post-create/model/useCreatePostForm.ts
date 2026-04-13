import { CreatePostFormInput } from '@features/post-create/model/form';
import { useForm } from 'react-hook-form';

export default function useCreatePostForm() {
  return useForm<CreatePostFormInput>();
}
