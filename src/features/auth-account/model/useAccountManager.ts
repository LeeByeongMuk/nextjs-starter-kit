import { getSession, useSession } from 'next-auth/react';
import { useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { UpdateAccountReq } from '../api/types';
import useDeleteAccount from './useDeleteAccount';
import useUpdateAccount from './useUpdateAccount';

interface SessionProfile extends UpdateAccountReq {
  userId: string;
}

/** 세션 회원 정보로 채운 폼과 수정·탈퇴 동작을 화면에 제공한다. */
export function useAccountManager() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userId = user?.id == null ? undefined : String(user.id);
  const email = user?.email ?? '';
  const name = user?.name ?? '';
  const nickname = user?.nickname ?? '';
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const methods = useForm<UpdateAccountReq>({
    defaultValues: { email, name, nickname },
  });
  const {
    reset,
    formState: { dirtyFields },
  } = methods;
  const lastProfile = useRef<SessionProfile | undefined>(undefined);
  const syncProfile = useEffectEvent(
    (profile: UpdateAccountReq, sameUser: boolean) => {
      reset(profile, {
        keepDirtyValues: sameUser && Object.keys(dirtyFields).length > 0,
        keepTouched: sameUser,
        keepErrors: sameUser,
      });
    }
  );

  useLayoutEffect(() => {
    if (userId === undefined) return;

    const previousProfile = lastProfile.current;
    const sameUser = previousProfile?.userId === userId;
    if (
      sameUser &&
      previousProfile.email === email &&
      previousProfile.name === name &&
      previousProfile.nickname === nickname
    ) {
      return;
    }

    syncProfile({ email, name, nickname }, sameUser);
    lastProfile.current = { userId, email, name, nickname };
  }, [email, name, nickname, userId]);

  const updateMutate = useUpdateAccount(profile => {
    if (String(profile.id) === lastProfile.current?.userId) {
      reset({
        email: profile.email,
        name: profile.name,
        nickname: profile.nickname ?? '',
      });
    }
  });
  const deleteMutate = useDeleteAccount();
  const canEdit = userId !== undefined;
  const isSessionMissing = status === 'unauthenticated';
  const isLoading =
    status === 'loading' || updateMutate.isPending || deleteMutate.isPending;

  const handleCheckSession = async () => {
    if (isCheckingSession) return;

    setIsCheckingSession(true);
    // getSession 알림은 Auth.js의 null 세션 캐시도 다시 조회하게 한다.
    await getSession().catch(() => null);
    setIsCheckingSession(false);
  };

  const handleUpdateAccount = (data: UpdateAccountReq) => {
    if (canEdit && !isLoading) updateMutate.mutate(data);
  };

  const handleDeleteAccount = () => {
    if (!canEdit || isLoading) return;

    const deletedReason = prompt(
      '회원 탈퇴를 진행하려면 탈퇴 사유를 입력해 주세요.'
    );
    if (!deletedReason) return;

    deleteMutate.mutate({ deleted_reason: deletedReason });
  };

  return {
    methods,
    handleUpdateAccount,
    handleDeleteAccount,
    handleCheckSession,
    canEdit,
    isSessionMissing,
    isCheckingSession,
    isLoading,
  };
}
