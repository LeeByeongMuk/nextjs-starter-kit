import { type Ref } from 'react';

interface DeleteAccountButtonProps {
  handleDeleteAccount: () => void;
  ref?: Ref<HTMLButtonElement>;
}

/** 계정 삭제 안내와 탈퇴 확인을 여는 버튼을 제공한다. */
export default function DeleteAccountButton({
  handleDeleteAccount,
  ref,
}: DeleteAccountButtonProps) {
  return (
    <section
      aria-labelledby="delete-account-title"
      className="mt-12 border-t border-line pt-6"
    >
      <h2 id="delete-account-title" className="text-lg font-semibold">
        회원 탈퇴
      </h2>
      <p className="mt-2 text-sm text-muted">
        탈퇴하면 계정이 삭제됩니다. 계속하려면 탈퇴 사유를 입력해 주세요.
      </p>
      <button
        ref={ref}
        type="button"
        onClick={handleDeleteAccount}
        className="mt-3 min-h-11 rounded border border-danger px-4 py-2 text-sm font-semibold text-danger"
      >
        회원 탈퇴
      </button>
    </section>
  );
}
