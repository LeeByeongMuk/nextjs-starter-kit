'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { SignInReq } from '../api/types';

// 절대 URL·프로토콜 상대(//) callbackUrl은 open redirect가 되므로 same-origin 경로만 복귀 허용
const resolveCallbackUrl = (callbackUrl: string | null) => {
  if (!callbackUrl) {
    return '/';
  }

  try {
    const url = new URL(callbackUrl, window.location.origin);
    if (url.origin !== window.location.origin) {
      return '/';
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return '/';
  }
};

export function useSignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<SignInReq>();

  const handleSignIn = async (data: SignInReq) => {
    setIsLoading(true);
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.ok) {
      router.push(resolveCallbackUrl(searchParams.get('callbackUrl')));
    } else {
      alert('Failed to sign in');
      setIsLoading(false);
    }
  };

  return { isLoading, handleSignIn, methods };
}
