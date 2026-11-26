import { ApiResponseSchema } from '@shared/api/types';
import { z } from 'zod';

const hasText = (value: string) => value.trim() !== '';

/** 로그인 요청 스키마 — 공백뿐인 값은 자격 증명으로 받지 않는다 */
export const SignInReqSchema = z.object({
  email: z.string().refine(hasText),
  password: z.string().refine(hasText),
});

/** 로그인 요청 */
export type SignInReq = z.infer<typeof SignInReqSchema>;

const SignInDataSchema = z.object({
  id: z.int(),
  access_token: z.string().refine(hasText),
});

/**
 * 로그인 응답 스키마 — 회원 식별자와 API 토큰이 모두 있어야 인증 정보로 읽는다.
 * 인증 정보(data)가 있지만 쓸 수 없으면 null로 읽고, 아예 싣지 않은 응답은 형식 오류로 거절한다.
 */
export const SignInResSchema = ApiResponseSchema.extend({
  data: SignInDataSchema.or(z.unknown().transform(() => null)),
});

/** 로그인 응답 */
export type SignInRes = z.infer<typeof SignInResSchema>;
