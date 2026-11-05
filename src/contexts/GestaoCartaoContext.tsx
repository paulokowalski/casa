import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { comprasService, despesasService, TODOS } from '../services/financas';
import { useFiltrosCompra, type FiltrosSelecionados } from '../hooks/useFiltrosCompra';
import type { CompraInput, DespesaMes, Parcela } from '../types/financas';

export interface DespesaMensal {
  mes: string; // "01".."12"
  valorMes: number;
}

interface FiltrosCartao extends FiltrosSelecionados {
  ultimaParcela: string;
}

type GestaoCartaoValue = ReturnType<typeof useFiltrosCompra> & {
  ultimaParcela: string;
  setUltimaParcela: (v: string) => void;
  buscar: () => void;
  filtrosAplicados: FiltrosCartao | null;
  compras: Parcela[];
  despesa: DespesaMes | null;
  despesasDoAno: DespesaMensal[];
  loading: boolean;
  loadingAno: boolean;
  /** POST sem `id`, PUT com `id` */
  salvarCompra: (dados: CompraInput, id?: string) => Promise<void>;
  excluirCompra: (id: string) => Promise<void>;
};

const GestaoCartaoContext = createContext<GestaoCartaoValue | null>(null);

export function GestaoCartaoProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosCartao | null>(null);
  const [ultimaParcela, setUltimaParcela] = useState(TODOS);
  const [compras, setCompras] = useState<Parcela[]>([]);
  const [despesa, setDespesa] = useState<DespesaMes | null>(null);
  const [despesasDoAno, setDespesasDoAno] = useState<DespesaMensal[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAno, setLoadingAno] = useState(false);

  const filtros = useFiltrosCompra((iniciais) => setFiltrosAplicados({ ...iniciais, ultimaParcela: TODOS }));

  // Dados do mês
  const consultar = useCallback(async (f: FiltrosCartao) => {
    setLoading(true);
    try {
      const [parcelas, desp] = await Promise.all([
        comprasService.parcelasDoMes(f.ano, f.mes, f.pessoa, f.cartao, f.ultimaParcela).catch(() => []),
        despesasService.doMes(f.ano, f.mes, f.pessoa),
      ]);
      setCompras(parcelas);
      setDespesa(desp);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filtrosAplicados) void consultar(filtrosAplicados);
  }, [filtrosAplicados, consultar]);

  // Total por mês do ano (gráfico)
  useEffect(() => {
    if (!filtrosAplicados) return;
    let ativo = true;
    setLoadingAno(true);
    despesasService
      .doAno(filtrosAplicados.ano, filtrosAplicados.pessoa)
      .then((porMes) => {
        if (!ativo) return;
        setDespesasDoAno(
          Object.keys(porMes)
            .sort()
            .map((mes) => ({ mes: mes.padStart(2, '0'), valorMes: Number(porMes[mes]?.valorMes) || 0 })),
        );
      })
      .finally(() => ativo && setLoadingAno(false));
    return () => {
      ativo = false;
    };
  }, [filtrosAplicados?.ano, filtrosAplicados?.pessoa]); // eslint-disable-line react-hooks/exhaustive-deps

  const buscar = useCallback(() => {
    if (!filtros.completos) return;
    setFiltrosAplicados({ ...filtros.selecionados, ultimaParcela });
  }, [filtros.completos, filtros.selecionados, ultimaParcela]);

  const recarregar = useCallback(async () => {
    if (filtrosAplicados) await consultar(filtrosAplicados);
  }, [filtrosAplicados, consultar]);

  const salvarCompra = useCallback(
    async (dados: CompraInput, id?: string) => {
      if (id) await comprasService.editar(id, dados);
      else await comprasService.criar(dados);
      await recarregar();
    },
    [recarregar],
  );
  const excluirCompra = useCallback(
    async (id: string) => {
      await comprasService.excluir(id);
      await recarregar();
    },
    [recarregar],
  );

  const value = useMemo<GestaoCartaoValue>(
    () => ({
      ...filtros,
      ultimaParcela,
      setUltimaParcela,
      buscar,
      filtrosAplicados,
      compras,
      despesa,
      despesasDoAno,
      loading,
      loadingAno,
      salvarCompra,
      excluirCompra,
    }),
    [
      filtros,
      ultimaParcela,
      buscar,
      filtrosAplicados,
      compras,
      despesa,
      despesasDoAno,
      loading,
      loadingAno,
      salvarCompra,
      excluirCompra,
    ],
  );

  return <GestaoCartaoContext.Provider value={value}>{children}</GestaoCartaoContext.Provider>;
}

export function useGestaoCartao(): GestaoCartaoValue {
  const ctx = useContext(GestaoCartaoContext);
  if (!ctx) throw new Error('useGestaoCartao deve ser usado dentro de <GestaoCartaoProvider>');
  return ctx;
}
