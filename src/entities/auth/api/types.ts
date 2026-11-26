import { ApiResponseSchema } from '@shared/api/types';
import { z } from 'zod';

/** 회원 프로필 스키마 — 숫자로 온 식별자는 문자열로, 비어 있는 닉네임은 빈 문자열로 맞춘다 */
export const UserDataSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(id => String(id)),
  email: z.string(),
  name: z.string(),
  nickname: z
    .string()
    .nullish()
    .transform(nickname => nickname ?? ''),
});

/** 회원 프로필 */
export type UserData = z.infer<typeof UserDataSchema>;

/** 회원 조회 응답 스키마 */
export const UserResSchema = ApiResponseSchema.extend({ data: UserDataSchema });

/** 회원 조회 응답 */
export type UserRes = z.infer<typeof UserResSchema>;
