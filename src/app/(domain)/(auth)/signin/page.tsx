'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';

import AuthHeader from '@domains/auth/_components/AuthHeader';
import SignInForm from '@domains/auth/signin/_components/SignInForm';
import { useSignInForm } from '@domains/auth/signin/_hooks/useSignInForm';
import LayerSpinner from '@shared/components/Spinner/LayerSpinner';

export default function SignIn() {
  const { isLoading, handleSignIn, methods } = useSignInForm();

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-full flex-col justify-center px-6 py-10 lg:px-8">
        <AuthHeader headText="Sign in to your account" />

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <SignInForm handleSignIn={handleSignIn} />
        </div>
      </div>

      {isLoading && <LayerSpinner />}
    </FormProvider>
  );
}
