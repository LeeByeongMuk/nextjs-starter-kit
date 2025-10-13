import '@testing-library/jest-dom';
import { server } from '@lib/mocks/testServer';
import { QueryCache } from '@tanstack/react-query';

const queryCache = new QueryCache();

global.alert = jest.fn();
global.prompt = jest.fn();

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
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
