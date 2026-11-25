'use client';

import {
  UpdatePostForm,
  type UpdatePostResourceRes,
  useUpdatePostManager,
  useUpdatePostResource,
} from '@features/post-update';
import Spinner from '@shared/ui/spinner';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormProvider } from 'react-hook-form';

/** 게시글 편집 폼과 진행 상태를 조합한다. */
export default function PostUpdateView() {
  const { id } = useParams<{ id: string }>();
  const { data, isError } = useUpdatePostResource();

  if (!data && isError)
    return (
      <section className="mx-auto max-w-[760px]">
        <h1 className="text-3xl font-bold">글을 수정할 수 없습니다.</h1>
        <p role="alert" className="mt-5 text-muted">
          수정할 글을 불러오지 못했습니다.
        </p>
        <Link
          href="/post"
          className="mt-6 inline-flex min-h-11 items-center text-accent underline"
        >
          게시판으로 돌아가기
        </Link>
      </section>
    );
  if (!data)
    return (
      <section>
        <h1 className="sr-only">글 수정</h1>
        <Spinner />
      </section>
    );

  return (
    <PostUpdateContent key={id} post={data.data} isRefetchError={isError} />
  );
}

function PostUpdateContent({
  post,
  isRefetchError,
}: {
  post: UpdatePostResourceRes['data'];
  isRefetchError: boolean;
}) {
  const { methods, handleUpdatePost, isPending } = useUpdatePostManager(post);
  const hasDraft = Object.keys(methods.formState.dirtyFields).length > 0;
  return (
    <FormProvider {...methods}>
      <section className="mx-auto w-full max-w-[760px]">
        <header className="mb-8 border-b border-line pb-7">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            글 수정
          </h1>
          <p className="mt-4 text-muted">
            작성한 내용을 확인하고 변경 사항을 저장해 주세요.
          </p>
        </header>
        {isRefetchError && (
          <p role="status" className="mb-4 text-sm text-muted">
            최신 글을 불러오지 못했습니다.
            {hasDraft && ' 작성 중인 내용은 유지됩니다.'}
          </p>
        )}
        <UpdatePostForm handleUpdatePost={handleUpdatePost} />
      </section>
      {isPending && <LayerSpinner />}
    </FormProvider>
  );
}
