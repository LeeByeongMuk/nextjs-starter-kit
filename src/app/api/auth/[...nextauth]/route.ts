import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { fetchSignIn, fetchUser } from '@/app/api/auth';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
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
        await fetchSignIn({
          email: credentials?.email || '',
          password: credentials?.password || '',
        });
        const user = await fetchUser();

        if (user) {
          return user.data;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },

    async session({ session, token }) {
      session.user = token as never;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  }
} as NextAuthOptions);
export { handler as GET, handler as POST };
