export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/post/create', '/post/:path*/update', '/account'],
};
