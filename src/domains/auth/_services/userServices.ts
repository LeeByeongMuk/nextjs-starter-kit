import { UserRes } from '@domains/auth/_types/api';
import { fetchApi } from '@shared/utils/api';

const fetchUser = async () => {
  return (await fetchApi('/api/users', {
    method: 'GET',
  })) as UserRes;
};

export { fetchUser };
