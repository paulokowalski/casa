import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../services/api';
import { API_URLS } from '../config/urls';
import { MONTHS_SHORT_PT } from '../utils/format';

export interface GeracaoMes {
  mes: string;
  geracao: number;
}

export interface GeracaoDia {
  dia: number;
  geracao: number;
}

export interface PotenciaPonto {
  horario: string;
  potencia: number;
}

interface EnergiaContextValue {
  ano: string;
  mes: string;
  setAno: (ano: string) => void;
  setMes: (mes: string) => void;
  geracaoMensal: GeracaoMes[];
  geracaoDiaria: GeracaoDia[];
  potenciaDia: PotenciaPonto[];
  geracaoDoDia: number | null;
  loadingMensal: boolean;
  loadingDiaria: boolean;
  loadingPotencia: boolean;
  carregarPotenciaDia: (dia: number) => Promise<void>;
}

const EnergiaContext = createContext<EnergiaContextValue | null>(null);

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

type ApiData = string | number[];

function horarioDe(data: ApiData): string {
  if (Array.isArray(data) && data.length >= 5)
    return `${String(data[3]).padStart(2, '0')}:${String(data[4]).padStart(2, '0')}`;
  if (typeof data === 'string') {
    const [h, m] = data.split('T')[1]?.split(':') ?? [];
    if (h && m) return `${h}:${m}`;
  }
  return '';
}

function diaDe(data: ApiData): number | null {
  if (Array.isArray(data) && data.length >= 3) return Number(data[2]);
  if (typeof data === 'string') {
    const partes = data.split('T')[0].split('-');
    if (partes.length === 3) return Number(partes[2]);
  }
  return null;
}

export function EnergiaProvider({ children }: Readonly<{ children: ReactNode }>) {
  const hoje = new Date();
  const [ano, setAno] = useState(String(hoje.getFullYear()));
  const [mes, setMes] = useState(String(hoje.getMonth() + 1).padStart(2, '0'));

  const [geracaoMensal, setGeracaoMensal] = useState<GeracaoMes[]>([]);
  const [geracaoDiaria, setGeracaoDiaria] = useState<GeracaoDia[]>([]);
  const [potenciaDia, setPotenciaDia] = useState<PotenciaPonto[]>([]);
  const [geracaoDoDia, setGeracaoDoDia] = useState<number | null>(null);
  const [loadingMensal, setLoadingMensal] = useState(false);
  const [loadingDiaria, setLoadingDiaria] = useState(false);
  const [loadingPotencia, setLoadingPotencia] = useState(false);

  useEffect(() => {
    let ativo = true;
    setLoadingMensal(true);
    api
      .get<{ month: string | number; value?: number }[]>(API_URLS.GERACAO_SOLAR_ANO(ano))
      .then((res) => {
        const porMes: number[] = Array.from({ length: 12 }, () => 0);
        (Array.isArray(res.data) ? res.data : []).forEach((item) => {
          const idx =
            typeof item.month === 'string' ? MESES_EN.indexOf(item.month.toUpperCase()) : Number(item.month) - 1;
          if (idx >= 0) porMes[idx] = Number(item.value) || 0;
        });
        if (ativo) setGeracaoMensal(MONTHS_SHORT_PT.map((m, i) => ({ mes: m, geracao: porMes[i] })));
      })
      .catch((error) => {
        console.error('Erro ao carregar geração mensal:', error);
        if (ativo) setGeracaoMensal([]);
      })
      .finally(() => ativo && setLoadingMensal(false));
    return () => {
      ativo = false;
    };
  }, [ano]);

  useEffect(() => {
    let ativo = true;
    setLoadingDiaria(true);
    api
      .get<{ valores?: { valor?: number; data: ApiData }[] }>(API_URLS.GERACAO_SOLAR_ANO_MES(ano, mes))
      .then((res) => {
        const dias = new Date(Number(ano), Number(mes), 0).getDate();
        const porDia: Record<number, number> = {};
        (res.data?.valores ?? []).forEach((item) => {
          const d = diaDe(item.data);
          if (d) porDia[d] = (porDia[d] ?? 0) + (Number(item.valor) || 0);
        });
        if (ativo)
          setGeracaoDiaria(Array.from({ length: dias }, (_, i) => ({ dia: i + 1, geracao: porDia[i + 1] ?? 0 })));
      })
      .catch((error) => {
        console.error('Erro ao carregar geração diária:', error);
        if (ativo) setGeracaoDiaria([]);
      })
      .finally(() => ativo && setLoadingDiaria(false));
    return () => {
      ativo = false;
    };
  }, [ano, mes]);

  const carregarPotenciaDia = useCallback(
    async (dia: number) => {
      setLoadingPotencia(true);
      try {
        const data = `${ano}-${mes}-${String(dia).padStart(2, '0')}`;
        const res = await api.get<{ valores?: { valor?: number; data: ApiData }[]; geracao?: number; gerado?: number }>(
          API_URLS.GERACAO_SOLAR(data),
        );
        setPotenciaDia(
          (res.data?.valores ?? []).map((i) => ({ horario: horarioDe(i.data), potencia: Number(i.valor) || 0 })),
        );
        const total = res.data?.geracao ?? res.data?.gerado;
        setGeracaoDoDia(total !== undefined && total !== null ? Number(total) : null);
      } catch (error) {
        console.error('Erro ao carregar potência do dia:', error);
        setPotenciaDia([]);
        setGeracaoDoDia(null);
      } finally {
        setLoadingPotencia(false);
      }
    },
    [ano, mes],
  );

  const value = useMemo(
    () => ({
      ano,
      mes,
      setAno,
      setMes,
      geracaoMensal,
      geracaoDiaria,
      potenciaDia,
      geracaoDoDia,
      loadingMensal,
      loadingDiaria,
      loadingPotencia,
      carregarPotenciaDia,
    }),
    [
      ano,
      mes,
      geracaoMensal,
      geracaoDiaria,
      potenciaDia,
      geracaoDoDia,
      loadingMensal,
      loadingDiaria,
      loadingPotencia,
      carregarPotenciaDia,
    ],
  );

  return <EnergiaContext.Provider value={value}>{children}</EnergiaContext.Provider>;
}

export function useEnergia(): EnergiaContextValue {
  const ctx = useContext(EnergiaContext);
  if (!ctx) throw new Error('useEnergia deve ser usado dentro de <EnergiaProvider>');
  return ctx;
}
