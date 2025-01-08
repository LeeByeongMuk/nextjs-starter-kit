import { ApiResponse } from '@shared/types/api';

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
