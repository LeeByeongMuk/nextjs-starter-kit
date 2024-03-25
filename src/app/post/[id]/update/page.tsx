'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import { fetchPost, fetchPostUpdate, PostUpdateReq } from '@/app/api/post';
import ButtonBox from '@/app/components/Post/Form/ButtonBox';
import ContentsEditor from '@/app/components/Post/Form/ContentsEditor';
import IsOpenCheckbox from '@/app/components/Post/Form/IsOpenCheckbox';
import TitleInput from '@/app/components/Post/Form/TitleInput';
import TypeSelect from '@/app/components/Post/Form/TypeSelect';

interface PostFormInput {
  title: string;
  type: string | null;
  contents: string;
  isOpen: boolean | null;
}

export default function PostUpdate() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const methods = useForm<PostFormInput>();
  const { handleSubmit, setValue } = methods;

  const {
    data: { data: post },
    isSuccess,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['posts', { id }],
    queryFn: () => fetchPost({ id }),
    initialData: {
      data: {
        title: '',
        contents: '',
        type: null,
        is_open: null,
      },
    },
  });

  useEffect(() => {
    if (isSuccess) {
      setValue('title', post.title);
      setValue('contents', post.contents);
      setValue('type', post.type);
      setValue('isOpen', post.is_open);
    }
  }, [isSuccess, setValue, post]);

  useEffect(() => {
    if (isError) {
      alert('Failed to fetch post');
      router.push('/post');
    }
  }, [isError, router]);

  const { mutate } = useMutation({
    mutationFn: (req: PostUpdateReq) => fetchPostUpdate(req),
  });

  const onSubmit: SubmitHandler<PostFormInput> = async data => {
    mutate(
      {
        id,
        title: data.title,
        type: data.type || null,
        contents: data.contents,
        is_open: data.isOpen,
      },
      {
        onSuccess: async () => {
          alert('Notice updated successfully');
          router.push(`/post/${id}`);
        },
        onError: () => {
          alert('Failed to update notice');
        },
      }
    );
  };

  if (isLoading || isError) return <div>Loading...</div>;

  return (
    <FormProvider {...methods}>
      <section className="mt-5 flex min-h-full flex-col justify-center border-2 border-teal-600 px-6 py-12 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <TitleInput defaultValue={post.title} />

          <TypeSelect selectedValue={post.type} />

          <ContentsEditor defaultValue={post.contents} />

          <IsOpenCheckbox checked={post.is_open} />

          <ButtonBox />
        </form>
      </section>
    </FormProvider>
  );
}
