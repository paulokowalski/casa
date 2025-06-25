import axios from "axios";
import { API_BASE_URL } from '../config/urls';
import { API_URLS } from '../config/urls';

export const api = axios.create({
    baseURL: API_BASE_URL
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
                    console.error('Acesso negado');
                    break;
                case 404:
                    // Recurso não encontrado
                    console.error('Recurso não encontrado');
                    break;
                case 500:
                    // Erro interno do servidor
                    console.error('Erro interno do servidor');
                    break;
                default:
                    console.error('Erro na requisição:', error.response.data);
            }
        } else if (error.request) {
            // Erro na requisição sem resposta do servidor
            console.error('Servidor não respondeu');
        } else {
            // Erro na configuração da requisição
            console.error('Erro ao configurar requisição:', error.message);
        }
        return Promise.reject(error);
    }
);

// Funções para transações
export function getTransacoes(params: Record<string, any>) {
  return api.get(API_URLS.TRANSACOES, { params });
}

export function getTransacaoById(id: string | number) {
  return api.get(API_URLS.TRANSACAO_ID(id));
}

export function criarTransacao(transacao: Record<string, any>) {
  return api.post(API_URLS.TRANSACOES, transacao);
}

export function atualizarTransacao(id, transacao) {
  return api.put(`/v1/transacoes/${id}`, transacao);
}

export function removerTransacao(id: string | number) {
  return api.delete(API_URLS.TRANSACAO_ID(id));
}

export function atualizarTransacaoSerie(idSerie: string, transacao: any, aPartirDe?: string) {
  const params = aPartirDe ? { params: { aPartirDe } } : {};
  return api.put(`/v1/transacoes/serie/${idSerie}`, transacao, params);
}