import { queryToasts } from '@shared/lib/testing/toast';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { toast } from './toast';
import Toaster from './Toaster';

const PENDING_TOAST_KEY = 'pending-toast';
const storageError = () => {
  throw new DOMException('저장소를 사용할 수 없습니다.', 'SecurityError');
};

describe('알림', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('성공과 오류 알림을 알림 영역에 표시하고 닫기 버튼으로 닫는다', async () => {
    render(<Toaster />);
    toast.success('저장했습니다.');
    toast.error('저장하지 못했습니다.');

    expect(await screen.findByText('저장했습니다.')).toBeInTheDocument();
    expect(await screen.findByText('저장하지 못했습니다.')).toBeInTheDocument();
    expect(queryToasts()).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: '알림 닫기' })[0]);
    await waitFor(() => expect(queryToasts()).toHaveLength(1));
  });

  test('성공 알림은 시간이 지나면 사라지고 오류 알림은 닫을 때까지 남는다', () => {
    jest.useFakeTimers();
    render(<Toaster />);
    toast.success('저장했습니다.');
    toast.error('저장하지 못했습니다.');
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(queryToasts()).toHaveLength(2);

    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });
    expect(screen.queryByText('저장했습니다.')).not.toBeInTheDocument();
    expect(screen.getByText('저장하지 못했습니다.')).toBeInTheDocument();
  });

  test('모두 닫기는 표시 중인 알림을 전부 닫는다', async () => {
    render(<Toaster />);
    toast.success('저장했습니다.');
    toast.error('저장하지 못했습니다.');
    await waitFor(() => expect(queryToasts()).toHaveLength(2));

    toast.dismiss();
    await waitFor(() => expect(queryToasts()).toHaveLength(0));
  });

  describe('문서 이동 뒤에도 이어지는 알림', () => {
    const message = '회원가입이 완료되었습니다.';
    const pendingToast = () => {
      const stored = window.sessionStorage.getItem(PENDING_TOAST_KEY);
      return stored === null ? null : JSON.parse(stored).message;
    };

    test('표시를 마치기 전까지 저장해 두고 닫으면 지운다', async () => {
      render(<Toaster />);
      toast.success(message, { survivesNavigation: true });

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(pendingToast()).toBe(message);

      fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }));
      await waitFor(() => expect(pendingToast()).toBeNull());
    });

    test('표시 시간이 끝나면 저장한 알림을 지운다', () => {
      jest.useFakeTimers();
      render(<Toaster />);
      toast.success(message, { survivesNavigation: true });
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(pendingToast()).toBe(message);

      act(() => {
        jest.advanceTimersByTime(60 * 1000);
      });
      expect(pendingToast()).toBeNull();
    });

    test('표시 중에 문서가 바뀌면 다음 문서에서 한 번 더 표시하고 지운다', async () => {
      const previousDocument = render(<Toaster />);
      toast.success(message, { survivesNavigation: true });
      await screen.findByText(message);
      previousDocument.unmount();
      expect(pendingToast()).toBe(message);

      render(<Toaster />);

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(pendingToast()).toBeNull();
    });

    test('새 요청이 알림을 모두 닫으면 다음 문서에서도 다시 표시하지 않는다', async () => {
      const previousDocument = render(<Toaster />);
      toast.success(message, { survivesNavigation: true });
      await screen.findByText(message);

      toast.dismiss();
      previousDocument.unmount();
      expect(pendingToast()).toBeNull();
      render(<Toaster />);
      expect(screen.queryByText(message)).toBeNull();
    });

    test('같은 문구의 알림이 둘이면 나중 알림이 닫힐 때까지 저장해 둔다', async () => {
      render(<Toaster />);
      toast.success(message, { survivesNavigation: true });
      const closeEarlier = await screen.findByRole('button', {
        name: '알림 닫기',
      });
      toast.success(message, { survivesNavigation: true });
      await waitFor(() => expect(queryToasts()).toHaveLength(2));

      fireEvent.click(closeEarlier);
      await waitFor(() => expect(queryToasts()).toHaveLength(1));
      expect(pendingToast()).toBe(message);

      fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }));
      await waitFor(() => expect(pendingToast()).toBeNull());
    });

    test.each([
      ['JSON이 아닌 값', message],
      ['형식이 다른 기록', JSON.stringify({ id: {}, message })],
      ['문구가 없는 기록', JSON.stringify({ id: 'toast' })],
    ])('손상된 저장값(%s)은 표시하지 않고 지운다', (_, stored) => {
      jest.useFakeTimers();
      window.sessionStorage.setItem(PENDING_TOAST_KEY, stored);

      render(<Toaster />);
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(window.sessionStorage.getItem(PENDING_TOAST_KEY)).toBeNull();
      expect(queryToasts()).toHaveLength(0);
    });

    test('저장소에 쓸 수 없어도 현재 문서에는 알림을 표시한다', async () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(storageError);
      render(<Toaster />);
      toast.success(message, { survivesNavigation: true });

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(pendingToast()).toBeNull();
    });

    test('저장소를 읽을 수 없으면 남긴 알림 없이 시작하고 닫을 수 있다', async () => {
      render(<Toaster />);
      toast.success(message, { survivesNavigation: true });
      await screen.findByText(message);
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(storageError);

      fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }));
      await waitFor(() => expect(queryToasts()).toHaveLength(0));

      expect(() => render(<Toaster />)).not.toThrow();
    });
  });
});
