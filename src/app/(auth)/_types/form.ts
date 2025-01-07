interface SignUpInput {
  email: string;
  name: string;
  nickname: string;
  password: string;
  passwordConfirmation: string;
}

interface SignInInput {
  email: string;
  password: string;
}

interface UserUpdateInput {
  email: string;
  name: string;
  nickname: string;
}

export type { SignUpInput, SignInInput, UserUpdateInput };
