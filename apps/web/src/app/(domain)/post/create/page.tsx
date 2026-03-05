'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';

import CreatePostForm from '@domains/post/create/_components/CreatePostForm';
import useCreatePost from '@domains/post/create/_hooks/useCreatePost';
import useCreatePostForm from '@domains/post/create/_hooks/useCreatePostForm';
import { CreatePostFormInput } from '@domains/post/create/_types/form';
import LayerSpinner from '@shared/components/Spinner/LayerSpinner';

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
