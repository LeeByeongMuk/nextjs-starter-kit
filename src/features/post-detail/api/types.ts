import { ApiResponseSchema, lenient } from '@shared/api/types';
import { z } from 'zod';

/** 게시글 상세 조회 요청 */
export interface PostReq {
  id: number;
}

/** 게시글 상세 스키마 — 분류와 작성자는 없거나 알 수 없는 값도 받아 화면의 대체 표시에 맡긴다 */
const PostDataSchema = z.object({
  contents: z.string(),
  created_at: z
    .string()
    .nullish()
    .transform(date => date ?? ''),
  hit: lenient(z.number()),
  id: lenient(z.number()),
  is_editable: z.boolean().nullish(),
  title: z.string(),
  type: z.string().nullish(),
  user_name: z.string().nullish(),
});

/** 게시글 상세 */
export type PostData = z.infer<typeof PostDataSchema>;

/** 게시글 상세 조회 응답 스키마 */
export const PostResSchema = ApiResponseSchema.extend({ data: PostDataSchema });

/** 게시글 상세 조회 응답 */
export type PostRes = z.infer<typeof PostResSchema>;
