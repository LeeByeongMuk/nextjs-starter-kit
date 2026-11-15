import '@testing-library/jest-dom';
import { server } from '@shared/api/mocks/testServer';
import { QueryCache } from '@tanstack/react-query';

const queryCache = new QueryCache();

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(window, 'prompt').mockImplementation(() => null);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  queryCache.clear();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
