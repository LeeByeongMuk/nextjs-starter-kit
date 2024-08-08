'use client';

import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonBox from '@/app/components/Auth/Form/ButtonBox';
import EmailInput from '@/app/components/Auth/Form/EmailInput';
import NameInput from '@/app/components/Auth/Form/NameInput';
import NickNameInput from '@/app/components/Auth/Form/NickNameInput';
import PwConfInput from '@/app/components/Auth/Form/PwConfInput';
import PwInput from '@/app/components/Auth/Form/PwInput';
import AuthHeader from '@/app/components/Auth/Header';
import LayerSpinner from '@/app/components/Spinner/LayerSpinner';
import useSignup from '@/app/hooks/auth/useSignup';

interface SignUpInput {
  email: string;
  name: string;
  nickname: string;
  password: string;
  passwordConfirmation: string;
}

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

            <PwInput />

            <PwConfInput />

            <ButtonBox buttonText="Sign up" />
          </form>
        </div>
      </div>

      {isPending && <LayerSpinner />}
    </FormProvider>
  );
}
