import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiErrorMessage } from '../services/api';
import { authService } from '../services/auth';
import { EVENTO_SESSAO_EXPIRADA, sessaoStorage } from '../services/sessao';
import type { Sessao, Usuario } from '../types/auth';

const SESSAO_EXPIRADA = 'Sua sessão expirou. Entre de novo.';

interface AuthContextValue {
  usuario: Usuario | null;
  isAdmin: boolean;
  aviso: string | null;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [sessao, setSessao] = useState<Sessao | null>(() => sessaoStorage.ler());
  const [aviso, setAviso] = useState<string | null>(null);

  const encerrar = useCallback((motivo: string | null) => {
    sessaoStorage.limpar();
    setSessao(null);
    setAviso(motivo);
  }, []);

  useEffect(() => {
    const aoExpirar = () => encerrar(SESSAO_EXPIRADA);
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
  }, [encerrar]);

  useEffect(() => {
    if (!sessaoStorage.ler()) return;
    authService
      .me()
      .then((usuario) => {
        const atual = sessaoStorage.ler();
        if (!atual) return;
        const atualizada = { ...atual, usuario };
        sessaoStorage.salvar(atualizada);
        setSessao(atualizada);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sessao) return;
    const restante = new Date(sessao.expiraEm).getTime() - Date.now();
    const timer = window.setTimeout(() => encerrar(SESSAO_EXPIRADA), Math.max(restante, 0));
    return () => window.clearTimeout(timer);
  }, [sessao, encerrar]);

  const entrar = useCallback(async (email: string, senha: string) => {
    try {
      const nova = await authService.login(email.trim(), senha);
      sessaoStorage.salvar(nova);
      setAviso(null);
      setSessao(nova);
    } catch (error) {
      throw new Error(apiErrorMessage(error, 'Não foi possível entrar. Tente de novo.'), { cause: error });
    }
  }, []);

  const sair = useCallback(() => encerrar(null), [encerrar]);

  const value = useMemo(
    () => ({ usuario: sessao?.usuario ?? null, isAdmin: sessao?.usuario.papel === 'ADMIN', aviso, entrar, sair }),
    [sessao, aviso, entrar, sair],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

export function useUsuario(): Usuario & { isAdmin: boolean } {
  const { usuario, isAdmin } = useAuth();
  if (!usuario) throw new Error('useUsuario requer login');
  return { ...usuario, isAdmin };
}
