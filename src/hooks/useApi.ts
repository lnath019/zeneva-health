import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export function useApi<T, Args extends unknown[]>(
  apiFn: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await apiFn(...args);
        setState({ data, error: null, isLoading: false });
        return data;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred';
        setState({ data: null, error: errorMsg, isLoading: false });
        throw err;
      }
    },
    [apiFn]
  );

  return {
    ...state,
    execute,
    setData: (data: T) => setState((prev) => ({ ...prev, data })),
  };
}
