'use client';

import AuthHeader from '@entities/auth/ui/AuthHeader';
import SignUpForm from '@features/auth-signup/ui/SignUpForm';
import useSignup from '@features/auth-signup/model/useSignup';
import { useSignupForm } from '@features/auth-signup/model/useSignupForm';
import { SignUpReq } from '@features/auth-signup/api/types';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import React from 'react';
import { FormProvider } from 'react-hook-form';

export default function Signup() {
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
