'use client';

import {
  PostDetail,
  PostDetailActions,
  usePostDetail,
} from '@features/post-detail';
import Link from 'next/link';

/** 조회 오류와 로딩을 분리한 읽기 화면이다. */
export default function PostDetailView() {
  const {
    id,
    post,
    isError,
    isLoading,
    isFetching,
    handleRedirectBack,
    handleDeletePost,
  } = usePostDetail();

  if (isError)
    return (
      <section className="mx-auto max-w-[760px]">
        <h1 className="text-3xl font-bold">게시글을 불러오지 못했습니다.</h1>
        <p role="alert" className="mt-5 text-muted">
          글이 없거나 일시적인 오류가 발생했습니다.
        </p>
        <Link
          href="/post"
          className="mt-6 inline-flex min-h-11 items-center text-accent underline underline-offset-4"
        >
          게시판으로 돌아가기
        </Link>
      </section>
    );

  return (
    <section className="mx-auto w-full max-w-[760px]">
      <Link
        href="/post"
        className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-accent"
      >
        <span aria-hidden="true">←</span> 게시판
      </Link>
      <PostDetail post={post} isLoading={isFetching || isLoading} />

      {!isFetching && !isLoading && (
        <PostDetailActions
          id={id}
          isEditable={!!post?.is_editable}
          handleRedirectBack={handleRedirectBack}
          handleDeletePost={handleDeletePost}
        />
      )}
    </section>
  );
}
