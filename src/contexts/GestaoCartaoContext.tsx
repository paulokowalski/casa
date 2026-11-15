import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { comprasService, TODOS } from '../services/financas';
import { useFiltrosCompra, type FiltrosSelecionados } from '../hooks/useFiltrosCompra';
import { calcularAnalise, type Analise } from '../lib/financas/analise';
import { idxParaRef, mesIdx, partesData } from '../lib/financas/parcelas';
import type { MesFuturo } from '../lib/financas/proximosMeses';
import type { CompraInput, CompraRegistro, Parcela } from '../types/financas';

type GestaoCartaoValue = ReturnType<typeof useFiltrosCompra> & {
  ultimaParcela: string;
  setUltimaParcela: (v: string) => void;
  buscar: () => void;
  filtrosAplicados: FiltrosSelecionados | null;
  loading: boolean;
  parcelasMes: Parcela[];
  transacoes: Parcela[];
  analise: Analise | null;
  proximos: MesFuturo[] | null;
  orcamento: number | null;
  salvarOrcamento: (valor: number | null) => void;
  salvarCompra: (dados: CompraInput, id?: string) => Promise<void>;
  excluirCompra: (id: string) => Promise<void>;
};

interface Consulta extends FiltrosSelecionados {
  ultimaParcela: string;
}

const GestaoCartaoContext = createContext<GestaoCartaoValue | null>(null);

const MESES_ANTERIORES = 3;
const MESES_SEGUINTES = 12;

function agruparPorMes(parcelas: Parcela[]): Map<number, Parcela[]> {
  const porMes = new Map<number, Parcela[]>();
  for (const p of parcelas) {
    const d = partesData(p.dataParcela);
    if (!d) continue;
    const i = mesIdx({ ano: d.ano, mes: d.mes });
    const lista = porMes.get(i);
    if (lista) lista.push(p);
    else porMes.set(i, [p]);
  }
  return porMes;
}

const chaveOrcamento = (pessoa: string) => `casa.gestaoFinanceira.orcamento.${(pessoa || 'geral').toUpperCase()}`;

function lerOrcamento(pessoa: string): number | null {
  try {
    const n = Number(window.localStorage.getItem(chaveOrcamento(pessoa)));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function GestaoCartaoProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [ultimaParcela, setUltimaParcela] = useState(TODOS);
  const [loading, setLoading] = useState(false);
  const [parcelasMes, setParcelasMes] = useState<Parcela[]>([]);
  const [filtradas, setFiltradas] = useState<Parcela[] | null>(null);
  const [parcelasAnteriores, setParcelasAnteriores] = useState<Parcela[][]>([]);
  const [registros, setRegistros] = useState<CompraRegistro[]>([]);
  const [orcamento, setOrcamento] = useState<number | null>(null);
  const [versao, setVersao] = useState(0);
  const [proximos, setProximos] = useState<MesFuturo[] | null>(null);

  const filtros = useFiltrosCompra((iniciais) => setConsulta({ ...iniciais, ultimaParcela: TODOS }));

  useEffect(() => {
    if (!consulta) return;
    let ativo = true;
    const f = consulta;
    setOrcamento(lerOrcamento(f.pessoa));
    setLoading(true);
    setProximos(null);
    const idx = mesIdx({ ano: Number(f.ano), mes: Number(f.mes) });
    const filtrarUltima = f.ultimaParcela !== TODOS;
    // Uma chamada traz dos 3 meses anteriores aos 12 seguintes; os meses são separados aqui.
    Promise.all([
      comprasService.parcelasDoPeriodo(
        idxParaRef(idx - MESES_ANTERIORES),
        idxParaRef(idx + MESES_SEGUINTES),
        f.pessoa,
        f.cartao,
      ),
      comprasService.todas(f.pessoa, f.cartao),
      filtrarUltima
        ? comprasService.parcelasDoMes(f.ano, f.mes, f.pessoa, f.cartao, f.ultimaParcela).catch(() => [])
        : Promise.resolve(null),
    ])
      .then(([periodo, todas, soUltima]) => {
        if (!ativo) return;
        const porMes = agruparPorMes(periodo);
        const doMes = (i: number) => porMes.get(i) ?? [];
        setParcelasMes(doMes(idx));
        setParcelasAnteriores(Array.from({ length: MESES_ANTERIORES }, (_, i) => doMes(idx - 1 - i)));
        setProximos(
          Array.from({ length: MESES_SEGUINTES }, (_, i) => ({ idx: idx + 1 + i, parcelas: doMes(idx + 1 + i) })),
        );
        setFiltradas(soUltima);
        setRegistros(todas);
      })
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
  }, [consulta, versao]);

  const buscar = useCallback(() => {
    if (filtros.completos) setConsulta({ ...filtros.selecionados, ultimaParcela });
  }, [filtros.completos, filtros.selecionados, ultimaParcela]);

  const salvarOrcamento = useCallback(
    (valor: number | null) => {
      const pessoa = consulta?.pessoa ?? filtros.selecionados.pessoa;
      const v = valor && valor > 0 ? valor : null;
      setOrcamento(v);
      try {
        if (v) window.localStorage.setItem(chaveOrcamento(pessoa), String(v));
        else window.localStorage.removeItem(chaveOrcamento(pessoa));
      } catch {}
    },
    [consulta, filtros.selecionados.pessoa],
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

  const filtrosAplicados = useMemo<FiltrosSelecionados | null>(
    () =>
      consulta ? { ano: consulta.ano, mes: consulta.mes, pessoa: consulta.pessoa, cartao: consulta.cartao } : null,
    [consulta],
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

  const value: GestaoCartaoValue = {
    ...filtros,
    ultimaParcela,
    setUltimaParcela,
    buscar,
    filtrosAplicados,
    loading,
    parcelasMes,
    transacoes: filtradas ?? parcelasMes,
    analise,
    proximos,
    orcamento,
    salvarOrcamento,
    salvarCompra,
    excluirCompra,
  };

  return <GestaoCartaoContext.Provider value={value}>{children}</GestaoCartaoContext.Provider>;
}

export function useGestaoCartao(): GestaoCartaoValue {
  const ctx = useContext(GestaoCartaoContext);
  if (!ctx) throw new Error('useGestaoCartao deve ser usado dentro de <GestaoCartaoProvider>');
  return ctx;
}
