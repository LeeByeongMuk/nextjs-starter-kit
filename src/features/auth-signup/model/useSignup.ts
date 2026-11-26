import { documentNavigation } from '@shared/lib/url';
import { toast } from '@shared/ui/toast';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

import { fetchSignUp } from '../api/signupServices';

/** 회원가입을 요청하고 성공하면 가입한 계정으로 로그인한다. */
export default function useSignup() {
  return useMutation({
    mutationFn: fetchSignUp,
    meta: { errorMessage: '회원가입을 완료하지 못했습니다.' },
    onSuccess: async (_, data) => {
      toast.success('회원가입이 완료되었습니다.', {
        survivesNavigation: true,
      });

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        redirectTo: '/',
      }).catch(() => undefined);
      if (result?.ok && !result.error && result.url) {
        documentNavigation.assign('/');
      } else {
        toast.error(
          '자동 로그인에 실패했습니다. 로그인 화면에서 다시 로그인해 주세요.'
        );
      }
    },
  });
}
