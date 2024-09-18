import Link from 'next/link';
import React from 'react';

import { DUMMY_DATA } from '@/app/constants/post';
import { PostListData } from '@/app/types/api/post';
import { getFormattedDate } from '@/app/utils/date';

interface Props {
  posts: PostListData[];
  isLoading: boolean;
}

export default function ListTable({ posts, isLoading }: Props) {
  const renderPostList = () => {
    if (isLoading) {
      return DUMMY_DATA.map(post => (
        <tr key={post.id} className="odd:bg-gray-50" role="post-list-loading">
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

    if (!posts.length) {
      return (
        <tr className="odd:bg-gray-50">
          <td
            colSpan={4}
            className="px-4 py-4 text-center font-medium text-gray-900"
          >
            No posts found
          </td>
        </tr>
      );
    }

    return posts.map(post => (
      <tr key={post.id} className="odd:bg-gray-50">
        <td className="w-8/12 whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          <Link href={`/post/${post.id}`}>{post.title}</Link>
        </td>
        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          {post.type}
        </td>
        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          {post.user?.name || 'Unknown'}
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
            <th className="w-10/12 whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Title
            </th>

            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Type
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
