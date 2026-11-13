import { api } from './api';
import { API_URLS } from '../config/urls';
import type { Sessao, Usuario } from '../types/auth';

export const authService = {
  login: (email: string, senha: string) => api.post<Sessao>(API_URLS.AUTH_LOGIN, { email, senha }).then((r) => r.data),
  me: () => api.get<Usuario>(API_URLS.AUTH_ME).then((r) => r.data),
  trocarSenha: (senhaAtual: string, novaSenha: string) =>
    api.put(API_URLS.AUTH_SENHA, { senhaAtual, novaSenha }).then(() => undefined),
};
