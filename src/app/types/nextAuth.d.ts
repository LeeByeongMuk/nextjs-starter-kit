import { DefaultSession } from 'next-auth';

import { UserData } from '@/app/types/api/auth';

declare module 'next-auth' {
  interface Session {
    user: UserData & DefaultSession['user'];
  }
}
