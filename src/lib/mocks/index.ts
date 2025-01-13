export async function initMsw() {
  if (typeof window === 'undefined') {
    const { server } = await import('@lib/mocks/node');
    server.listen();
  } else {
    const { worker } = await import('@lib/mocks/browser');
    await worker.start();
  }
}
