'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonBox from '@/domains/auth/components/AuthForm/ButtonBox';
import EmailInput from '@/domains/auth/components/AuthForm/EmailInput';
import NameInput from '@/domains/auth/components/AuthForm/NameInput';
import NickNameInput from '@/domains/auth/components/AuthForm/NickNameInput';
import useDeleteAccount from '@/domains/auth/hooks/useDeleteAccount';
import useUpdateAccount from '@/domains/auth/hooks/useUpdateAccount';
import { UserUpdateInput } from '@/domains/auth/types/form';
import LayerSpinner from '@/shared/components/Spinner/LayerSpinner';

export default function Account() {
  const { data: session } = useSession();

  const methods = useForm<UserUpdateInput>();
  const { handleSubmit, reset } = methods;

  const updateMutate = useUpdateAccount();
  const deleteMutate = useDeleteAccount();

  useEffect(() => {
    if (!session?.user) return;
    reset({
      email: session.user.email,
      name: session.user.name,
      nickname: session.user.nickname || '',
    });
  }, [reset, session?.user]);

  const onUpdateAccount: SubmitHandler<UserUpdateInput> = async data => {
    updateMutate.mutate({
      email: data.email,
      name: data.name,
      nickname: data.nickname,
    });
  };

  const onDeleteAccount = () => {
    const deletedReason = prompt(
      'Are you sure you want to delete your account? Please enter a reason'
    );
    if (!deletedReason) return;

    deleteMutate.mutate({
      deleted_reason: deletedReason,
    });
  };

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-full flex-col justify-center px-6 py-10 lg:px-8">
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-4" onSubmit={handleSubmit(onUpdateAccount)}>
            <EmailInput defaultValue={session?.user?.email} />

            <NameInput defaultValue={session?.user?.name} />

            <NickNameInput
              defaultValue={session?.user?.nickname || undefined}
            />

            <ButtonBox buttonText="Account Update" />
          </form>

          <div className="mt-3">
            <button
              type="button"
              className="flex w-full justify-center rounded-md border border-teal-600 bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-transparent hover:text-teal-600 focus:outline-none focus:ring active:text-teal-500"
              onClick={onDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
      {(updateMutate.isPending || deleteMutate.isPending) && <LayerSpinner />}
    </FormProvider>
  );
}
