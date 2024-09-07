import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  return res.json([
    {
      created_at: '2024-01-01 00:00:00',
      hit: 1,
      id: 1,
      title: 'title',
      type: 'notice',
      user_name: 'name',
    },
  ]);
});

router.get('/:id', (req, res) => {
  return res.json({
    contents: 'contents',
    created_at: '2024-01-01 00:00:00',
    hit: 1,
    id: 1,
    is_editable: true,
    title: 'title',
    type: 'notice',
    user_name: 'name',
  });
});

router.post('/', (req, res) => {
  return res.json({
    id: 1,
    message: 'success',
  });
});

router.put('/:id', (req, res) => {
  return res.json({
    id: 1,
    message: 'success',
  });
});

router.get('/:id/edit', (req, res) => {
  return res.json({
    id: 1,
    type: 'notice',
    title: 'title',
    contents: 'contents',
    is_published: true,
  });
});

export default router;
