'use client';

import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonBox from '@/domains/post/components/Form/ButtonBox';
import ContentsEditor from '@/domains/post/components/Form/ContentsEditor';
import IsOpenCheckbox from '@/domains/post/components/Form/IsOpenCheckbox';
import TitleInput from '@/domains/post/components/Form/TitleInput';
import TypeSelect from '@/domains/post/components/Form/TypeSelect';
import useCreatePost from '@/domains/post/hooks/useCreatePost';
import { PostFormInput } from '@/domains/post/types/form';
import LayerSpinner from '@/shared/components/Spinner/LayerSpinner';

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
