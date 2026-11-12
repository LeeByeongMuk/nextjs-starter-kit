import { getPostTypeLabel } from '@entities/post';
import { getFormattedDate } from '@shared/lib/date';
import Link from 'next/link';
import React from 'react';

import { PostListData } from '../api/types';

interface Props {
  post: PostListData;
}

/** 제목을 우선하고 작은 화면에서는 메타데이터를 함께 표시하는 행 */
export default function ListItem({ post }: Props) {
  const typeLabel = getPostTypeLabel(post.type);
  const writer = post.user?.name || '알 수 없음';
  const date = getFormattedDate(post.created_at);

  return (
    <tr className="transition-colors hover:bg-paper focus-within:bg-accent-soft/50 motion-reduce:transition-none">
      <td className="px-1 py-4 md:px-4 md:py-5">
        <Link
          href={`/post/${post.id}`}
          className="inline-flex min-h-11 items-center rounded-sm text-base leading-6 font-medium wrap-anywhere text-ink decoration-accent underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:text-sm"
        >
          {post.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-muted md:hidden">
          <span className="font-medium capitalize text-accent">
            {typeLabel}
          </span>
          <span className="wrap-anywhere">{writer}</span>
          <time dateTime={post.created_at} className="tabular-nums">
            {date}
          </time>
        </div>
      </td>
      <td className="hidden px-3 py-5 align-top md:table-cell">
        <span className="inline-block rounded px-2 py-1 text-xs font-medium break-words capitalize text-accent bg-accent-soft">
          {typeLabel}
        </span>
      </td>
      <td className="hidden px-4 py-5 leading-6 wrap-anywhere text-muted md:table-cell">
        {writer}
      </td>
      <td className="hidden px-4 py-5 text-right leading-6 text-muted tabular-nums md:table-cell">
        <time dateTime={post.created_at}>{date}</time>
      </td>
    </tr>
  );
}
