import React from 'react';
import { useFormContext } from 'react-hook-form';

import ButtonBox from '@domains/post/_components/Form/ButtonBox';
import ContentsEditor from '@domains/post/_components/Form/ContentsEditor';
import IsOpenCheckbox from '@domains/post/_components/Form/IsOpenCheckbox';
import TitleInput from '@domains/post/_components/Form/TitleInput';
import TypeSelect from '@domains/post/_components/Form/TypeSelect';
import { CreatePostFormInput } from '@domains/post/create/_types/form';

interface CreatePostFormProps {
  handleCreatePost: (req: CreatePostFormInput) => void;
}

export default function CreatePostForm({
  handleCreatePost,
}: CreatePostFormProps) {
  const { handleSubmit } = useFormContext<CreatePostFormInput>();

  return (
    <form onSubmit={handleSubmit(handleCreatePost)}>
      <TitleInput />

      <TypeSelect />

      <ContentsEditor />

      <IsOpenCheckbox />

      <ButtonBox />
    </form>
  );
}
