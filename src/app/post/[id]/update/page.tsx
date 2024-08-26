'use client';

import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonBox from '@/app/components/Post/Form/ButtonBox';
import ContentsEditor from '@/app/components/Post/Form/ContentsEditor';
import IsPublishedCheckbox from '@/app/components/Post/Form/IsPublishedCheckbox';
import TitleInput from '@/app/components/Post/Form/TitleInput';
import TypeSelect from '@/app/components/Post/Form/TypeSelect';
import Spinner from '@/app/components/Spinner';
import LayerSpinner from '@/app/components/Spinner/LayerSpinner';
import useUpdatePost from '@/app/hooks/post/useUpdatePost';
import useUpdatePostResource from '@/app/hooks/post/useUpdatePostResource';
import { PostType } from '@/app/types/post';

interface PostFormInput {
  title: string;
  type: PostType | null;
  contents: string;
  isPublished: '1' | '0';
}

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
      setValue('isPublished', post.is_published ? '1' : '0');
    }
  }, [isSuccess, setValue, post]);

  const { mutate, isPending } = useUpdatePost();

  const onSubmit: SubmitHandler<PostFormInput> = async data => {
    mutate({
      id,
      title: data.title,
      type: data.type || null,
      contents: data.contents,
      is_published: data.isPublished === '1',
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

          <IsPublishedCheckbox />

          <ButtonBox />
        </form>
      </section>
      {isPending && <LayerSpinner />}
    </FormProvider>
  );
}
