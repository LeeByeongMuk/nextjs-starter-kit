import { z } from 'zod';

import { PostsReqSchema } from '../api/types';

const searchLength = '검색어를 2자 이상 입력하거나 비워 주세요.';

/** 목록 검색 폼 스키마 — 검색어는 비우거나 2자 이상 입력한다 */
export const PostListSearchSchema = PostsReqSchema.pick({ type: true }).extend({
  q: z
    .string(searchLength)
    .refine(q => q === '' || q.length >= 2, searchLength),
});

/** 목록 검색 폼 입력값 */
export type PostListSearch = z.input<typeof PostListSearchSchema>;
