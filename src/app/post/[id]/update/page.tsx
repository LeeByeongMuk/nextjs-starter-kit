'use client';

import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import useSWR from 'swr';

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

export default function PostUpdate() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const methods = useForm<PostFormInput>();
  const { handleSubmit, setValue } = methods;

  const {
    data: { data: post },
    isLoading,
    error,
  } = useSWR(
    `/api/posts/${params.id}`,
    async url => {
      return await fetchApi(url, {
        method: 'GET',
      });
    },
    {
      fallbackData: {
        data: {
          title: '',
          contents: '',
          type: null,
          is_open: null,
        },
      },
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onSuccess: ({ data: post }) => {
        setValue('title', post.title);
        setValue('contents', post.contents);
        setValue('type', post.type);
        setValue('isOpen', post.is_open);
      },
      onError: () => {
        alert('Failed to fetch post');
        router.push('/post');
      }
    }
  );

  const onSubmit: SubmitHandler<PostFormInput> = async data => {
    try {
      const res = await fetchApi(`/api/posts/${params.id}`, {
        method: 'PUT',
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

  if (isLoading || error) return <div>Loading...</div>;

  return (
    <FormProvider {...methods}>
      <section className="mt-5 flex min-h-full flex-col justify-center border-2 border-teal-600 px-6 py-12 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <TitleInput defaultValue={post.title} />

          <TypeSelect selectedValue={post.type}  />

          <ContentsEditor defaultValue={post.contents} />

          <IsOpenCheckbox checked={post.is_open} />

          <ButtonBox />
        </form>
      </section>
    </FormProvider>
  );
}
