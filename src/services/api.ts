import axios, { AxiosHeaders, isAxiosError } from 'axios';
import { API_BASE_URL, API_URLS } from '../config/urls';

/** Cliente HTTP do backend (casa-api). A chave de API vem do .env (VITE_API_KEY). */
export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_API_KEY;
  if (token) {
    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set('X-API-KEY', token);
  }
  return config;
});

/** Extrai a mensagem de erro devolvida pelo backend, com um texto padrão de reserva. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { mensagem?: string; message?: string; error?: string } | undefined;
    return data?.mensagem || data?.message || data?.error || fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

export function getGeracaoSolar(data: string) {
  return api.get(API_URLS.GERACAO_SOLAR(data));
}

export function getCarroFipe(codigoFipe: string) {
  return api.get(API_URLS.CARRO_FIPE(codigoFipe));
}
