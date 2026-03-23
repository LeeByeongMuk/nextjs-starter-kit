import { PostListData } from '@domains/post/list/_types/api';
import { getFormattedDate } from '@shared/utils/date';
import Link from 'next/link';
import React from 'react';

interface Props {
  post: PostListData;
}

export default function ListItem({ post }: Props) {
  return (
    <tr key={post.id} className="odd:bg-gray-50">
      <td className="w-8/12 px-4 py-2 font-medium whitespace-nowrap text-gray-900">
        <Link href={`/post/${post.id}`}>{post.title}</Link>
      </td>
      <td className="px-4 py-2 font-medium whitespace-nowrap text-gray-900">
        {post.type}
      </td>
      <td className="px-4 py-2 font-medium whitespace-nowrap text-gray-900">
        {post.user?.name || 'Unknown'}
      </td>
      <td className="px-4 py-2 font-medium whitespace-nowrap text-gray-900">
        {getFormattedDate(post.created_at)}
      </td>
    </tr>
  );
}
