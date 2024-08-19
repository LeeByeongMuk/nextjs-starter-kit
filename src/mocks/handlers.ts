import { http, HttpResponse } from 'msw';

export const handlers = [
  // 회원 API
  http.post(`/api/users/signup`, () => {
    return HttpResponse.json({
      data: {
        access_token: '1|mockaccesstoken0000',
      },
    });
  }),
  http.post(`/api/users/signin`, () => {
    return HttpResponse.json({
      data: {
        access_token: '1|mockaccesstoken0000',
      },
    });
  }),
  http.get(`/api/users`, () => {
    return HttpResponse.json({
      data: {
        created_at: '2021-09-01T00:00:00',
        email: 'test@email.com',
        name: 'name',
        nickname: 'nickname',
        phone: null,
        provider: null,
      },
    });
  }),
  http.put(`/api/users`, () => {
    return HttpResponse.json({
      data: {
        message: 'Updated successfully',
      },
    });
  }),
  http.delete(`/api/users`, () => {
    return HttpResponse.json({
      data: {
        message: 'Deleted successfully',
      },
    });
  }),

  // 게시글 API
  http.post(`/api/posts`, () => {
    return HttpResponse.json({
      data: {
        id: 1,
        message: 'Post created successfully',
      },
    });
  }),
  http.put(`/api/posts/:id`, () => {
    return HttpResponse.json({
      data: {
        message: 'Post updated successfully',
      },
    });
  }),
  http.get('/api/posts/:id/edit', () => {
    return HttpResponse.json({
      data: {
        id: 1,
        title: 'title',
        contents: 'contents',
        type: 'notice',
        is_open: true,
      },
    });
  }),
  http.get(`/api/posts/:id`, () => {
    return HttpResponse.json({
      data: {
        id: 1,
        title: 'title',
        contents: 'contents',
        type: 'notice',
        is_open: true,
        created_at: '2021-09-01T00:00:00',
      },
    });
  }),
  http.delete(`/api/posts/:id`, () => {
    return HttpResponse.json({
      data: {
        message: 'Post deleted successfully',
      },
    });
  }),
];
