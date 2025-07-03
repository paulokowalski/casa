import { useState, useEffect, useCallback } from 'react';
import { FipeData, CurrencyData, CearaData, CearaApiResponse } from '../types/api';

// Estados possíveis para as requisições
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Interface para o estado de uma requisição
export interface ApiState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

// Hook genérico para dados de API
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

  // Refetch automático se configurado
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

// Hook específico para dados da FIPE
export function useFipeData(url: string) {
  return useApiData<FipeData>(url);
}

// Hook específico para dados de cotações
export function useCurrencyData(url: string) {
  const { data, loading, error, refetch } = useApiData<Record<string, CurrencyData>>(url);
  
  // Extrai o primeiro item do objeto de resposta
  const currencyData = data ? Object.values(data)[0] : null;
  
  return {
    data: currencyData,
    loading,
    error,
    refetch,
  };
}

// Hook específico para dados do Ceará
export function useCearaData(url: string) {
  const { data, loading, error, refetch } = useApiData<CearaApiResponse>(url);
  
  // Encontra os dados do Ceará na tabela
  const cearaData = data?.table?.find((team: CearaData) => team.strTeam === 'Ceará') || null;
  
  return {
    data: cearaData,
    loading,
    error,
    refetch,
  };
}

export function useBitcoinPrice() {
  const [data, setData] = useState<{ usd: number, brl: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('https://blockchain.info/ticker')
      .then(res => res.json())
      .then(json => {
        setData({ usd: json.USD.last, brl: json.BRL.last });
        setLoading(false);
      })
      .catch(err => {
        setError('Erro ao buscar valor do Bitcoin');
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
} 