import express from 'express';

import users_controllers from '@/server/controllers/users_controllers';

const router = express.Router();

router.get('/', users_controllers.getUser);
router.post('/signup', users_controllers.createUser);
router.post('/signin', users_controllers.signIn);
router.put('/', users_controllers.updateUser);
router.delete('/', users_controllers.deleteUser);

export default router;
