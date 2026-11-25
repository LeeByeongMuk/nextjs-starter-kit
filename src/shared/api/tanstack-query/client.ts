import { toast } from '@shared/ui/toast';
import { isServer, MutationCache, QueryClient } from '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** 변경 요청이 실패했을 때 사용자에게 알릴 문구 */
      errorMessage?: string;
    };
  }
}

export const defaultStaleTime = 60 * 1000;

const defaultMutationError = '요청을 완료하지 못했습니다. 다시 시도해 주세요.';

function makeQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({
      onMutate: () => {
        toast.dismiss();
      },
      onError: (_error, _variables, _onMutateResult, mutation) => {
        toast.error(mutation.meta?.errorMessage ?? defaultMutationError);
      },
    }),
    defaultOptions: {
      queries: {
        // staleTime: defaultStaleTime,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/** 브라우저에서는 하나의 QueryClient를 재사용하고 서버에서는 요청마다 새로 만든다 */
export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
