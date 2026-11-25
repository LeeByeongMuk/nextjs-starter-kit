import { server } from '@shared/api/mocks/testServer';
import { TOKEN_KEY } from '@shared/config/auth';
import { getHandlerURI } from '@shared/lib/url';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';

import { fetchDeleteAccount, fetchUpdateAccount } from './accountService';
import { type DeleteAccountReq, type UpdateAccountReq } from './types';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));

const profile = {
  email: 'test@email.com',
  name: 'name',
  nickname: 'nickname',
};

describe('계정 서버 액션', () => {
  const request = jest.fn();

  beforeEach(() => {
    request.mockClear();
    jest.mocked(cookies).mockResolvedValue({
      get: (key: string) =>
        key === TOKEN_KEY ? { name: key, value: 'test-token' } : undefined,
    } as Awaited<ReturnType<typeof cookies>>);
    server.use(
      http.put(getHandlerURI('/api/users'), async ({ request: req }) => {
        request(await req.json());
        return HttpResponse.json({
          ok: true,
          message: 'success',
          data: { id: 1, ...profile, access_token: 'unused' },
        });
      }),
      http.delete(getHandlerURI('/api/users'), async ({ request: req }) => {
        request(
          await req.json(),
          new URL(req.url).searchParams.get('deleted_reason')
        );
        return HttpResponse.json({
          ok: true,
          message: 'success',
          data: { ok: true },
        });
      })
    );
  });

  test('프로필 수정은 허용된 필드만 전송하고 문자열 식별자와 공개 필드만 전달한다', async () => {
    const input = { ...profile, role: 'admin' };

    await expect(fetchUpdateAccount(input)).resolves.toEqual({
      ok: true,
      message: 'success',
      data: { id: '1', ...profile },
    });
    expect(request).toHaveBeenCalledWith(profile);
  });

  test('닉네임이 비어 있는 응답은 빈 문자열로 전달한다', async () => {
    server.use(
      http.put(getHandlerURI('/api/users'), () =>
        HttpResponse.json({ data: { id: 1, ...profile, nickname: null } })
      )
    );

    await expect(fetchUpdateAccount(profile)).resolves.toEqual({
      data: { id: '1', ...profile, nickname: '' },
    });
  });

  test.each([
    ['입력 없음', undefined],
    ['문자열이 아닌 이름', { ...profile, name: 1 }],
  ])(
    '형식이 맞지 않는 프로필(%s)은 API 요청 전에 거절한다',
    async (_, input) => {
      await expect(
        fetchUpdateAccount(input as unknown as UpdateAccountReq)
      ).rejects.toThrow('회원 정보 입력을 확인해 주세요.');
      expect(request).not.toHaveBeenCalled();
    }
  );

  test('회원 탈퇴는 확인한 계정으로 로그인되어 있으면 사유만 전송하고 응답의 공통 필드만 전달한다', async () => {
    await expect(
      fetchDeleteAccount({ deleted_reason: '탈퇴 사유', user_id: '1' })
    ).resolves.toEqual({ ok: true, message: 'success' });
    expect(request).toHaveBeenCalledWith(
      { deleted_reason: '탈퇴 사유' },
      '탈퇴 사유'
    );
  });

  test('탈퇴를 확인한 계정과 로그인한 계정이 다르면 탈퇴를 요청하지 않는다', async () => {
    await expect(
      fetchDeleteAccount({ deleted_reason: '탈퇴 사유', user_id: '2' })
    ).rejects.toThrow('탈퇴를 확인한 계정으로 로그인되어 있지 않습니다.');
    expect(request).not.toHaveBeenCalled();
  });

  test.each([
    ['입력 없음', undefined],
    ['문자열이 아닌 사유', { deleted_reason: null, user_id: '1' }],
    ['확인한 계정 누락', { deleted_reason: '탈퇴 사유' }],
  ])(
    '형식이 맞지 않는 탈퇴 사유(%s)는 API 요청 전에 거절한다',
    async (_, input) => {
      await expect(
        fetchDeleteAccount(input as unknown as DeleteAccountReq)
      ).rejects.toThrow('회원 탈퇴 사유를 확인해 주세요.');
      expect(request).not.toHaveBeenCalled();
    }
  );
});
