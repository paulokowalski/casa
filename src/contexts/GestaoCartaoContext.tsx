import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { comprasService, TODOS } from '../services/financas';
import { useFiltrosCompra, type FiltrosSelecionados } from '../hooks/useFiltrosCompra';
import { calcularAnalise, type Analise } from '../lib/financas/analise';
import { idxParaRef, mesIdx } from '../lib/financas/parcelas';
import type { MesFuturo } from '../lib/financas/proximosMeses';
import type { CompraInput, CompraRegistro, Parcela } from '../types/financas';

type GestaoCartaoValue = ReturnType<typeof useFiltrosCompra> & {
  /** Filtro "Última parcela" (TODOS | SIM | NAO): vale só para a tabela de transações */
  ultimaParcela: string;
  setUltimaParcela: (v: string) => void;
  buscar: () => void;
  filtrosAplicados: FiltrosSelecionados | null;
  loading: boolean;
  /** Todas as parcelas do mês: base dos indicadores, insights e gráficos */
  parcelasMes: Parcela[];
  /** Parcelas exibidas na tabela (respeitam o filtro "Última parcela") */
  transacoes: Parcela[];
  analise: Analise | null;
  /** Parcelas já assumidas nos 12 meses seguintes ao mês buscado (null enquanto carrega) */
  proximos: MesFuturo[] | null;
  /** Orçamento mensal definido pelo usuário (salvo no navegador, por pessoa) */
  orcamento: number | null;
  salvarOrcamento: (valor: number | null) => void;
  /** POST sem `id`, PUT com `id` */
  salvarCompra: (dados: CompraInput, id?: string) => Promise<void>;
  excluirCompra: (id: string) => Promise<void>;
};

interface Consulta extends FiltrosSelecionados {
  ultimaParcela: string;
}

const GestaoCartaoContext = createContext<GestaoCartaoValue | null>(null);

// Mantém a chave antiga para não perder orçamentos já salvos no navegador
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

  // Mês selecionado, os 3 anteriores (comparação por categoria), todas as compras (histórico/projeção)
  // e, se houver filtro de última parcela, a lista filtrada para a tabela.
  useEffect(() => {
    if (!consulta) return;
    let ativo = true;
    const f = consulta;
    setOrcamento(lerOrcamento(f.pessoa));
    setLoading(true);
    const idx = mesIdx({ ano: Number(f.ano), mes: Number(f.mes) });
    const anteriores = [1, 2, 3].map((i) => idxParaRef(idx - i));
    const filtrarUltima = f.ultimaParcela !== TODOS;
    Promise.all([
      comprasService.parcelasDoMesSeguro(f.ano, f.mes, f.pessoa, f.cartao),
      Promise.all(anteriores.map((r) => comprasService.parcelasDoMesSeguro(r.ano, r.mes, f.pessoa, f.cartao))),
      comprasService.todas(),
      filtrarUltima
        ? comprasService.parcelasDoMes(f.ano, f.mes, f.pessoa, f.cartao, f.ultimaParcela).catch(() => [])
        : Promise.resolve(null),
    ])
      .then(([atual, ant, todas, soUltima]) => {
        if (!ativo) return;
        const pessoa = f.pessoa.toUpperCase();
        const cartao = f.cartao.toUpperCase();
        setParcelasMes(atual);
        setParcelasAnteriores(ant);
        setFiltradas(soUltima);
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
  }, [consulta, versao]);

  // Próximos 12 meses: carregados à parte para não atrasar o restante da tela
  useEffect(() => {
    if (!consulta) return;
    let ativo = true;
    setProximos(null);
    const idx = mesIdx({ ano: Number(consulta.ano), mes: Number(consulta.mes) });
    const indices = Array.from({ length: 12 }, (_, i) => idx + 1 + i);
    Promise.all(
      indices.map((i) => {
        const r = idxParaRef(i);
        return comprasService
          .parcelasDoMesSeguro(r.ano, r.mes, consulta.pessoa, consulta.cartao)
          .then((parcelas) => ({ idx: i, parcelas }));
      }),
    ).then((meses) => ativo && setProximos(meses));
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
      } catch {
        /* navegador sem storage: mantém só em memória */
      }
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
