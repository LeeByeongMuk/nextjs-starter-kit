import React from 'react';

import { getFormattedDate } from '@/app/utils/date';

interface PostDetailProps {
  isLoading: boolean;
  post: {
    id: number;
    title: string;
    contents: string;
    created_at: string;
    hit: number;
    type: 'notice' | 'faq' | null;
    user: {
      name: string;
      nickname: string;
    };
  };
}

export default function PostDetail({ isLoading, post }: PostDetailProps) {
  return (
    <div className="mt-5">
      <div>
        <h4 className="border-b-2 border-b-teal-600 p-2 text-xl font-bold">
          {isLoading ? (
            <div className="mb-2 mt-2 h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700"></div>
          ) : (
            post.title
          )}
        </h4>

        <div className="flex items-center justify-between bg-teal-100 p-2 text-base">
          {isLoading ? (
            <div className="h-3 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          ) : (
            <span>{post.user.name || post.user.nickname}</span>
          )}

          {isLoading ? (
            <div className="h-3 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          ) : (
            <span>{getFormattedDate(post.created_at)}</span>
          )}
        </div>
      </div>

      <div
        className="border-b-2 pb-5 pl-2 pr-2 pt-5 text-base"
        dangerouslySetInnerHTML={{
          __html: isLoading
            ? '<div class="h-64 w-full bg-gray-200 dark:bg-gray-700" />'
            : post.contents,
        }}
      />
    </div>
  );
}
