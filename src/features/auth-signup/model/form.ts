import {
  EmailSchema,
  NameSchema,
  NicknameSchema,
  PasswordSchema,
} from '@entities/auth';
import { z } from 'zod';

const confirmationRequired = '비밀번호 확인을 입력해 주세요.';

/** 회원가입 폼 스키마 — 비밀번호 확인은 폼에서만 쓰고 요청에는 싣지 않는다 */
export const SignUpFormSchema = z
  .object({
    email: EmailSchema,
    name: NameSchema,
    nickname: NicknameSchema,
    password: PasswordSchema,
    passwordConfirmation: z
      .string(confirmationRequired)
      .min(1, confirmationRequired),
  })
  .refine(
    ({ password, passwordConfirmation }) => password === passwordConfirmation,
    {
      path: ['passwordConfirmation'],
      error: '비밀번호가 일치하지 않습니다.',
    }
  );

/** 회원가입 폼 입력값 */
export type SignUpFormInput = z.input<typeof SignUpFormSchema>;

/** 회원가입 폼 기본값 */
export const SIGN_UP_DEFAULT_VALUES: SignUpFormInput = {
  email: '',
  name: '',
  nickname: '',
  password: '',
  passwordConfirmation: '',
};
