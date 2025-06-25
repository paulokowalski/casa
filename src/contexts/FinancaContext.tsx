import { createContext, useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { getTransacoes, criarTransacao, atualizarTransacao, removerTransacao, api } from '../services/api';
import { usePessoa } from './PessoaContext';
import { API_URLS } from '../config/urls';

export type TipoTransacao = 'despesa' | 'receita';
export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  descricao: string;
  valor: number;
  data: string;
  fixa: boolean;
  pessoa: string;
  ano: string;
  mes: string;
  categoria?: string;
}

interface FinancaContextData {
  transacoes: Transacao[];
  adicionar: (t: Omit<Transacao, 'id'>) => void;
  editar: (id: string, t: Omit<Transacao, 'id'>) => void;
  excluir: (id: string) => void;
  recarregarTransacoes: () => void;
  pessoa: string;
  setPessoa: (p: string) => void;
  ano: string;
  setAno: (a: string) => void;
  mes: string;
  setMes: (m: string) => void;
  gastosPorCartao: { [nomeCartao: string]: number };
  cartaoDespesas: any[];
  pessoas: { id: number, nome: string }[];
  cartaoDespesasAgrupadas: { [nomeCartao: string]: any[] };
  transacoesProxMes: Transacao[];
  getDespesasProximasTodasPessoas: () => Promise<any[]>;
  loading: boolean;
  setLoading: (v: boolean) => void;
}
const FinancaContext = createContext<FinancaContextData>({} as any);
export const useFinanca = () => useContext(FinancaContext);

export function FinancaProvider({ children }: { children: React.ReactNode }) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [transacoesProxMes, setTransacoesProxMes] = useState<Transacao[]>([]);
  const [pessoa, setPessoa] = useState('');
  const [ano, setAno] = useState('');
  const [mes, setMes] = useState('');
  const [cartaoDespesas, setCartaoDespesas] = useState<any[]>([]);
  const [gastosPorCartao, setGastosPorCartao] = useState<{ [nomeCartao: string]: number }>({});
  const [loading, setLoading] = useState(false);

  const { pessoas, carregarPessoas } = usePessoa();

  // Carregar pessoas automaticamente ao inicializar o contexto
  useEffect(() => {
    if (!pessoas || pessoas.length === 0) {
      carregarPessoas();
    }
  }, []);

  // Função auxiliar para controle de loading
  function makeLoadingController(setLoading: (v: boolean) => void) {
    let transacoesProntas = false;
    let cartaoPronto = false;
    return {
      transacoesOk() {
        transacoesProntas = true;
        if (transacoesProntas && cartaoPronto) setLoading(false);
      },
      cartaoOk() {
        cartaoPronto = true;
        if (transacoesProntas && cartaoPronto) setLoading(false);
      }
    };
  }

  // Não carregar nada automaticamente. Só buscar quando o usuário selecionar pessoa, ano e mês explicitamente.
  useEffect(() => {
    if (pessoa && ano && mes) {
      setLoading(true);
      const loadingCtrl = makeLoadingController(setLoading);
      getTransacoes({ pessoaId: pessoa, ano, mes }).then(res => {
        setTransacoes(res.data);
        loadingCtrl.transacoesOk();
      });
      // Buscar transações do próximo mês
      let proxMes = Number(mes) + 1;
      let proxAno = Number(ano);
      if (proxMes > 12) {
        proxMes = 1;
        proxAno++;
      }
      getTransacoes({ pessoaId: pessoa, ano: String(proxAno), mes: String(proxMes).padStart(2, '0') }).then(res => {
        setTransacoesProxMes(res.data);
      });
      // Buscar despesas de cartão de crédito
      const pessoaObj = pessoas.find(p => String(p.id) === String(pessoa));
      const nomePessoa = pessoaObj ? pessoaObj.nome : '';
      if (nomePessoa) {
        (async () => {
          try {
            const res = await api.get(API_URLS.COMPRA_SEM_CARTAO(ano, mes, nomePessoa));
            let despesas = res.data;
            if (despesas && Array.isArray(despesas.compras)) {
              despesas = despesas.compras;
            } else if (!Array.isArray(despesas)) {
              if (despesas && Array.isArray(despesas.data)) {
                despesas = despesas.data;
              } else if (despesas && Array.isArray(despesas.items)) {
                despesas = despesas.items;
              } else if (despesas && typeof despesas === 'object') {
                despesas = Object.values(despesas);
              } else {
                despesas = [];
              }
            }
            setCartaoDespesas(Array.isArray(despesas) ? despesas : []);
            const totais: { [nomeCartao: string]: number } = {};
            if (Array.isArray(despesas)) {
              despesas.forEach((despesa: any) => {
                if (!despesa || typeof despesa !== 'object') return;
                if (!('nomeCartao' in despesa)) return;
                const nomeCartao = String(despesa.nomeCartao);
                totais[nomeCartao] = (totais[nomeCartao] || 0) + (Number(despesa.valorParcela) || 0);
              });
            }
            setGastosPorCartao(totais);
          } catch {
            setCartaoDespesas([]);
            setGastosPorCartao({});
          }
          loadingCtrl.cartaoOk();
        })();
      } else {
        setCartaoDespesas([]);
        setGastosPorCartao({});
        loadingCtrl.cartaoOk();
      }
    } else {
      setTransacoes([]);
      setTransacoesProxMes([]);
      setCartaoDespesas([]);
      setGastosPorCartao({});
    }
  }, [pessoa, ano, mes, pessoas]);

  function adicionar(t: Omit<Transacao, 'id'>) {
    criarTransacao(t).then(res => {
      setTransacoes(prev => [...prev, res.data]);
    });
  }
  function editar(id: string, t: Omit<Transacao, 'id'>) {
    atualizarTransacao(id, t).then(res => {
      setTransacoes(prev => prev.map(item => item.id === id ? res.data : item));
    });
  }
  function excluir(id: string) {
    removerTransacao(id).then(() => {
      setTransacoes(prev => prev.filter(item => item.id !== id));
    });
  }

  const cartaoDespesasAgrupadas = useMemo(() => {
    const agrupado: { [nomeCartao: string]: any[] } = {};
    cartaoDespesas.forEach((despesa: any) => {
      const nomeCartao = despesa && despesa.nomeCartao ? String(despesa.nomeCartao) : 'Desconhecido';
      if (!agrupado[nomeCartao]) agrupado[nomeCartao] = [];
      agrupado[nomeCartao].push(despesa);
    });
    return agrupado;
  }, [cartaoDespesas]);

  function recarregarTransacoes() {
    if (pessoa && ano && mes) {
      getTransacoes({ pessoaId: pessoa, ano, mes }).then(res => {
        setTransacoes(res.data);
      });
    }
  }

  // Função para buscar despesas próximas do vencimento para todas as pessoas
  const getDespesasProximasTodasPessoas = useCallback(async () => {
    // Buscar pessoas do backend se ainda não estiverem carregadas
    let pessoasList = pessoas;
    if (!pessoasList || pessoasList.length === 0) {
      const res = await api.get(API_URLS.PESSOAS);
      pessoasList = res.data;
    }
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
    let todasDespesas: any[] = [];
    for (const pessoaObj of pessoasList) {
      // Buscar todas as despesas dos próximos 30 dias (mês corrente e próximo mês)
      let despesas: any[] = [];
      // Buscar mês corrente
      const resCorrente = await getTransacoes({ pessoaId: pessoaObj.id, ano: String(anoAtual), mes: mesAtual });
      despesas.push(...(resCorrente.data || []));
      // Buscar próximo mês
      let proxMes = Number(mesAtual) + 1;
      let proxAno = anoAtual;
      if (proxMes > 12) {
        proxMes = 1;
        proxAno++;
      }
      const resProx = await getTransacoes({ pessoaId: pessoaObj.id, ano: String(proxAno), mes: String(proxMes).padStart(2, '0') });
      despesas.push(...(resProx.data || []));
      // Filtrar despesas nos próximos 30 dias
      const despesasProximas = despesas.filter((t: any) => {
        if (t.tipo !== 'despesa' || !t.data) return false;
        const dataVenc = Array.isArray(t.data)
          ? new Date(t.data[0], t.data[1] - 1, t.data[2])
          : new Date(t.data);
        const diff = (dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
      });
      todasDespesas.push(...despesasProximas.map((d: any) => ({ ...d, pessoaNome: pessoaObj.nome, pessoaId: pessoaObj.id })));
    }
    return todasDespesas;
  }, [pessoas]);

  return (
    <FinancaContext.Provider value={{ transacoes, adicionar, editar, excluir, recarregarTransacoes, pessoa, setPessoa, ano, setAno, mes, setMes, gastosPorCartao, cartaoDespesas, pessoas, cartaoDespesasAgrupadas, transacoesProxMes, getDespesasProximasTodasPessoas, loading, setLoading }}>
      {children}
    </FinancaContext.Provider>
  );
} 