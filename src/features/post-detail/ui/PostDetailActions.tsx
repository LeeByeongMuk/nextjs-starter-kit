import Link from 'next/link';

interface PostDetailActionsProps {
  id: number;
  isEditable: boolean;
  handleRedirectBack: () => void;
  handleDeletePost: () => void;
}

/** 기존 돌아가기·수정·삭제 동작을 제공한다. */
export default function PostDetailActions({
  id,
  isEditable,
  handleRedirectBack,
  handleDeletePost,
}: PostDetailActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
      <button
        type="button"
        onClick={handleRedirectBack}
        className="min-h-11 rounded border border-line px-5 py-2 text-sm font-semibold hover:border-accent hover:text-accent"
      >
        돌아가기
      </button>
      {isEditable && (
        <>
          <Link
            href={`/post/${id}/update`}
            className="inline-flex min-h-11 items-center rounded bg-accent px-5 py-2 text-sm font-semibold text-inverse hover:bg-accent-hover"
          >
            수정
          </Link>
          <button
            type="button"
            onClick={handleDeletePost}
            className="ml-auto min-h-11 rounded px-4 py-2 text-sm text-danger hover:underline"
          >
            삭제
          </button>
        </>
      )}
    </div>
  );
}
