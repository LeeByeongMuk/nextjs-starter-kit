import { CreatePostFormInput } from '@domains/post/create/_types/form';
import { useForm } from 'react-hook-form';

export default function useCreatePostForm() {
  return useForm<CreatePostFormInput>();
}
