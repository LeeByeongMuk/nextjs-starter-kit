import { SignUpReq } from '@domains/auth/signup/_types/api';
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
