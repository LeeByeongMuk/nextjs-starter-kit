import { server } from '@shared/api/mocks/testServer';
import { TOKEN_KEY } from '@shared/config/auth';
import { deleteAccessToken, fetchApi } from '@shared/lib/api';
import { getHandlerURI } from '@shared/lib/url';
import Header from '@shared/ui/layout/Header';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { signOut, useSession } from 'next-auth/react';

import { fetchSignIn } from './signinService';
import { SignInRes } from './types';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('next/navigation', () => ({ usePathname: () => '/post' }));
jest.mock('next-auth/react');

const signInUrl = getHandlerURI('/api/users/signin');
const userUrl = getHandlerURI('/api/users');
const credentials = {
  email: 'demo@example.com',
  password: 'DemoPassword1!',
};
const response: SignInRes = {
  ok: true,
  message: 'Demo sign in',
  data: { id: 1, access_token: 'demo-access-token' },
};

describe('API 토큰 쿠키 생명주기', () => {
  let cookieStore: {
    has: jest.Mock;
    get: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
  };
  let requestBody: unknown;

  beforeEach(() => {
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
    server.use(
      http.post(signInUrl, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(response);
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

      await expect(fetchSignIn(credentials)).resolves.toEqual(response);

      expect(requestBody).toEqual(credentials);
      expect(cookieStore.set).toHaveBeenCalledWith(
        TOKEN_KEY,
        response.data.access_token,
        { path: '/', httpOnly: true, sameSite: 'lax', secure }
      );
    }
  );

  test('로그인 실패 시 토큰 쿠키를 만들지 않는다', async () => {
    server.use(
      http.post(signInUrl, () => new HttpResponse(null, { status: 401 }))
    );

    await expect(fetchSignIn(credentials)).rejects.toThrow();

    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  test('서버에서 로그아웃한 뒤 API 요청에 이전 토큰을 전달하지 않는다', async () => {
    const authorizationHeaders: (string | null)[] = [];
    server.use(
      http.get(userUrl, ({ request }) => {
        authorizationHeaders.push(request.headers.get('Authorization'));
        return HttpResponse.json({ ok: true });
      })
    );

    await fetchSignIn(credentials);
    await fetchApi('/api/users');
    await deleteAccessToken();
    await fetchApi('/api/users');

    expect(cookieStore.delete).toHaveBeenCalledWith(TOKEN_KEY);
    expect(authorizationHeaders).toEqual([response.data.access_token, '']);
  });

  test('토큰이 없는 로그아웃도 안전하게 처리한다', async () => {
    await expect(deleteAccessToken()).resolves.toBeUndefined();
    expect(cookieStore.has(TOKEN_KEY)).toBe(false);
  });

  test('헤더 로그아웃은 Auth.js 이벤트 없이도 API 토큰을 먼저 삭제한다', async () => {
    await fetchSignIn(credentials);
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
