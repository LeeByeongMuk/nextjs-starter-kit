import { useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

import { fetchDeletePost } from '@/app/api/post';

export default function useDeletePost() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  return useMutation({
    mutationFn: () => fetchDeletePost({ id }),
    onSuccess: () => {
      alert('Post deleted successfully');
      router.push('/');
    },
    onError: () => {
      alert('Failed to delete post');
    },
  });
}
