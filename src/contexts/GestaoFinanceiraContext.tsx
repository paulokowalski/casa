import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { comprasService, TODOS } from '../services/financas';
import { useFiltrosCompra, type FiltrosSelecionados } from '../hooks/useFiltrosCompra';
import { calcularAnalise, type Analise } from '../lib/financas/analise';
import { idxParaRef, mesIdx } from '../lib/financas/parcelas';
import type { CompraInput, CompraRegistro, Parcela } from '../types/financas';

type GestaoFinanceiraValue = ReturnType<typeof useFiltrosCompra> & {
  buscar: () => void;
  filtrosAplicados: FiltrosSelecionados | null;
  loading: boolean;
  parcelasMes: Parcela[];
  analise: Analise | null;
  /** Orçamento mensal definido pelo usuário (salvo no navegador, por pessoa) */
  orcamento: number | null;
  salvarOrcamento: (valor: number | null) => void;
  /** POST sem `id`, PUT com `id` */
  salvarCompra: (dados: CompraInput, id?: string) => Promise<void>;
  excluirCompra: (id: string) => Promise<void>;
};

const GestaoFinanceiraContext = createContext<GestaoFinanceiraValue | null>(null);

const chaveOrcamento = (pessoa: string) => `casa.gestaoFinanceira.orcamento.${(pessoa || 'geral').toUpperCase()}`;

function lerOrcamento(pessoa: string): number | null {
  try {
    const n = Number(window.localStorage.getItem(chaveOrcamento(pessoa)));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function GestaoFinanceiraProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosSelecionados | null>(null);
  const [loading, setLoading] = useState(false);
  const [parcelasMes, setParcelasMes] = useState<Parcela[]>([]);
  const [parcelasAnteriores, setParcelasAnteriores] = useState<Parcela[][]>([]);
  const [registros, setRegistros] = useState<CompraRegistro[]>([]);
  const [orcamento, setOrcamento] = useState<number | null>(null);
  const [versao, setVersao] = useState(0);

  const filtros = useFiltrosCompra(setFiltrosAplicados);

  // Carrega o mês selecionado, os 3 anteriores (comparação por categoria) e todas as compras (histórico/projeção)
  useEffect(() => {
    if (!filtrosAplicados) return;
    let ativo = true;
    const f = filtrosAplicados;
    setOrcamento(lerOrcamento(f.pessoa));
    setLoading(true);
    const idx = mesIdx({ ano: Number(f.ano), mes: Number(f.mes) });
    const anteriores = [1, 2, 3].map((i) => idxParaRef(idx - i));
    Promise.all([
      comprasService.parcelasDoMesSeguro(f.ano, f.mes, f.pessoa, f.cartao),
      ...anteriores.map((r) => comprasService.parcelasDoMesSeguro(r.ano, r.mes, f.pessoa, f.cartao)),
      comprasService.todas(),
    ])
      .then((resultados) => {
        if (!ativo) return;
        const [atual, a1, a2, a3] = resultados as Parcela[][];
        const todas = resultados[4] as CompraRegistro[];
        const pessoa = f.pessoa.toUpperCase();
        const cartao = f.cartao.toUpperCase();
        setParcelasMes(atual);
        setParcelasAnteriores([a1, a2, a3]);
        setRegistros(
          todas.filter(
            (r) =>
              r.nomePessoaCompra?.toUpperCase() === pessoa &&
              (cartao === TODOS || r.nomeCartao?.toUpperCase() === cartao),
          ),
        );
      })
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
  }, [filtrosAplicados, versao]);

  const buscar = useCallback(() => {
    if (filtros.completos) setFiltrosAplicados({ ...filtros.selecionados });
  }, [filtros.completos, filtros.selecionados]);

  const salvarOrcamento = useCallback(
    (valor: number | null) => {
      const pessoa = filtrosAplicados?.pessoa ?? filtros.selecionados.pessoa;
      const v = valor && valor > 0 ? valor : null;
      setOrcamento(v);
      try {
        if (v) window.localStorage.setItem(chaveOrcamento(pessoa), String(v));
        else window.localStorage.removeItem(chaveOrcamento(pessoa));
      } catch {
        /* navegador sem storage: mantém só em memória */
      }
    },
    [filtrosAplicados, filtros.selecionados.pessoa],
  );

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  const salvarCompra = useCallback(
    async (dados: CompraInput, id?: string) => {
      if (id) await comprasService.editar(id, dados);
      else await comprasService.criar(dados);
      recarregar();
    },
    [recarregar],
  );

  const excluirCompra = useCallback(
    async (id: string) => {
      await comprasService.excluir(id);
      recarregar();
    },
    [recarregar],
  );

  const analise = useMemo<Analise | null>(() => {
    if (!filtrosAplicados) return null;
    return calcularAnalise({
      ref: { ano: Number(filtrosAplicados.ano), mes: Number(filtrosAplicados.mes) },
      parcelasMes,
      parcelasAnteriores,
      registros,
      orcamento,
      hoje: new Date(),
    });
  }, [filtrosAplicados, parcelasMes, parcelasAnteriores, registros, orcamento]);

  const value: GestaoFinanceiraValue = {
    ...filtros,
    buscar,
    filtrosAplicados,
    loading,
    parcelasMes,
    analise,
    orcamento,
    salvarOrcamento,
    salvarCompra,
    excluirCompra,
  };

  return <GestaoFinanceiraContext.Provider value={value}>{children}</GestaoFinanceiraContext.Provider>;
}

export function useGestaoFinanceira(): GestaoFinanceiraValue {
  const ctx = useContext(GestaoFinanceiraContext);
  if (!ctx) throw new Error('useGestaoFinanceira deve ser usado dentro de <GestaoFinanceiraProvider>');
  return ctx;
}
