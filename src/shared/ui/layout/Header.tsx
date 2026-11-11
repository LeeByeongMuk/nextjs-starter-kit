'use client';

import { deleteAccessToken } from '@shared/lib/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

/** 세션에 맞는 주요 탐색과 인증 동작을 제공한다. */
export default function Header() {
  const { status } = useSession();
  const pathname = usePathname();

  const onSignOut = async () => {
    await deleteAccessToken();
    await signOut();
  };

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex min-h-20 w-full max-w-[1120px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 sm:px-8">
        <Link
          href="/post"
          className="flex min-h-11 items-center text-lg font-bold tracking-tight text-ink"
        >
          next<span className="text-accent"> / </span>starter
        </Link>
        <nav
          aria-label="주요 메뉴"
          className="flex flex-wrap items-center gap-1 text-sm sm:gap-4"
        >
          <Link
            href="/post"
            aria-current={pathname?.startsWith('/post') ? 'page' : undefined}
            className="inline-flex min-h-11 items-center px-2 font-semibold text-accent hover:text-accent-hover"
          >
            게시판
          </Link>
          {status === 'authenticated' && (
            <Link
              href="/account"
              aria-current={pathname === '/account' ? 'page' : undefined}
              className="inline-flex min-h-11 items-center px-2 text-muted hover:text-ink"
            >
              내 계정
            </Link>
          )}
          {status === 'loading' ? (
            <span role="status" className="px-2 text-muted">
              로그인 확인 중
            </span>
          ) : status === 'authenticated' ? (
            <button
              type="button"
              onClick={onSignOut}
              className="min-h-11 px-2 text-muted hover:text-ink"
            >
              로그아웃
            </button>
          ) : (
            <Link
              href="/signin"
              className="inline-flex min-h-11 items-center rounded border border-line px-4 font-medium hover:border-accent hover:text-accent"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
