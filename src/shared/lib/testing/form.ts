import { zodResolver } from '@hookform/resolvers/zod';
import { type FieldValues } from 'react-hook-form';
import { type ZodType } from 'zod';

/** 폼 스키마가 화면에 표시할 필드별 오류 문구를 구한다 — 화면과 같은 zodResolver 결과를 쓴다 */
export const resolveFormErrors = async <Input extends FieldValues>(
  schema: ZodType<unknown, Input>,
  values: unknown
) => {
  const { errors } = await zodResolver(schema)(values as Input, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  });
  return Object.fromEntries(
    Object.entries(errors).map(([field, error]) => [field, error?.message])
  );
};
