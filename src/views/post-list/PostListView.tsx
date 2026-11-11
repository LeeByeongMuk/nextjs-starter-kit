'use client';

import { Pagination } from '@entities/post';
import {
  PostListContainer,
  PostListFilter,
  usePostListManager,
} from '@features/post-list';
import React from 'react';

/** 게시판 제목과 탐색, 데이터 상태를 조합한다. */
export default function PostListView() {
  const { setSearchFilters, posts, meta, isLoading, isError } =
    usePostListManager();

  return (
    <section aria-labelledby="board-title">
      <header className="mb-8 border-b border-line pb-8 sm:mb-10 sm:pb-10">
        <p className="mb-3 text-sm font-semibold text-accent">BOARD</p>
        <h1
          id="board-title"
          className="text-4xl font-bold tracking-tight sm:text-5xl"
        >
          게시판
        </h1>
        <p className="mt-4 text-base text-muted">
          질문과 소식, 함께 나누고 싶은 이야기를 모았습니다.
        </p>
      </header>
      <PostListFilter setSearchFilters={setSearchFilters} />

      {isError ? (
        <div role="alert" className="border-y border-line py-12">
          <h2 className="text-xl font-semibold">
            게시글을 불러오지 못했습니다.
          </h2>
          <p className="mt-3 text-muted">
            잠시 후 다시 검색하거나 페이지를 새로고침해 주세요.
          </p>
        </div>
      ) : (
        <>
          <p role="status" className="mb-4 text-sm text-muted">
            {isLoading
              ? '게시글을 확인하고 있습니다.'
              : `전체 ${meta.total}개의 글`}
          </p>
          <PostListContainer posts={posts} isLoading={isLoading} />
        </>
      )}

      {!isError && !isLoading && (
        <Pagination
          meta={meta}
          onPageChange={page => setSearchFilters(prev => ({ ...prev, page }))}
        />
      )}
    </section>
  );
}
