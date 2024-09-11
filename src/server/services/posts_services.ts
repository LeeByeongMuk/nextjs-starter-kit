import { Request } from 'express';

import Posts from '@/server/models/posts_models';
import tokenServices from '@/server/services/token_services';
import { handleError } from '@/server/utils/errorHandling';

const postsServices = {
  getPosts: async (req: Request) => {
    try {
      return await Posts.getPosts(req.body);
    } catch (err) {
      handleError(err);
    }
  },

  getPostById: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken({ token });

      return await Posts.getPostById({
        postId: Number(req.params.id),
        userId: decoded.id,
      });
    } catch (err) {
      handleError(err);
    }
  },

  createPost: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken({ token });

      return await Posts.createPost({
        ...req.body,
        userId: decoded.id,
      });
    } catch (err) {
      handleError(err);
    }
  },

  updatePost: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken({ token });

      return await Posts.updatePost({
        id: Number(req.params.id),
        userId: decoded.id,
        ...req.body,
      });
    } catch (err) {
      handleError(err);
    }
  },

  getPostUpdateResourceById: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken({ token });

      return await Posts.getPostUpdateResourceById({
        postId: Number(req.params.id),
        userId: decoded.id,
      });
    } catch (err) {
      handleError(err);
    }
  },

  deletePost: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken({ token });

      return await Posts.deletePost({
        postId: Number(req.params.id),
        userId: decoded.id,
      });
    } catch (err) {
      handleError(err);
    }
  },
};

export default postsServices;
