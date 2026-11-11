import Link from 'next/link';
import { useSession } from 'next-auth/react';
import React from 'react';
import { FormProvider } from 'react-hook-form';

import { PostsReq } from '../../api/types';
import { usePostListForm } from '../../model/usePostListForm';
import SearchInput from './SearchInput';
import TypeSelect from './TypeSelect';

interface Props {
  setSearchFilters: React.Dispatch<React.SetStateAction<PostsReq>>;
}

/** 게시글 분류와 검색, 인증된 사용자의 글쓰기 진입점 */
export default function ListFilter({ setSearchFilters }: Props) {
  const { status } = useSession();
  const { methods, handleFormSubmit, updateTypeTrigger } = usePostListForm({
    setSearchFilters,
  });

  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form
        role="search"
        aria-label="게시글 검색 및 분류"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-start lg:justify-between">
          <TypeSelect onChange={updateTypeTrigger} />

          <div className="flex w-full flex-wrap items-start gap-3 lg:w-auto lg:flex-nowrap">
            <SearchInput />
            {status === 'authenticated' && (
              <Link
                href="/post/create"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-inverse transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:bg-accent-hover motion-reduce:transition-none"
                passHref={false}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="size-4"
                >
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
                글쓰기
              </Link>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
