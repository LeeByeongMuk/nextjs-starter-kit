import { fetchApi } from '@shared/lib/api';

import { UserRes } from './types';

const fetchUser = async () => {
  return (await fetchApi('/api/users', {
    method: 'GET',
  })) as UserRes;
};

export { fetchUser };
