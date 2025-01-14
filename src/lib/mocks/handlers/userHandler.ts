import { http, HttpResponse } from 'msw';

import userData from '@lib/mocks/data/user.json';

export const userHandler = [
  http.post(`/api/users/signup`, () => {
    return HttpResponse.json(userData.signup);
  }),
  http.post(`/api/users/signin`, () => {
    return HttpResponse.json(userData.signin);
  }),
  http.get(`/api/users`, () => {
    return HttpResponse.json(userData.get);
  }),
  http.put(`/api/users`, () => {
    return HttpResponse.json(userData.update);
  }),
  http.delete(`/api/users`, () => {
    return HttpResponse.json(userData.delete);
  }),
];
