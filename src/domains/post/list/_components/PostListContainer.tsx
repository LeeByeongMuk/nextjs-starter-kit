import React from 'react';

import PostListEmptyUI from '@domains/post/list/_components/PostListEmptyUI';
import ListItem from '@domains/post/list/_components/PostListItem';
import PostListSkeletonUI from '@domains/post/list/_components/PostListSkeletonUI';
import { PostListData } from '@domains/post/list/_types/api';

interface Props {
  posts: PostListData[];
  isLoading: boolean;
}

export default function PostList({ posts, isLoading }: Props) {
  const renderPostList = () => {
    if (isLoading) {
      return <PostListSkeletonUI />;
    }

    if (!posts.length) {
      return <PostListEmptyUI />;
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
