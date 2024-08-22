interface UserData {
  created_at: string;
  email: string;
  name: string;
  nickname: string;
  phone: string | null;
  provider: string | null;
}

interface UserRes {
  data: UserData;
}

interface SignInReq {
  email: string;
  password: string;
}

interface SignInRes {
  data: {
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

interface UpdateAccountRes {
  data: {
    id: string;
    message: string;
  };
}

interface DeleteAccountReq {
  deleted_reason: string;
}

interface DeleteAccountRes extends UpdateAccountRes {}

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
