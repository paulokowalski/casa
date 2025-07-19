import axios from "axios";
import { API_BASE_URL } from '../config/urls';
import { API_URLS } from '../config/urls';
import type { AxiosRequestHeaders } from 'axios';

export const api = axios.create({
    baseURL: API_BASE_URL
});

// Interceptor para adicionar token de autenticação no header X-API-KEY (tudo maiúsculo)
api.interceptors.request.use(config => {
    const token = import.meta.env.VITE_API_KEY;
    if (token) {
        // Garante que headers existe e é do tipo correto
        (config.headers as AxiosRequestHeaders)['X-API-KEY'] = token;
    }
    return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // Erro do servidor com resposta
            switch (error.response.status) {
                case 401:
                    // Não autorizado - redirecionar para login
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    // Acesso negado
                    // TODO: tratar acesso negado
                    break;
                case 404:
                    // Recurso não encontrado
                    // TODO: tratar recurso não encontrado
                    break;
                case 500:
                    // Erro interno do servidor
                    // TODO: tratar erro interno do servidor
                    break;
                default:
                    // TODO: tratar erro na requisição
            }
        } else if (error.request) {
            // Erro na requisição sem resposta do servidor
            // TODO: tratar servidor não respondeu
        } else {
            // Erro ao configurar requisição
            // TODO: tratar erro ao configurar requisição
        }
        return Promise.reject(error);
    }
);

// Funções para transações
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
  return api.put(`/v1/transacoes/${id}`, transacao);
}

export function removerTransacao(id: string | number) {
  return api.delete(API_URLS.TRANSACAO_ID(id));
}

export function atualizarTransacaoSerie(idSerie: string, transacao: Record<string, unknown>, aPartirDe?: string) {
  const params = aPartirDe ? { params: { aPartirDe } } : {};
  return api.put(`/v1/transacoes/serie/${idSerie}`, transacao, params);
}

// Função para buscar geração solar
export function getGeracaoSolar(data: string) {
  return api.get(API_URLS.GERACAO_SOLAR(data));
}