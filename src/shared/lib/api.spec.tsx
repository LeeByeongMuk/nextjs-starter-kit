import { server } from '@shared/api/mocks/testServer';
import { http, HttpResponse } from 'msw';
import { z } from 'zod';

import { fetchApi } from './api';
import { getHandlerURI } from './url';

const ItemResSchema = z.object({
  data: z.object({ id: z.number() }),
});

describe('fetchApi 응답 검증', () => {
  const respond = (body: Record<string, unknown>) =>
    server.use(
      http.get(getHandlerURI('/api/items/1'), () => HttpResponse.json(body))
    );

  test('스키마가 선언한 필드만 반환한다', async () => {
    respond({ data: { id: 1, secret: 'hidden' }, extra: true });

    await expect(
      fetchApi('/api/items/1', { auth: 'none', schema: ItemResSchema })
    ).resolves.toEqual({ data: { id: 1 } });
  });

  test('응답이 스키마와 다르면 받은 값을 전달하지 않고 거절한다', async () => {
    respond({ data: { id: '1' } });

    await expect(
      fetchApi('/api/items/1', { auth: 'none', schema: ItemResSchema })
    ).rejects.toBeInstanceOf(z.ZodError);
  });

  test('스키마가 없으면 응답 본문을 그대로 반환한다', async () => {
    respond({ data: { id: 1, secret: 'hidden' } });

    await expect(fetchApi('/api/items/1', { auth: 'none' })).resolves.toEqual({
      data: { id: 1, secret: 'hidden' },
    });
  });
});
