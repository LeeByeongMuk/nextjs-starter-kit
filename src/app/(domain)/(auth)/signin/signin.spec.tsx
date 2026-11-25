import SignIn from '@app/(domain)/(auth)/signin/page';
import { server } from '@shared/api/mocks/testServer';
import { documentNavigation } from '@shared/lib/url';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

const origin = window.location.origin;
const authOrigin = 'https://auth.example';
const credentials = {
  email: 'test@email.com',
  password: 'Password11!!',
};
const csrfToken = 'test-csrf-token';
const requestError = '로그인 요청을 완료하지 못했습니다. 다시 시도해 주세요.';
const credentialsError =
  '로그인하지 못했습니다. 이메일과 비밀번호를 확인해 주세요.';

function fillCredentials() {
  fireEvent.change(screen.getByLabelText('이메일'), {
    target: { value: credentials.email },
  });
  fireEvent.change(screen.getByLabelText('비밀번호'), {
    target: { value: credentials.password },
  });
  return screen.getByRole('button', { name: '로그인' });
}

const signInResponse = (url: string) => HttpResponse.json({ url });

describe('이메일 로그인', () => {
  let navigate: jest.SpiedFunction<typeof documentNavigation.assign>;
  const csrf = jest.fn();
  const callback = jest.fn();
  const respondToCsrf = jest.fn();
  const respondToCallback = jest.fn();

  beforeEach(() => {
    window.history.replaceState(null, '', '/signin');
    navigate = jest
      .spyOn(documentNavigation, 'assign')
      .mockImplementation(() => {});
    csrf.mockReset();
    callback.mockReset();
    respondToCsrf
      .mockReset()
      .mockImplementation(() => HttpResponse.json({ csrfToken }));
    respondToCallback
      .mockReset()
      .mockImplementation(() => signInResponse(`${origin}/`));
    server.use(
      http.get(`${origin}/api/auth/csrf`, ({ request }) => {
        csrf(request.credentials);
        return respondToCsrf();
      }),
      http.post(
        `${origin}/api/auth/callback/credentials`,
        async ({ request }) => {
          callback({
            credentials: request.credentials,
            contentType: request.headers.get('Content-Type'),
            returnRedirect: request.headers.get('X-Auth-Return-Redirect'),
            body: Object.fromEntries(new URLSearchParams(await request.text())),
          });
          return respondToCallback();
        }
      )
    );
  });

  test.each([
    [origin, null, `${origin}/`],
    [authOrigin, null, `${origin}/`],
    [
      authOrigin,
      '/account?error=example&section=profile#name',
      `${origin}/account?error=example&section=profile#name`,
    ],
    [
      origin,
      `${origin}/post/12/update?section=body#editor`,
      `${origin}/post/12/update?section=body#editor`,
    ],
    [authOrigin, 'https://outside.example/account', `${origin}/`],
    [authOrigin, `${authOrigin}/account`, `${origin}/`],
  ])(
    'Auth.js 응답 호스트가 %s일 때 검증한 복귀 주소로 이동한다 (%s)',
    async (responseOrigin, returnTo, href) => {
      respondToCallback.mockReturnValueOnce(
        signInResponse(`${responseOrigin}/`)
      );
      if (returnTo !== null) {
        window.history.replaceState(
          null,
          '',
          `/signin?${new URLSearchParams({ callbackUrl: returnTo })}`
        );
      }
      render(<SignIn />);
      expect(screen.getByRole('heading', { name: '로그인' })).toBeVisible();
      const submit = fillCredentials();
      fireEvent.click(submit);

      await waitFor(() => expect(navigate).toHaveBeenCalledWith(href));
      expect(csrf).toHaveBeenCalledWith('same-origin');
      expect(callback).toHaveBeenCalledWith({
        credentials: 'same-origin',
        contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
        returnRedirect: '1',
        body: { ...credentials, csrfToken, callbackUrl: '/' },
      });
      expect(window.alert).not.toHaveBeenCalled();
    }
  );

  test('진행 중과 성공 직후 문서가 바뀌기 전에는 다시 제출할 수 없다', async () => {
    let complete!: () => void;
    respondToCallback.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          complete = () => resolve(signInResponse(`${origin}/`));
        })
    );
    render(<SignIn />);
    const submit = fillCredentials();
    const form = submit.closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('status')).toBeVisible();
    expect(submit).toBeDisabled();
    complete();

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(submit).toBeDisabled();
    expect(form).toHaveAttribute('aria-busy', 'true');
    fireEvent.submit(form);
    expect(csrf).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['CSRF 연결 오류', 'csrf', () => HttpResponse.error()],
    ['CSRF HTTP 오류', 'csrf', () => new HttpResponse(null, { status: 503 })],
    ['콜백 연결 오류', 'callback', () => HttpResponse.error()],
    [
      '콜백 HTTP 오류',
      'callback',
      () => new HttpResponse(null, { status: 503 }),
    ],
    [
      '콜백 서버 오류 응답',
      'callback',
      () => signInResponse(`${origin}/api/auth/error?error=Configuration`),
    ],
    [
      '콜백의 예상 밖 경로',
      'callback',
      () => signInResponse(`${authOrigin}/account`),
    ],
    [
      '콜백의 예상 밖 프로토콜',
      'callback',
      () => signInResponse('ftp://auth.example/'),
    ],
    [
      '콜백 루트의 오류 파라미터',
      'callback',
      () => signInResponse(`${authOrigin}/?error=Configuration`),
    ],
  ])(
    '%s 뒤에 주소와 입력을 유지하고 재시도할 수 있다',
    async (_, stage, respond) => {
      const request = stage === 'csrf' ? respondToCsrf : respondToCallback;
      request.mockImplementationOnce(respond);
      render(<SignIn />);
      const submit = fillCredentials();
      fireEvent.click(submit);

      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith(requestError)
      );
      expect(window.location.pathname).toBe('/signin');
      expect(navigate).not.toHaveBeenCalled();
      expect(screen.getByLabelText('이메일')).toHaveValue(credentials.email);
      expect(screen.getByLabelText('비밀번호')).toHaveValue(
        credentials.password
      );
      expect(submit).toBeEnabled();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(callback).toHaveBeenCalledTimes(stage === 'csrf' ? 0 : 1);

      fireEvent.click(submit);
      await waitFor(() => expect(navigate).toHaveBeenCalledWith(`${origin}/`));
      expect(csrf).toHaveBeenCalledTimes(2);
    }
  );

  test.each([origin, authOrigin])(
    'HTTP 200 응답(%s)에 자격 증명 오류가 있으면 입력을 보존하고 다시 제출할 수 있다',
    async responseOrigin => {
      respondToCallback.mockReturnValueOnce(
        signInResponse(
          `${responseOrigin}/signin?error=CredentialsSignin&code=credentials`
        )
      );
      render(<SignIn />);
      const submit = fillCredentials();
      fireEvent.click(submit);

      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith(credentialsError)
      );
      expect(navigate).not.toHaveBeenCalled();
      expect(screen.getByLabelText('이메일')).toHaveValue(credentials.email);
      expect(submit).toBeEnabled();

      fireEvent.click(submit);
      await waitFor(() => expect(navigate).toHaveBeenCalledWith(`${origin}/`));
    }
  );

  test('입력 검증 실패 후 오류 필드에 초점을 두고 다시 제출할 수 있다', async () => {
    render(<SignIn />);
    const submit = screen.getByRole('button', { name: '로그인' });
    fireEvent.click(submit);

    expect(await screen.findByText('이메일을 입력해 주세요.')).toBeVisible();
    expect(screen.getByLabelText('이메일')).toHaveFocus();
    expect(submit).toBeEnabled();
    expect(csrf).not.toHaveBeenCalled();

    fillCredentials();
    fireEvent.click(submit);
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(`${origin}/`));
  });
});
