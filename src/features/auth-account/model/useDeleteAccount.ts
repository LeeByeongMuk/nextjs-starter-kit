import { deleteAccessToken } from '@shared/lib/api';
import { useMutation } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';

import { fetchDeleteAccount } from '../api/accountService';

/** 회원 탈퇴를 요청하고 성공하면 API 토큰을 지운 뒤 로그아웃한다. */
export default function useDeleteAccount() {
  return useMutation({
    mutationFn: fetchDeleteAccount,
    onSuccess: async () => {
      alert('회원 탈퇴가 완료되었습니다.');
      await deleteAccessToken();
      await signOut({
        callbackUrl: '/',
      });
    },
    onError: () => {
      alert('회원 탈퇴를 완료하지 못했습니다.');
    },
  });
}
