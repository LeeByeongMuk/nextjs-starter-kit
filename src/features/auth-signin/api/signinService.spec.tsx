import { server } from '@shared/api/mocks/testServer';
import { getHandlerURI } from '@shared/lib/url';
import { http, HttpResponse } from 'msw';
import { ZodError } from 'zod';

import { fetchSignIn } from './signinService';

const credentials = {
  email: 'demo@example.com',
  password: ' DemoPassword1! ',
};
const signInData = { id: 1, access_token: 'demo-access-token' };

describe('로그인 API 호출', () => {
  const request = jest.fn();
  const respond = jest.fn();

  beforeEach(() => {
    request.mockClear();
    respond.mockReset().mockImplementation(() =>
      HttpResponse.json({
        ok: true,
        message: 'success',
        data: { ...signInData, extra: true },
      })
    );
    server.use(
      http.post(
        getHandlerURI('/api/users/signin'),
        async ({ request: req }) => {
          request(await req.json());
          return respond();
        }
      )
    );
  });

  test('입력한 자격 증명만 그대로 전송하고 회원 식별자와 API 토큰을 반환한다', async () => {
    await expect(
      fetchSignIn({ ...credentials, csrfToken: 'csrf', callbackUrl: '/' })
    ).resolves.toEqual(signInData);
    expect(request).toHaveBeenCalledWith(credentials);
  });

  test.each([
    ['입력 없음', undefined],
    ['이메일 누락', { password: credentials.password }],
    ['공백뿐인 이메일', { ...credentials, email: '  ' }],
    ['문자열이 아닌 비밀번호', { ...credentials, password: 12345678 }],
  ])(
    '자격 증명 형식이 맞지 않으면(%s) API를 호출하지 않고 로그인 실패로 처리한다',
    async (_, input) => {
      await expect(fetchSignIn(input)).resolves.toBeNull();
      expect(request).not.toHaveBeenCalled();
    }
  );

  test.each([
    ['비어 있는 인증 정보', { ok: true, data: null }],
    ['토큰 누락', { ok: true, data: { id: 1 } }],
    ['공백뿐인 토큰', { ok: true, data: { id: 1, access_token: ' ' } }],
    [
      '정수가 아닌 식별자',
      { ok: true, data: { id: 1.5, access_token: 'demo-access-token' } },
    ],
  ])(
    '응답의 인증 정보로 로그인할 수 없으면(%s) 로그인 실패로 처리한다',
    async (_, body) => {
      respond.mockImplementation(() => HttpResponse.json(body));

      await expect(fetchSignIn(credentials)).resolves.toBeNull();
    }
  );

  test.each([
    ['인증 정보 누락', { ok: true }],
    ['본문 없음', null],
  ])(
    '응답이 인증 정보를 싣지 않으면(%s) 로그인 실패가 아닌 형식 오류로 전달한다',
    async (_, body) => {
      respond.mockImplementation(() => HttpResponse.json(body));

      await expect(fetchSignIn(credentials)).rejects.toBeInstanceOf(ZodError);
    }
  );
});
