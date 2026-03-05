import { useForm, UseFormReturn } from 'react-hook-form';

import { SignUpReq } from '@domains/auth/signup/_types/api';

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
