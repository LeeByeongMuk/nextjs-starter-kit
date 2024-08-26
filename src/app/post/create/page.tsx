'use client';

import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonBox from '@/app/components/Post/Form/ButtonBox';
import ContentsEditor from '@/app/components/Post/Form/ContentsEditor';
import IsPublishedCheckbox from '@/app/components/Post/Form/IsPublishedCheckbox';
import TitleInput from '@/app/components/Post/Form/TitleInput';
import TypeSelect from '@/app/components/Post/Form/TypeSelect';
import LayerSpinner from '@/app/components/Spinner/LayerSpinner';
import useCreatePost from '@/app/hooks/post/useCreatePost';

interface PostFormInput {
  title: string;
  type: string | null;
  contents: string;
  is_published: '1' | '0';
}

export default function CreatePost() {
  const methods = useForm<PostFormInput>();
  const { handleSubmit } = methods;

  const { mutate, isPending } = useCreatePost();
  const onSubmit: SubmitHandler<PostFormInput> = async data => {
    mutate({
      title: data.title,
      type: data.type,
      contents: data.contents,
      is_published: data.is_published === '1',
    });
  };

  return (
    <FormProvider {...methods}>
      <section className="mt-5 flex min-h-full flex-col justify-center border-2 border-teal-600 px-6 py-12 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <TitleInput />

          <TypeSelect />

          <ContentsEditor />

          <IsPublishedCheckbox />

          <ButtonBox />
        </form>
      </section>

      {isPending && <LayerSpinner />}
    </FormProvider>
  );
}
