import { getFormattedDate } from '@shared/lib/date';
import Link from 'next/link';

import { PostListData } from '../api/types';

interface Props {
  post: PostListData;
}

/** 긴 제목과 작성 정보를 줄바꿈 가능한 목록 행에 표시한다. */
export default function ListItem({ post }: Props) {
  const typeLabel =
    post.type === 'notice'
      ? '공지'
      : post.type === 'faq'
        ? '자주 묻는 질문'
        : post.type === 'free'
          ? '자유'
          : post.type;
  return (
    <li className="border-b border-line py-7 sm:py-8">
      <article className="min-w-0">
        <p className="mb-2 text-xs font-semibold tracking-wide text-accent">
          {typeLabel}
        </p>
        <h2 className="text-xl leading-relaxed font-semibold tracking-tight sm:text-2xl">
          <Link
            href={`/post/${post.id}`}
            className="inline-block min-h-11 py-1 text-ink underline-offset-4 hover:text-accent hover:underline"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span>{post.user?.name || '작성자 미상'}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.created_at}>
            {getFormattedDate(post.created_at)}
          </time>
        </p>
      </article>
    </li>
  );
}
