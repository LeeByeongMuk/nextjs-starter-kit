import Link from 'next/link';
import { useSession } from 'next-auth/react';
import React from 'react';
import { FormProvider } from 'react-hook-form';

import SearchInput from '@domains/post/list/_components/PostListFilter/SearchInput';
import TypeSelect from '@domains/post/list/_components/PostListFilter/TypeSelect';
import { usePostListForm } from '@domains/post/list/_hooks/usePostListForm';
import { PostsReq } from '@domains/post/list/_types/api';

interface Props {
  setSearchFilters: React.Dispatch<React.SetStateAction<PostsReq>>;
}

export default function ListFilter({ setSearchFilters }: Props) {
  const { status } = useSession();
  const { methods, handleFormSubmit, updateTypeTrigger } = usePostListForm({
    setSearchFilters,
  });

  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="flex justify-between">
          <TypeSelect onChange={updateTypeTrigger} />

          <div className="flex">
            {status === 'authenticated' && (
              <Link
                href="/post/create"
                className="mr-2 flex items-center rounded border border-teal-600 bg-teal-600 px-4 text-sm font-medium text-white hover:bg-transparent hover:text-teal-600 focus:outline-none focus:ring active:text-teal-500"
                passHref={false}
              >
                Post Create
              </Link>
            )}
            <SearchInput />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
