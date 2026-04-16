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
                className="mr-2 flex items-center rounded border border-teal-600 bg-teal-600 px-4 text-sm font-medium text-white hover:bg-transparent hover:text-teal-600 focus:ring focus:outline-none active:text-teal-500"
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
