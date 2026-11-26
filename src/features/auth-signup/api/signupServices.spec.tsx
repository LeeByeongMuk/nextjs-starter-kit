import { server } from '@shared/api/mocks/testServer';
import { getHandlerURI } from '@shared/lib/url';
import { http, HttpResponse } from 'msw/http';

import { fetchSignUp } from './signupServices';
import { type SignUpReq } from './types';

const account = {
  email: 'test@email.com',
  name: 'name',
  nickname: 'nickname',
  password: 'Password11!!',
};

describe('회원가입 서버 액션', () => {
  const request = jest.fn();

  beforeEach(() => {
    request.mockClear();
    server.use(
      http.post(
        getHandlerURI('/api/users/signup'),
        async ({ request: req }) => {
          request(await req.json());
          return HttpResponse.json({
            ok: true,
            message: 'success',
            data: { id: 1, access_token: 'mockaccesstoken0000' },
          });
        }
      )
    );
  });

  test('허용된 필드만 전송하고 응답에서 계정 식별자만 전달한다', async () => {
    const input = { ...account, passwordConfirmation: account.password };

    await expect(fetchSignUp(input)).resolves.toEqual({
      ok: true,
      message: 'success',
      data: { id: 1 },
    });
    expect(request).toHaveBeenCalledWith(account);
  });

  test.each([
    ['식별자 없는 계정 정보', { data: {} }],
    ['빈 본문', {}],
  ])(
    '응답(%s)이 식별자를 싣지 않아도 가입 결과를 실패로 만들지 않는다',
    async (_, body) => {
      server.use(
        http.post(getHandlerURI('/api/users/signup'), () =>
          HttpResponse.json(body)
        )
      );

      await expect(fetchSignUp(account)).resolves.toEqual(body);
    }
  );

  test.each([
    ['입력 없음', undefined],
    ['닉네임 누락', { ...account, nickname: undefined }],
    ['문자열이 아닌 비밀번호', { ...account, password: 12345678 }],
  ])('형식이 맞지 않는 입력(%s)은 API 요청 전에 거절한다', async (_, input) => {
    await expect(fetchSignUp(input as unknown as SignUpReq)).rejects.toThrow(
      '회원가입 입력을 확인해 주세요.'
    );
    expect(request).not.toHaveBeenCalled();
  });
});
