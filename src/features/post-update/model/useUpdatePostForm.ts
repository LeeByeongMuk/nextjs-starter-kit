import { useForm } from 'react-hook-form';

import { UpdatePostFormInput } from './form';

export default function useUpdatePostForm() {
  return useForm<UpdatePostFormInput>();
}
