import { z } from 'zod';

/** 게시글 분류 스키마 */
export const PostTypeSchema = z.enum(['notice', 'faq', 'free']);

/** 게시글 분류 */
export type PostType = z.infer<typeof PostTypeSchema>;
