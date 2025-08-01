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
  paga: boolean;
}

interface DadosGraficoAno {
  mes: string;
  Receita: number;
  Despesa: number;
}

interface FinancaContextData {
  // Estados existentes
  transacoes: Transacao[];
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
  loading: boolean;
  setLoading: (v: boolean) => void;
  
  // Novos estados para gráfico
  dadosGraficoAno: DadosGraficoAno[];
  loadingGraficoAno: boolean;
  
  // Funções existentes
  adicionar: (t: Omit<Transacao, 'id'>) => void;
  editar: (id: string, t: Omit<Transacao, 'id'>) => void;
  excluir: (id: string) => void;
  recarregarTransacoes: () => void;
  getDespesasProximasTodasPessoas: () => Promise<any[]>;
  
  // Novas funções para gráfico
  carregarDadosGraficoAno: () => void;
}

const FinancaContext = createContext<FinancaContextData>({} as any);
export const useFinanca = () => useContext(FinancaContext);

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export function FinancaProvider({ children }: { children: React.ReactNode }) {
  // Estados existentes
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [transacoesProxMes, setTransacoesProxMes] = useState<Transacao[]>([]);
  const [pessoa, setPessoa] = useState('');
  const [ano, setAno] = useState('');
  const [mes, setMes] = useState('');
  const [cartaoDespesas, setCartaoDespesas] = useState<any[]>([]);
  const [gastosPorCartao, setGastosPorCartao] = useState<{ [nomeCartao: string]: number }>({});
  const [loading, setLoading] = useState(false);

  // Novos estados para gráfico
  const [dadosGraficoAno, setDadosGraficoAno] = useState<DadosGraficoAno[]>([]);
  const [loadingGraficoAno, setLoadingGraficoAno] = useState(false);

  const { pessoas, carregarPessoas } = usePessoa();

  useEffect(() => {
    if (!pessoas || pessoas.length === 0) {
      carregarPessoas();
    }
  }, []);

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

  // Carregar dados do gráfico anual
  const carregarDadosGraficoAno = useCallback(async () => {
    if (!pessoa || !ano) {
      setDadosGraficoAno([]);
      return;
    }

    setLoadingGraficoAno(true);
    try {
      const receitas: number[] = Array(12).fill(0);
      const despesas: number[] = Array(12).fill(0);
      const despesasCartao: number[] = Array(12).fill(0);
      
      // Descobrir nome da pessoa
      const pessoaObj = pessoas.find(p => String(p.id) === String(pessoa));
      const pessoaNome = pessoaObj ? pessoaObj.nome : '';
      
      await Promise.all(
        Array.from({ length: 12 }, (_, i) => i + 1).map(async (mes) => {
          // Buscar transações normais
          const res = await getTransacoes({ pessoaId: pessoa, ano, mes: String(mes).padStart(2, '0') });
          const transacoes = Array.isArray(res.data) ? res.data : [];
          receitas[mes - 1] = transacoes.filter((t: any) => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
          despesas[mes - 1] = transacoes.filter((t: any) => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
          
          // Buscar despesas de cartão de crédito
          try {
            if (pessoaNome) {
              const url = API_URLS.COMPRA_SEM_CARTAO(ano, String(mes).padStart(2, '0'), pessoaNome);
              const cartaoRes = await api.get(url);
              let despesasCartaoArr = cartaoRes.data;
              if (despesasCartaoArr && Array.isArray(despesasCartaoArr.compras)) {
                despesasCartaoArr = despesasCartaoArr.compras;
              } else if (!Array.isArray(despesasCartaoArr)) {
                if (despesasCartaoArr && Array.isArray(despesasCartaoArr.data)) {
                  despesasCartaoArr = despesasCartaoArr.data;
                } else if (despesasCartaoArr && Array.isArray(despesasCartaoArr.items)) {
                  despesasCartaoArr = despesasCartaoArr.items;
                } else if (despesasCartaoArr && typeof despesasCartaoArr === 'object') {
                  despesasCartaoArr = Object.values(despesasCartaoArr);
                } else {
                  despesasCartaoArr = [];
                }
              }
              despesasCartao[mes - 1] = (despesasCartaoArr || []).reduce((acc: number, c: any) => acc + (Number(c.valorParcela) || 0), 0);
            }
          } catch {}
        })
      );
      
      // Montar dados para o gráfico
      const data = MESES.map((mes, idx) => ({
        mes,
        Receita: receitas[idx],
        Despesa: despesas[idx] + despesasCartao[idx],
      }));
      
      setDadosGraficoAno(data);
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico anual:', error);
      setDadosGraficoAno([]);
    } finally {
      setLoadingGraficoAno(false);
    }
  }, [pessoa, ano, pessoas]);

  // Carregar dados do gráfico quando pessoa ou ano mudarem
  useEffect(() => {
    carregarDadosGraficoAno();
  }, [carregarDadosGraficoAno]);

  useEffect(() => {
    if (pessoa && ano && mes) {
      setLoading(true);
      const loadingCtrl = makeLoadingController(setLoading);
      getTransacoes({ pessoaId: pessoa, ano, mes }).then(res => {
        setTransacoes(res.data);
        loadingCtrl.transacoesOk();
      });
      let proxMes = Number(mes) + 1;
      let proxAno = Number(ano);
      if (proxMes > 12) {
        proxMes = 1;
        proxAno++;
      }
      getTransacoes({ pessoaId: pessoa, ano: String(proxAno), mes: String(proxMes).padStart(2, '0') }).then(res => {
        setTransacoesProxMes(res.data);
      });
      const pessoaObj = pessoas.find(p => String(p.id) === String(pessoa));
      const nomePessoa = pessoaObj ? pessoaObj.nome : '';
      if (nomePessoa) {
        (async () => {
          try {
            const res = await api.get(API_URLS.COMPRA_SEM_CARTAO(ano, mes, nomePessoa));
            let despesasCartaoArr = res.data;
            if (despesasCartaoArr && Array.isArray(despesasCartaoArr.compras)) {
              despesasCartaoArr = despesasCartaoArr.compras;
            } else if (!Array.isArray(despesasCartaoArr)) {
              if (despesasCartaoArr && Array.isArray(despesasCartaoArr.data)) {
                despesasCartaoArr = despesasCartaoArr.data;
              } else if (despesasCartaoArr && Array.isArray(despesasCartaoArr.items)) {
                despesasCartaoArr = despesasCartaoArr.items;
              } else if (despesasCartaoArr && typeof despesasCartaoArr === 'object') {
                despesasCartaoArr = Object.values(despesasCartaoArr);
              } else {
                despesasCartaoArr = [];
              }
            }
            setCartaoDespesas(despesasCartaoArr || []);
            const gastosPorCartaoMap: { [nomeCartao: string]: number } = {};
            (despesasCartaoArr || []).forEach((compra: any) => {
              const nomeCartao = compra.nomeCartao || 'Sem cartão';
              gastosPorCartaoMap[nomeCartao] = (gastosPorCartaoMap[nomeCartao] || 0) + (Number(compra.valorParcela) || 0);
            });
            setGastosPorCartao(gastosPorCartaoMap);
            loadingCtrl.cartaoOk();
          } catch (error) {
            console.error('Erro ao carregar despesas de cartão:', error);
            setCartaoDespesas([]);
            setGastosPorCartao({});
            loadingCtrl.cartaoOk();
          }
        })();
      } else {
        setCartaoDespesas([]);
        setGastosPorCartao({});
        loadingCtrl.cartaoOk();
      }
    }
  }, [pessoa, ano, mes, pessoas]);

  const cartaoDespesasAgrupadas = useMemo(() => {
    const agrupadas: { [nomeCartao: string]: any[] } = {};
    cartaoDespesas.forEach(compra => {
      const nomeCartao = compra.nomeCartao || 'Sem cartão';
      if (!agrupadas[nomeCartao]) {
        agrupadas[nomeCartao] = [];
      }
      agrupadas[nomeCartao].push(compra);
    });
    return agrupadas;
  }, [cartaoDespesas]);

  function adicionar(t: Omit<Transacao, 'id'>) {
    const novaTransacao = {
      ...t,
      id: Date.now().toString(),
    };
    setTransacoes(prev => [...prev, novaTransacao]);
  }

  function editar(id: string, t: Omit<Transacao, 'id'>) {
    setTransacoes(prev => prev.map(item => item.id === id ? { ...t, id } : item));
  }

  function excluir(id: string) {
    setTransacoes(prev => prev.filter(item => item.id !== id));
  }

  function recarregarTransacoes() {
    if (pessoa && ano && mes) {
      getTransacoes({ pessoaId: pessoa, ano, mes }).then(res => {
        setTransacoes(res.data);
      });
    }
  }

  async function getDespesasProximasTodasPessoas() {
    try {
      const transacoes = await api.get(API_URLS.TRANSACOES_PROXIMOS_30_DIAS);
      return transacoes.data;
    } catch (error) {
      console.error('Erro ao carregar despesas próximas:', error);
      return [];
    }
  }

  return (
    <FinancaContext.Provider value={{
      // Estados existentes
      transacoes,
      pessoa,
      setPessoa,
      ano,
      setAno,
      mes,
      setMes,
      gastosPorCartao,
      cartaoDespesas,
      pessoas,
      cartaoDespesasAgrupadas,
      transacoesProxMes,
      loading,
      setLoading,
      
      // Novos estados para gráfico
      dadosGraficoAno,
      loadingGraficoAno,
      
      // Funções existentes
      adicionar,
      editar,
      excluir,
      recarregarTransacoes,
      getDespesasProximasTodasPessoas,
      
      // Novas funções para gráfico
      carregarDadosGraficoAno,
    }}>
      {children}
    </FinancaContext.Provider>
  );
} 