'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React, { useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonBox from '@/app/(auth)/_components/Form/ButtonBox';
import EmailInput from '@/app/(auth)/_components/Form/EmailInput';
import PasswordInput from '@/app/(auth)/_components/Form/PasswordInput';
import AuthHeader from '@/app/(auth)/_components/Header';
import LayerSpinner from '@/components/Spinner/LayerSpinner';
import { SignInInput } from '@/app/(auth)/_types/form';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const methods = useForm<SignInInput>();
  const { handleSubmit } = methods;

  const onSubmit: SubmitHandler<SignInInput> = async data => {
    setIsLoading(true);
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.ok) {
      router.push('/');
    } else {
      alert('Failed to sign in');
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-full flex-col justify-center px-6 py-10 lg:px-8">
        <AuthHeader headText="Sign in to your account" />

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <EmailInput />

            <PasswordInput />

            <ButtonBox buttonText="Sign in" />

            {/* TODO: <Social /> */}
          </form>
        </div>
      </div>
      {isLoading && <LayerSpinner />}
    </FormProvider>
  );
}
