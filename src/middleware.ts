import { auth as middleware } from '@app/auth/config';

export default middleware;

export const config = {
  matcher: ['/post/create', '/post/:path*/update', '/account'],
};
