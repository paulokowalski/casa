import axios from "axios";
import { API_BASE_URL } from '../config/urls';
import { API_URLS } from '../config/urls';
import type { AxiosRequestHeaders } from 'axios';

export const api = axios.create({
    baseURL: API_BASE_URL
});

api.interceptors.request.use(config => {
    const token = import.meta.env.VITE_API_KEY;
    if (token) {
        (config.headers as AxiosRequestHeaders)['X-API-KEY'] = token;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    break;
                case 404:
                    break;
                case 500:
                    break;
                default:
                    break;
            }
        } else if (error.request) {
        } else {
        }
        return Promise.reject(error);
    }
);

export function getTransacoes(params: Record<string, unknown>) {
  return api.get(API_URLS.TRANSACOES, { params });
}

export function getTransacaoById(id: string | number) {
  return api.get(API_URLS.TRANSACAO_ID(id));
}

export function criarTransacao(transacao: Record<string, unknown>) {
  return api.post(API_URLS.TRANSACOES, transacao);
}

export function atualizarTransacao(id: string | number, transacao: Record<string, unknown>) {
  return api.put(API_URLS.TRANSACAO_ID(id), transacao);
}

export function removerTransacao(id: string | number) {
  return api.delete(API_URLS.TRANSACAO_ID(id));
}

export function atualizarTransacaoSerie(idSerie: string, transacao: Record<string, unknown>, aPartirDe?: string) {
  const params = aPartirDe ? { params: { aPartirDe } } : {};
  return api.put(API_URLS.TRANSACAO_SERIE(idSerie), transacao, params);
}

export function getGeracaoSolar(data: string) {
  return api.get(API_URLS.GERACAO_SOLAR(data));
}

export function getCearaNova(idTime: string|number) {
  return api.get(API_URLS.API_BRASILEIRAO_POSICAO(idTime));
}

export function getRodadaAtual(idTime: string|number) {
  return api.get(API_URLS.API_BRASILEIRAO_RODADA(idTime));
}