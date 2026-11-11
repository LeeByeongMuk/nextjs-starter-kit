import { DUMMY_DATA } from '@entities/post';
import React from 'react';

/** 목록 행의 높이를 유지하는 로딩 표시 */
export default function PostListSkeletonUI() {
  return DUMMY_DATA.map(post => (
    <tr key={post.id} aria-hidden="true" className="motion-safe:animate-pulse">
      <td className="px-1 py-6 md:px-4">
        <div className="h-4 w-3/4 rounded bg-skeleton" />
        <div className="mt-4 h-3 w-1/2 rounded bg-skeleton md:hidden" />
      </td>
      <td className="hidden px-3 py-6 md:table-cell">
        <div className="h-4 w-full rounded bg-skeleton" />
      </td>
      <td className="hidden px-4 py-6 md:table-cell">
        <div className="h-4 w-2/3 rounded bg-skeleton" />
      </td>
      <td className="hidden px-4 py-6 md:table-cell">
        <div className="ml-auto h-4 w-3/4 rounded bg-skeleton" />
      </td>
    </tr>
  ));
}
