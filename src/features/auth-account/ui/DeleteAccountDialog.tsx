import Dialog from '@shared/ui/dialog/Dialog';
import ValidationError from '@shared/ui/error/ValidationError';
import { useEffect, useRef } from 'react';

import { DeleteAccountFormInput } from '../model/form';
import useDeleteAccountForm from '../model/useDeleteAccountForm';

interface DeleteAccountDialogProps {
  open: boolean;
  /** 탈퇴를 확인받는 계정 — 바뀌면 입력하던 사유를 버린다 */
  accountId?: string;
  onCancel: () => void;
  onConfirm: (deletedReason: string) => void;
}

/** 탈퇴 사유를 입력받아 회원 탈퇴를 확인한다 — 취소하면 입력을 비운다 */
export default function DeleteAccountDialog({
  open,
  accountId,
  onCancel,
  onConfirm,
}: DeleteAccountDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useDeleteAccountForm();
  const reasonRef = useRef<HTMLInputElement | null>(null);
  const { ref: registerReason, ...reasonField } = register('deletedReason');

  // 계정마다 새로 만들지 않고 입력만 비운다. 열려 있던 대화상자가 close()로 닫혀야 브라우저가 초점을 되돌린다.
  useEffect(() => {
    reset();
  }, [accountId, reset]);

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = ({ deletedReason }: DeleteAccountFormInput) => {
    onConfirm(deletedReason);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      title="회원 탈퇴"
      description="회원 탈퇴를 진행하려면 탈퇴 사유를 입력해 주세요."
      initialFocusRef={reasonRef}
    >
      <form noValidate className="mt-5" onSubmit={handleSubmit(handleConfirm)}>
        <label htmlFor="deletedReason" className="block text-sm font-semibold">
          탈퇴 사유
        </label>
        <input
          id="deletedReason"
          type="text"
          autoComplete="off"
          aria-invalid={!!errors.deletedReason}
          aria-describedby={
            errors.deletedReason ? 'deletedReason-error' : undefined
          }
          className="mt-2 block min-h-12 w-full rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted"
          {...reasonField}
          ref={element => {
            registerReason(element);
            reasonRef.current = element;
          }}
        />
        <ValidationError
          id="deletedReason-error"
          isError={!!errors.deletedReason}
          message={errors.deletedReason?.message}
        />
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="min-h-11 rounded border border-line px-5 py-2 text-sm font-semibold hover:border-accent hover:text-accent"
          >
            취소
          </button>
          <button
            type="submit"
            className="min-h-11 rounded bg-danger px-5 py-2 text-sm font-semibold text-inverse hover:bg-danger/90"
          >
            회원 탈퇴
          </button>
        </div>
      </form>
    </Dialog>
  );
}
