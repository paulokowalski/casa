import type { Sessao } from '../types/auth';

const CHAVE = 'casa.sessao';

export const EVENTO_SESSAO_EXPIRADA = 'casa:sessao-expirada';

export const sessaoStorage = {
  ler(): Sessao | null {
    try {
      const bruto = window.localStorage.getItem(CHAVE);
      if (!bruto) return null;
      const s = JSON.parse(bruto) as Sessao;
      if (!s?.token || !s.expiraEm || new Date(s.expiraEm).getTime() <= Date.now()) {
        window.localStorage.removeItem(CHAVE);
        return null;
      }
      return s;
    } catch {
      return null;
    }
  },
  salvar(s: Sessao) {
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(s));
    } catch {}
  },
  limpar() {
    try {
      window.localStorage.removeItem(CHAVE);
    } catch {}
  },
};
