'use client';

import { useRouter } from 'next/navigation';

/** 편집 폼의 기존 취소·제출 동작을 제공한다. */
export default function ButtonBox() {
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
        className="min-h-12 rounded bg-accent px-7 py-3 text-sm font-semibold text-inverse hover:bg-accent-hover"
      >
        저장
      </button>
    </div>
  );
}
