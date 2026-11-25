'use client';

import { useRouter } from 'next/navigation';

interface Props {
  isSubmitting?: boolean;
  isSaved?: boolean;
}

/** 편집 폼의 기존 취소·제출 동작을 제공한다. */
export default function ButtonBox({
  isSubmitting = false,
  isSaved = false,
}: Props) {
  const router = useRouter();
  return (
    <div className="mt-10 flex flex-wrap justify-end gap-3 border-t border-line pt-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="min-h-12 rounded border border-line px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
      >
        취소
      </button>
      <button
        type="submit"
        disabled={isSubmitting || isSaved}
        className="min-h-12 rounded bg-accent px-7 py-3 text-sm font-semibold text-inverse enabled:hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
      >
        {isSaved ? '저장 완료' : isSubmitting ? '저장 중…' : '저장'}
      </button>
    </div>
  );
}
