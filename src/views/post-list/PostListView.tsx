import { Suspense } from 'react';

import PostListContent, { PostListFallback } from './PostListContent';

/** 검색과 분류로 탐색하는 게시판 목록 화면 */
export default function PostListView() {
  return (
    <section
      aria-labelledby="post-list-heading"
      className="grid grid-cols-[1fr_auto] gap-x-4 text-ink"
    >
      <h1
        id="post-list-heading"
        className="col-start-1 row-start-1 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
      >
        게시판
      </h1>
      <p className="col-span-2 row-start-2 mt-3 mb-8 max-w-prose text-sm leading-6 text-muted sm:mb-10 sm:text-base">
        게시글을 둘러보고, 제목이나 내용으로 필요한 글을 찾아보세요.
      </p>

      <Suspense fallback={<PostListFallback />}>
        <PostListContent />
      </Suspense>
    </section>
  );
}
