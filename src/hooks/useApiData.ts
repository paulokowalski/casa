import { useState, useEffect, useCallback } from 'react';
import { FipeData, CurrencyData } from '../types/api';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

export function useApiData<T>(
  url: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: 'idle',
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!url || options?.enabled === false) return;

    setState(prev => ({ ...prev, loading: 'loading', error: null }));

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setState({ data, loading: 'success', error: null });
    } catch (error) {
      setState({
        data: null,
        loading: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }, [url, options?.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (options?.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options?.refetchInterval]);

  const refetch = () => {
    fetchData();
  };

  return { ...state, refetch };
}

export function useFipeData(url: string) {
  return useApiData<FipeData>(url);
}

export function useCurrencyData(url: string) {
  const { data, loading, error, refetch } = useApiData<Record<string, CurrencyData>>(url);
  
  const currencyData = data ? Object.values(data)[0] : null;
  
  return {
    data: currencyData,
    loading,
    error,
    refetch,
  };
}