import { getFormattedDate } from '@shared/lib/date';
import { useEffect, useRef } from 'react';

import { PostData } from '../api/types';

interface PostDetailProps {
  isLoading: boolean;
  post: PostData;
}

/** HTML 본문 형식을 유지하며 제목과 읽기 영역을 제공한다. */
export default function PostDetail({ isLoading, post }: PostDetailProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const blocks =
      contentRef.current?.querySelectorAll<HTMLElement>('pre, table');
    blocks?.forEach(block => {
      if (block.scrollWidth > block.clientWidth) {
        block.tabIndex = 0;
        block.setAttribute(
          'aria-label',
          block.tagName === 'PRE'
            ? '가로로 스크롤할 수 있는 코드'
            : '가로로 스크롤할 수 있는 표'
        );
      }
    });
  }, [post.contents, isLoading]);

  if (isLoading)
    return (
      <div>
        <h1 className="sr-only">게시글</h1>
        <div role="status" className="space-y-6 border-b border-line pb-10">
          <span className="sr-only">게시글을 불러오는 중입니다.</span>
          <div aria-hidden="true" className="h-10 w-4/5 rounded bg-skeleton" />
          <div aria-hidden="true" className="h-4 w-40 rounded bg-skeleton" />
          <div aria-hidden="true" className="h-64 rounded bg-skeleton" />
        </div>
      </div>
    );

  return (
    <article aria-labelledby="post-title">
      <header className="border-b border-line pb-8">
        <p className="mb-4 text-sm font-semibold text-accent">
          {post.type === 'notice'
            ? '공지'
            : post.type === 'faq'
              ? '자주 묻는 질문'
              : '자유'}
        </p>
        <h1
          id="post-title"
          className="text-3xl leading-snug font-bold tracking-tight sm:text-[2.5rem]"
        >
          {post.title}
        </h1>
        <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
          <span>{post.user_name || '작성자 미상'}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.created_at}>
            {getFormattedDate(post.created_at)}
          </time>
        </p>
      </header>
      <div
        ref={contentRef}
        className="post-content min-w-0 py-10 sm:py-12"
        dangerouslySetInnerHTML={{ __html: post.contents }}
      />
    </article>
  );
}
