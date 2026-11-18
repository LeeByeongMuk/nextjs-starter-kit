import { PostForm } from '@entities/post';

import { UpdatePostFormInput } from '../model/form';

interface UpdatePostFormProps {
  handleUpdatePost: (req: UpdatePostFormInput) => Promise<unknown>;
}

/** 게시글 필드를 검증한 뒤 HTML 본문과 함께 제출한다. */
export default function UpdatePostForm({
  handleUpdatePost,
}: UpdatePostFormProps) {
  return <PostForm onSave={handleUpdatePost} />;
}
