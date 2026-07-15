import SignIn from '@app/(domain)/(auth)/signin/page';
import { server } from '@shared/api/mocks/testServer';
import { getQueryClient } from '@shared/api/tanstack-query/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React from 'react';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock('next-auth/react');

const queryClient = getQueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('로그인 테스트', () => {
  const mockPush = jest.fn();
  let mockSearchParams: URLSearchParams;

  beforeEach(() => {
    (cookies as jest.Mock).mockResolvedValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue({ value: 'test-token' }),
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

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

    test('callbackUrl이 있으면 로그인 성공 후 해당 경로로 이동한다', async () => {
      (signIn as jest.Mock).mockResolvedValue({ ok: true });
      mockSearchParams.set('callbackUrl', '/account');

      // when - 로그인 성공
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - callbackUrl 경로로 복귀
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/account'));
    });

    test('외부 origin callbackUrl은 무시하고 홈으로 이동한다', async () => {
      (signIn as jest.Mock).mockResolvedValue({ ok: true });
      mockSearchParams.set('callbackUrl', 'https://evil.example.com/x');

      // when - 로그인 성공
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - open redirect 차단
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
