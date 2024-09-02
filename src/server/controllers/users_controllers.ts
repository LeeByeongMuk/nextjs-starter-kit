import { Request, Response } from 'express';

import usersServices from '@/server/services/users_services';

const users_controllers = {
  getUser: (req: Request, res: Response) => {
    return res.json({
      created_at: '2024-01-01 00:00:00',
      email: 'test@email.com',
      name: 'name',
      nickname: 'nickname',
      phone: null,
      provider: null,
    });
  },

  signIn: async (req: Request, res: Response) => {
    try {
      const data = await usersServices.signIn(req);

      return res.status(200).json({
        status: 200,
        message: 'success',
        data,
      });
    } catch (err) {
      return res.status(400).json({
        status: 400,
        message: 'error',
      });
    }
  },

  createUser: async (req: Request, res: Response) => {
    try {
      const data = await usersServices.createUser(req);

      return res.status(201).json({
        status: 201,
        message: 'success',
        data,
      });
    } catch (err) {
      return res.status(400).json({
        status: 400,
        message: 'error',
      });
    }
  },

  updateUser: (req: Request, res: Response) => {
    return res.json({
      id: 1,
      message: 'success',
    });
  },

  deleteUser: (req: Request, res: Response) => {
    return res.json({
      id: 1,
      message: 'success',
    });
  },
};

export default users_controllers;
