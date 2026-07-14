'use client';

import { AuthHeader } from '@entities/auth';
import {
  SignUpForm,
  type SignUpReq,
  useSignup,
  useSignupForm,
} from '@features/auth-signup';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import React from 'react';
import { FormProvider } from 'react-hook-form';

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
