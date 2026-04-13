import ButtonBox from '@entities/post/ui/Form/ButtonBox';
import ContentsEditor from '@entities/post/ui/Form/ContentsEditor';
import IsOpenCheckbox from '@entities/post/ui/Form/IsOpenCheckbox';
import TitleInput from '@entities/post/ui/Form/TitleInput';
import TypeSelect from '@entities/post/ui/Form/TypeSelect';
import { CreatePostFormInput } from '@features/post-create/model/form';
import React from 'react';
import { useFormContext } from 'react-hook-form';

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
