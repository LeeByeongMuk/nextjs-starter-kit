import { auth as proxy } from '@app/auth/config';

export default proxy;

export const config = {
  matcher: ['/post/create', '/post/:path*/update', '/account'],
};
