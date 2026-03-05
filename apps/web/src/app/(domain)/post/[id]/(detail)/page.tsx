'use client';

import React from 'react';

import Detail from '@domains/post/detail/_components/PostDetail';
import PostDetailActions from '@domains/post/detail/_components/PostDetailActions';
import usePostDetail from '@domains/post/detail/_hooks/usePostDetail';

export default function PostDetail() {
  const {
    id,
    post,
    isError,
    isLoading,
    isFetching,
    handleRedirectBack,
    handleDeletePost,
  } = usePostDetail();

  return (
    <section className="py-8">
      <Detail post={post} isLoading={isFetching || isLoading || isError} />

      <PostDetailActions
        id={id}
        isEditable={!!post?.is_editable}
        handleRedirectBack={handleRedirectBack}
        handleDeletePost={handleDeletePost}
      />
    </section>
  );
}
