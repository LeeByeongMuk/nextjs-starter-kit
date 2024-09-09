import { Request, Response } from 'express';

import postsServices from '@/server/services/posts_services';
import { handleError } from '@/server/utils/errorHandling';

const postsControllers = {
  getPosts: async (req: Request, res: Response) => {
    try {
      const data = await postsServices.getPosts(req);

      return res.status(200).json({
        ok: true,
        message: 'success',
        data,
      });
    } catch (err) {
      handleError(err, res);
    }
  },
  getPostById: async (req: Request, res: Response) => {
    try {
      const data = await postsServices.getPostById(req);

      return res.status(200).json({
        ok: true,
        message: 'success',
        data,
      });
    } catch (err) {
      handleError(err, res);
    }
  },
  createPost: async (req: Request, res: Response) => {
    try {
      const data = await postsServices.createPost(req);

      return res.status(201).json({
        ok: true,
        message: 'success',
        data,
      });
    } catch (err) {
      handleError(err, res);
    }
  },
  updatePost: async (req: Request, res: Response) => {
    try {
      const data = await postsServices.updatePost(req);

      return res.status(200).json({
        ok: true,
        message: 'success',
        data,
      });
    } catch (err) {
      handleError(err, res);
    }
  },
  getPostUpdateResourceById: async (req: Request, res: Response) => {
    try {
      const data = await postsServices.getPostUpdateResourceById(req);

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

export default postsControllers;
