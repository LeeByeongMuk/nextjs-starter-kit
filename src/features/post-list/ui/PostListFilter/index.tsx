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

/** 분류와 검색, 로그인 사용자의 글쓰기 진입을 제공한다. */
export default function ListFilter({ setSearchFilters }: Props) {
  const { status } = useSession();
  const { methods, handleFormSubmit, updateTypeTrigger } = usePostListForm({
    setSearchFilters,
  });

  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form
        aria-label="게시글 필터"
        noValidate
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <TypeSelect onChange={updateTypeTrigger} />

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-start">
            {status === 'authenticated' && (
              <Link
                href="/post/create"
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded bg-accent px-5 text-sm font-semibold text-inverse hover:bg-accent-hover"
              >
                글쓰기
              </Link>
            )}
            <SearchInput />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
