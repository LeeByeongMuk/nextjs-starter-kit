import { http, HttpResponse } from 'msw';

import postData from '@lib/mocks/data/post.json';
import { getHandlerURI } from '@shared/utils/url';

export const postHandler = [
  http.get(getHandlerURI('/api/posts'), () => {
    return HttpResponse.json(postData.getAll);
  }),
  http.post(getHandlerURI('/api/posts'), () => {
    return HttpResponse.json(postData.create);
  }),
  http.get(getHandlerURI('/api/posts/:id'), () => {
    return HttpResponse.json(postData.getById);
  }),
  http.get(getHandlerURI('/api/posts/:id/edit'), () => {
    return HttpResponse.json(postData.getEdit);
  }),
  http.put(getHandlerURI('/api/posts/:id'), () => {
    return HttpResponse.json(postData.update);
  }),
  http.delete(getHandlerURI('/api/posts/:id'), () => {
    return HttpResponse.json(postData.delete);
  }),
];
