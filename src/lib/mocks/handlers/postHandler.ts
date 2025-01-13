import { http, HttpResponse } from 'msw';

import postData from '@lib/mocks/data/post.json';

export const postHandler = [
  http.get(`${process.env.APP_API_URL}/api/posts`, () => {
    return HttpResponse.json(postData.getAll);
  }),
  http.post(`${process.env.APP_API_URL}/api/posts`, () => {
    return HttpResponse.json(postData.create);
  }),
  http.put(`${process.env.APP_API_URL}/api/posts/:id`, () => {
    return HttpResponse.json(postData.update);
  }),
  http.get(`${process.env.APP_API_URL}/api/posts/:id/edit`, () => {
    return HttpResponse.json(postData.getEdit);
  }),
  http.get(`${process.env.APP_API_URL}/api/posts/:id`, () => {
    return HttpResponse.json(postData.getById);
  }),
  http.delete(`${process.env.APP_API_URL}/api/posts/:id`, () => {
    return HttpResponse.json(postData.delete);
  }),
];
