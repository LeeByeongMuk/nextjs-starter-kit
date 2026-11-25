'use client';

import { Pagination } from '@entities/post';
import {
  PostListContainer,
  PostListFilter,
  stringifySearchFilters,
  usePostListManager,
} from '@features/post-list';

/** 검색 조건을 읽기 전까지 목록의 진행 상태와 기본 표를 표시한다. */
export function PostListFallback() {
  return (
    <>
      <p
        role="status"
        className="col-start-2 row-start-1 self-center text-sm text-muted tabular-nums"
      >
        게시글을 불러오는 중…
      </p>
      <div className="col-span-2 row-start-3">
        <PostListContainer posts={[]} isLoading />
      </div>
    </>
  );
}

/** 현재 검색 조건의 상태, 필터, 목록과 페이지 이동을 함께 표시한다. */
export default function PostListContent() {
  const { searchFilters, setSearchFilters, posts, meta, isLoading, isError } =
    usePostListManager();

  return (
    <>
      <p
        role="status"
        className="col-start-2 row-start-1 self-center text-sm text-muted tabular-nums"
      >
        {isLoading
          ? '게시글을 불러오는 중…'
          : isError
            ? '목록을 불러오지 못했습니다.'
            : `현재 ${posts.length}개 표시${meta.total > 0 ? ` · ${meta.current_page} / ${meta.last_page} 페이지` : ''}`}
      </p>
      <div className="col-span-2 row-start-3">
        <PostListFilter
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
        />
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
      </div>
    </>
  );
}
