import { queryToasts, spyOnToast } from '@shared/lib/testing/toast';
import Toaster from '@shared/ui/toast/Toaster';
import { QueryClientProvider, useMutation } from '@tanstack/react-query';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';

import { getQueryClient } from './client';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={getQueryClient()}>
    {children}
  </QueryClientProvider>
);

const failingRequest = async () => {
  throw new Error('서버 내부 오류');
};

describe('변경 요청의 중앙 알림', () => {
  beforeEach(() => {
    render(<Toaster />);
  });

  test('실패하면 변경 요청이 지정한 문구로 알리고 오류 원문은 노출하지 않는다', async () => {
    const { result } = renderHook(
      () =>
        useMutation({
          mutationFn: failingRequest,
          meta: { errorMessage: '저장하지 못했습니다.' },
        }),
      { wrapper }
    );

    act(() => {
      result.current.mutate();
    });

    expect(await screen.findByText('저장하지 못했습니다.')).toBeInTheDocument();
    expect(screen.queryByText('서버 내부 오류')).not.toBeInTheDocument();
  });

  test('문구를 지정하지 않은 변경 요청의 실패는 기본 문구로 알린다', async () => {
    const { result } = renderHook(
      () => useMutation({ mutationFn: failingRequest }),
      { wrapper }
    );

    act(() => {
      result.current.mutate();
    });

    expect(
      await screen.findByText('요청을 완료하지 못했습니다. 다시 시도해 주세요.')
    ).toBeInTheDocument();
  });

  test('새 변경 요청을 시작하면 이전 알림을 닫는다', async () => {
    const { result } = renderHook(
      () => ({
        failing: useMutation({ mutationFn: failingRequest }),
        succeeding: useMutation({ mutationFn: async () => 'ok' }),
      }),
      { wrapper }
    );
    act(() => {
      result.current.failing.mutate();
    });
    await waitFor(() => expect(queryToasts()).toHaveLength(1));

    act(() => {
      result.current.succeeding.mutate();
    });

    await waitFor(() => expect(queryToasts()).toHaveLength(0));
  });

  test('조회 실패는 알림으로 알리지 않는다', async () => {
    const toastCalls = spyOnToast();

    await expect(
      getQueryClient().fetchQuery({
        queryKey: ['failing-query'],
        queryFn: failingRequest,
      })
    ).rejects.toThrow('서버 내부 오류');

    expect(toastCalls.error).not.toHaveBeenCalled();
    expect(toastCalls.success).not.toHaveBeenCalled();
  });
});
