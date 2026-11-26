import '@testing-library/jest-dom';
import { server } from '@shared/api/mocks/testServer';
import { toast } from '@shared/ui/toast';
import { QueryCache } from '@tanstack/react-query';

const queryCache = new QueryCache();

// jsdom은 <dialog>를 여닫는 API를 구현하지 않으므로 열림 상태, 닫힐 때의 초점, close 이벤트를 브라우저처럼 보완한다.
const dialogOpeners = new WeakMap<HTMLDialogElement, Element | null>();
HTMLDialogElement.prototype.showModal ??= function showModal() {
  dialogOpeners.set(this, document.activeElement);
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function close() {
  if (!this.open) return;

  this.open = false;
  // 열기 전에 초점이 있던 요소로 되돌린다. 그 요소를 쓸 수 없으면 대화상자 안에 남은 초점을 내려놓는다.
  const opener = dialogOpeners.get(this);
  if (opener instanceof HTMLElement) opener.focus();
  if (
    document.activeElement instanceof HTMLElement &&
    this.contains(document.activeElement)
  ) {
    document.activeElement.blur();
  }
  // close 이벤트는 작업 큐에 넣어 나중에 보낸다.
  setTimeout(() => this.dispatchEvent(new Event('close')));
};

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  toast.dismiss();
  window.sessionStorage.clear();
  queryCache.clear();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
