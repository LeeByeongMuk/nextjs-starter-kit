import Account from '@app/(domain)/(auth)/account/page';
import { useDeleteAccount } from '@features/auth-account';
import { useUpdateAccount } from '@features/auth-account';
import { server } from '@shared/api/mocks/testServer';
import { getQueryClient } from '@shared/api/tanstack-query/client';
import { TOKEN_KEY } from '@shared/config/auth';
import { getHandlerURI } from '@shared/lib/url';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { signOut, useSession } from 'next-auth/react';

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
  const deleteCookie = jest.fn();

  beforeEach(() => {
    deleteCookie.mockClear();
    (signOut as jest.Mock).mockClear();
    (cookies as jest.Mock).mockResolvedValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue({ value: 'test-token' }),
      delete: deleteCookie,
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
      fireEvent.change(screen.getByLabelText('이메일'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('이름'), {
        target: { value: 'name' },
      });
      fireEvent.change(screen.getByLabelText('닉네임'), {
        target: { value: 'nickname' },
      });

      fireEvent.click(screen.getByRole('button', { name: '변경 사항 저장' }));

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
      expect(window.alert).toHaveBeenCalledWith('회원 정보를 수정했습니다.');
    });

    test('회원 정보 수정 실패 시 에러 메세지가 표시된다.', async () => {
      queryClient.clear();
      server.use(
        http.put(getHandlerURI('/api/users'), () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      // when - 회원 정보 수정 버튼 클릭
      fireEvent.change(screen.getByLabelText('이메일'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('이름'), {
        target: { value: 'name' },
      });
      fireEvent.change(screen.getByLabelText('닉네임'), {
        target: { value: 'nickname' },
      });

      fireEvent.click(screen.getByRole('button', { name: '변경 사항 저장' }));

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
      expect(window.alert).toHaveBeenCalledWith(
        '회원 정보를 수정하지 못했습니다.'
      );
    });
  });

  describe('회원 탈퇴 테스트', () => {
    test('회원 탈퇴 버튼 클릭 시 탈퇴 사유 입력 모달이 뜬다', async () => {
      // when - 회원 탈퇴 버튼 클릭
      fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));

      // then - 탈퇴 사유 입력 모달이 뜬다
      expect(window.prompt).toHaveBeenCalledWith(
        '회원 탈퇴를 진행하려면 탈퇴 사유를 입력해 주세요.'
      );
    });

    test('회원 탈퇴 성공 시 로그아웃 처리된다.', async () => {
      // when - 회원 탈퇴 버튼 클릭
      fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));

      // then - 로그아웃 처리된다
      const { result } = renderHook(() => useDeleteAccount(), { wrapper });

      act(() => {
        result.current.mutate({
          deleted_reason: 'reason',
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(window.alert).toHaveBeenCalledWith('회원 탈퇴가 완료되었습니다.');
      expect(deleteCookie).toHaveBeenCalledWith(TOKEN_KEY);
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
      expect(deleteCookie.mock.invocationCallOrder[0]).toBeLessThan(
        (signOut as jest.Mock).mock.invocationCallOrder[0]
      );
    });

    test('회원 탈퇴 실패 시 에러 메세지가 표시된다.', async () => {
      queryClient.clear();
      server.use(
        http.delete(getHandlerURI('/api/users'), () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      // when - 회원 탈퇴 버튼 클릭
      fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));

      // then - 에러 메세지가 표시된다
      const { result } = renderHook(() => useDeleteAccount(), { wrapper });

      act(() => {
        result.current.mutate({
          deleted_reason: 'reason',
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(window.alert).toHaveBeenCalledWith(
        '회원 탈퇴를 완료하지 못했습니다.'
      );
    });
  });
});
