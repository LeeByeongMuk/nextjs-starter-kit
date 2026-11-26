import './config';

import { server } from '@shared/api/mocks/testServer';
import { SESSION_MAX_AGE, TOKEN_KEY } from '@shared/config/auth';
import { fetchApi } from '@shared/lib/api';
import { deleteAccessToken } from '@shared/lib/deleteAccessToken';
import { getHandlerURI } from '@shared/lib/url';
import Header from '@shared/ui/layout/Header';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw/http';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { signOut, useSession } from 'next-auth/react';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('next/navigation', () => ({ usePathname: () => '/post' }));
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));
jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('next-auth/react');

const configureAuth = jest.mocked(NextAuth).mock.calls[0][0] as (
  request?: NextRequest
) => NextAuthConfig;
const config = configureAuth(
  new NextRequest('http://localhost/api/auth/session')
);
const { jwt, session } = config.callbacks!;
const authorize = jest.mocked(Credentials).mock.calls[0][0]!.authorize!;
const signInUrl = getHandlerURI('/api/users/signin');
const userUrl = getHandlerURI('/api/users');
const oldTokenKey = 'access_token';
const credentials = {
  email: 'demo@example.com',
  password: 'DemoPassword1!',
};
const response = {
  ok: true,
  message: 'Demo sign in',
  data: { id: 1, access_token: 'demo-access-token' },
};
const profile = {
  id: 1,
  email: credentials.email,
  name: 'Demo',
  nickname: 'starter',
};
const now = new Date('2026-11-18T03:30:00.000Z');
const expires = new Date(now.getTime() + SESSION_MAX_AGE * 1000);
const signIn = () => authorize(credentials, new Request(signInUrl));

const readJwt = (
  params: {
    token: JWT;
    trigger?: 'update';
    session?: unknown;
  },
  authConfig = config
) =>
  authConfig.callbacks!.jwt!(params as Parameters<NonNullable<typeof jwt>>[0]);

describe('API 토큰 쿠키 생명주기', () => {
  let cookieStore: {
    has: jest.Mock;
    get: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
  };
  let requestBody: unknown;
  let signInAuthorization: string | null;
  let profileAuthorization: string | null;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());
    const values = new Map<string, string>();
    cookieStore = {
      has: jest.fn((key: string) => values.has(key)),
      get: jest.fn((key: string) => {
        const value = values.get(key);
        return value === undefined ? undefined : { value };
      }),
      set: jest.fn((key: string, value: string) => values.set(key, value)),
      delete: jest.fn((key: string) => values.delete(key)),
    };
    (cookies as jest.Mock).mockResolvedValue(cookieStore);
    requestBody = undefined;
    signInAuthorization = null;
    profileAuthorization = null;
    server.use(
      http.post(signInUrl, async ({ request }) => {
        signInAuthorization = request.headers.get('Authorization');
        requestBody = await request.json();
        return HttpResponse.json(response);
      }),
      http.get(userUrl, ({ request }) => {
        profileAuthorization = request.headers.get('Authorization');
        return HttpResponse.json({ ok: true, data: profile });
      })
    );
  });

  test.each([
    ['development', false],
    ['production', true],
  ] as const)(
    '%s 로그인은 환경에 맞는 서버 전용 쿠키를 설정한다',
    async (env, secure) => {
      jest.replaceProperty(process, 'env', { ...process.env, NODE_ENV: env });

      cookieStore.set(oldTokenKey, 'legacy-token');
      cookieStore.set(TOKEN_KEY, 'previous-token');

      await expect(signIn()).resolves.toEqual({
        ...profile,
        id: String(profile.id),
        sessionExpiresAt: expires.getTime(),
      });

      expect(requestBody).toEqual(credentials);
      expect(signInAuthorization).toBeNull();
      expect(profileAuthorization).toBe(response.data.access_token);
      expect(cookieStore.has(oldTokenKey)).toBe(false);
      expect(config.session?.maxAge).toBe(SESSION_MAX_AGE);
      expect(cookieStore.set).toHaveBeenCalledWith(
        TOKEN_KEY,
        response.data.access_token,
        { path: '/', httpOnly: true, sameSite: 'lax', secure, expires }
      );
    }
  );

  test('잘못된 자격 증명은 토큰 쿠키 없이 로그인 실패로 처리한다', async () => {
    server.use(
      http.post(signInUrl, () => new HttpResponse(null, { status: 401 }))
    );

    await expect(signIn()).resolves.toBeNull();

    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  test('로그인 API 오류는 예외를 전달하고 토큰 쿠키를 만들지 않는다', async () => {
    server.use(
      http.post(signInUrl, () => new HttpResponse(null, { status: 503 }))
    );

    await expect(signIn()).rejects.toMatchObject({ status: 503 });

    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  test('로그인 후 회원 조회에 실패하면 새 토큰 쿠키를 만들지 않는다', async () => {
    server.use(
      http.get(userUrl, () => new HttpResponse(null, { status: 500 }))
    );

    await expect(signIn()).rejects.toThrow();

    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  test('JWT를 갱신해도 로그인 시의 만료 시각이 유지되고 세션에는 필요한 값만 포함된다', async () => {
    const user = await signIn();
    const token = await jwt!({
      user: user!,
      trigger: 'signIn',
      token: { sub: user!.id, email: user!.email, name: user!.name },
    });
    expect(token?.sessionExpiresAt).toBe(expires.getTime());

    server.use(
      http.get(userUrl, () =>
        HttpResponse.json({
          ok: true,
          data: { ...profile, nickname: 'updated', access_token: 'unused' },
        })
      )
    );
    jest.spyOn(Date, 'now').mockReturnValue(expires.getTime() - 1);
    const updatedToken = await readJwt({
      token: token!,
      trigger: 'update',
      session: { nickname: 'browser value' },
    });
    const sessionArgs = {
      token: updatedToken,
      session: { expires: '' },
    } as Parameters<NonNullable<typeof session>>[0];

    await expect(session!(sessionArgs)).resolves.toEqual({
      user: { ...profile, id: String(profile.id), nickname: 'updated' },
      expires: expires.toISOString(),
    });
    expect(updatedToken?.sessionExpiresAt).toBe(expires.getTime());

    jest.spyOn(Date, 'now').mockReturnValue(expires.getTime());
    await expect(readJwt({ token: updatedToken! })).resolves.toBeNull();
  });

  test.each(['HTTP 503', '네트워크 오류'])(
    '프로필 조회 %s 시 세션을 유지하고 다음 세션 요청에서 서버 프로필을 다시 읽는다',
    async failure => {
      const profileRequest = jest.fn();
      const token = {
        sub: String(profile.id),
        name: profile.name,
        email: profile.email,
        nickname: profile.nickname,
        sessionExpiresAt: expires.getTime(),
      };
      cookieStore.set(TOKEN_KEY, 'test-token');
      server.use(
        http.get(userUrl, () => {
          profileRequest();
          return failure === 'HTTP 503'
            ? new HttpResponse(null, { status: 503 })
            : HttpResponse.error();
        })
      );

      const pendingToken = await readJwt({ token, trigger: 'update' });
      expect(pendingToken).toEqual({ ...token, profileRefreshPending: true });
      expect(cookieStore.delete).not.toHaveBeenCalled();

      const sessionArgs = {
        token: pendingToken,
        session: { expires: '' },
      } as Parameters<NonNullable<typeof session>>[0];
      await expect(session!(sessionArgs)).resolves.toEqual({
        user: { ...profile, id: String(profile.id) },
        expires: expires.toISOString(),
      });

      for (const request of [
        undefined,
        new NextRequest('http://localhost/account'),
      ]) {
        await expect(
          readJwt({ token: pendingToken! }, configureAuth(request))
        ).resolves.toEqual(pendingToken);
      }
      expect(profileRequest).toHaveBeenCalledTimes(1);

      server.use(
        http.get(userUrl, () =>
          HttpResponse.json({
            ok: true,
            data: { ...profile, nickname: 'updated' },
          })
        )
      );
      const refreshedToken = await readJwt({ token: pendingToken! });
      expect(refreshedToken).toEqual({ ...token, nickname: 'updated' });
      expect(refreshedToken?.profileRefreshPending).toBeUndefined();
      expect(cookieStore.has(TOKEN_KEY)).toBe(true);
    }
  );

  test.each([
    [401, 'update'],
    [403, undefined],
  ] as const)(
    '프로필 조회에서 %s가 반환되면 세션을 종료하고 API 쿠키를 제거한다',
    async (status, trigger) => {
      cookieStore.set(TOKEN_KEY, 'test-token');
      server.use(http.get(userUrl, () => new HttpResponse(null, { status })));

      await expect(
        readJwt({
          trigger,
          token: {
            sub: String(profile.id),
            sessionExpiresAt: expires.getTime(),
            profileRefreshPending: trigger === undefined,
          },
        })
      ).resolves.toBeNull();
      expect(cookieStore.has(TOKEN_KEY)).toBe(false);
    }
  );

  test('API 쿠키가 누락되거나 만료 정보가 없는 세션은 로그인 상태로 제공하지 않는다', async () => {
    const token = {
      sub: String(profile.id),
      sessionExpiresAt: expires.getTime(),
    };
    await expect(readJwt({ token })).resolves.toBeNull();

    cookieStore.set(TOKEN_KEY, 'test-token');
    await expect(readJwt({ token: { sub: token.sub } })).resolves.toBeNull();
  });

  test('서버에서 로그아웃한 뒤 API 요청에 이전 토큰을 전달하지 않는다', async () => {
    const authorizationHeaders: (string | null)[] = [];
    server.use(
      http.get(userUrl, ({ request }) => {
        authorizationHeaders.push(request.headers.get('Authorization'));
        return HttpResponse.json({ ok: true, data: profile });
      })
    );

    await signIn();
    await fetchApi('/api/users');
    await deleteAccessToken();
    cookieStore.set(oldTokenKey, 'legacy-token');
    await fetchApi('/api/users');

    expect(cookieStore.delete).toHaveBeenCalledWith(TOKEN_KEY);
    expect(authorizationHeaders).toEqual([
      response.data.access_token,
      response.data.access_token,
      null,
    ]);
  });

  test('토큰이 없는 로그아웃도 안전하게 처리한다', async () => {
    await expect(deleteAccessToken()).resolves.toBeUndefined();
    expect(cookieStore.has(TOKEN_KEY)).toBe(false);
  });

  test('헤더 로그아웃은 Auth.js 이벤트 없이도 API 토큰을 먼저 삭제한다', async () => {
    await signIn();
    (useSession as jest.Mock).mockReturnValue({ status: 'authenticated' });
    (signOut as jest.Mock).mockImplementation(async () => {
      expect(cookieStore.has(TOKEN_KEY)).toBe(false);
    });
    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));

    await waitFor(() => expect(signOut).toHaveBeenCalled());
    expect(cookieStore.delete).toHaveBeenCalledWith(TOKEN_KEY);
  });
});
