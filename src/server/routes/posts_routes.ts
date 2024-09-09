import express from 'express';

import postsControllers from '@/server/controllers/posts_controllers';

const router = express.Router();

router.get('/', postsControllers.getPosts);
router.get('/:id', postsControllers.getPostById);
router.post('/', postsControllers.createPost);
router.put('/:id', postsControllers.updatePost);
router.get('/:id/edit', postsControllers.getPostUpdateResourceById);
router.delete('/:id', postsControllers.deletePost);

export default router;
