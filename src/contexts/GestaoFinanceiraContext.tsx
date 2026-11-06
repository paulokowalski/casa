import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePessoa, type Pessoa } from './PessoaContext';
import { comprasService, despesasService, filtrosService } from '../services/financas';
import { contasService, faturaService, rendaService } from '../services/contas';
import { calcularVisao, type VisaoMensal } from '../lib/financas/visaoMensal';
import { idxParaRef, mesIdx } from '../lib/financas/parcelas';
import type { Competencia, Conta, ContaInput, Lancamento, LancamentoInput } from '../types/contas';
import type { Item, Parcela } from '../types/financas';

interface Dados {
  lancamentos: Lancamento[];
  contas: Conta[];
  parcelasCartao: Parcela[];
  cartaoPorMes: Map<number, number>;
  renda: number | null;
  rendaHerdada: boolean;
  faturaPaga: boolean;
}

type GestaoFinanceiraValue = {
  ano: number;
  mes: number;
  pessoa: Pessoa | null;
  pessoas: Pessoa[];
  anos: number[];
  categorias: Item[];
  setAno: (ano: number) => void;
  setMes: (mes: number) => void;
  setPessoaId: (id: number) => void;
  /** Mês selecionado no formato "2026-11" */
  competencia: Competencia;
  loading: boolean;
  erro: string | null;
  visao: VisaoMensal | null;
  contas: Conta[];
  renda: number | null;
  rendaHerdada: boolean;
  salvarRenda: (valor: number | null) => Promise<void>;
  /** POST sem `id`; PUT com `id`, valendo a partir do mês selecionado */
  salvarConta: (dados: ContaInput, id?: string) => Promise<void>;
  excluirConta: (id: string, encerrarAPartirDoMes: boolean) => Promise<void>;
  atualizarLancamento: (id: string, dados: LancamentoInput) => Promise<void>;
  /** Marca ou desmarca a fatura do cartão do mês como paga */
  marcarFatura: (paga: boolean) => Promise<void>;
};

const GestaoFinanceiraContext = createContext<GestaoFinanceiraValue | null>(null);

const comp = (ano: number, mes: number): Competencia => `${ano}-${String(mes).padStart(2, '0')}`;

export function GestaoFinanceiraProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { pessoas } = usePessoa();
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [pessoaId, setPessoaId] = useState<number | null>(null);
  const [anosCompra, setAnosCompra] = useState<number[]>([]);
  const [categorias, setCategorias] = useState<Item[]>([]);
  const [dados, setDados] = useState<Dados | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  const pessoa = pessoas.find((p) => p.id === pessoaId) ?? null;
  const competencia = comp(ano, mes);

  useEffect(() => {
    filtrosService.anos().then((itens) => setAnosCompra(itens.map((i) => Number(i.codigo)).filter(Boolean)));
    filtrosService.categorias().then(setCategorias);
  }, []);

  // Primeira pessoa como padrão
  useEffect(() => {
    if (pessoaId === null && pessoas.length > 0) setPessoaId(pessoas[0].id);
  }, [pessoas, pessoaId]);

  useEffect(() => {
    if (!pessoa) return;
    let ativo = true;
    const refIdx = mesIdx({ ano, mes });
    const inicio = idxParaRef(refIdx - 11);
    const anosJanela = [...new Set([inicio.ano, ano])];
    setLoading(true);
    setErro(null);
    Promise.all([
      contasService.lancamentos(pessoa.id, comp(inicio.ano, inicio.mes), comp(ano, mes)),
      contasService.listar(pessoa.id),
      rendaService.obter(ano, mes, pessoa.id).catch(() => null),
      comprasService.parcelasDoMesSeguro(ano, mes, pessoa.nome),
      Promise.all(anosJanela.map((a) => despesasService.doAno(String(a), pessoa.nome).then((r) => [a, r] as const))),
      faturaService.obter(ano, mes, pessoa.id).catch(() => null),
    ])
      .then(([lancamentos, contas, renda, parcelasCartao, despesasAnos, fatura]) => {
        if (!ativo) return;
        const cartaoPorMes = new Map<number, number>();
        despesasAnos.forEach(([a, porMes]) =>
          Object.entries(porMes).forEach(([m, d]) =>
            cartaoPorMes.set(mesIdx({ ano: a, mes: Number(m) }), Number(d?.valorMes) || 0),
          ),
        );
        setDados({
          lancamentos,
          contas,
          parcelasCartao,
          cartaoPorMes,
          renda: renda?.valor ?? null,
          rendaHerdada: Boolean(renda?.herdada),
          faturaPaga: Boolean(fatura?.paga),
        });
      })
      .catch((e: unknown) => ativo && setErro(e instanceof Error ? e.message : 'Erro ao carregar.'))
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
  }, [pessoa, ano, mes, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  const salvarRenda = useCallback(
    async (valor: number | null) => {
      if (!pessoa) return;
      const r = await rendaService.salvar(ano, mes, pessoa.id, valor);
      setDados((d) => (d ? { ...d, renda: r.valor, rendaHerdada: r.herdada } : d));
    },
    [pessoa, ano, mes],
  );

  const salvarConta = useCallback(
    async (input: ContaInput, id?: string) => {
      if (id) await contasService.editar(id, input, competencia);
      else await contasService.criar(input);
      recarregar();
    },
    [competencia, recarregar],
  );

  const excluirConta = useCallback(
    async (id: string, encerrarAPartirDoMes: boolean) => {
      await contasService.excluir(id, encerrarAPartirDoMes ? competencia : undefined);
      recarregar();
    },
    [competencia, recarregar],
  );

  const atualizarLancamento = useCallback(async (id: string, input: LancamentoInput) => {
    const troca = (paga: boolean) =>
      setDados((d) => (d ? { ...d, lancamentos: d.lancamentos.map((l) => (l.id === id ? { ...l, paga } : l)) } : d));
    if (input.paga !== undefined && input.valor === undefined) troca(input.paga); // resposta imediata na tela
    let atualizado: Lancamento;
    try {
      atualizado = await contasService.atualizarLancamento(id, input);
    } catch (e) {
      if (input.paga !== undefined && input.valor === undefined) troca(!input.paga);
      throw e;
    }
    // Atualiza na hora; estimativas dos meses seguintes mudam no servidor, então recarrega em seguida
    setDados((d) => (d ? { ...d, lancamentos: d.lancamentos.map((l) => (l.id === id ? atualizado : l)) } : d));
    if (input.valor !== undefined) setVersao((v) => v + 1);
  }, []);

  const marcarFatura = useCallback(
    async (paga: boolean) => {
      if (!pessoa) return;
      setDados((d) => (d ? { ...d, faturaPaga: paga } : d)); // resposta imediata na tela
      try {
        const r = await faturaService.salvar(ano, mes, pessoa.id, paga);
        setDados((d) => (d ? { ...d, faturaPaga: r.paga } : d));
      } catch (e) {
        setDados((d) => (d ? { ...d, faturaPaga: !paga } : d));
        throw e;
      }
    },
    [pessoa, ano, mes],
  );

  const visao = useMemo(
    () =>
      dados
        ? calcularVisao({
            ref: { ano, mes },
            lancamentos: dados.lancamentos,
            contas: dados.contas,
            parcelasCartao: dados.parcelasCartao,
            cartaoPorMes: dados.cartaoPorMes,
            renda: dados.renda,
            faturaPaga: dados.faturaPaga,
            hoje: new Date(),
          })
        : null,
    [dados, ano, mes],
  );

  const anos = useMemo(
    () => [...new Set([...anosCompra, hoje.getFullYear(), hoje.getFullYear() + 1, ano])].sort((a, b) => b - a),
    [anosCompra, ano], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const value: GestaoFinanceiraValue = {
    ano,
    mes,
    pessoa,
    pessoas,
    anos,
    categorias,
    setAno,
    setMes,
    setPessoaId,
    competencia,
    loading,
    erro,
    visao,
    contas: dados?.contas ?? [],
    renda: dados?.renda ?? null,
    rendaHerdada: dados?.rendaHerdada ?? false,
    salvarRenda,
    salvarConta,
    excluirConta,
    atualizarLancamento,
    marcarFatura,
  };

  return <GestaoFinanceiraContext.Provider value={value}>{children}</GestaoFinanceiraContext.Provider>;
}

export function useGestaoFinanceira(): GestaoFinanceiraValue {
  const ctx = useContext(GestaoFinanceiraContext);
  if (!ctx) throw new Error('useGestaoFinanceira deve ser usado dentro de <GestaoFinanceiraProvider>');
  return ctx;
}
