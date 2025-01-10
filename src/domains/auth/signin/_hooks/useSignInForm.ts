'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { SignInReq } from '@domains/auth/signin/_types/api';

export function useSignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const methods = useForm<SignInReq>();

  const handleSignIn = async (data: SignInReq) => {
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

  return { isLoading, handleSignIn, methods };
}
