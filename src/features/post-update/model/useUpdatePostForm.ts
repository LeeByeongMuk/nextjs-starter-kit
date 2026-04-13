import { UpdatePostFormInput } from '@features/post-update/model/form';
import { useForm } from 'react-hook-form';

export default function useUpdatePostForm() {
  return useForm<UpdatePostFormInput>();
}
