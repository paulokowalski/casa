import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { API_URLS } from '../config/urls';

interface Pessoa {
  id: number;
  nome: string;
  email: string;
}

interface PessoaContextData {
  pessoas: Pessoa[];
  loading: boolean;
  carregarPessoas: () => void;
  editarPessoa: (id: number, nome: string, email: string) => Promise<void>;
  excluirPessoa: (id: number) => Promise<void>;
}

const PessoaContext = createContext<PessoaContextData>({} as PessoaContextData);

export function PessoaProvider({ children }: { children: React.ReactNode }) {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarPessoas = () => {
    setLoading(true);
    api.get(API_URLS.PESSOAS)
      .then(res => setPessoas(res.data))
      .finally(() => setLoading(false));
  };

  const editarPessoa = async (id: number, nome: string, email: string) => {
    setLoading(true);
    try {
      await api.put(API_URLS.PESSOA_ID(id), { nome, email });
      carregarPessoas();
    } finally {
      setLoading(false);
    }
  };

  const excluirPessoa = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(API_URLS.PESSOA_ID(id));
      carregarPessoas();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPessoas();
  }, []);

  return (
    <PessoaContext.Provider value={{ pessoas, loading, carregarPessoas, editarPessoa, excluirPessoa }}>
      {children}
    </PessoaContext.Provider>
  );
}

export function usePessoa() {
  return useContext(PessoaContext);
} 