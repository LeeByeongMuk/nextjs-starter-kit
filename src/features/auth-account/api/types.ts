import { UserDataSchema } from '@entities/auth';
import { ApiResponseSchema } from '@shared/api/types';
import { z } from 'zod';

/** 회원 정보 수정 요청 스키마 — 입력 규칙은 폼이 확인하고 서버 액션은 형식만 확인한다 */
export const UpdateAccountReqSchema = z.object({
  email: z.string(),
  name: z.string(),
  nickname: z.string(),
});

/** 회원 정보 수정 요청 */
export type UpdateAccountReq = z.infer<typeof UpdateAccountReqSchema>;

/** 회원 정보 수정 응답 스키마 */
export const UpdateAccountResSchema = ApiResponseSchema.extend({
  data: UserDataSchema,
});

/** 회원 정보 수정 응답 */
export type UpdateAccountRes = z.infer<typeof UpdateAccountResSchema>;

/** 회원 탈퇴 요청 스키마 */
export const DeleteAccountReqSchema = z.object({
  deleted_reason: z.string(),
});

/** 회원 탈퇴 요청 */
export type DeleteAccountReq = z.infer<typeof DeleteAccountReqSchema>;

/** 회원 탈퇴 응답 스키마 */
export const DeleteAccountResSchema = ApiResponseSchema;

/** 회원 탈퇴 응답 */
export type DeleteAccountRes = z.infer<typeof DeleteAccountResSchema>;
