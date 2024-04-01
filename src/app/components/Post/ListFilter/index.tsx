import React, { useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import SearchInput from '@/app/components/Post/ListFilter/SearchInput';
import TypeSelect from '@/app/components/Post/ListFilter/TypeSelect';
import { PostListSearch, PostsReq } from '@/app/types/post';

interface Props {
  setSearchFilters: React.Dispatch<React.SetStateAction<PostsReq>>;
}

export default function ListFilter({ setSearchFilters }: Props) {
  const methods = useForm<PostListSearch>({
    defaultValues: {
      type: '',
      q: '',
    },
  });
  const { handleSubmit, getValues } = methods;
  const type = getValues('type');

  useEffect(() => {
    setSearchFilters(prev => ({
      ...prev,
      type,
      page: 1,
    }));
  }, [type, setSearchFilters]);

  const onSubmit: SubmitHandler<PostListSearch> = data => {
    setSearchFilters({
      ...data,
      page: 1,
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between">
          <TypeSelect />

          <SearchInput />
        </div>
      </form>
    </FormProvider>
  );
}
