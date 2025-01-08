'use client';

import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonBox from '@/domains/auth/components/AuthForm/ButtonBox';
import EmailInput from '@/domains/auth/components/AuthForm/EmailInput';
import NameInput from '@/domains/auth/components/AuthForm/NameInput';
import NickNameInput from '@/domains/auth/components/AuthForm/NickNameInput';
import PasswordConfirmInput from '@/domains/auth/components/AuthForm/PasswordConfirmInput';
import PasswordInput from '@/domains/auth/components/AuthForm/PasswordInput';
import AuthHeader from '@/domains/auth/components/AuthHeader';
import useSignup from '@/domains/auth/hooks/useSignup';
import { SignUpInput } from '@/domains/auth/types/form';
import LayerSpinner from '@/shared/components/Spinner/LayerSpinner';

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
