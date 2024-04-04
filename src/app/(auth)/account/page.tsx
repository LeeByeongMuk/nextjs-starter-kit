'use client';

import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import { fetchUserUpdate } from '@/app/api/auth';
import ButtonBox from '@/app/components/Auth/Form/ButtonBox';
import EmailInput from '@/app/components/Auth/Form/EmailInput';
import NameInput from '@/app/components/Auth/Form/NameInput';
import NickNameInput from '@/app/components/Auth/Form/NickNameInput';
import LayerSpinner from '@/app/components/Spinner/LayerSpinner';

interface UserUpdateInput {
  email: string;
  name: string;
  nickname: string;
}

export default function Account() {
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, update } = useSession();

  const methods = useForm<UserUpdateInput>();
  const { handleSubmit } = methods;

  const { mutate } = useMutation({
    mutationFn: fetchUserUpdate,
  });

  const onSubmit: SubmitHandler<UserUpdateInput> = async data => {
    setIsLoading(true);
    mutate(
      {
        email: data.email,
        name: data.name,
        nickname: data.nickname,
      },
      {
        onSuccess: async () => {
          alert('Account updated successfully');
          await update();
        },
        onError: () => {
          alert('Failed to update account');
        },
        onSettled: () => {
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-full flex-col justify-center px-6 py-10 lg:px-8">
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <EmailInput defaultValue={session?.user?.email} />

            <NameInput defaultValue={session?.user?.name} />

            <NickNameInput
              defaultValue={session?.user?.nickname || undefined}
            />

            <ButtonBox buttonText="Account Update" />
          </form>
        </div>
      </div>
      {isLoading && <LayerSpinner />}
    </FormProvider>
  );
}
