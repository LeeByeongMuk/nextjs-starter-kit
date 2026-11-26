'use client';

import {
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  role?: 'alertdialog';
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
}

/** 배경 조작을 막는 모달 대화상자 — Esc로 닫을 수 있고, 닫히면 브라우저가 열기 전의 초점으로 되돌린다 */
export default function Dialog({
  open,
  onClose,
  title,
  description,
  role,
  initialFocusRef,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      initialFocusRef?.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocusRef]);

  return (
    <dialog
      ref={dialogRef}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={event => {
        // 브라우저가 Esc 등으로 직접 닫은 경우만 알린다. close 이벤트는 늦게 도착하므로 그사이 다시 연 대화상자는 닫지 않는다.
        if (open && !event.currentTarget.open) onClose();
      }}
      className="m-auto w-[calc(100%-2.5rem)] max-w-md overscroll-contain rounded border border-line bg-surface p-6 text-ink backdrop:bg-paper/85"
    >
      <h2 id={titleId} className="text-lg font-semibold text-balance">
        {title}
      </h2>
      {description && (
        <p id={descriptionId} className="mt-2 text-sm text-muted">
          {description}
        </p>
      )}
      {children}
    </dialog>
  );
}
