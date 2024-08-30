import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  return res.json([
    {
      created_at: '2024-01-01 00:00:00',
      email: 'test@email.com',
      name: 'name',
      nickname: 'nickname',
      phone: null,
      provider: null,
    },
  ]);
});

router.post('/signup', (req, res) => {

  return res.json({
    access_token: '1|asdasdasdads',
  });
});

router.post('/signin', (req, res) => {
  return res.json({
    access_token: '1|asdasdasdads',
  });
});

router.put('/', (req, res) => {
  return res.json({
    id: 1,
    message: 'success',
  });
});

router.delete('/', (req, res) => {
  return res.json({
    id: 1,
    message: 'success',
  });
});

export default router;