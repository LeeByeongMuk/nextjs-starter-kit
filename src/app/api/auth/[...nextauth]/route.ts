import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

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
        const signInRes = await fetch('http://localhost:80/api/accounts/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials?.email || '',
            password: credentials?.password || '',
          }),
        });
        const data = await signInRes.json();
        const token = data?.data?.access_token;

        const userRes = await fetch('http://localhost:80/api/accounts', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const user = await userRes.json();

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
} as NextAuthOptions);
export { handler as GET, handler as POST };
