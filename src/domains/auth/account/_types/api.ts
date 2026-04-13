import { UserData } from '@entities/auth/api/types';
import { ApiResponse } from '@shared/api/types';

export interface UpdateAccountReq {
  email: string;
  name: string;
  nickname: string;
}

export interface UpdateAccountRes extends ApiResponse {
  data: UserData;
}

export interface DeleteAccountReq {
  deleted_reason: string;
}

export interface DeleteAccountRes extends ApiResponse {
  data: {
    id: string;
  };
}
