import Link from 'next/link';
import React from 'react';

interface Props {
  posts: {
    id: number;
    title: string;
    type: string;
    hit: number;
    created_at: string;
    user: {
      id: number;
      name: string;
    };
  }[];
  isLoading: boolean;
}

const DUMMY_DATA = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  title: `Title ${i}`,
  type: 'Type',
}));

export default function ListTable({ posts, isLoading }: Props) {
  const getFormattedDate = (date: string) => {
    return new Intl.DateTimeFormat('ko-KR').format(new Date(date));
  }

  const renderPostList = () => {
    if (isLoading) {
      return DUMMY_DATA.map(post => (
        <tr key={post.id} className="odd:bg-gray-50">
          <td className="px-4 py-3.5 w-8/12">
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </td>
          <td className="px-4 py-3.5">
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </td>
          <td className="px-4 py-3.5">
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </td>
          <td className="px-4 py-3.5">
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </td>
        </tr>
      ));
    }

    return posts.map(post => (
      <tr key={post.id} className="odd:bg-gray-50">
        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-8/12">
          <Link href={`/post/${post.id}`}>{post.title}</Link>
        </td>
        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          <Link href={`/post/${post.id}`}>{post.hit}</Link>
        </td>
        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          <Link href={`/post/${post.id}`}>{post.user.name}</Link>
        </td>
        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          <Link href={`/post/${post.id}`}>{getFormattedDate(post.created_at)  }</Link>
        </td>
      </tr>
    ));
  };

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="ltr:text-left">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 w-8/12">
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
