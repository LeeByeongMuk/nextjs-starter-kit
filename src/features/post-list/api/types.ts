import { PostIdSchema, PostTypeSchema } from '@entities/post';
import { PaginationDataSchema } from '@shared/api/pagination';
import { ApiResponseSchema, lenient } from '@shared/api/types';
import { z } from 'zod';

/** 목록 조회 조건 스키마 — 분류를 비우면 전체 글을 조회한다 */
export const PostsReqSchema = z.object({
  page: z.int().positive(),
  type: z.enum(['', ...PostTypeSchema.options]),
  q: z.string(),
});

/** 목록 조회 조건 */
export type PostsReq = z.infer<typeof PostsReqSchema>;

/** 목록의 게시글 스키마 — 분류와 작성자는 없거나 알 수 없는 값도 받아 화면의 대체 표시에 맡긴다 */
const PostListDataSchema = z.object({
  created_at: z
    .string()
    .nullish()
    .transform(date => date ?? ''),
  hit: lenient(z.number()),
  id: PostIdSchema,
  title: z.string(),
  type: z.string().nullish(),
  user: z
    .object({
      id: lenient(z.number()),
      name: z.string().nullish(),
      nickname: lenient(z.string()),
    })
    .nullish(),
});

/** 목록의 게시글 */
export type PostListData = z.infer<typeof PostListDataSchema>;

/** 목록 조회 응답 스키마 */
export const PostsResSchema = ApiResponseSchema.extend({
  ...PaginationDataSchema.shape,
  data: z.array(PostListDataSchema),
});

/** 목록 조회 응답 */
export type PostsRes = z.infer<typeof PostsResSchema>;
