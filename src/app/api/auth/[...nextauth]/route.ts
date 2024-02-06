import NextAuth, { NextAuthOptions } from 'next-auth';

const handler = NextAuth({
} as NextAuthOptions);
export { handler as GET, handler as POST };
