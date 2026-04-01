import { auth as middleware } from './auth';

export default middleware;

export const config = {
  matcher: ['/post/create', '/post/:path*/update', '/account'],
};
