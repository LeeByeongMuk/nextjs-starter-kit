import { ApiResponse } from '@shared/types/api';

export interface SignInReq {
  email: string;
  password: string;
}

export interface SignInRes extends ApiResponse {
  data: {
    id: number;
    access_token: string;
  };
}
