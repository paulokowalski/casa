import axios, { AxiosHeaders, isAxiosError } from 'axios';
import { API_BASE_URL, API_URLS } from '../config/urls';
import { EVENTO_SESSAO_EXPIRADA, sessaoStorage } from './sessao';

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = sessaoStorage.ler()?.token;
  if (token) {
    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401 && !error.config?.url?.endsWith(API_URLS.AUTH_LOGIN)) {
      window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { mensagem?: string; message?: string; error?: string } | undefined;
    return data?.mensagem || data?.message || data?.error || fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
