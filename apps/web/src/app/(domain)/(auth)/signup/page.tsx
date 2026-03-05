'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';

import AuthHeader from '@domains/auth/_components/AuthHeader';
import SignUpForm from '@domains/auth/signup/_components/SignUpForm';
import useSignup from '@domains/auth/signup/_hooks/useSignup';
import { useSignupForm } from '@domains/auth/signup/_hooks/useSignupForm';
import { SignUpReq } from '@domains/auth/signup/_types/api';
import LayerSpinner from '@shared/components/Spinner/LayerSpinner';

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
