'use client';

import { UpdatePostForm, useUpdatePostManager } from '@features/post-update';
import Spinner from '@shared/ui/spinner';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import React from 'react';
import { FormProvider } from 'react-hook-form';

export default function PostUpdateView() {
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
