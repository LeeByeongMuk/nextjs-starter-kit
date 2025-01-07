'use client';

import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonBox from '@/app/(auth)/_components/Form/ButtonBox';
import EmailInput from '@/app/(auth)/_components/Form/EmailInput';
import NameInput from '@/app/(auth)/_components/Form/NameInput';
import NickNameInput from '@/app/(auth)/_components/Form/NickNameInput';
import PasswordConfirmInput from '@/app/(auth)/_components/Form/PasswordConfirmInput';
import PasswordInput from '@/app/(auth)/_components/Form/PasswordInput';
import AuthHeader from '@/app/(auth)/_components/Header';
import LayerSpinner from '@/components/Spinner/LayerSpinner';
import useSignup from '@/app/(auth)/_hooks/useSignup';
import { SignUpInput } from '@/app/(auth)/_types/form';

export default function Signup() {
  const { mutate, isPending } = useSignup();

  const methods = useForm<SignUpInput>();
  const { handleSubmit } = methods;

  const onSubmit: SubmitHandler<SignUpInput> = async data => {
    if (isPending) return;
    mutate({
      email: data.email,
      name: data.name,
      nickname: data.nickname,
      password: data.password,
    });
  };

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-full flex-col justify-center px-6 py-10 lg:px-8">
        <AuthHeader headText="Sign up to your account" />

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <EmailInput />

            <NameInput />

            <NickNameInput />

            <PasswordInput />

            <PasswordConfirmInput />

            <ButtonBox buttonText="Sign up" />
          </form>
        </div>
      </div>

      {isPending && <LayerSpinner />}
    </FormProvider>
  );
}
