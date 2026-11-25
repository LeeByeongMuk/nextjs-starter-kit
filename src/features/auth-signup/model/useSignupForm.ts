import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';

import {
  SIGN_UP_DEFAULT_VALUES,
  type SignUpFormInput,
  SignUpFormSchema,
} from './form';

/** 회원가입 입력을 초기화하고 폼 스키마로 검증한다. */
export function useSignupForm(): UseFormReturn<SignUpFormInput> {
  return useForm<SignUpFormInput>({
    defaultValues: SIGN_UP_DEFAULT_VALUES,
    resolver: zodResolver(SignUpFormSchema),
  });
}
