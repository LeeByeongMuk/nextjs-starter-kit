'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { fetchApi } from '@/app/utils/api';

interface PostFormInput {
  title: string;
  type: string | null;
  contents: string;
  isOpen: boolean | null;
}

export default function PostCreate() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<PostFormInput>();

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

  const redirectBack = () => {
    router.back();
  };

  return (
    <section className="mt-5 flex min-h-full flex-col justify-center border-2 border-teal-600 px-6 py-12 lg:px-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            htmlFor="title"
            className="block text-xs font-medium text-gray-700"
          >
            Title
          </label>

          <input
            type="text"
            id="title"
            className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
            placeholder="Post title..."
            {...register('title', { required: true })}
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="type"
            className="block text-xs font-medium text-gray-700"
          >
            Type
          </label>

          <select
            id="type"
            className="mt-1.5 w-full rounded-lg border-gray-300 text-gray-700 sm:text-sm"
            {...register('type')}
          >
            <option value="">Please select</option>
            <option value="notice">Notice</option>
            <option value="faq">Faq</option>
          </select>
        </div>

        <div className="mt-5">
          <label
            htmlFor="contents"
            className="block text-xs font-medium text-gray-700"
          >
            Contents
          </label>

          <textarea
            id="contents"
            className="mt-2 w-full rounded-lg border-gray-200 align-top shadow-sm sm:text-sm"
            placeholder="Enter any additional order notes..."
            {...register('contents', { required: true })}
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="isOpen"
            className="block text-xs font-medium text-gray-700"
          >
            Is Open
          </label>

          <input
            type="checkbox"
            id="isOpen"
            className="mt-1 rounded-md border-gray-200 shadow-sm sm:text-sm"
            {...register('isOpen')}
          />
        </div>

        <div className="mt-5 flex justify-center gap-2.5">
          <button
            type="button"
            className="inline-block rounded border border-teal-600 bg-teal-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-teal-600 focus:outline-none focus:ring active:text-teal-500"
            onClick={redirectBack}
          >
            back
          </button>

          <button
            type="submit"
            className="inline-block rounded border border-teal-600 px-12 py-3 text-sm font-medium text-teal-600 hover:bg-teal-600 hover:text-white focus:outline-none focus:ring active:bg-teal-500"
          >
            submit
          </button>
        </div>
      </form>
    </section>
  );
}
