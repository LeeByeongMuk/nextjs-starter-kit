import { useMutation } from '@tanstack/react-query';

import { fetchUserUpdate } from '@/app/api/auth';

export default function useUserUpdate() {
  return useMutation({
    mutationFn: fetchUserUpdate,
  });
}
