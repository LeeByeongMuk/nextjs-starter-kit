import { UserRes } from '@entities/auth/api/types';
import { fetchApi } from '@shared/lib/api';

const fetchUser = async () => {
  return (await fetchApi('/api/users', {
    method: 'GET',
  })) as UserRes;
};

export { fetchUser };
