import { DefaultSession } from 'next-auth';

import { UserData } from '../api/types';

declare module 'next-auth' {
  interface Session {
    user: UserData & DefaultSession['user'];
  }
}
