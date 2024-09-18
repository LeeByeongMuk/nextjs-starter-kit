import Link from 'next/link';
import React from 'react';

import { PostListData } from '@/app/types/api/post';
import { getFormattedDate } from '@/app/utils/date';

interface Props {
  post: PostListData;
}

export default function ListItem({ post }: Props) {
  return (
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
  );
}
