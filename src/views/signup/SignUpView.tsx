'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';

import { AuthHeader } from '@entities/auth';
import {
  SignUpForm,
  useSignup,
  useSignupForm,
  type SignUpReq,
} from '@features/auth-signup';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';

export default function SignUpView() {
  const methods = useSignupForm();
  const { mutate, isPending } = useSignup();
  const handleSignUp = (req: SignUpReq) => {
    mutate(req);
  };

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-full flex-col justify-center px-6 py-10 lg:px-8">
        <AuthHeader headText="Sign up to your account" />

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <SignUpForm handleSignUp={handleSignUp} />
        </div>
      </div>

      {isPending && <LayerSpinner />}
    </FormProvider>
  );
}
