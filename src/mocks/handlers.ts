import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post(`/signup`, () => {
    return HttpResponse.json({
      data: {
        access_token: '1|mockaccesstoken0000',
      },
    });
  }),
  http.post(`/api/users/signup`, () => {
    return HttpResponse.json({
      data: {
        access_token: '1|mockaccesstoken0000',
      },
    });
  }),
];
