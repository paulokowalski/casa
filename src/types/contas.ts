/** Contas fora do cartão (financiamentos, prestações, plano de saúde…) — contrato de /v1/contas e /v1/renda. */

export type TipoConta = 'RECORRENTE' | 'PARCELADA' | 'UNICA';

/** Competência no formato "2026-11" */
export type Competencia = string;

export interface Conta {
  id: string;
  pessoaId: number;
  categoriaId: string | null;
  categoria: string | null;
  descricao: string;
  tipo: TipoConta;
  valor: number;
  diaVencimento: number;
  competenciaInicio: Competencia;
  competenciaFim: Competencia | null;
  parcelaInicial: number | null;
  totalParcelas: number | null;
  /** % ao mês (1.49 = 1,49% a.m.) */
  jurosMes: number | null;
  valorVariavel: boolean;
  debitoAutomatico: boolean;
  ativa: boolean;
  parcelaAtual: number | null;
  parcelasRestantes: number | null;
  saldoRestante: number | null;
}

export interface ContaInput {
  pessoaId: number;
  categoriaId: string | null;
  descricao: string;
  tipo: TipoConta;
  valor: number;
  diaVencimento: number;
  competenciaInicio: Competencia;
  competenciaFim?: Competencia | null;
  parcelaInicial?: number | null;
  totalParcelas?: number | null;
  jurosMes?: number | null;
  valorVariavel: boolean;
  debitoAutomatico: boolean;
}

/** Uma conta em um mês */
export interface Lancamento {
  id: string;
  contaId: string;
  descricao: string;
  categoria: string | null;
  tipo: TipoConta;
  competencia: Competencia;
  vencimento: string; // yyyy-MM-dd
  numeroParcela: number | null;
  totalParcelas: number | null;
  valor: number;
  valorEstimado: boolean;
  paga: boolean;
  dataPagamento: string | null;
  debitoAutomatico: boolean;
  valorVariavel: boolean;
}

export interface LancamentoInput {
  paga?: boolean;
  valor?: number;
  dataPagamento?: string;
}

/** Fatura do cartão marcada como paga no mês */
export interface FaturaStatus {
  competencia: Competencia;
  paga: boolean;
  dataPagamento: string | null;
}

export interface Renda {
  competencia: Competencia;
  valor: number | null;
  origem: Competencia | null;
  /** true quando vale a renda de um mês anterior */
  herdada: boolean;
}
