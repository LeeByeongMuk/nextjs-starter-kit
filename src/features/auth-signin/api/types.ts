import { ApiResponse } from '@shared/api/types';

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
