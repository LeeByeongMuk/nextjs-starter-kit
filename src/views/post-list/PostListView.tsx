'use client';

import { Pagination } from '@entities/post';
import {
  PostListContainer,
  PostListFilter,
  stringifySearchFilters,
  usePostListManager,
} from '@features/post-list';
import React from 'react';

/** 검색과 분류로 탐색하는 게시판 목록 화면 */
export default function PostListView() {
  const { searchFilters, setSearchFilters, posts, meta, isLoading, isError } =
    usePostListManager();

  return (
    <section aria-labelledby="post-list-heading" className="text-ink">
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between gap-4">
          <h1
            id="post-list-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            게시판
          </h1>
          <p className="text-sm text-muted tabular-nums" role="status">
            {isLoading
              ? '게시글을 불러오는 중…'
              : isError
                ? '목록을 불러오지 못했습니다.'
                : `현재 ${posts.length}개 표시${meta.total > 0 ? ` · ${meta.current_page} / ${meta.last_page} 페이지` : ''}`}
          </p>
        </div>
        <p className="mt-3 max-w-prose text-sm leading-6 text-muted sm:text-base">
          게시글을 둘러보고, 제목이나 내용으로 필요한 글을 찾아보세요.
        </p>
      </div>

      <PostListFilter setSearchFilters={setSearchFilters} />

      <PostListContainer
        posts={posts}
        isLoading={isLoading}
        isError={isError}
      />

      {!isError && !isLoading && (
        <Pagination
          meta={meta}
          getPageHref={page =>
            `/post?${stringifySearchFilters({ ...searchFilters, page })}`
          }
          onPageChange={page => setSearchFilters(prev => ({ ...prev, page }))}
        />
      )}
    </section>
  );
}
