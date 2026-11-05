import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { API_URLS } from '../../config/urls';
import { useCurrencyData, useFipeData } from '../../hooks/useApiData';
import { MONTHS_PT, MONTHS_SHORT_PT } from '../../utils/format';
import type { CurrencyData } from '../../types/api';

/** Código FIPE do veículo acompanhado pelo histórico do backend */
export const CODIGO_FIPE_HISTORICO = '015203-0';

const MESES_EN = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];

const CHAVE_TARIFA = 'casa.dashboard.tarifaKwh';
export const TARIFA_PADRAO = 0.95;

type Status = 'loading' | 'ok' | 'erro';

// ------------------------------------------------------------------ helpers
const pad = (n: number) => String(n).padStart(2, '0');

function hojeLocal() {
  const d = new Date();
  return {
    ano: d.getFullYear(),
    mes: d.getMonth() + 1,
    dia: d.getDate(),
    hora: d.getHours(),
    iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
  };
}

type ApiData = string | number[] | undefined;

interface LeituraPotencia {
  valor?: number;
  potencia?: number;
  data: ApiData;
}

interface GeracaoMesApi {
  month?: string | number;
  value?: number;
  geracao?: number;
}

interface CarroFipeApi {
  mesReferencia?: string;
  valor?: number;
  marca?: string;
  modelo?: string;
  ano?: string;
}

function horarioDe(data: ApiData): string {
  if (Array.isArray(data) && data.length >= 5) return `${pad(Number(data[3]))}:${pad(Number(data[4]))}`;
  if (typeof data === 'string') {
    const p = data.split('T')[1]?.split(':');
    if (p && p.length >= 2) return `${p[0]}:${p[1]}`;
  }
  return '';
}

function diaDe(data: ApiData): number | null {
  if (Array.isArray(data) && data.length >= 3) return Number(data[2]);
  if (typeof data === 'string') {
    const p = data.split('T')[0].split('-');
    if (p.length === 3) return Number(p[2]);
  }
  return null;
}

function mesDe(item: GeracaoMesApi): number {
  if (typeof item?.month === 'string') return MESES_EN.indexOf(item.month.toUpperCase());
  if (typeof item?.month === 'number') return item.month - 1;
  return -1;
}

function serieAnual(lista: GeracaoMesApi[]): number[] {
  const out = Array.from({ length: 12 }, () => 0);
  (Array.isArray(lista) ? lista : []).forEach((i) => {
    const idx = mesDe(i);
    if (idx >= 0) out[idx] = Number(i.value ?? i.geracao ?? 0) || 0;
  });
  return out;
}

export function lerTarifa(): number {
  try {
    const v = Number(window.localStorage.getItem(CHAVE_TARIFA));
    return isFinite(v) && v > 0 ? v : TARIFA_PADRAO;
  } catch {
    return TARIFA_PADRAO;
  }
}

function gravarTarifa(v: number) {
  try {
    window.localStorage.setItem(CHAVE_TARIFA, String(v));
  } catch {
    /* sem storage: só em memória */
  }
}

// ------------------------------------------------------------------ tipos
export interface SolarHoje {
  kwh: number | null;
  curva: { horario: string; potencia: number }[];
  pico: { potencia: number; horario: string } | null;
  agora: { potencia: number; horario: string } | null;
}

export interface SolarMes {
  acumulado: number;
  mediaDiaria: number | null;
  previsao: number | null;
  diasNoMes: number;
}

export interface SolarAno {
  atual: number[];
  anterior: number[];
  ytdAtual: number;
  ytdAnterior: number;
  melhorMes: { idx: number; valor: number } | null;
}

export interface FipeHistorico {
  pontos: { referencia: string; rotulo: string; valor: number }[];
  descricao: string;
  atual: number | null;
  variacao12m: number | null;
  perdaMensalMedia: number | null;
  perdaUltimoMes: number | null;
  projecao12m: number | null;
}

export interface Cambio {
  codigo: 'USD' | 'EUR';
  valor: number;
  variacao: number; // em %
  minimo: number;
  maximo: number;
}

export type TomInsight = 'bom' | 'ruim' | 'neutro' | 'info';
export interface InsightDia {
  id: string;
  icone: 'sol' | 'grafico' | 'dolar' | 'carro' | 'trofeu';
  tom: TomInsight;
  titulo: string;
  texto: string;
}

// ------------------------------------------------------------------ hook
export function useDashboardData() {
  const hoje = useMemo(hojeLocal, []);

  const [hojeStatus, setHojeStatus] = useState<Status>('loading');
  const [solarHoje, setSolarHoje] = useState<SolarHoje | null>(null);
  const [mesStatus, setMesStatus] = useState<Status>('loading');
  const [solarMes, setSolarMes] = useState<SolarMes | null>(null);
  const [anoStatus, setAnoStatus] = useState<Status>('loading');
  const [solarAno, setSolarAno] = useState<SolarAno | null>(null);
  const [fipeStatus, setFipeStatus] = useState<Status>('loading');
  const [fipe, setFipe] = useState<FipeHistorico | null>(null);
  const [tarifa, setTarifaState] = useState<number>(lerTarifa);
  const [atualizadoEm, setAtualizadoEm] = useState<Date>(new Date());

  const { data: fipeAtual, loading: fipeAtualLoading, error: fipeAtualErro } = useFipeData(API_URLS.FIPE);
  const dolar = useCurrencyData(API_URLS.DOLLAR);
  const euro = useCurrencyData(API_URLS.EURO);

  const setTarifa = useCallback((v: number) => {
    if (!(v > 0)) return;
    setTarifaState(v);
    gravarTarifa(v);
  }, []);

  const carregar = useCallback(async () => {
    setAtualizadoEm(new Date());

    // Solar: hoje
    setHojeStatus('loading');
    api
      .get(API_URLS.GERACAO_SOLAR(hoje.iso))
      .then((r) => {
        const p: { valores?: LeituraPotencia[]; potencias?: LeituraPotencia[]; geracao?: number; gerado?: number } =
          r.data || {};
        const lista = p.valores ?? p.potencias ?? [];
        const curva = lista
          .map((i) => ({ horario: horarioDe(i.data), potencia: Number(i.valor ?? i.potencia ?? 0) || 0 }))
          .filter((i) => i.horario);
        const pico = curva.reduce<SolarHoje['pico']>((max, c) => (!max || c.potencia > max.potencia ? c : max), null);
        const kwhBruto = p.geracao ?? p.gerado;
        setSolarHoje({
          kwh: kwhBruto !== undefined && kwhBruto !== null ? Number(kwhBruto) : null,
          curva,
          pico: pico && pico.potencia > 0 ? pico : null,
          agora: curva.length ? curva[curva.length - 1] : null,
        });
        setHojeStatus('ok');
      })
      .catch(() => {
        setSolarHoje(null);
        setHojeStatus('erro');
      });

    // Solar: mês (kWh por dia)
    setMesStatus('loading');
    api
      .get(API_URLS.GERACAO_SOLAR_ANO_MES(hoje.ano, pad(hoje.mes)))
      .then((r) => {
        const lista = Array.isArray(r.data?.valores) ? r.data.valores : [];
        const porDia: Record<number, number> = {};
        lista.forEach((i: LeituraPotencia) => {
          const d = diaDe(i.data);
          if (d) porDia[d] = (porDia[d] || 0) + (Number(i.valor) || 0);
        });
        const diasNoMes = new Date(hoje.ano, hoje.mes, 0).getDate();
        const acumulado = Object.keys(porDia).reduce((a, k) => a + porDia[Number(k)], 0);
        // média só de dias completos (antes de hoje) com geração
        const completos = Object.keys(porDia)
          .map(Number)
          .filter((d) => d < hoje.dia && porDia[d] > 0);
        const mediaDiaria = completos.length ? completos.reduce((a, d) => a + porDia[d], 0) / completos.length : null;
        const hojeKwh = porDia[hoje.dia] || 0;
        const restantes = diasNoMes - hoje.dia;
        const previsao =
          mediaDiaria !== null ? acumulado - hojeKwh + Math.max(hojeKwh, mediaDiaria) + restantes * mediaDiaria : null;
        setSolarMes({ acumulado, mediaDiaria, previsao, diasNoMes });
        setMesStatus('ok');
      })
      .catch(() => {
        setSolarMes(null);
        setMesStatus('erro');
      });

    // Solar: ano atual x anterior
    setAnoStatus('loading');
    Promise.all([
      api
        .get(API_URLS.GERACAO_SOLAR_ANO(hoje.ano))
        .then((r) => r.data)
        .catch(() => null),
      api
        .get(API_URLS.GERACAO_SOLAR_ANO(hoje.ano - 1))
        .then((r) => r.data)
        .catch(() => []),
    ]).then(([atualBruto, anteriorBruto]) => {
      if (atualBruto === null) {
        setSolarAno(null);
        setAnoStatus('erro');
        return;
      }
      const atual = serieAnual(atualBruto);
      const anterior = serieAnual(anteriorBruto || []);
      // compara só meses completos (antes do mês atual)
      const mesesCompletos = hoje.mes - 1;
      const ytdAtual = atual.slice(0, mesesCompletos).reduce((a, b) => a + b, 0);
      const ytdAnterior = anterior.slice(0, mesesCompletos).reduce((a, b) => a + b, 0);
      let melhorMes: SolarAno['melhorMes'] = null;
      atual.forEach((v, i) => {
        if (v > 0 && (!melhorMes || v > melhorMes.valor)) melhorMes = { idx: i, valor: v };
      });
      setSolarAno({ atual, anterior, ytdAtual, ytdAnterior, melhorMes });
      setAnoStatus('ok');
    });

    // FIPE: histórico do backend
    setFipeStatus('loading');
    api
      .get(API_URLS.CARRO_FIPE(CODIGO_FIPE_HISTORICO))
      .then((r) => {
        const lista: CarroFipeApi[] = Array.isArray(r.data) ? r.data : [];
        const pontos = lista
          .map((i) => {
            const ref = String(i.mesReferencia ?? '');
            const m = /^(\d{2})\/(\d{4})$/.exec(ref);
            const rotulo = m ? `${MONTHS_SHORT_PT[Number(m[1]) - 1]}/${m[2].slice(2)}` : ref;
            const ordem = m ? Number(m[2]) * 12 + Number(m[1]) : 0;
            return { referencia: ref, rotulo, valor: Number(i.valor) || 0, ordem };
          })
          .filter((p) => p.valor > 0)
          .sort((a, b) => a.ordem - b.ordem);
        const ultimos = pontos.slice(-13);
        const n = ultimos.length;
        const atual = n ? ultimos[n - 1].valor : null;
        const inicio = n > 1 ? ultimos[0].valor : null;
        const meses = n - 1;
        const variacao12m = atual !== null && inicio ? (atual - inicio) / inicio : null;
        const perdaMensalMedia = atual !== null && inicio && meses > 0 ? (inicio - atual) / meses : null;
        const perdaUltimoMes = n > 1 ? ultimos[n - 2].valor - ultimos[n - 1].valor : null;
        const primeiro = lista[0] || {};
        setFipe({
          pontos: ultimos.map(({ referencia, rotulo, valor }) => ({ referencia, rotulo, valor })),
          descricao: [primeiro.marca, primeiro.modelo, primeiro.ano].filter(Boolean).join(' '),
          atual,
          variacao12m,
          perdaMensalMedia,
          perdaUltimoMes,
          projecao12m: atual !== null && perdaMensalMedia !== null ? Math.max(0, atual - perdaMensalMedia * 12) : null,
        });
        setFipeStatus('ok');
      })
      .catch(() => {
        setFipe(null);
        setFipeStatus('erro');
      });
  }, [hoje]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const cambios = useMemo(() => {
    const conv = (codigo: 'USD' | 'EUR', d: CurrencyData | null): Cambio | null =>
      d
        ? {
            codigo,
            valor: Number(d.bid),
            variacao: Number(d.pctChange) || 0,
            minimo: Number(d.low),
            maximo: Number(d.high),
          }
        : null;
    return { dolar: conv('USD', dolar.data), euro: conv('EUR', euro.data) };
  }, [dolar.data, euro.data]);
  const cambioStatus: Status =
    dolar.loading === 'loading' || euro.loading === 'loading'
      ? 'loading'
      : !cambios.dolar && !cambios.euro
        ? 'erro'
        : 'ok';

  // ------------------------------------------------------------- insights
  const insights = useMemo<InsightDia[]>(() => {
    const out: InsightDia[] = [];
    const kwh = (v: number) => `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kWh`;
    const brl = (v: number) =>
      v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: v >= 100 ? 0 : 2 });
    const pct = (v: number) => `${Math.abs(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`;

    if (solarHoje?.kwh != null && solarMes?.mediaDiaria) {
      const r = solarHoje.kwh / solarMes.mediaDiaria;
      if (r >= 1) {
        out.push({
          id: 'sol-hoje',
          icone: 'sol',
          tom: 'bom',
          titulo: `Painéis ${pct(r - 1)} acima da média`,
          texto: `${kwh(solarHoje.kwh)} hoje; média diária do mês: ${kwh(solarMes.mediaDiaria)}.`,
        });
      } else if (hoje.hora >= 17) {
        out.push({
          id: 'sol-hoje',
          icone: 'sol',
          tom: 'ruim',
          titulo: `Dia ${pct(1 - r)} abaixo da média`,
          texto: `${kwh(solarHoje.kwh)} hoje contra média de ${kwh(solarMes.mediaDiaria)}. Vale checar sujeira ou sombra nos painéis se repetir.`,
        });
      } else {
        out.push({
          id: 'sol-hoje',
          icone: 'sol',
          tom: 'info',
          titulo: `${pct(r)} da média diária já gerada`,
          texto: `${kwh(solarHoje.kwh)} até agora; a média do mês é ${kwh(solarMes.mediaDiaria)} por dia.`,
        });
      }
    }

    if (solarMes?.previsao && solarAno) {
      const mesmoMes = solarAno.anterior[hoje.mes - 1];
      const economia = solarMes.previsao * tarifa;
      if (mesmoMes > 0) {
        const d = (solarMes.previsao - mesmoMes) / mesmoMes;
        out.push({
          id: 'sol-prev',
          icone: 'grafico',
          tom: d >= 0 ? 'bom' : 'ruim',
          titulo: `${MONTHS_PT[hoje.mes - 1][0].toUpperCase()}${MONTHS_PT[hoje.mes - 1].slice(1)} deve fechar em ~${kwh(Math.round(solarMes.previsao))}`,
          texto: `${pct(d)} ${d >= 0 ? 'acima' : 'abaixo'} de ${MONTHS_PT[hoje.mes - 1]}/${hoje.ano - 1}; economia estimada de ${brl(economia)}.`,
        });
      } else {
        out.push({
          id: 'sol-prev',
          icone: 'grafico',
          tom: 'info',
          titulo: `Previsão do mês: ~${kwh(Math.round(solarMes.previsao))}`,
          texto: `Economia estimada de ${brl(economia)} na conta de luz.`,
        });
      }
    }

    if (cambios.dolar && isFinite(cambios.dolar.valor)) {
      const v = cambios.dolar.variacao;
      const valor = cambios.dolar.valor.toLocaleString('pt-BR', { minimumFractionDigits: 4 });
      if (Math.abs(v) >= 0.3) {
        out.push({
          id: 'dolar',
          icone: 'dolar',
          tom: v > 0 ? 'ruim' : 'bom',
          titulo: `Dólar ${v > 0 ? 'subiu' : 'caiu'} ${Math.abs(v).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% hoje`,
          texto: `R$ ${valor} — compras internacionais ficam ${v > 0 ? 'mais caras' : 'mais baratas'} que ontem.`,
        });
      } else {
        out.push({
          id: 'dolar',
          icone: 'dolar',
          tom: 'neutro',
          titulo: 'Dólar estável hoje',
          texto: `R$ ${valor} (${v >= 0 ? '+' : ''}${v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%).`,
        });
      }
    }

    if (fipe?.perdaUltimoMes != null && fipe.atual) {
      const p = fipe.perdaUltimoMes;
      out.push({
        id: 'fipe',
        icone: 'carro',
        tom: p > 0 ? 'ruim' : 'bom',
        titulo:
          p > 0
            ? `Carro perdeu ${brl(p)} no último mês`
            : p < 0
              ? `Carro valorizou ${brl(-p)} no último mês`
              : 'Valor FIPE estável no último mês',
        texto: `${fipe.descricao || 'FIPE atual'}: ${brl(fipe.atual)}${fipe.variacao12m !== null ? ` (${fipe.variacao12m <= 0 ? '−' : '+'}${pct(fipe.variacao12m)} em 12 meses)` : ''}.`,
      });
    }

    if (out.length < 4 && solarAno && solarAno.ytdAnterior > 0) {
      const d = (solarAno.ytdAtual - solarAno.ytdAnterior) / solarAno.ytdAnterior;
      out.push({
        id: 'ytd',
        icone: 'trofeu',
        tom: d >= 0 ? 'bom' : 'ruim',
        titulo: `Geração no ano ${pct(d)} ${d >= 0 ? 'acima' : 'abaixo'} de ${hoje.ano - 1}`,
        texto: `${kwh(Math.round(solarAno.ytdAtual))} até ${MONTHS_PT[Math.max(0, hoje.mes - 2)]}, contra ${kwh(Math.round(solarAno.ytdAnterior))}.`,
      });
    }
    return out.slice(0, 4);
  }, [solarHoje, solarMes, solarAno, cambios, fipe, tarifa, hoje]);

  const carregandoResumo =
    hojeStatus === 'loading' ||
    mesStatus === 'loading' ||
    anoStatus === 'loading' ||
    fipeStatus === 'loading' ||
    cambioStatus === 'loading';

  return {
    hoje,
    atualizadoEm,
    recarregar: carregar,
    tarifa,
    setTarifa,
    solarHoje,
    hojeStatus,
    solarMes,
    mesStatus,
    solarAno,
    anoStatus,
    fipe,
    fipeStatus,
    fipeAtual,
    fipeAtualStatus: (fipeAtualLoading === 'loading' ? 'loading' : fipeAtualErro ? 'erro' : 'ok') as Status,
    cambios,
    cambioStatus,
    insights,
    carregandoResumo,
  };
}
