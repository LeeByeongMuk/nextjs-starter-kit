import { Request } from 'express';
import Posts from '@/server/models/posts_models';
import tokenServices from '@/server/services/token_services';
import { CustomError } from '@/server/utils/errorHandling';

const postsServices = {
  getPosts: async (req: Request) => {
    try {
      return await Posts.getPosts(req.body);
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      } else {
        throw new CustomError('Error fetching posts', 500);
      }
    }
  },

  getPostById: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken(token);

      return await Posts.getPostById({
        postId: Number(req.params.id),
        userId: decoded.id,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      } else {
        throw new CustomError('Error fetching post', 500);
      }
    }
  },

  createPost: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken(token);

      return await Posts.createPost({
        ...req.body,
        userId: decoded.id,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      } else {
        throw new CustomError('Error creating post', 500);
      }
    }
  },

  updatePost: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken(token);

      return await Posts.updatePost({
        id: Number(req.params.id),
        userId: decoded.id,
        ...req.body,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      } else {
        throw new CustomError('Error updating post', 500);
      }
    }
  },

  getPostUpdateResourceById: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken(token);

      return await Posts.getPostUpdateResourceById({
        postId: Number(req.params.id),
        userId: decoded.id,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      } else {
        throw new CustomError('Error fetching post', 500);
      }
    }
  },

  deletePost: async (req: Request) => {
    try {
      const token = tokenServices.checkAuthToken(req);
      const decoded = tokenServices.verifyAccessToken(token);

      return await Posts.deletePost({
        postId: Number(req.params.id),
        userId: decoded.id,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        throw err;
      } else {
        throw new CustomError('Error deleting post', 500);
      }
    }
  },
};

export default postsServices;
