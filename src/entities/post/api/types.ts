import { ApiResponseSchema } from '@shared/api/types';
import { z } from 'zod';

import { PostTypeSchema } from '../model/types';

/** 게시글 식별자 스키마 — 1 이상의 안전한 정수만 받는다 */
export const PostIdSchema = z.int().positive();

/** 게시글 등록·수정 요청 본문 스키마 — 분류를 고르지 않은 글은 빈 값이나 null로 받는다 */
export const PostBodySchema = z.object({
  title: z.string(),
  type: z.union([PostTypeSchema, z.literal('')]).nullish(),
  contents: z.string(),
  is_open: z.boolean(),
});

/** 게시글 등록·수정 요청 본문 */
export type PostBody = z.infer<typeof PostBodySchema>;

/** 게시글 삭제 요청 */
export interface DeletePostReq {
  id: number;
}

/** 게시글 삭제 응답 스키마 */
export const DeletePostResSchema = ApiResponseSchema.default({});

/** 게시글 삭제 응답 */
export type DeletePostRes = z.infer<typeof DeletePostResSchema>;
