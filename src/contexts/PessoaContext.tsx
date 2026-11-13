import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, apiErrorMessage } from '../services/api';
import { API_URLS } from '../config/urls';
import type { Papel } from '../types/auth';

export interface Pessoa {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  temAcesso: boolean;
}

export interface PessoaInput {
  nome: string;
  email: string;
  senha?: string;
  papel: Papel;
  ativo: boolean;
}

interface PessoaContextValue {
  pessoas: Pessoa[];
  loading: boolean;
  carregarPessoas: () => Promise<void>;
  criarPessoa: (dados: PessoaInput) => Promise<void>;
  editarPessoa: (id: number, dados: PessoaInput) => Promise<void>;
  excluirPessoa: (id: number) => Promise<void>;
}

const PessoaContext = createContext<PessoaContextValue | null>(null);

export function PessoaProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarPessoas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Pessoa[]>(API_URLS.PESSOAS);
      setPessoas(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const executar = useCallback(
    async (acao: () => Promise<unknown>, mensagemErro: string) => {
      try {
        await acao();
      } catch (error) {
        throw new Error(apiErrorMessage(error, mensagemErro), { cause: error });
      }
      await carregarPessoas();
    },
    [carregarPessoas],
  );

  const criarPessoa = useCallback(
    (dados: PessoaInput) => executar(() => api.post(API_URLS.PESSOAS, dados), 'Erro ao cadastrar pessoa.'),
    [executar],
  );
  const editarPessoa = useCallback(
    (id: number, dados: PessoaInput) =>
      executar(() => api.put(API_URLS.PESSOA_ID(id), dados), 'Erro ao salvar pessoa.'),
    [executar],
  );
  const excluirPessoa = useCallback(
    (id: number) => executar(() => api.delete(API_URLS.PESSOA_ID(id)), 'Erro ao excluir pessoa.'),
    [executar],
  );

  useEffect(() => {
    void carregarPessoas();
  }, [carregarPessoas]);

  const value = useMemo(
    () => ({ pessoas, loading, carregarPessoas, criarPessoa, editarPessoa, excluirPessoa }),
    [pessoas, loading, carregarPessoas, criarPessoa, editarPessoa, excluirPessoa],
  );

  return <PessoaContext.Provider value={value}>{children}</PessoaContext.Provider>;
}

export function usePessoa(): PessoaContextValue {
  const ctx = useContext(PessoaContext);
  if (!ctx) throw new Error('usePessoa deve ser usado dentro de <PessoaProvider>');
  return ctx;
}
