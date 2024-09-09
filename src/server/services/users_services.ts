import { Request } from 'express';

import { SignUpReq } from '@/app/types/api/auth';
import Users from '@/server/models/users_models';
import tokenServices from '@/server/services/token_services';
import { handleError } from '@/server/utils/errorHandling';

const usersServices = {
  getUser: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken({ token });

      return await Users.getUser({
        userId: decoded.id,
      });
    } catch (err) {
      handleError(err);
    }
  },

  signIn: async (req: { body: SignUpReq }) => {
    try {
      const user = await Users.signIn(req.body);
      const { accessToken } = await tokenServices.generateTokens({
        userId: user.id,
      });

      return {
        access_token: accessToken,
        id: user.id,
      };
    } catch (err) {
      handleError(err);
    }
  },

  createUser: async (req: { body: SignUpReq }) => {
    try {
      const user = await Users.createUser(req.body);
      const { accessToken, refreshToken } = await tokenServices.generateTokens({
        userId: user.id,
      });

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (err) {
      handleError(err);
    }
  },

  updateUser: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken({ token });

      return await Users.updateUser({
        ...req.body,
        userId: decoded.id,
      });
    } catch (err) {
      handleError(err);
    }
  },

  deleteUser: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken({ token });

      return await Users.deleteUser({
        ...req.body,
        id: decoded.id,
      });
    } catch (err) {
      handleError(err);
    }
  },
};

export default usersServices;
