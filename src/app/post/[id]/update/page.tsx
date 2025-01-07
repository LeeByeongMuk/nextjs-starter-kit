'use client';

import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonBox from '@/app/post/_components/Form/ButtonBox';
import ContentsEditor from '@/app/post/_components/Form/ContentsEditor';
import IsOpenCheckbox from '@/app/post/_components/Form/IsOpenCheckbox';
import TitleInput from '@/app/post/_components/Form/TitleInput';
import TypeSelect from '@/app/post/_components/Form/TypeSelect';
import Spinner from '@/components/Spinner';
import LayerSpinner from '@/components/Spinner/LayerSpinner';
import useUpdatePost from '@/app/post/_hooks/useUpdatePost';
import useUpdatePostResource from '@/app/post/_hooks/useUpdatePostResource';
import { PostFormInput } from '@/app/post/_types/form';

export default function UpdatePost() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const methods = useForm<PostFormInput>();
  const { handleSubmit, setValue } = methods;

  const {
    data: { data: post },
    isSuccess,
    isError,
    isLoading,
    isFetching,
  } = useUpdatePostResource();

  useEffect(() => {
    if (isSuccess) {
      setValue('title', post.title);
      setValue('contents', post.contents);
      setValue('type', post.type);
      setValue('isOpen', post.is_open ? '1' : '0');
    }
  }, [isSuccess, setValue, post]);

  const { mutate, isPending } = useUpdatePost();

  const onSubmit: SubmitHandler<PostFormInput> = async data => {
    mutate({
      id,
      title: data.title,
      type: data.type || null,
      contents: data.contents,
      is_open: data.isOpen === '1',
    });
  };

  if (isFetching || isLoading || isError) return <Spinner />;

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
