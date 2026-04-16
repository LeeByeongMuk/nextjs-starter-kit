import React from 'react';

export default function PostListEmptyUI() {
  return (
    <tr className="odd:bg-gray-50">
      <td colSpan={4} className="p-4 text-center font-medium text-gray-900">
        No posts found
      </td>
    </tr>
  );
}
