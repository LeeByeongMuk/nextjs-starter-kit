/** 같은 출처의 복귀 주소 전체를 사용하고, 유효하지 않으면 홈으로 이동한다. */
export function resolveCallbackUrl(callbackUrl: string | null, origin: string) {
  const home = new URL('/', origin);
  if (!callbackUrl) return home.href;

  try {
    const url = new URL(callbackUrl, home);
    if (
      url.origin === home.origin &&
      url.protocol === home.protocol &&
      !url.username &&
      !url.password
    ) {
      return url.href;
    }
  } catch {
    return home.href;
  }
  return home.href;
}
