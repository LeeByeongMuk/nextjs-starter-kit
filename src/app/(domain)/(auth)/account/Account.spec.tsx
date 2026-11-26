import Account from '@app/(domain)/(auth)/account/page';
import { server } from '@shared/api/mocks/testServer';
import { getQueryClient } from '@shared/api/tanstack-query/client';
import { TOKEN_KEY } from '@shared/config/auth';
import { spyOnToast } from '@shared/lib/testing/toast';
import { documentNavigation, getHandlerURI } from '@shared/lib/url';
import Toaster from '@shared/ui/toast/Toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
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
    render(<Toaster />);
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
      await act(async () => {
        fireEvent.click(submit);
        fireEvent.click(submit);
      });

      await waitFor(() => expect(updateSession).toHaveBeenCalledWith({}));
      expect(save).toHaveBeenCalledTimes(1);
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
      expect(
        await screen.findByText('회원 정보를 수정했습니다.')
      ).toBeInTheDocument();
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
      expect(
        await screen.findByText('회원 정보를 수정했습니다.')
      ).toBeInTheDocument();
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

      expect(
        await screen.findByText('회원 정보를 수정하지 못했습니다.')
      ).toBeInTheDocument();
      expect(updateSession).not.toHaveBeenCalled();
      expect(name).toHaveValue('새 이름');
      expect(submit).toBeEnabled();
    });
  });

  describe('회원 탈퇴 테스트', () => {
    const deleteRequest = jest.fn();
    let view: RenderResult;
    const openDialog = () => {
      fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));
      return screen.getByRole('dialog', { name: '회원 탈퇴' });
    };
    const submitReason = (dialog: HTMLElement, reason: string) => {
      fireEvent.change(within(dialog).getByLabelText('탈퇴 사유'), {
        target: { value: reason },
      });
      fireEvent.click(
        within(dialog).getByRole('button', { name: '회원 탈퇴' })
      );
    };

    beforeEach(() => {
      deleteRequest.mockClear();
      jest.spyOn(documentNavigation, 'assign').mockImplementation(() => {});
      server.use(
        http.delete(getHandlerURI('/api/users'), async ({ request }) => {
          deleteRequest(await request.json());
          return HttpResponse.json({ ok: true, message: 'success' });
        })
      );
      view = renderAccount();
    });

    test('회원 탈퇴 버튼 클릭 시 탈퇴 사유 입력 모달이 뜬다', async () => {
      // when - 회원 탈퇴 버튼 클릭
      const dialog = openDialog();

      // then - 탈퇴 사유 입력 모달이 뜬다
      expect(dialog).toHaveAccessibleDescription(
        '회원 탈퇴를 진행하려면 탈퇴 사유를 입력해 주세요.'
      );
      expect(within(dialog).getByLabelText('탈퇴 사유')).toHaveFocus();
    });

    test('탈퇴 사유를 입력하지 않으면 오류를 알리고 탈퇴를 요청하지 않는다', async () => {
      const dialog = openDialog();
      fireEvent.click(
        within(dialog).getByRole('button', { name: '회원 탈퇴' })
      );

      const reason = within(dialog).getByLabelText('탈퇴 사유');
      await waitFor(() =>
        expect(reason).toHaveAccessibleDescription('탈퇴 사유를 입력해 주세요.')
      );
      expect(dialog).toBeVisible();
      expect(deleteRequest).not.toHaveBeenCalled();
    });

    test('취소하면 입력한 사유를 비우고 탈퇴를 요청하지 않는다', async () => {
      const dialog = openDialog();
      fireEvent.change(within(dialog).getByLabelText('탈퇴 사유'), {
        target: { value: 'reason' },
      });
      fireEvent.click(within(dialog).getByRole('button', { name: '취소' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(deleteRequest).not.toHaveBeenCalled();
      expect(within(openDialog()).getByLabelText('탈퇴 사유')).toHaveValue('');
    });

    test('탈퇴 후 세션을 종료하고 현재 출처의 홈으로 이동한다', async () => {
      const toastCalls = spyOnToast();
      jest
        .mocked(signOut)
        .mockResolvedValueOnce({ url: 'https://auth.example.test/' });

      // when - 탈퇴 사유를 입력하고 탈퇴를 확인
      submitReason(openDialog(), 'reason');

      // then - 로그아웃 처리된다
      expect(
        await screen.findByText('회원 탈퇴가 완료되었습니다.')
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(documentNavigation.assign).toHaveBeenCalledWith('/')
      );
      expect(signOut).toHaveBeenCalledWith({
        redirect: false,
        redirectTo: '/',
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(toastCalls.success).toHaveBeenCalledWith(
        '회원 탈퇴가 완료되었습니다.',
        { survivesNavigation: true }
      );
      expect(deleteRequest).toHaveBeenCalledWith({ deleted_reason: 'reason' });
      expect(deleteCookie).toHaveBeenCalledWith(TOKEN_KEY);
      expect(deleteCookie.mock.invocationCallOrder[0]).toBeLessThan(
        (signOut as jest.Mock).mock.invocationCallOrder[0]
      );
    });

    test('한 번 연 대화상자를 연속 제출해도 한 번만 탈퇴하고 로그아웃한다', async () => {
      const dialog = openDialog();
      const confirm = within(dialog).getByRole('button', { name: '회원 탈퇴' });
      await act(async () => {
        submitReason(dialog, 'reason');
        fireEvent.click(confirm);
      });

      await waitFor(() => expect(signOut).toHaveBeenCalled());
      expect(deleteRequest).toHaveBeenCalledTimes(1);
      expect(signOut).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: '회원 탈퇴' })).toBeDisabled();
    });

    test('탈퇴 뒤 로그아웃이 실패하면 로그아웃을 다시 안내하고 탈퇴를 반복하지 않는다', async () => {
      jest.mocked(signOut).mockRejectedValueOnce(new Error('offline'));
      submitReason(openDialog(), 'reason');

      expect(await screen.findByText(/다시 로그아웃해 주세요/)).toBeVisible();
      expect(screen.queryByText('회원 탈퇴를 완료하지 못했습니다.')).toBeNull();
      expect(documentNavigation.assign).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: '회원 탈퇴' })).toBeDisabled();
      expect(deleteRequest).toHaveBeenCalledTimes(1);
    });

    test('회원 탈퇴 실패 시 에러 메세지가 표시된다.', async () => {
      queryClient.clear();
      server.use(
        http.delete(getHandlerURI('/api/users'), () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      // when - 탈퇴 사유를 입력하고 탈퇴를 확인
      submitReason(openDialog(), 'reason');

      // then - 에러 메세지가 표시되고 입력한 사유로 다시 시도할 수 있다
      expect(
        await screen.findByText('회원 탈퇴를 완료하지 못했습니다.')
      ).toBeInTheDocument();
      expect(signOut).not.toHaveBeenCalled();
      const openButton = screen.getByRole('button', { name: '회원 탈퇴' });
      await waitFor(() => expect(openButton).toBeEnabled());
      expect(openButton).toHaveFocus();
      expect(within(openDialog()).getByLabelText('탈퇴 사유')).toHaveValue(
        'reason'
      );
    });

    test('탈퇴를 요청하는 동안 초점을 다른 곳으로 옮겼으면 실패해도 가져오지 않는다', async () => {
      const deleteStarted = jest.fn();
      let failDelete = () => {};
      server.use(
        http.delete(getHandlerURI('/api/users'), () => {
          deleteStarted();
          return new Promise<HttpResponse<null>>(resolve => {
            failDelete = () => resolve(new HttpResponse(null, { status: 500 }));
          });
        })
      );
      const elsewhere = document.body.appendChild(
        document.createElement('button')
      );

      submitReason(openDialog(), 'reason');
      await waitFor(() => expect(deleteStarted).toHaveBeenCalled());
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      elsewhere.focus();
      failDelete();

      await screen.findByText('회원 탈퇴를 완료하지 못했습니다.');
      await waitFor(() =>
        expect(screen.getByRole('button', { name: '회원 탈퇴' })).toBeEnabled()
      );
      expect(elsewhere).toHaveFocus();
      elsewhere.remove();
    });

    test('실패한 탈퇴 요청의 초점은 한 번만 되돌린다', async () => {
      let finishUpdate = () => {};
      const updateReleased = new Promise<void>(resolve => {
        finishUpdate = resolve;
      });
      updateSession.mockResolvedValue(newSession(account));
      server.use(
        http.delete(
          getHandlerURI('/api/users'),
          () => new HttpResponse(null, { status: 500 })
        ),
        http.put(getHandlerURI('/api/users'), async () => {
          await updateReleased;
          return HttpResponse.json({ data: account });
        })
      );
      const openButton = screen.getByRole('button', { name: '회원 탈퇴' });
      submitReason(openDialog(), 'reason');
      await screen.findByText('회원 탈퇴를 완료하지 못했습니다.');
      await waitFor(() => expect(openButton).toHaveFocus());

      openButton.blur();
      fireEvent.submit(screen.getByRole('button', { name: '변경 사항 저장' }));
      await waitFor(() => expect(openButton).toBeDisabled());
      finishUpdate();

      expect(
        await screen.findByText('회원 정보를 수정했습니다.')
      ).toBeInTheDocument();
      await waitFor(() => expect(openButton).toBeEnabled());
      expect(document.body).toHaveFocus();
    });

    test('대화상자를 연 뒤 다른 계정으로 바뀌면 닫고 입력한 사유를 버린다', async () => {
      const other = { ...account, id: '2', email: 'other@email.com' };
      server.use(
        http.get(getHandlerURI('/api/users'), () =>
          HttpResponse.json({ data: other })
        )
      );
      const openButton = screen.getByRole('button', { name: '회원 탈퇴' });
      openButton.focus();
      fireEvent.change(within(openDialog()).getByLabelText('탈퇴 사유'), {
        target: { value: '이전 계정의 사유' },
      });

      setSession(other);
      view.rerender(<Account />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(openButton).toHaveFocus();
      expect(deleteRequest).not.toHaveBeenCalled();

      const dialog = openDialog();
      expect(within(dialog).getByLabelText('탈퇴 사유')).toHaveValue('');
      submitReason(dialog, '새 계정의 사유');
      await waitFor(() =>
        expect(deleteRequest).toHaveBeenCalledWith({
          deleted_reason: '새 계정의 사유',
        })
      );
      expect(deleteRequest).toHaveBeenCalledTimes(1);
    });

    test('탈퇴를 확인한 직후 다른 계정으로 바뀌면 이전 계정의 확인으로 탈퇴를 요청하지 않는다', async () => {
      const accountRequest = jest.fn();
      server.use(
        http.get(getHandlerURI('/api/users'), () => {
          accountRequest();
          return HttpResponse.json({ data: account });
        })
      );

      submitReason(openDialog(), '이전 계정의 사유');
      setSession({ ...account, id: '2', email: 'other@email.com' });
      view.rerender(<Account />);

      await waitFor(() =>
        expect(screen.getByRole('button', { name: '회원 탈퇴' })).toBeEnabled()
      );
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(accountRequest).not.toHaveBeenCalled();
      expect(deleteRequest).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('대화상자를 연 뒤 세션이 끝나면 닫고, 같은 계정으로 돌아와도 다시 열지 않는다', () => {
      fireEvent.change(within(openDialog()).getByLabelText('탈퇴 사유'), {
        target: { value: 'reason' },
      });

      setMissingSession();
      view.rerender(<Account />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      setSession(account);
      view.rerender(<Account />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(within(openDialog()).getByLabelText('탈퇴 사유')).toHaveValue('');
      expect(deleteRequest).not.toHaveBeenCalled();
    });
  });
});
