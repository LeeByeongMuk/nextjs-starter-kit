'use client';

import AccountForm from '@features/auth-account/ui/AccountForm';
import DeleteAccountButton from '@features/auth-account/ui/DeleteAccountButton';
import { useAccountManager } from '@features/auth-account/model/useAccountManager';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import React from 'react';
import { FormProvider } from 'react-hook-form';

export default function Account() {
  const { methods, handleUpdateAccount, handleDeleteAccount, isLoading } =
    useAccountManager();

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-full flex-col justify-center px-6 py-10 lg:px-8">
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <AccountForm handleUpdateAccount={handleUpdateAccount} />
          <DeleteAccountButton handleDeleteAccount={handleDeleteAccount} />
        </div>

        {isLoading && <LayerSpinner />}
      </div>
    </FormProvider>
  );
}
