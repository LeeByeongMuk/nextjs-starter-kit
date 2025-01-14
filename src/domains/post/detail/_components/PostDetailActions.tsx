import Link from 'next/link';
import React from 'react';

interface PostDetailActionsProps {
  id: number;
  isEditable: boolean;
  handleRedirectBack: () => void;
  handleDeletePost: () => void;
}

export default function PostDetailActions({
  id,
  isEditable,
  handleRedirectBack,
  handleDeletePost,
}: PostDetailActionsProps) {
  return (
    <div className="mt-5 flex justify-center gap-2.5">
      <button
        type="button"
        className="inline-block rounded border border-teal-600 bg-teal-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-teal-600 focus:outline-none focus:ring active:text-teal-500"
        onClick={handleRedirectBack}
      >
        back
      </button>

      {isEditable && (
        <Link
          href={`/post/${id}/update`}
          role="post-edit-link"
          className="inline-block rounded border border-teal-600 px-12 py-3 text-sm font-medium text-teal-600 hover:bg-teal-600 hover:text-white focus:outline-none focus:ring active:bg-teal-500"
          passHref={false}
        >
          update
        </Link>
      )}

      {isEditable && (
        <button
          type="button"
          className="inline-block rounded border border-red-600 px-12 py-3 text-sm font-medium text-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus:ring active:bg-teal-500"
          onClick={handleDeletePost}
        >
          delete
        </button>
      )}
    </div>
  );
}
