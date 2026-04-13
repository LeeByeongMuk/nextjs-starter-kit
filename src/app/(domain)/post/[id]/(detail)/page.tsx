'use client';

import Detail from '@features/post-detail/ui/PostDetail';
import PostDetailActions from '@features/post-detail/ui/PostDetailActions';
import usePostDetail from '@features/post-detail/model/usePostDetail';
import React from 'react';

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
