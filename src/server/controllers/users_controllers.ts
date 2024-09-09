import { Request, Response } from 'express';

import usersServices from '@/server/services/users_services';
import { handleError } from '@/server/utils/errorHandling';

const usersControllers = {
  getUser: async (req: Request, res: Response) => {
    try {
      const data = await usersServices.getUser(req);

      return res.status(200).json({
        ok: true,
        message: 'success',
        data,
      });
    } catch (err) {
      handleError(err, res);
    }
  },

  signIn: async (req: Request, res: Response) => {
    try {
      const data = await usersServices.signIn(req);

      return res.status(200).json({
        ok: true,
        message: 'success',
        data,
      });
    } catch (err) {
      handleError(err, res);
    }
  },

  createUser: async (req: Request, res: Response) => {
    try {
      const data = await usersServices.createUser(req);

      return res.status(201).json({
        ok: true,
        message: 'success',
        data,
      });
    } catch (err) {
      handleError(err, res);
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const data = await usersServices.updateUser(req);

      return res.status(200).json({
        ok: true,
        message: 'success',
        data,
      });
    } catch (err) {
      handleError(err, res);
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    try {
      const data = await usersServices.deleteUser(req);

      return res.status(200).json({
        ok: true,
        message: 'success',
        data,
      });
    } catch (err) {
      handleError(err, res);
    }
  },
};

export default usersControllers;
