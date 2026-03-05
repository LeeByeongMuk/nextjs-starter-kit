import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

import { fetchSignUp } from '@domains/auth/signup/services/signupServices';

export default function useSignup() {
  return useMutation({
    mutationFn: fetchSignUp,
    onSuccess: async (_, data) => {
      alert('Signed up successfully!');

      await signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl: '/',
      });
    },
    onError: () => {
      alert('Failed to sign up');
    },
  });
}
