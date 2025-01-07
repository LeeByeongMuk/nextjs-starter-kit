import { DefaultSession } from 'next-auth';

import { UserData } from '@/app/(auth)/_types/api';

declare module 'next-auth' {
  interface Session {
    user: UserData & DefaultSession['user'];
  }
}
