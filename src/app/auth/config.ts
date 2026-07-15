// server-only — excluded from @entities/auth barrel to keep client bundle clean
// eslint-disable-next-line boundaries/dependencies
import { fetchUser } from '@entities/auth/api/userServices';
// server-only — excluded from @features/auth-signin barrel to keep client bundle clean
// eslint-disable-next-line boundaries/dependencies
import { fetchSignIn } from '@features/auth-signin/api/signinService';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
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

        const {
          data: { id },
        } = await fetchSignIn({
          email: credentials.email,
          password: credentials.password,
        });
        const user = await fetchUser();

        if (user) {
          return {
            ...user.data,
            id: id.toString(),
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    async jwt({ token, user, trigger }) {
      if (trigger === 'update') {
        const updateUser = await fetchUser();
        return { ...token, ...user, ...updateUser.data };
      }
      return { ...token, ...user };
    },
    async session({ session, token }) {
      const tokenUser = token as Partial<typeof session.user> & {
        emailVerified?: Date | null;
      };
      session.user = {
        ...session.user,
        ...tokenUser,
        emailVerified: tokenUser.emailVerified ?? null,
      };
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
});
