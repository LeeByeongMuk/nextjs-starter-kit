import Link from 'next/link';

/** 실제 게시판으로 돌아가는 간결한 푸터를 제공한다. */
export default function Footer() {
  return (
    <footer className="border-t border-line text-sm text-muted">
      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-3 px-5 py-6 sm:px-8">
        <p>next / starter</p>
        <Link
          href="/post"
          className="inline-flex min-h-11 items-center hover:text-accent"
        >
          게시판으로 돌아가기{' '}
          <span aria-hidden="true" className="ml-2">
            ↑
          </span>
        </Link>
      </div>
    </footer>
  );
}
