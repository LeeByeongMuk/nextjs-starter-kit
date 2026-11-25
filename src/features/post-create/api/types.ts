import { type PostBody, PostIdSchema } from '@entities/post';
import { ApiResponseSchema } from '@shared/api/types';
import { z } from 'zod';

/** 게시글 등록 요청 — 형식과 크기는 서버 액션의 getPostRequestBody가 확인한다 */
export type CreatePostReq = PostBody;

/** 게시글 등록 응답 스키마 — 상세 화면 경로에 쓰는 식별자라 경로와 같은 규칙으로 확인한다 */
export const CreatePostResSchema = ApiResponseSchema.extend({
  data: z.object({ id: PostIdSchema }),
});

/** 게시글 등록 응답 */
export type CreatePostRes = z.infer<typeof CreatePostResSchema>;
