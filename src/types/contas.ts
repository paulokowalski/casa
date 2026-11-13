export type TipoConta = 'RECORRENTE' | 'PARCELADA' | 'UNICA';

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

export interface Lancamento {
  id: string;
  contaId: string;
  descricao: string;
  categoria: string | null;
  tipo: TipoConta;
  competencia: Competencia;
  vencimento: string;
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

export interface FaturaStatus {
  competencia: Competencia;
  paga: boolean;
  dataPagamento: string | null;
}

export interface Renda {
  competencia: Competencia;
  valor: number | null;
  origem: Competencia | null;
  herdada: boolean;
}
