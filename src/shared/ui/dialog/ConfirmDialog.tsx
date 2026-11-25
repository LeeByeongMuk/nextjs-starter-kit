'use client';

import { useRef } from 'react';

import Dialog from './Dialog';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 되돌릴 수 없는 동작을 실행하기 전에 확인을 받는다 — 열리면 취소에 초점을 둔다 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      role="alertdialog"
      initialFocusRef={cancelRef}
    >
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded border border-line px-5 py-2 text-sm font-semibold hover:border-accent hover:text-accent"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="min-h-11 rounded bg-danger px-5 py-2 text-sm font-semibold text-inverse hover:bg-danger/90"
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
