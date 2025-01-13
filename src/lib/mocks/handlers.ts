import { http, HttpResponse } from 'msw';

export const handlers = [
  // 회원 API
  http.post(`${process.env.APP_API_URL}/api/users/signup`, () => {
    return HttpResponse.json({
      ok: true,
      message: 'success',
      data: {
        access_token: 'mockaccesstoken0000',
      },
    });
  }),
  http.post(`${process.env.APP_API_URL}/api/users/signin`, () => {
    return HttpResponse.json({
      ok: true,
      message: 'success',
      data: {
        access_token: '1|mockaccesstoken0000',
      },
    });
  }),
  http.get(`${process.env.APP_API_URL}/api/users`, () => {
    return HttpResponse.json({
      ok: true,
      message: 'success',
      data: {
        id: 1,
        name: 'name',
        nickname: 'nickname',
        email: 'test@email.com',
      },
    });
  }),
  http.put(`${process.env.APP_API_URL}/api/users`, () => {
    return HttpResponse.json({
      ok: true,
      message: 'success',
      data: {
        id: 1,
        name: 'name',
        nickname: 'nickname',
        email: 'test@email.com',
      },
    });
  }),
  http.delete(`${process.env.APP_API_URL}/api/users`, () => {
    return HttpResponse.json({
      ok: true,
      message: 'success',
      data: {
        ok: true,
      },
    });
  }),

  // 게시글 API
  http.get(`${process.env.APP_API_URL}/api/posts`, () => {
    const data = Array.from({ length: 20 }, (_, index) => ({
      id: index + 1,
      type: 'notice',
      title: `Title ${index + 1}`,
      hit: 0,
      created_at: '2021-09-01T00:00:00',
      user: {
        id: 1,
        name: 'name',
        nickname: 'nickname',
      },
    }));
    return HttpResponse.json({
      data,
      meta: {
        current_page: 1,
        last_page: 1,
        total: 1,
      },
    });
  }),
  // http.post(`${process.env.APP_API_URL}/api/posts`, () => {
  //   console.log('asd');
  //   return HttpResponse.json({
  //     ok: true,
  //     message: 'success',
  //     data: {
  //       id: 1,
  //     },
  //   });
  // }),
  // http.put(`${process.env.APP_API_URL}/api/posts/:id`, () => {
  //   return HttpResponse.json({
  //     ok: true,
  //     message: 'success',
  //     data: {
  //       id: 1,
  //     },
  //   });
  // }),
  // http.get('${process.env.APP_API_URL}/api/posts/:id/edit', () => {
  //   return HttpResponse.json({
  //     ok: true,
  //     message: 'success',
  //     data: {
  //       id: 1,
  //       title: 'title',
  //       contents: 'contents',
  //       type: 'notice',
  //       is_open: true,
  //     },
  //   });
  // }),
  // http.get(`${process.env.APP_API_URL}/api/posts/:id`, () => {
  //   return HttpResponse.json({
  //     ok: true,
  //     message: 'success',
  //     data: {
  //       contents: 'contents',
  //       created_at: '2021-09-01T00:00:00',
  //       hit: 0,
  //       id: 1,
  //       is_editable: false,
  //       title: 'title',
  //       type: 'notice',
  //       user_name: 'name',
  //     },
  //   });
  // }),
  // http.delete(`${process.env.APP_API_URL}/api/posts/:id`, () => {
  //   return HttpResponse.json({
  //     ok: true,
  //     message: 'success',
  //     data: {
  //       id: 1,
  //     },
  //   });
  // }),
];
