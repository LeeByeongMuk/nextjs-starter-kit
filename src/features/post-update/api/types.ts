import { type PostBody } from '@entities/post';
import { ApiResponseSchema, lenient } from '@shared/api/types';
import { z } from 'zod';

/** 게시글 수정 요청 — 본문의 형식과 크기는 서버 액션의 getPostRequestBody가 확인한다 */
export interface UpdatePostReq extends PostBody {
  id: number;
}

/** 게시글 수정 응답 스키마 — 화면이 쓰지 않는 식별자라 없어도 수정 결과를 막지 않는다 */
export const UpdatePostResSchema = ApiResponseSchema.extend({
  data: lenient(z.object({ id: lenient(z.number()) })),
}).default({});

/** 게시글 수정 응답 */
export type UpdatePostRes = z.infer<typeof UpdatePostResSchema>;

/** 편집용 게시글 스키마 — 지원하지 않는 이전 분류도 받아 폼에서 다시 고르게 한다 */
const UpdatePostResourceDataSchema = z.object({
  id: lenient(z.number()),
  type: z.string().nullish(),
  title: z.string(),
  contents: z.string(),
  is_open: z.boolean(),
});

/** 편집용 게시글 조회 요청 */
export interface UpdatePostResourceReq {
  id: number;
}

/** 편집용 게시글 조회 응답 스키마 */
export const UpdatePostResourceResSchema = ApiResponseSchema.extend({
  data: UpdatePostResourceDataSchema,
});

/** 편집용 게시글 조회 응답 */
export type UpdatePostResourceRes = z.infer<typeof UpdatePostResourceResSchema>;
