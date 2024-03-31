import Link from 'next/link';
import React from 'react';

import { PostListData } from '@/app/types/post';
import { getFormattedDate } from '@/app/utils/date';

interface Props {
  posts: PostListData[];
  isLoading: boolean;
}

const DUMMY_DATA = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  title: `Title ${i}`,
  type: 'Type',
}));

export default function ListTable({ posts, isLoading }: Props) {
  const renderPostList = () => {
    if (isLoading) {
      return DUMMY_DATA.map(post => (
        <tr key={post.id} className="odd:bg-gray-50">
          <td className="w-8/12 px-4 py-3.5">
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </td>
          <td className="px-4 py-3.5">
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </td>
          <td className="px-4 py-3.5">
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </td>
          <td className="px-4 py-3.5">
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </td>
        </tr>
      ));
    }

    return posts.map(post => (
      <tr key={post.id} className="odd:bg-gray-50">
        <td className="w-8/12 whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          <Link href={`/post/${post.id}`}>{post.title}</Link>
        </td>
        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          {post.hit}
        </td>
        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          {post.user.name}
        </td>
        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          {getFormattedDate(post.created_at)}
        </td>
      </tr>
    ));
  };

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="ltr:text-left">
          <tr>
            <th className="w-8/12 whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Title
            </th>

            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Hit
            </th>

            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Writer
            </th>

            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Time
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">{renderPostList()}</tbody>
      </table>
    </div>
  );
}
