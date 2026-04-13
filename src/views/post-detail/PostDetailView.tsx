'use client';

import React from 'react';

import {
  PostDetail,
  PostDetailActions,
  usePostDetail,
} from '@features/post-detail';

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

  return (
    <section className="py-8">
      <PostDetail post={post} isLoading={isFetching || isLoading || isError} />

      <PostDetailActions
        id={id}
        isEditable={!!post?.is_editable}
        handleRedirectBack={handleRedirectBack}
        handleDeletePost={handleDeletePost}
      />
    </section>
  );
}
