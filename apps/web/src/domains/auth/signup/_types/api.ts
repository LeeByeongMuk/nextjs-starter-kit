import { ApiResponse } from '@shared/types/api';

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
