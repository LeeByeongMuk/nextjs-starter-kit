import { ApiResponse } from '@shared/api/types';

interface UserData {
  id: string;
  email: string;
  name: string;
  nickname: string;
}

interface UserRes extends ApiResponse {
  data: UserData;
}

export type { UserData, UserRes };
