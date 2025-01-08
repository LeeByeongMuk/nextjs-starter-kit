import { UserData } from '@domains/auth/_types/api';
import { ApiResponse } from '@shared/types/api';

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
