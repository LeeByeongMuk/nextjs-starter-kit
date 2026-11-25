'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { PostsReq } from '../api/types';
import { type PostListSearch, PostListSearchSchema } from './form';

interface UsePostListFormProps {
  searchFilters: PostsReq;
  setSearchFilters: React.Dispatch<React.SetStateAction<PostsReq>>;
}

/** URL의 분류와 검색어를 따르는 목록 검색 폼과 제출·분류 변경 처리 */
export function usePostListForm({
  searchFilters,
  setSearchFilters,
}: UsePostListFormProps) {
  const methods = useForm<PostListSearch>({
    defaultValues: {
      type: searchFilters.type,
      q: searchFilters.q,
    },
    resolver: zodResolver(PostListSearchSchema),
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
