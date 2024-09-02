import { SignUpReq } from '@/app/types/auth';
import Users from '@/server/models/users_models';

const usersServices = {
  signIn: async (req: { body: SignUpReq }) => {
    try {
      return await Users.signIn(req.body);
    } catch {
      throw new Error('error');
    }
  },
  createUser: async (req: { body: SignUpReq }) => {
    try {
      return await Users.createUser(req.body);
    } catch {
      throw new Error('error');
    }
  },
};

export default usersServices;
