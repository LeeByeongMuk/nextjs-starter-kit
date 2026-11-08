'use client';

import {
  AccountForm,
  DeleteAccountButton,
  useAccountManager,
} from '@features/auth-account';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import React from 'react';
import { FormProvider } from 'react-hook-form';

/** 계정 정보 수정과 탈퇴 동작을 조합한다. */
export default function AccountView() {
  const { methods, handleUpdateAccount, handleDeleteAccount, isLoading } =
    useAccountManager();

  return (
    <FormProvider {...methods}>
      <section className="mx-auto w-full max-w-md py-4 sm:py-8">
        <header className="mb-8 border-b border-line pb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            내 계정
          </h1>
          <p className="mt-4 text-muted">
            회원 정보를 확인하고 수정할 수 있습니다.
          </p>
        </header>
        <div>
          <AccountForm handleUpdateAccount={handleUpdateAccount} />
          <DeleteAccountButton handleDeleteAccount={handleDeleteAccount} />
        </div>

        {isLoading && <LayerSpinner />}
      </section>
    </FormProvider>
  );
}
