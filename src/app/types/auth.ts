interface UserData {
  created_at: string;
  email: string;
  id: number;
  name: string;
  nickname: string | null;
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
  nickname?: string | null;
  password: string;
}

interface SignUpRes extends SignInRes {}

export type { UserData, UserRes, SignUpReq, SignUpRes, SignInReq, SignInRes };
