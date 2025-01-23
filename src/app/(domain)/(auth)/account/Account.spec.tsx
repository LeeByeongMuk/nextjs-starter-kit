import { QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { cookies } from 'next/headers';
import { useSession } from 'next-auth/react';

import Account from '@app_domain/(auth)/account/page';
import useDeleteAccount from '@domains/auth/account/_hooks/useDeleteAccount';
import useUpdateAccount from '@domains/auth/account/_hooks/useUpdateAccount';
import { server } from '@lib/mocks/testServer';
import { getQueryClient } from '@lib/tanstackQuery/client';
import { getHandlerURI } from '@shared/utils/url';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('next-auth/react');

const queryClient = getQueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('마이페이지 페이지 테스트', () => {
  const useSessionMock = useSession as jest.Mock;

  beforeEach(() => {
    (cookies as jest.Mock).mockReturnValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue,
    });

    useSessionMock.mockReturnValue({
      user: {
        created_at: '2030-09-01T00:00:00.000Z',
        email: 'test@email.com',
        name: 'name',
        nickname: 'nickname',
        phone: null,
        provider: null,
      },
      update: jest.fn(),
    });

    // given - 마이페이지가 그려짐
    render(<Account />, { wrapper });
  });

  describe('회원 정보 수정 테스트', () => {
    test('회원 정보 수정 성공 시 성공 메세지가 표시된다.', async () => {
      // when - 회원 정보 수정 버튼 클릭
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'name' },
      });
      fireEvent.change(screen.getByLabelText('NickName'), {
        target: { value: 'nickname' },
      });

      fireEvent.click(screen.getByText('Account Update'));

      // then - 성공 메세지가 표시된다.
      const { result } = renderHook(() => useUpdateAccount(), { wrapper });

      act(() => {
        result.current.mutate({
          email: 'test@email.com',
          name: 'name',
          nickname: 'nickname',
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(window.alert).toHaveBeenCalledWith('Account updated successfully');
    });

    test('회원 정보 수정 실패 시 에러 메세지가 표시된다.', async () => {
      queryClient.clear();
      server.use(
        http.put(getHandlerURI('/api/users'), () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      // when - 회원 정보 수정 버튼 클릭
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'name' },
      });
      fireEvent.change(screen.getByLabelText('NickName'), {
        target: { value: 'nickname' },
      });

      fireEvent.click(screen.getByText('Account Update'));

      // then - 에러 메세지가 표시된다.
      const { result } = renderHook(() => useUpdateAccount(), { wrapper });

      act(() => {
        result.current.mutate({
          email: 'test@email.com',
          name: 'name',
          nickname: 'nickname',
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(window.alert).toHaveBeenCalledWith('Failed to update account');
    });
  });

  describe('회원 탈퇴 테스트', () => {
    test('회원 탈퇴 버튼 클릭 시 탈퇴 사유 입력 모달이 뜬다', async () => {
      // when - 회원 탈퇴 버튼 클릭
      fireEvent.click(screen.getByText('Delete Account'));

      // then - 탈퇴 사유 입력 모달이 뜬다
      expect(window.prompt).toHaveBeenCalledWith(
        'Are you sure you want to delete your account? Please enter a reason'
      );
    });

    test('회원 탈퇴 성공 시 로그아웃 처리된다.', async () => {
      // when - 회원 탈퇴 버튼 클릭
      fireEvent.click(screen.getByText('Delete Account'));

      // then - 로그아웃 처리된다
      const { result } = renderHook(() => useDeleteAccount(), { wrapper });

      act(() => {
        result.current.mutate({
          deleted_reason: 'reason',
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(window.alert).toHaveBeenCalledWith('Account deleted successfully');
    });

    test('회원 탈퇴 실패 시 에러 메세지가 표시된다.', async () => {
      queryClient.clear();
      server.use(
        http.delete(getHandlerURI('/api/users'), () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      // when - 회원 탈퇴 버튼 클릭
      fireEvent.click(screen.getByText('Delete Account'));

      // then - 에러 메세지가 표시된다
      const { result } = renderHook(() => useDeleteAccount(), { wrapper });

      act(() => {
        result.current.mutate({
          deleted_reason: 'reason',
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(window.alert).toHaveBeenCalledWith('Failed to delete account');
    });
  });
});
