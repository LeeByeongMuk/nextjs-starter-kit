import { EmailSchema, NameSchema, NicknameSchema } from '@entities/auth';
import { z } from 'zod';

/** 회원 정보 수정 폼 스키마 — 가입할 때와 같은 입력 규칙으로 확인한다 */
export const AccountFormSchema = z.object({
  email: EmailSchema,
  name: NameSchema,
  nickname: NicknameSchema,
});

/** 회원 정보 수정 폼 입력값 */
export type AccountFormInput = z.input<typeof AccountFormSchema>;

const deletedReasonRequired = '탈퇴 사유를 입력해 주세요.';

/** 회원 탈퇴 확인 폼 스키마 — 탈퇴 사유를 입력해야 요청한다 */
export const DeleteAccountFormSchema = z.object({
  deletedReason: z.string(deletedReasonRequired).min(1, deletedReasonRequired),
});

/** 회원 탈퇴 확인 폼 입력값 */
export type DeleteAccountFormInput = z.input<typeof DeleteAccountFormSchema>;

/** 회원 탈퇴 확인 폼 기본값 */
export const DELETE_ACCOUNT_DEFAULT_VALUES: DeleteAccountFormInput = {
  deletedReason: '',
};
