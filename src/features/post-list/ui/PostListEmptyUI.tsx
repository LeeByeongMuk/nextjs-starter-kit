import React from 'react';

/** 결과가 없는 검색에 다음 행동을 안내하는 빈 목록 */
export default function PostListEmptyUI() {
  return (
    <tr>
      <td colSpan={4} className="px-4 py-16 text-center">
        <p className="font-medium text-ink" role="status">
          표시할 게시글이 없습니다.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">
          검색어를 바꾸거나 다른 분류를 선택해 보세요.
        </p>
      </td>
    </tr>
  );
}
