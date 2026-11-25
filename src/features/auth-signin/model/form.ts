import { EmailSchema, PasswordSchema } from '@entities/auth';
import { z } from 'zod';

/** 로그인 폼 스키마 — 가입할 때와 같은 이메일·비밀번호 규칙으로 확인한다 */
export const SignInFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

/** 로그인 폼 입력값 */
export type SignInFormInput = z.input<typeof SignInFormSchema>;

/** 로그인 폼 기본값 */
export const SIGN_IN_DEFAULT_VALUES: SignInFormInput = {
  email: '',
  password: '',
};
