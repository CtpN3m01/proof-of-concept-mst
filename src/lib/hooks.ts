import { useState } from 'react';

interface UseAsyncStateOptions<T> {
  initialData?: T;
  onError?: (error: Error) => void;
}

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsyncState<T>(options?: UseAsyncStateOptions<T>) {
  const [state, setState] = useState<AsyncState<T>>({
    data: options?.initialData || null,
    loading: false,
    error: null,
  });

  const execute = async (asyncFunction: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      if (options?.onError) {
        options.onError(error instanceof Error ? error : new Error(errorMessage));
      }
      
      throw error;
    }
  };

  const reset = () => {
    setState({
      data: options?.initialData || null,
      loading: false,
      error: null,
    });
  };

  return {
    ...state,
    execute,
    reset,
  };
}
