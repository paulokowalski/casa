/**
 * Adaptador do sistema que hospeda o módulo: quem são os usuários que podem entrar numa família.
 * No casa, as pessoas com acesso (lista só para administradores). Num app próprio, troque por convite por e-mail.
 */
import { api } from '../../services/api';

export interface UsuarioDisponivel {
  id: number;
  nome: string;
}

export async function listarUsuarios(): Promise<UsuarioDisponivel[] | null> {
  try {
    const { data } = await api.get<{ id: number; nome: string; ativo: boolean; temAcesso: boolean }[]>('/v1/pessoas');
    return data.filter((p) => p.ativo && p.temAcesso).map((p) => ({ id: p.id, nome: p.nome }));
  } catch {
    return null;
  }
}
