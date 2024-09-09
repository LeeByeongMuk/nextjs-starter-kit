import { Request } from 'express';

import { SignUpReq } from '@/app/types/api/auth';
import Users from '@/server/models/users_models';
import tokenServices from '@/server/services/token_services';
import { CustomError } from '@/server/utils/errorHandling';

const usersServices = {
  getUser: async (req: Request) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new CustomError('Token not found', 401);
      }

      const decoded = tokenServices.verifyAccessToken(token as string);
      if (!decoded) {
        throw new CustomError('Invalid token', 401);
      }

      const user = await Users.getUser(decoded.id);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      return user;
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      } else {
        throw new CustomError('Error fetching user', 500);
      }
    }
  },

  signIn: async (req: { body: SignUpReq }) => {
    try {
      const user = await Users.signIn(req.body);

      const { accessToken } = await tokenServices.generateTokens(user.id);

      return {
        access_token: accessToken,
        id: user.id,
      };
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      } else {
        throw new CustomError('Error signing in', 500);
      }
    }
  },

  createUser: async (req: { body: SignUpReq }) => {
    try {
      const user = await Users.createUser(req.body);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const { accessToken, refreshToken } = await tokenServices.generateTokens(
        user.id
      );

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      } else {
        throw new CustomError('Error creating user', 500);
      }
    }
  },

  updateUser: async (req: Request) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new CustomError('Token not found', 401);
      }

      const decoded = tokenServices.verifyAccessToken(token as string);
      if (!decoded) {
        throw new CustomError('Invalid token', 401);
      }

      const data = await Users.updateUser({
        ...req.body,
        id: decoded.id,
      });
      if (!data) {
        throw new CustomError('User not found', 404);
      }

      return data;
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      } else {
        throw new CustomError('Error updating user', 500);
      }
    }
  },

  deleteUser: async (req: Request) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new CustomError('Token not found', 401);
      }

      const decoded = tokenServices.verifyAccessToken(token as string);
      if (!decoded) {
        throw new CustomError('Invalid token', 401);
      }

      const data = await Users.deleteUser({
        ...req.body,
        id: decoded.id,
      });
      if (!data) {
        throw new CustomError('User not found', 404);
      }

      return data;
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      } else {
        throw new CustomError('Error deleting user', 500);
      }
    }
  },
};

export default usersServices;
