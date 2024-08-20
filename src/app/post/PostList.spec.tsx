import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';

import usePostList from '@/app/hooks/post/usePostList';
import PostList from '@/app/post/page';
import { PostsReq } from '@/app/types/post';
import { server } from '@/mocks/node';

jest.mock('next/headers');
jest.mock('next/navigation');
jest.mock('next-auth/react');
global.alert = jest.fn();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('게시글 리스트 페이지 테스트', () => {
  const mockSearchParam = useSearchParams as jest.Mock;
  const type = 'notice';
  const q = 'search';
  const searchFilters = {
    type,
    q,
    page: 1,
  } as PostsReq;

  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    server.resetHandlers();

    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    (cookies as jest.Mock).mockReturnValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue,
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
    });
    (mockSearchParam as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({
        type: 'notice',
        q: 'search',
        page: 1,
      }),
    });
    (useSession as jest.Mock).mockReturnValue({
      user: {
        created_at: '2030-09-01T00:00:00.000Z',
        email: 'test@email.com',
        name: 'name',
        nickname: 'nickname',
        phone: null,
        provider: null,
      },
      update: jest.fn(),
    });

    // given - 회원가입 페이지가 그려짐
    render(<PostList />, { wrapper });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  test('게시글 타입을 선택할 시 검색 필터에 타입이 추가된다', () => {
    // when - 게시글 타입을 선택한다
    fireEvent.select(screen.getByLabelText('Type'), {
      target: { value: type },
    });

    // then - 검색 필터에 타입이 추가된다
    const searchParams = mockSearchParam();
    expect(screen.getByLabelText('Type')).toHaveValue(type);
    expect(searchParams.get().type).toBe(type);
  });

  test('검색어를 입력할 시 검색 필터에 검색어가 추가된다', () => {
    // when - 검색어를 입력한다
    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: q },
    });

    // then - 검색 필터에 검색어가 추가된다
    const searchParams = mockSearchParam();
    expect(screen.getByLabelText('Search')).toHaveValue(q);
    expect(searchParams.get().q).toBe(q);
  });

  test('검색 버튼을 클릭시 검색 필터가 업데이트 된다', () => {
    // when - 검색 버튼을 클릭한다
    fireEvent.select(screen.getByLabelText('Type'), {
      target: { value: 'notice' },
    });
    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'search' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    // then - 검색 필터가 업데이트 된다
    const searchParams = mockSearchParam();
    expect(screen.getByLabelText('Type')).toHaveValue(type);
    expect(searchParams.get().type).toBe(type);
    expect(screen.getByLabelText('Search')).toHaveValue(q);
    expect(searchParams.get().q).toBe(q);
  });

  test('검색 필터가 업데이트 되면 게시글 리스트가 다시 호출된다', async () => {
    // when - 검색 필터가 업데이트 된다
    fireEvent.select(screen.getByLabelText('Type'), {
      target: { value: 'notice' },
    });
    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'search' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    // then - 게시글 리스트가 다시 호출된다
    const { result } = renderHook(() => usePostList({ searchFilters }), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(Array.isArray(result.current.data.data)).toBe(true);
      expect(result.current.data.data[0]).toMatchObject({
        id: 1,
        title: 'Title 1',
        hit: 0,
        user: {
          name: 'name',
        },
        created_at: '2021-09-01T00:00:00',
      });
      expect(result.current.data.meta).toEqual({
        total: 1,
        current_page: 1,
        last_page: 1,
      });
    });
  });

  test('페이지네이션 버튼을 클릭하면 검색 필터에 페이지가 되고 리스트가 다시 호출된다', async () => {
    // given - 페이지네이션 버튼을 클릭한다
    fireEvent.click(screen.getByRole('pagination-1'));

    // then - 검색 필터에 페이지가 되고 리스트가 다시 호출된다
    const searchParams = mockSearchParam();
    expect(searchParams.get().page).toBe(1);
  });

  test('게시글 리스트 호출 중 에러가 발생하면 에러 메시지가 출력된다', async () => {
    server.use(
      http.get('/api/posts', () => {
        return new HttpResponse(null, {
          status: 500,
        });
      })
    );

    // when - 게시글 리스트 API 호출
    const { result } = renderHook(() => usePostList({ searchFilters }), {
      wrapper,
    });

    // then - 에러 메시지가 출력된다
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(window.alert).toHaveBeenCalledWith('Failed to fetch posts');
  });
});
