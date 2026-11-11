import { PaginationMeta } from '@shared/api/pagination';
import React from 'react';

import { PAGE_GROUP_NUMBER } from '../config/post';

interface Props {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  getPageHref: (page: number) => string;
}

/** 현재 검색 조건의 게시글 페이지 이동 */
export default function Pagination({ meta, onPageChange, getPageHref }: Props) {
  const getPageGroup = () => {
    const pageGroupNum = Math.ceil(meta.current_page / PAGE_GROUP_NUMBER);
    const firstPageNum = (pageGroupNum - 1) * PAGE_GROUP_NUMBER + 1;
    const lastPageNum = Math.min(
      firstPageNum + PAGE_GROUP_NUMBER - 1,
      meta.last_page
    );

    return Array.from(
      { length: Math.max(lastPageNum - firstPageNum + 1, 1) },
      (_, i) => firstPageNum + i
    );
  };

  const onNavigate = (
    event: React.MouseEvent<HTMLAnchorElement>,
    page: number
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    onPageChange(page);
  };

  const pageGroup = getPageGroup();

  return (
    <nav aria-label="게시글 페이지" className="mt-8 flex justify-center">
      <ul className="flex flex-wrap justify-center gap-1 text-sm tabular-nums">
        {meta.current_page > 1 && (
          <li>
            <a
              href={getPageHref(meta.current_page - 1)}
              className="flex min-h-11 items-center justify-center rounded-md px-3 text-muted hover:bg-skeleton hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={event => onNavigate(event, meta.current_page - 1)}
            >
              이전
            </a>
          </li>
        )}

        {pageGroup.map(d => (
          <li key={d}>
            <a
              aria-label={`${d} 페이지`}
              aria-current={meta.current_page === d ? 'page' : undefined}
              href={getPageHref(d)}
              className={`flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${meta.current_page === d ? 'bg-accent text-inverse hover:bg-accent-hover' : 'text-muted hover:bg-accent-soft hover:text-ink'}`}
              onClick={event => onNavigate(event, d)}
            >
              {d}
            </a>
          </li>
        ))}

        {meta.last_page > 1 && meta.last_page !== meta.current_page && (
          <li>
            <a
              href={getPageHref(meta.current_page + 1)}
              className="flex min-h-11 items-center justify-center rounded-md px-3 text-muted hover:bg-skeleton hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={event => onNavigate(event, meta.current_page + 1)}
            >
              다음
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}
