'use client';

import {
  CreatePostForm,
  type CreatePostFormInput,
  useCreatePost,
  useCreatePostForm,
} from '@features/post-create';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import { FormProvider } from 'react-hook-form';

export default function PostCreateView() {
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
