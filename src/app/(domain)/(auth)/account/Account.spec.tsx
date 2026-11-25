import Account from '@app/(domain)/(auth)/account/page';
import { useDeleteAccount } from '@features/auth-account';
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
import { getSession, signOut, useSession } from 'next-auth/react';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('next-auth/react');

const queryClient = getQueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('마이페이지 페이지 테스트', () => {
  const getSessionMock = jest.mocked(getSession);
  const useSessionMock = jest.mocked(useSession);
  const updateSession = jest.fn();
  const deleteCookie = jest.fn();
  const account = {
    id: '1',
    email: 'test@email.com',
    name: '이전 이름',
    nickname: '이전 닉네임',
  };
  const newSession = (user: typeof account) => ({ user, expires: '' });
  const setSession = (user: typeof account) => {
    useSessionMock.mockReturnValue({
      data: newSession(user),
      status: 'authenticated',
      update: updateSession,
    });
  };
  const setMissingSession = () => {
    useSessionMock.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: updateSession,
    });
  };
  const renderAccount = () => render(<Account />, { wrapper });

  beforeEach(() => {
    deleteCookie.mockClear();
    updateSession.mockReset();
    getSessionMock.mockReset().mockResolvedValue(null);
    (signOut as jest.Mock).mockClear();
    (cookies as jest.Mock).mockResolvedValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue({ value: 'test-token' }),
      delete: deleteCookie,
    });
    setSession(account);
  });

  describe('회원 정보 수정 테스트', () => {
    test('세션이 도착한 뒤 서버 값으로 폼을 채운다', () => {
      useSessionMock.mockReturnValue({
        data: null,
        status: 'loading',
        update: updateSession,
      });
      const { rerender } = renderAccount();
      const email = screen.getByLabelText('이메일');
      expect(email).toHaveValue('');
      expect(email).toBeDisabled();

      setSession(account);
      rerender(<Account />);
      expect(email).toHaveValue(account.email);
      expect(email).toBeEnabled();
      expect(screen.getByLabelText('이름')).toHaveValue(account.name);
      expect(screen.getByLabelText('닉네임')).toHaveValue(account.nickname);
    });

    test('세션 재조회 때 편집 중인 값은 보존하고 나머지 값은 갱신한다', () => {
      const { rerender } = renderAccount();
      const name = screen.getByLabelText('이름');
      fireEvent.change(name, { target: { value: '편집 중인 이름' } });

      setSession({ ...account });
      rerender(<Account />);
      expect(name).toHaveValue('편집 중인 이름');

      setSession({ ...account, name: '서버 이름', nickname: '서버 닉네임' });
      rerender(<Account />);
      expect(name).toHaveValue('편집 중인 이름');
      expect(screen.getByLabelText('닉네임')).toHaveValue('서버 닉네임');
    });

    test('세션이 끊기면 폼을 잠그고, 직접 다시 확인해 같은 계정이면 편집을 이어간다', async () => {
      const { rerender } = renderAccount();
      const name = screen.getByLabelText('이름');
      const submit = screen.getByRole('button', { name: '변경 사항 저장' });
      const save = jest.fn();
      server.use(
        http.put(getHandlerURI('/api/users'), () => {
          save();
          return HttpResponse.json({ ok: true, data: account });
        })
      );
      fireEvent.change(name, { target: { value: '편집 중인 이름' } });
      setMissingSession();
      rerender(<Account />);
      expect(name).not.toBeVisible();
      expect(submit).toBeDisabled();
      expect(screen.getByRole('status')).toHaveTextContent(
        '세션을 확인할 수 없습니다.'
      );
      expect(getSessionMock).not.toHaveBeenCalled();
      await act(async () => {
        fireEvent.submit(submit.closest('form')!);
      });
      expect(save).not.toHaveBeenCalled();

      const recovered = { ...account, nickname: '갱신된 닉네임' };
      getSessionMock.mockImplementationOnce(async () => {
        setSession(recovered);
        rerender(<Account />);
        return newSession(recovered);
      });
      fireEvent.click(screen.getByRole('button', { name: '세션 다시 확인' }));

      await waitFor(() => expect(submit).toBeEnabled());
      expect(getSessionMock).toHaveBeenCalledTimes(1);
      expect(name).toBeVisible();
      expect(name).toHaveValue('편집 중인 이름');
      expect(screen.getByLabelText('닉네임')).toHaveValue('갱신된 닉네임');
    });

    test('세션이 끊긴 뒤 다른 계정으로 확인되면 해당 계정의 값만 사용한다', () => {
      const { rerender } = renderAccount();
      const name = screen.getByLabelText('이름');
      fireEvent.change(name, { target: { value: '편집 중인 이름' } });
      setMissingSession();
      rerender(<Account />);
      expect(name).not.toBeVisible();

      const other = { ...account, id: '2', name: '다른 이름' };
      setSession(other);
      rerender(<Account />);
      expect(name).toBeVisible();
      expect(name).toHaveValue(other.name);
    });

    test('저장이 끝날 때까지 잠그고 PUT 응답을 폼 기준값으로 적용한다', async () => {
      const saved = { ...account, name: '서버 이름', nickname: '서버 닉네임' };
      let finishSessionUpdate!: () => void;
      updateSession.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finishSessionUpdate = () => resolve(newSession(account));
          })
      );
      const save = jest.fn();
      server.use(
        http.put(getHandlerURI('/api/users'), async ({ request }) => {
          save(await request.json());
          return HttpResponse.json({ ok: true, message: '', data: saved });
        })
      );
      const { rerender } = renderAccount();
      const name = screen.getByLabelText('이름');
      const submit = screen.getByRole('button', { name: '변경 사항 저장' });
      fireEvent.change(name, { target: { value: '새 이름' } });
      fireEvent.click(submit);

      await waitFor(() => expect(updateSession).toHaveBeenCalledWith({}));
      expect(save).toHaveBeenCalledWith({
        email: account.email,
        name: '새 이름',
        nickname: account.nickname,
      });
      expect(submit).toBeDisabled();
      expect(name).toBeDisabled();
      setSession({ ...account });
      rerender(<Account />);
      expect(name).toHaveValue('새 이름');

      finishSessionUpdate();
      await waitFor(() => expect(submit).toBeEnabled());
      expect(window.alert).toHaveBeenCalledWith('회원 정보를 수정했습니다.');
      expect(name).toHaveValue(saved.name);
      expect(screen.getByLabelText('닉네임')).toHaveValue(saved.nickname);

      setMissingSession();
      rerender(<Account />);
      expect(name).not.toBeVisible();
      setSession({ ...account });
      rerender(<Account />);
      expect(name).toHaveValue(saved.name);

      setSession({ ...saved, name: '다시 갱신된 이름' });
      rerender(<Account />);
      expect(name).toHaveValue('다시 갱신된 이름');
    });

    test('세션 갱신에 실패하면 서버가 저장한 응답 값으로 폼을 채운다', async () => {
      const saved = { ...account, name: '저장된 이름' };
      updateSession.mockRejectedValueOnce(new Error('네트워크 오류'));
      server.use(
        http.put(getHandlerURI('/api/users'), () =>
          HttpResponse.json({ ok: true, message: '', data: saved })
        )
      );
      renderAccount();
      const name = screen.getByLabelText('이름');
      fireEvent.change(name, { target: { value: '새 이름' } });
      fireEvent.click(screen.getByRole('button', { name: '변경 사항 저장' }));

      await waitFor(() => expect(name).toHaveValue(saved.name));
      expect(getSessionMock).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenCalledWith('회원 정보를 수정했습니다.');
    });

    test('저장 요청 중 계정이 바뀌면 이전 계정의 저장 응답을 폼에 적용하지 않는다', async () => {
      const saved = { ...account, name: '저장된 이름' };
      let finishSessionUpdate!: () => void;
      updateSession.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finishSessionUpdate = () => resolve(newSession(saved));
          })
      );
      server.use(
        http.put(getHandlerURI('/api/users'), () =>
          HttpResponse.json({ ok: true, message: '', data: saved })
        )
      );
      const { rerender } = renderAccount();
      const name = screen.getByLabelText('이름');
      fireEvent.change(name, { target: { value: '새 이름' } });
      fireEvent.click(screen.getByRole('button', { name: '변경 사항 저장' }));
      await waitFor(() => expect(updateSession).toHaveBeenCalledWith({}));

      const other = { ...account, id: '2', name: '다른 이름' };
      setSession(other);
      rerender(<Account />);
      finishSessionUpdate();
      await waitFor(() => expect(name).toBeEnabled());
      expect(name).toHaveValue(other.name);
    });

    test('저장에 실패하면 세션을 갱신하지 않고 편집값을 남긴다', async () => {
      server.use(
        http.put(getHandlerURI('/api/users'), () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      renderAccount();
      const name = screen.getByLabelText('이름');
      const submit = screen.getByRole('button', { name: '변경 사항 저장' });
      fireEvent.change(name, { target: { value: '새 이름' } });
      fireEvent.click(submit);

      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith(
          '회원 정보를 수정하지 못했습니다.'
        )
      );
      expect(updateSession).not.toHaveBeenCalled();
      expect(name).toHaveValue('새 이름');
      expect(submit).toBeEnabled();
    });
  });

  describe('회원 탈퇴 테스트', () => {
    beforeEach(() => {
      renderAccount();
    });

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
      expect(signOut).toHaveBeenCalledWith({ redirectTo: '/' });
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
