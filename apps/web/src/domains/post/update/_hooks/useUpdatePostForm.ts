import { useForm } from 'react-hook-form';

import { UpdatePostFormInput } from '@domains/post/update/_types/form';

export default function useUpdatePostForm() {
  return useForm<UpdatePostFormInput>();
}
