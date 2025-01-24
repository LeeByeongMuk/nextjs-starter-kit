'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';

import AccountForm from '@domains/auth/account/_components/AccountForm';
import DeleteAccountButton from '@domains/auth/account/_components/DeleteAccountButton';
import { useAccountManager } from '@domains/auth/account/_hooks/useAccountManager';
import LayerSpinner from '@shared/components/Spinner/LayerSpinner';

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
