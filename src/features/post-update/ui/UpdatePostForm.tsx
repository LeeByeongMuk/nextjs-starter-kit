import {
  ButtonBox,
  IsOpenCheckbox,
  TitleInput,
  TypeSelect,
} from '@entities/post';
// DOM 의존 편집기는 SSR 안전성을 위해 Public API에서 제외한다.
// eslint-disable-next-line boundaries/dependencies
import ContentsEditor from '@entities/post/ui/Form/ContentsEditor';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { UpdatePostFormInput } from '../model/form';

interface UpdatePostFormProps {
  handleUpdatePost: (req: UpdatePostFormInput) => void;
}

/** 게시글 필드를 검증한 뒤 HTML 본문과 함께 제출한다. */
export default function UpdatePostForm({
  handleUpdatePost,
}: UpdatePostFormProps) {
  const { handleSubmit } = useFormContext<UpdatePostFormInput>();

  return (
    <form noValidate onSubmit={handleSubmit(handleUpdatePost)}>
      <TitleInput />

      <TypeSelect />

      <ContentsEditor />

      <IsOpenCheckbox />

      <ButtonBox />
    </form>
  );
}
