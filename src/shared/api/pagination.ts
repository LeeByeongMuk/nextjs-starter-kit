import { z } from 'zod';

/** 목록 응답의 페이지 정보 스키마 — 화면이 쓰는 값만 남긴다 */
export const PaginationMetaSchema = z.object({
  current_page: z.number(),
  last_page: z.number(),
  total: z.number(),
});

/** 목록 응답의 페이지 정보 */
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/** 페이지 정보를 함께 싣는 목록 응답의 공통 스키마 */
export const PaginationDataSchema = z.object({ meta: PaginationMetaSchema });
