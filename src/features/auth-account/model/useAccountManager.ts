import { zodResolver } from '@hookform/resolvers/zod';
import { getSession, useSession } from 'next-auth/react';
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';

import { UpdateAccountReq } from '../api/types';
import { type AccountFormInput, AccountFormSchema } from './form';
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
  const methods = useForm<AccountFormInput>({
    defaultValues: { email, name, nickname },
    resolver: zodResolver(AccountFormSchema),
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
  const [deleteDialogUserId, setDeleteDialogUserId] = useState<string>();
  // 탈퇴 확인은 대화상자를 연 계정에만 유효하다. 세션이 끝나거나 다른 계정으로 바뀌면 닫는다.
  if (deleteDialogUserId !== undefined && deleteDialogUserId !== userId) {
    setDeleteDialogUserId(undefined);
  }
  const sessionUserId = useRef(userId);
  useLayoutEffect(() => {
    sessionUserId.current = userId;
  }, [userId]);
  const canEdit = userId !== undefined;
  const isSessionMissing = status === 'unauthenticated';
  const isLoading =
    status === 'loading' || updateMutate.isPending || deleteMutate.isPending;

  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const restoredDeleteAttempt = useRef<number>(undefined);
  const failedDeleteAttempt =
    deleteMutate.isError &&
    !isLoading &&
    deleteMutate.variables?.user_id === userId
      ? deleteMutate.submittedAt
      : undefined;
  // 탈퇴를 요청하는 동안 여는 버튼이 비활성화되어 브라우저가 대화상자를 닫으며 초점을 되돌리지 못한다.
  // 요청이 실패해 버튼을 다시 쓸 수 있게 되면 한 번만, 사용자가 그사이 다른 곳으로 옮기지 않은 초점을 되돌린다.
  useEffect(() => {
    if (
      failedDeleteAttempt === undefined ||
      restoredDeleteAttempt.current === failedDeleteAttempt
    ) {
      return;
    }

    restoredDeleteAttempt.current = failedDeleteAttempt;
    if (document.activeElement === document.body) {
      deleteButtonRef.current?.focus();
    }
  }, [failedDeleteAttempt]);

  const handleCheckSession = async () => {
    if (isCheckingSession) return;

    setIsCheckingSession(true);
    // getSession 알림은 Auth.js의 null 세션 캐시도 다시 조회하게 한다.
    await getSession().catch(() => null);
    setIsCheckingSession(false);
  };

  const handleUpdateAccount = (data: AccountFormInput) => {
    if (canEdit && !isLoading) updateMutate.mutate(data);
  };

  const handleDeleteAccount = () => {
    if (canEdit && !isLoading) setDeleteDialogUserId(userId);
  };

  const handleCancelDeleteAccount = () => {
    setDeleteDialogUserId(undefined);
  };

  const handleConfirmDeleteAccount = (deletedReason: string) => {
    // 폼 검증을 기다린 뒤 호출되므로, 그사이 세션이 바뀌었는지는 렌더 시점의 값이 아닌 최신 값으로 확인한다.
    if (
      deleteDialogUserId === undefined ||
      deleteDialogUserId !== sessionUserId.current ||
      isLoading
    ) {
      return;
    }

    setDeleteDialogUserId(undefined);
    deleteMutate.mutate({
      deleted_reason: deletedReason,
      user_id: deleteDialogUserId,
    });
  };

  return {
    methods,
    handleUpdateAccount,
    handleDeleteAccount,
    handleCancelDeleteAccount,
    handleConfirmDeleteAccount,
    handleCheckSession,
    accountId: userId,
    isDeleteDialogOpen: deleteDialogUserId !== undefined,
    deleteButtonRef,
    canEdit,
    isSessionMissing,
    isCheckingSession,
    isLoading,
  };
}
