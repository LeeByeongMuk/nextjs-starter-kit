'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';

import UpdatePostForm from '@domains/post/update/_components/UpdatePostForm';
import { useUpdatePostManager } from '@domains/post/update/_hooks/usePostUpdateManager';
import Spinner from '@shared/components/Spinner';
import LayerSpinner from '@shared/components/Spinner/LayerSpinner';

export default function UpdatePost() {
  const {
    methods,
    handleUpdatePost,
    isPending,
    isLoading,
    isFetching,
    isError,
  } = useUpdatePostManager();

  if (isFetching || isLoading || isError) return <Spinner />;

  return (
    <FormProvider {...methods}>
      <section className="mt-5 flex min-h-full flex-col justify-center border-2 border-teal-600 px-6 py-12 lg:px-8">
        <UpdatePostForm handleUpdatePost={handleUpdatePost} />
      </section>
      {isPending && <LayerSpinner />}
    </FormProvider>
  );
}
