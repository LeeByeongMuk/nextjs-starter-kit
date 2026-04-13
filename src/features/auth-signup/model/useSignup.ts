import { fetchSignUp } from '@features/auth-signup/api/signupServices';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

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
