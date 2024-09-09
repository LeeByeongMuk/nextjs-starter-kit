import { Request } from 'express';

import { PostType } from '@/app/types/post';
import Posts from '@/server/models/posts_models';
import tokenServices from '@/server/services/token_services';
import { CustomError } from '@/server/utils/errorHandling';

const postsServices = {
  getPosts: async (req: Request) => {
    try {
      const params = req.params;
      const posts = await Posts.getPosts({
        page: Number(params.page),
        type: params.type as PostType,
        q: params.q,
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
      if (!decoded.ok) {
        throw new CustomError('Invalid token', 401);
      }

      const post = await Posts.getPostById({
        postId: Number(req.params.id),
        userId: decoded.data?.id as number,
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
      if (!decoded.ok) {
        throw new CustomError('Invalid token', 401);
      }

      const postId = await Posts.createPost({
        ...req.body,
        userId: Number(decoded.data?.id),
      });

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
      if (!decoded.ok) {
        throw new CustomError('Invalid token', 401);
      }

      const postId = await Posts.updatePost({
        userId: decoded.data?.id as number,
        id: Number(req.params.id),
        ...req.body,
      });

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
      if (!decoded.ok) {
        throw new CustomError('Invalid token', 401);
      }

      const post = await Posts.getPostUpdateResourceById({
        postId: Number(req.params.id),
        userId: Number(decoded.data?.id),
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
};

export default postsServices;
