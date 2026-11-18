// server-only — excluded from @entities/auth barrel to keep client bundle clean
// eslint-disable-next-line boundaries/dependencies
import { fetchUser } from '@entities/auth/api/userServices';
// server-only — excluded from @features/auth-signin barrel to keep client bundle clean
// eslint-disable-next-line boundaries/dependencies
import { fetchSignIn } from '@features/auth-signin/api/signinService';
import { SESSION_MAX_AGE } from '@shared/config/auth';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@shared/lib/accessToken';
import { ApiError } from '@shared/lib/api';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

/** Auth.js 요청과 앱의 로그인, 로그아웃, 세션 확인을 연결한다. */
export const { handlers, signIn, signOut, auth } = NextAuth(request => ({
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE,
  },
  events: {
    signOut: clearAccessToken,
  },
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'your@mail.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          typeof credentials?.email !== 'string' ||
          typeof credentials?.password !== 'string' ||
          !credentials.email.trim() ||
          !credentials.password.trim()
        ) {
          return null;
        }

        const signInData = await fetchSignIn({
          email: credentials.email,
          password: credentials.password,
        });
        if (signInData === null) return null;

        const { id, access_token: accessToken } = signInData;
        if (
          !Number.isSafeInteger(id) ||
          typeof accessToken !== 'string' ||
          !accessToken.trim()
        ) {
          return null;
        }

        const {
          data: { email, name, nickname },
        } = await fetchUser(accessToken);
        const sessionExpiresAt =
          (Math.floor(Date.now() / 1000) + SESSION_MAX_AGE) * 1000;
        await setAccessToken(accessToken, sessionExpiresAt);

        return { id: String(id), email, name, nickname, sessionExpiresAt };
      },
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        return {
          ...token,
          nickname: user.nickname,
          sessionExpiresAt: user.sessionExpiresAt,
        };
      }

      if (
        typeof token.sessionExpiresAt !== 'number' ||
        token.sessionExpiresAt <= Date.now() ||
        !(await getAccessToken())
      ) {
        return null;
      }

      if (
        trigger !== 'update' &&
        (request?.nextUrl.pathname !== '/api/auth/session' ||
          token.profileRefreshPending !== true)
      ) {
        return token;
      }

      try {
        const {
          data: { email, name, nickname },
        } = await fetchUser();
        return {
          ...token,
          email,
          name,
          nickname,
          profileRefreshPending: undefined,
        };
      } catch (error) {
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          await clearAccessToken();
          return null;
        }
        return { ...token, profileRefreshPending: true };
      }
    },
    async session({ session, token }) {
      return {
        user: {
          id: token.sub ?? '',
          email: token.email ?? '',
          name: token.name ?? '',
          nickname: typeof token.nickname === 'string' ? token.nickname : '',
        },
        expires:
          typeof token.sessionExpiresAt === 'number'
            ? new Date(token.sessionExpiresAt).toISOString()
            : session.expires,
      };
    },
  },
  pages: {
    signIn: '/signin',
  },
}));
