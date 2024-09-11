import express from 'express';

import usersControllers from '@/server/controllers/users_controllers';

const router = express.Router();

router.get('/', usersControllers.getUser);
router.post('/signup', usersControllers.createUser);
router.post('/signin', usersControllers.signIn);
router.put('/', usersControllers.updateUser);
router.delete('/', usersControllers.deleteUser);

export default router;
