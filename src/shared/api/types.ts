import { z } from 'zod';

/** 화면이 쓰지 않는 응답 값의 스키마 — 형식이 맞으면 전달하고, 없거나 달라도 요청을 막지 않는다 */
export const lenient = <Schema extends z.ZodType>(schema: Schema) =>
  schema.optional().catch(undefined);

/** API 응답 공통 필드 스키마 — 요청의 성공 여부는 HTTP 상태로 판정하므로 화면이 쓰지 않는다 */
export const ApiResponseSchema = z.object({
  ok: lenient(z.boolean()),
  message: lenient(z.string()),
});
