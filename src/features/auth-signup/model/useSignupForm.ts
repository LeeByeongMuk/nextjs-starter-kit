import { useForm, UseFormReturn } from 'react-hook-form';

import { SignUpReq } from '../api/types';

export function useSignupForm(): UseFormReturn<SignUpReq> {
  return useForm<SignUpReq>({
    defaultValues: {
      email: '',
      name: '',
      nickname: '',
      password: '',
    },
  });
}
