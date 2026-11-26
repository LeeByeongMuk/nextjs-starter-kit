import { toast } from '@shared/ui/toast';
import { screen, within } from '@testing-library/react';

/** 알림 영역에 표시 중인 알림 항목을 찾는다 — 테스트가 Toaster를 렌더한 뒤에 쓴다 */
export const queryToasts = () =>
  within(screen.getByRole('region', { name: /^알림/ })).queryAllByRole(
    'listitem'
  );

/** 알림 요청을 기록한다 — 알림은 한 박자 늦게 렌더되므로 뜨지 않아야 하는 흐름은 화면 대신 이 기록으로 확인한다 */
export const spyOnToast = () => ({
  success: jest.spyOn(toast, 'success'),
  error: jest.spyOn(toast, 'error'),
});
