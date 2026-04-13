'use client';

import CreatePostForm from '@features/post-create/ui/CreatePostForm';
import useCreatePost from '@features/post-create/model/useCreatePost';
import useCreatePostForm from '@features/post-create/model/useCreatePostForm';
import { CreatePostFormInput } from '@features/post-create/model/form';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import React from 'react';
import { FormProvider } from 'react-hook-form';

export default function CreatePost() {
  const methods = useCreatePostForm();
  const { mutate, isPending } = useCreatePost();

  const handleCreatePost = (data: CreatePostFormInput) => {
    mutate({
      title: data.title,
      type: data.type,
      contents: data.contents,
      is_open: data.isOpen === '1',
    });
  };

  return (
    <FormProvider {...methods}>
      <section className="mt-5 flex min-h-full flex-col justify-center border-2 border-teal-600 px-6 py-12 lg:px-8">
        <CreatePostForm handleCreatePost={handleCreatePost} />
      </section>

      {isPending && <LayerSpinner />}
    </FormProvider>
  );
}
