import { EmailSchema, NameSchema, NicknameSchema } from '@entities/auth';
import { z } from 'zod';

/** 회원 정보 수정 폼 스키마 — 가입할 때와 같은 입력 규칙으로 확인한다 */
export const AccountFormSchema = z.object({
  email: EmailSchema,
  name: NameSchema,
  nickname: NicknameSchema,
});

/** 회원 정보 수정 폼 입력값 */
export type AccountFormInput = z.input<typeof AccountFormSchema>;
