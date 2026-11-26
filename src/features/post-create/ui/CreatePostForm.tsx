import { PostForm } from '@entities/post';

import { CreatePostFormOutput } from '../model/form';

interface CreatePostFormProps {
  handleCreatePost: (data: CreatePostFormOutput) => Promise<unknown>;
}

/** 게시글 필드를 검증한 뒤 HTML 본문과 함께 제출한다. */
export default function CreatePostForm({
  handleCreatePost,
}: CreatePostFormProps) {
  return <PostForm onSave={handleCreatePost} />;
}
