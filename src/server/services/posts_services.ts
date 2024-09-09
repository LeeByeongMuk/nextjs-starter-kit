import { Request } from 'express';

import { PostType } from '@/app/types/api/post';
import Posts from '@/server/models/posts_models';
import tokenServices from '@/server/services/token_services';
import { CustomError } from '@/server/utils/errorHandling';

const postsServices = {
  getPosts: async (req: Request) => {
    try {
      const posts = await Posts.getPosts({
        page: Number(req.body.page),
        type: req.body.type as PostType,
        q: req.body.q,
      });

      if (!posts) {
        throw new CustomError('Posts not found', 404);
      }

      return posts;
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
      const token = req.headers.authorization;
      if (!token) {
        throw new CustomError('Token not found', 401);
      }

      const decoded = tokenServices.verifyAccessToken(token as string);
      if (!decoded) {
        throw new CustomError('Invalid token', 401);
      }

      const post = await Posts.getPostById({
        postId: Number(req.params.id),
        userId: decoded.id,
      });

      if (!post) {
        throw new CustomError('Post not found', 404);
      }

      return post;
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
      const token = req.headers.authorization;
      if (!token) {
        throw new CustomError('Token not found', 401);
      }

      const decoded = tokenServices.verifyAccessToken(token as string);
      if (!decoded) {
        throw new CustomError('Invalid token', 401);
      }

      const postId = await Posts.createPost({
        ...req.body,
        userId: decoded.id,
      });

      if (!postId) {
        throw new CustomError('Error creating post', 500);
      }

      return {
        id: postId,
      };
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
      const token = req.headers.authorization;
      if (!token) {
        throw new CustomError('Token not found', 401);
      }

      const decoded = tokenServices.verifyAccessToken(token as string);
      if (!decoded) {
        throw new CustomError('Invalid token', 401);
      }

      const postId = await Posts.updatePost({
        id: Number(req.params.id),
        userId: decoded.id,
        ...req.body,
      });

      if (!postId) {
        throw new CustomError('Error updating post', 500);
      }

      return {
        id: postId,
      };
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
      const token = req.headers.authorization;
      if (!token) {
        throw new CustomError('Token not found', 401);
      }

      const decoded = tokenServices.verifyAccessToken(token as string);
      if (!decoded) {
        throw new CustomError('Invalid token', 401);
      }

      const post = await Posts.getPostUpdateResourceById({
        postId: Number(req.params.id),
        userId: decoded.id,
      });

      if (!post) {
        throw new CustomError('Post not found', 404);
      }

      return post;
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
      const token = req.headers.authorization;
      if (!token) {
        throw new CustomError('Token not found', 401);
      }

      const decoded = tokenServices.verifyAccessToken(token as string);
      if (!decoded) {
        throw new CustomError('Invalid token', 401);
      }

      const postId = await Posts.deletePost({
        postId: Number(req.params.id),
        userId: decoded.id,
      });

      if (!postId) {
        throw new CustomError('Error deleting post', 500);
      }

      return {
        id: postId,
      };
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
