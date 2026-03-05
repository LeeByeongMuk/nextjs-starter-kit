import { http, HttpResponse } from 'msw';

import userData from '@lib/mocks/data/user.json';
import { getHandlerURI } from '@shared/utils/url';

export const userHandler = [
  http.post(getHandlerURI('/api/users/signup'), () => {
    return HttpResponse.json(userData.signup);
  }),
  http.post(getHandlerURI(`/api/users/signin`), () => {
    return HttpResponse.json(userData.signin);
  }),
  http.get(getHandlerURI(`/api/users`), () => {
    return HttpResponse.json(userData.get);
  }),
  http.put(getHandlerURI(`/api/users`), () => {
    return HttpResponse.json(userData.update);
  }),
  http.delete(getHandlerURI(`/api/users`), () => {
    return HttpResponse.json(userData.delete);
  }),
];
