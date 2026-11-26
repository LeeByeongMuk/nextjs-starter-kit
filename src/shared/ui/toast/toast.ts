import { toast as sonnerToast } from 'sonner';
import { z } from 'zod';

const PENDING_TOAST_KEY = 'pending-toast';

const PendingToastSchema = z.object({
  id: z.string(),
  message: z.string(),
});

type PendingToast = z.infer<typeof PendingToastSchema>;

interface SuccessOptions {
  /** 전체 문서 이동으로 화면이 바뀌어도 다음 문서에서 이어서 표시한다 */
  survivesNavigation?: boolean;
}

// 저장소를 쓸 수 없는 브라우저에서는 알림을 현재 문서에서만 표시한다.
const withSessionStorage = <Result>(access: (storage: Storage) => Result) => {
  try {
    return access(window.sessionStorage);
  } catch {
    return undefined;
  }
};

const readPendingToast = () =>
  withSessionStorage(storage => {
    const stored = storage.getItem(PENDING_TOAST_KEY);
    return stored === null
      ? undefined
      : PendingToastSchema.safeParse(JSON.parse(stored)).data;
  });

const storePendingToast = (pending: PendingToast) =>
  withSessionStorage(storage =>
    storage.setItem(PENDING_TOAST_KEY, JSON.stringify(pending))
  );

const removePendingToast = () =>
  withSessionStorage(storage => storage.removeItem(PENDING_TOAST_KEY));

// 같은 문구의 알림이 여러 개여도 저장해 둔 바로 그 알림이 닫힐 때만 지운다.
const clearPendingToast = ({ id }: { id: string | number }) => {
  if (readPendingToast()?.id === id) removePendingToast();
};

// sonner가 붙이는 번호는 문서마다 다시 시작하므로, 저장소를 함께 쓰는 문서끼리 겹치지 않는 값을 직접 만든다.
const createToastId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** 앱 전역 알림 — 성공은 잠시 표시하고, 오류는 닫거나 다음 요청을 시작할 때까지 유지한다 */
export const toast = {
  success(
    message: string,
    { survivesNavigation = false }: SuccessOptions = {}
  ) {
    if (!survivesNavigation) {
      sonnerToast.success(message);
      return;
    }

    const id = createToastId();
    sonnerToast.success(message, {
      id,
      onAutoClose: clearPendingToast,
      onDismiss: clearPendingToast,
    });
    storePendingToast({ id, message });
  },
  error(message: string) {
    sonnerToast.error(message, { duration: Infinity });
  },
  dismiss() {
    removePendingToast();
    sonnerToast.dismiss();
  },
};

/** 이전 문서에서 표시를 끝내지 못한 알림이 있으면 한 번 표시한다 */
export const showPendingToast = () => {
  const pending = readPendingToast();
  removePendingToast();
  if (pending) sonnerToast.success(pending.message);
};
