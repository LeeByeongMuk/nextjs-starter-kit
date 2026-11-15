import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

import { fetchSignUp } from '../api/signupServices';

/** 회원가입을 요청하고 성공하면 가입한 계정으로 로그인한다. */
export default function useSignup() {
  return useMutation({
    mutationFn: fetchSignUp,
    onSuccess: async (_, data) => {
      alert('회원가입이 완료되었습니다.');

      await signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl: '/',
      });
    },
    onError: () => {
      alert('회원가입을 완료하지 못했습니다.');
    },
  });
}
