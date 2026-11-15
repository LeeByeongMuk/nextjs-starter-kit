'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { PostListSearch, PostsReq } from '../api/types';
import useSearchFilters from './useSearchFilters';

interface UsePostListFormProps {
  setSearchFilters: React.Dispatch<React.SetStateAction<PostsReq>>;
}

/** URL의 분류와 검색어를 따르는 목록 검색 폼과 제출·분류 변경 처리 */
export function usePostListForm({ setSearchFilters }: UsePostListFormProps) {
  const { searchFilters } = useSearchFilters();

  const methods = useForm<PostListSearch>({
    defaultValues: {
      type: searchFilters.type,
      q: searchFilters.q,
    },
  });

  const { getValues, resetField } = methods;

  useEffect(() => {
    resetField('type', { defaultValue: searchFilters.type });
  }, [resetField, searchFilters.type]);

  useEffect(() => {
    resetField('q', { defaultValue: searchFilters.q });
  }, [resetField, searchFilters.q]);

  const handleFormSubmit = (data: PostListSearch) => {
    setSearchFilters({
      ...data,
      page: 1,
    });
  };

  const updateTypeTrigger = () => {
    const type = getValues('type');
    setSearchFilters(prev => ({
      ...prev,
      type,
      page: 1,
    }));
  };

  return {
    methods,
    handleFormSubmit,
    updateTypeTrigger,
  };
}
