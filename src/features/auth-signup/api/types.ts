import { ApiResponseSchema, lenient } from '@shared/api/types';
import { z } from 'zod';

/** 회원가입 요청 스키마 — 입력 규칙은 폼이 확인하고 서버 액션은 형식만 확인한다 */
export const SignUpReqSchema = z.object({
  email: z.string(),
  name: z.string(),
  nickname: z.string(),
  password: z.string(),
});

/** 회원가입 요청 */
export type SignUpReq = z.infer<typeof SignUpReqSchema>;

/** 회원가입 응답 스키마 — 계정 식별자만 남긴다. 화면이 쓰지 않는 값이라 없어도 가입 결과를 막지 않는다 */
export const SignUpResSchema = ApiResponseSchema.extend({
  data: lenient(z.object({ id: lenient(z.number()) })),
}).default({});

/** 회원가입 응답 */
export type SignUpRes = z.infer<typeof SignUpResSchema>;
