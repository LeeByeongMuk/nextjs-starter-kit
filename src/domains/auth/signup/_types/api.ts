import { ApiResponse } from '@shared/api/types';

export interface SignUpReq {
  email: string;
  name: string;
  nickname: string;
  password: string;
}

export interface SignUpRes extends ApiResponse {
  data: {
    id: number;
    access_token: string;
  };
}
