'use client';

import { useSession } from 'next-auth/react';
import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonBox from '@/app/components/Auth/Form/ButtonBox';
import EmailInput from '@/app/components/Auth/Form/EmailInput';
import NameInput from '@/app/components/Auth/Form/NameInput';
import NickNameInput from '@/app/components/Auth/Form/NickNameInput';
import LayerSpinner from '@/app/components/Spinner/LayerSpinner';
import useDeleteAccount from '@/app/hooks/auth/useDeleteAccount';
import useUpdateAccount from '@/app/hooks/auth/useUpdateAccount';

interface UserUpdateInput {
  email: string;
  name: string;
  nickname: string;
}

export default function Account() {
  const { data: session } = useSession();

  const methods = useForm<UserUpdateInput>();
  const { handleSubmit } = methods;

  const updateMutate = useUpdateAccount();

  const deleteMutate = useDeleteAccount();

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
