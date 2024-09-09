import { Request } from 'express';
import jwt from 'jsonwebtoken';

import Token from '@/server/models/token_models';
import { CustomError, handleError } from '@/server/utils/errorHandling';

import 'dotenv/config';

const tokenServices = {
  checkAuthToken: (req: Request) => {
    const token = req.headers.authorization;
    if (!token) {
      throw new CustomError('Token not found', 401);
    }
    return token;
  },

  createAccessToken: (user: { id: number }) => {
    try {
      return jwt.sign({ ...user }, process.env.JWT_SECRET as string, {
        algorithm: 'HS256',
        expiresIn: '1h',
      });
    } catch (err) {
      handleError(err);
    }
  },

  createRefreshToken: async (user: { id: number }) => {
    try {
      const refreshToken = jwt.sign(
        {},
        process.env.JWT_REFRESH_SECRET as string,
        {
          algorithm: 'HS256',
          expiresIn: '7d',
        }
      );

      await Token.saveRefreshToken({
        userId: user.id,
        refreshToken,
      });

      return refreshToken;
    } catch (err) {
      handleError(err);
    }
  },

  verifyAccessToken: ({ token }: { token: string }) => {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload;

    if (!decoded.id) {
      throw new CustomError('Invalid access token', 401);
    }

    return {
      id: decoded.id,
    };
  },

  verifyRefreshToken: async ({ refreshToken }: { refreshToken: string }) => {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      ) as jwt.JwtPayload;

      const refreshTokenRecord = await Token.findRefreshToken({
        userId: Number(decoded.id),
      });

      if (!refreshTokenRecord || refreshTokenRecord.user_id !== decoded.id) {
        throw new CustomError('Invalid refresh token', 401);
      }

      const newAccessToken = tokenServices.createAccessToken({
        id: refreshTokenRecord.user_id,
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (err) {
      handleError(err);
    }
  },

  revokeRefreshToken: async ({ refreshToken }: { refreshToken: string }) => {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      ) as jwt.JwtPayload;

      return await Token.revokeRefreshToken({
        userId: decoded.id,
      });
    } catch (err) {
      handleError(err);
    }
  },

  generateTokens: async ({ userId }: { userId: number }) => {
    const accessToken = tokenServices.createAccessToken({ id: userId });
    const refreshToken = await tokenServices.createRefreshToken({
      id: userId,
    });

    return {
      accessToken,
      refreshToken,
    };
  },
};

export default tokenServices;
