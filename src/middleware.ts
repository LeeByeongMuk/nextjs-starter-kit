// Explicit import required for Next.js 16 Turbopack compatibility
import { withAuth } from 'next-auth/middleware';

export default withAuth;

export const config = {
  matcher: ['/post/create', '/post/:path*/update', '/account'],
};
