'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';

import {
  AccountForm,
  DeleteAccountButton,
  useAccountManager,
} from '@features/auth-account';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';

export default function AccountView() {
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
