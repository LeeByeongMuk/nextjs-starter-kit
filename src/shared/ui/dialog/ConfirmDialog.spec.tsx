import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ConfirmDialog from './ConfirmDialog';

describe('확인 대화상자', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  const confirmDialog = (open: boolean, description?: string) => (
    <ConfirmDialog
      open={open}
      title="이 게시글을 삭제할까요?"
      description={description}
      confirmLabel="삭제"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );

  beforeEach(() => {
    onConfirm.mockClear();
    onCancel.mockClear();
  });

  test('닫혀 있으면 내용과 동작을 노출하지 않는다', () => {
    render(confirmDialog(false));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '삭제' })
    ).not.toBeInTheDocument();
  });

  test('열리면 제목과 설명을 연결하고 취소에 초점을 둔다', () => {
    render(confirmDialog(true, '삭제한 글은 목록에 표시되지 않습니다.'));

    const dialog = screen.getByRole('alertdialog', {
      name: '이 게시글을 삭제할까요?',
    });
    expect(dialog).toBeVisible();
    expect(dialog).toHaveAccessibleDescription(
      '삭제한 글은 목록에 표시되지 않습니다.'
    );
    expect(screen.getByRole('button', { name: '취소' })).toHaveFocus();
  });

  test('확인과 취소 선택을 각각 전달한다', () => {
    render(confirmDialog(true));

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('브라우저가 Esc 입력으로 대화상자를 닫으면 취소로 처리한다', async () => {
    render(confirmDialog(true));

    screen.getByRole<HTMLDialogElement>('alertdialog').close();

    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('상위 상태로 닫을 때는 취소를 알리지 않고 다시 열 수 있다', async () => {
    const { rerender } = render(confirmDialog(true));
    const dialog = screen.getByRole<HTMLDialogElement>('alertdialog');
    const openWhenClosed = new Promise<boolean>(resolve =>
      dialog.addEventListener('close', () => resolve(dialog.open), {
        once: true,
      })
    );

    rerender(confirmDialog(false));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    rerender(confirmDialog(true));
    expect(screen.getByRole('alertdialog')).toBeVisible();
    expect(screen.getByRole('button', { name: '취소' })).toHaveFocus();

    await expect(openWhenClosed).resolves.toBe(true);
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeVisible();
  });
});
