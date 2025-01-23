import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React from 'react';

import SignIn from '@app_domain/(auth)/signin/page';
import { server } from '@lib/mocks/testServer';
import { getQueryClient } from '@lib/tanstackQuery/client';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('next-auth/react');

const queryClient = getQueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('로그인 테스트', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (cookies as jest.Mock).mockReturnValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue,
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // given - 로그인 페이지가 그려짐
    render(<SignIn />, { wrapper });
  });

  describe('회원가입 API 호출', () => {
    test('회원가입 성공', async () => {
      (signIn as jest.Mock).mockResolvedValue({ ok: true });

      // when - 이메일, 비밀번호 값이 입력하고 로그인 버튼 클릭
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 회원가입 성공
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
    });

    test('회원가입 실패', async () => {
      (signIn as jest.Mock).mockResolvedValue({ ok: false });

      server.use(
        http.post('/api/users/signin', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      // when - 이메일, 비밀번호 값이 입력하고 로그인 버튼 클릭
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 회원가입 실패
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith('Failed to sign in')
      );
    });
  });
});
