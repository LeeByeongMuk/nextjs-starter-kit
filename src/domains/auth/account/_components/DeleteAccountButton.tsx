import React from 'react';

interface DeleteAccountButtonProps {
  handleDeleteAccount: () => void;
}

export default function DeleteAccountButton({
  handleDeleteAccount,
}: DeleteAccountButtonProps) {
  return (
    <div className="mt-3">
      <button
        type="button"
        className="flex w-full justify-center rounded-md border border-teal-600 bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-transparent hover:text-teal-600 focus:outline-none focus:ring active:text-teal-500"
        onClick={handleDeleteAccount}
      >
        Delete Account
      </button>
    </div>
  );
}
