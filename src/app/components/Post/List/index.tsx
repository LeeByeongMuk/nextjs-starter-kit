import React from 'react';

import EmptyItem from '@/app/components/Post/List/EmptyItem';
import ListItem from '@/app/components/Post/List/Item';
import LoadingList from '@/app/components/Post/List/LoadingList';
import { PostListData } from '@/app/types/api/post';

interface Props {
  posts: PostListData[];
  isLoading: boolean;
}

export default function PostList({ posts, isLoading }: Props) {
  const renderPostList = () => {
    if (isLoading) {
      return <LoadingList />;
    }

    if (!posts.length) {
      return <EmptyItem />;
    }

    return posts.map(post => {
      return <ListItem key={post.id} post={post} />;
    });
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
