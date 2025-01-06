'use client';

import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonBox from '@/components/Post/Form/ButtonBox';
import ContentsEditor from '@/components/Post/Form/ContentsEditor';
import IsOpenCheckbox from '@/components/Post/Form/IsOpenCheckbox';
import TitleInput from '@/components/Post/Form/TitleInput';
import TypeSelect from '@/components/Post/Form/TypeSelect';
import LayerSpinner from '@/components/Spinner/LayerSpinner';
import useCreatePost from '@/hooks/post/useCreatePost';
import { PostFormInput } from '@/types/form/post';

export default function CreatePost() {
  const methods = useForm<PostFormInput>();
  const { handleSubmit } = methods;

  const { mutate, isPending } = useCreatePost();
  const onSubmit: SubmitHandler<PostFormInput> = async data => {
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <TitleInput />

          <TypeSelect />

          <ContentsEditor />

          <IsOpenCheckbox />

          <ButtonBox />
        </form>
      </section>

      {isPending && <LayerSpinner />}
    </FormProvider>
  );
}
