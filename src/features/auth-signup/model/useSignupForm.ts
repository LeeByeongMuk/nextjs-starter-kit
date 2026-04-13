import { SignUpReq } from '@features/auth-signup/api/types';
import { useForm, UseFormReturn } from 'react-hook-form';

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
