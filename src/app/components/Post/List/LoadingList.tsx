import React from 'react';

import { DUMMY_DATA } from '@/app/constants/post';

export default function LoadingList() {
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
