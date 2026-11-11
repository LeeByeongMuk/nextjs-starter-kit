import React from 'react';

import { PostListData } from '../api/types';
import PostListEmptyUI from './PostListEmptyUI';
import ListItem from './PostListItem';
import PostListSkeletonUI from './PostListSkeletonUI';

interface Props {
  posts: PostListData[];
  isLoading: boolean;
  isError?: boolean;
}

/** 데스크톱 표와 모바일 목록을 공유하는 게시글 영역 */
export default function PostList({ posts, isLoading, isError }: Props) {
  const renderPostList = () => {
    if (isLoading) {
      return <PostListSkeletonUI />;
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={4} className="px-4 py-16 text-center">
            <p role="alert" className="font-medium text-ink">
              게시글을 불러오지 못했습니다.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              연결 상태를 확인하고 페이지를 새로고침해 주세요.
            </p>
          </td>
        </tr>
      );
    }

    if (!posts.length) {
      return <PostListEmptyUI />;
    }

    return posts.map(post => {
      return <ListItem key={post.id} post={post} />;
    });
  };

  return (
    <div id="post-list" aria-busy={isLoading} className="border-b border-line">
      <table className="w-full table-fixed bg-surface text-left text-sm">
        <caption className="sr-only">
          게시글 목록: 제목, 분류, 작성자, 작성일
        </caption>
        <thead className="border-b border-line bg-paper">
          <tr>
            <th
              scope="col"
              className="md:w-6/12 px-4 py-3 text-xs font-medium text-muted"
            >
              제목
            </th>

            <th
              scope="col"
              className="hidden md:table-cell w-2/12 px-3 py-3 text-xs font-medium text-muted"
            >
              분류
            </th>

            <th
              scope="col"
              className="hidden md:table-cell w-2/12 px-4 py-3 text-xs font-medium text-muted"
            >
              작성자
            </th>

            <th
              scope="col"
              className="hidden md:table-cell w-2/12 px-4 py-3 text-right text-xs font-medium text-muted"
            >
              작성일
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-line">{renderPostList()}</tbody>
      </table>
    </div>
  );
}
