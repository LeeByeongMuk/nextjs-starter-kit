'use client';

import AuthHeader from '@entities/auth/ui/AuthHeader';
import SignInForm from '@features/auth-signin/ui/SignInForm';
import { useSignInForm } from '@features/auth-signin/model/useSignInForm';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import React from 'react';
import { FormProvider } from 'react-hook-form';

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
