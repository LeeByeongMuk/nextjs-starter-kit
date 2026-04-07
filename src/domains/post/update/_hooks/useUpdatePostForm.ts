import { UpdatePostFormInput } from '@domains/post/update/_types/form';
import { useForm } from 'react-hook-form';

export default function useUpdatePostForm() {
  return useForm<UpdatePostFormInput>();
}
