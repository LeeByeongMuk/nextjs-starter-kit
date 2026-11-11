'use client';

import {
  CreatePostForm,
  type CreatePostFormInput,
  useCreatePost,
  useCreatePostForm,
} from '@features/post-create';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import { FormProvider } from 'react-hook-form';

/** 게시글 편집 폼과 진행 상태를 조합한다. */
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
      <section className="mx-auto w-full max-w-[760px]">
        <header className="mb-8 border-b border-line pb-7">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            글쓰기
          </h1>
          <p className="mt-4 text-muted">
            제목과 본문을 작성하고 공개 범위를 선택해 주세요.
          </p>
        </header>
        <CreatePostForm handleCreatePost={handleCreatePost} />
      </section>

      {isPending && <LayerSpinner />}
    </FormProvider>
  );
}
