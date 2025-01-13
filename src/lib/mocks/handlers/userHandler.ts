import { http, HttpResponse } from 'msw';

import userData from '@lib/mocks/data/user.json';

export const userHandler = [
  http.post(`${process.env.APP_API_URL}/api/users/signup`, () => {
    return HttpResponse.json(userData.signup);
  }),
  http.post(`${process.env.APP_API_URL}/api/users/signin`, () => {
    return HttpResponse.json(userData.signin);
  }),
  http.get(`${process.env.APP_API_URL}/api/users`, () => {
    return HttpResponse.json(userData.get);
  }),
  http.put(`${process.env.APP_API_URL}/api/users`, () => {
    return HttpResponse.json(userData.update);
  }),
  http.delete(`${process.env.APP_API_URL}/api/users`, () => {
    return HttpResponse.json(userData.delete);
  }),
];
