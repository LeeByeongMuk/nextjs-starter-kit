import { http, HttpResponse } from 'msw';

import postData from '@lib/mocks/data/post.json';

export const postHandler = [
  http.get(`/api/posts`, () => {
    return HttpResponse.json(postData.getAll);
  }),
  http.post(`/api/posts`, () => {
    return HttpResponse.json(postData.create);
  }),
  http.put(`/api/posts/:id`, () => {
    return HttpResponse.json(postData.update);
  }),
  http.get(`/api/posts/:id/edit`, () => {
    return HttpResponse.json(postData.getEdit);
  }),
  http.get(`/api/posts/:id`, () => {
    return HttpResponse.json(postData.getById);
  }),
  http.delete(`/api/posts/:id`, () => {
    return HttpResponse.json(postData.delete);
  }),
];
