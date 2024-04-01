import { DefaultSession } from 'next-auth';

import { UserData } from '@/app/types/auth';

declare module 'next-auth' {
  interface Session {
    user: UserData & DefaultSession['user'];
  }
}
