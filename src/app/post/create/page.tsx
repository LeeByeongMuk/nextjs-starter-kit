'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonBox from '@/app/components/Post/Form/ButtonBox';
import ContentsEditor from '@/app/components/Post/Form/ContentsEditor';
import IsOpenCheckbox from '@/app/components/Post/Form/IsOpenCheckbox';
import TitleInput from '@/app/components/Post/Form/TitleInput';
import TypeSelect from '@/app/components/Post/Form/TypeSelect';
import { fetchApi } from '@/app/utils/api';

interface PostFormInput {
  title: string;
  type: string | null;
  contents: string;
  isOpen: boolean | null;
}

export default function PostCreate() {
  const router = useRouter();
  const methods = useForm<PostFormInput>();
  const { handleSubmit } = methods;

  const onSubmit: SubmitHandler<PostFormInput> = async data => {
    try {
      const res = await fetchApi('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          type: data.type || null,
          contents: data.contents,
          is_open: data.isOpen,
        }),
      });

      alert('Notice created successfully');
      router.push(`/post/${res.data.id}`);
    } catch (err) {
      alert('Failed to create notice');
    }
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
    </FormProvider>
  );
}
