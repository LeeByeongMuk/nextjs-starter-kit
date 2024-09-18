import { Request, Response } from 'express';

import postsServices from '@/server/services/posts_services';
import { handleErrorResponse } from '@/server/utils/errorHandling';

const postsControllers = {
  getPosts: async (req: Request, res: Response) => {
    try {
      const data = await postsServices.getPosts(req);

      return res.status(200).json({
        ok: true,
        message: 'success',
        ...data,
      });
    } catch (err) {
      handleErrorResponse(err, res);
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
      handleErrorResponse(err, res);
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
      handleErrorResponse(err, res);
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
      handleErrorResponse(err, res);
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
      handleErrorResponse(err, res);
    }
  },

  deletePost: async (req: Request, res: Response) => {
    try {
      const data = await postsServices.deletePost(req);

      return res.status(200).json({
        ok: true,
        message: 'success',
        data,
      });
    } catch (err) {
      handleErrorResponse(err, res);
    }
  },
};

export default postsControllers;
