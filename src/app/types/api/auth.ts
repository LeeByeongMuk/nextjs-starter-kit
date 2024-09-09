import { ApiResponse } from '@/app/types/api/common';

interface UserData {
  id: string;
  email: string;
  name: string;
  nickname: string;
}

interface UserRes extends ApiResponse {
  data: UserData;
}

interface SignInReq {
  email: string;
  password: string;
}

interface SignInRes extends ApiResponse {
  data: {
    id: number;
    access_token: string;
  };
}

interface SignUpReq {
  email: string;
  name: string;
  nickname: string;
  password: string;
}

interface SignUpRes extends SignInRes {}

interface UpdateAccountReq {
  email: string;
  name: string;
  nickname: string;
}

interface UpdateAccountRes extends ApiResponse {
  data: UserData;
}

interface DeleteAccountReq {
  deleted_reason: string;
}

interface DeleteAccountRes extends ApiResponse {
  data: {
    id: string;
  };
}

export type {
  UserData,
  UserRes,
  SignUpReq,
  SignUpRes,
  SignInReq,
  SignInRes,
  UpdateAccountReq,
  UpdateAccountRes,
  DeleteAccountReq,
  DeleteAccountRes,
};
