import type { CompraInput, Parcela } from '../../types/financas';
import { MONTHS_PT, MONTHS_SHORT_PT } from '../../utils/format';

export interface MesRef {
  ano: number;
  mes: number;
}

export const DIAS_SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

export function mesIdx(ref: MesRef): number {
  return ref.ano * 12 + (ref.mes - 1);
}

export function idxParaRef(idx: number): MesRef {
  return { ano: Math.floor(idx / 12), mes: (idx % 12) + 1 };
}

export function partesData(data: string): { ano: number; mes: number; dia: number } | null {
  if (!data) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(data);
  if (!m) return null;
  return { ano: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) };
}

export function idxDaData(data: string): number | null {
  const p = partesData(data);
  return p ? p.ano * 12 + (p.mes - 1) : null;
}

export function rotuloMes(idx: number, anoRef?: number): string {
  const r = idxParaRef(idx);
  const abrev = MONTHS_SHORT_PT[r.mes - 1];
  if (anoRef !== undefined && r.ano !== anoRef) return `${abrev}/${String(r.ano).slice(-2)}`;
  return abrev;
}

export function rotuloMesAno(idx: number): string {
  const r = idxParaRef(idx);
  return `${MONTHS_SHORT_PT[r.mes - 1]}/${String(r.ano).slice(-2)}`;
}

export function rotuloMesLongo(idx: number): string {
  const r = idxParaRef(idx);
  return `${MONTHS_PT[r.mes - 1]}/${r.ano}`;
}

export function nomeMes(mes: number): string {
  return MONTHS_PT[mes - 1] ?? '';
}

export function valorParcelaDe(valorProduto: number, numeroParcelas: number): number {
  const n = Math.max(1, numeroParcelas || 1);
  const centavos = Math.round(Number(valorProduto || 0) * 100);
  return Math.trunc(centavos / n) / 100;
}

export function arred(v: number): number {
  return Math.round(v * 100) / 100;
}

export function somar(lista: number[]): number {
  return arred(lista.reduce((a, b) => a + b, 0));
}

export function normalizar(texto: string | undefined | null): string {
  return String(texto ?? '')
    .trim()
    .toUpperCase();
}

const REGEX_CANCELADA = /\s*\[CANCELADA (\d+)\/(\d+)\]\s*$/i;

export interface InfoCancelamento {
  nomeBase: string;
  pagas: number;
  totalOriginal: number;
}

export function lerCancelamento(nome: string): InfoCancelamento | null {
  const m = REGEX_CANCELADA.exec(nome || '');
  if (!m) return null;
  return {
    nomeBase: (nome || '').replace(REGEX_CANCELADA, '').trim(),
    pagas: Number(m[1]),
    totalOriginal: Number(m[2]),
  };
}

export function nomeSemMarcacao(nome: string): string {
  return (nome || '').replace(REGEX_CANCELADA, '').trim();
}

export function nomeComCancelamento(nome: string, pagas: number, totalOriginal: number): string {
  return `${nomeSemMarcacao(nome)} [CANCELADA ${pagas}/${totalOriginal}]`;
}

export function parcelasVencidasAte(dataCompra: string, numeroParcelas: number, ateIdx: number): number {
  const inicio = idxDaData(dataCompra);
  if (inicio === null) return 0;
  const vencidas = ateIdx - inicio;
  return Math.max(0, Math.min(numeroParcelas, vencidas));
}

export function montarCancelamento(
  p: Parcela,
  pagas: number,
  tipoLancamentoId: string,
  categoriaId: string | null,
): CompraInput {
  const info = lerCancelamento(p.nomeCompra);
  const totalOriginal = info ? info.totalOriginal : p.numeroTotalParcela;
  const vp = valorParcelaDe(p.valorTotal, p.numeroTotalParcela);
  return {
    nomeProduto: nomeComCancelamento(p.nomeCompra, pagas, totalOriginal),
    valorProduto: Math.round(vp * pagas * 100) / 100,
    dataCompra: p.dataCompra,
    numeroParcelas: pagas,
    nomePessoaCompra: p.nomePessoa,
    tipoLancamentoId,
    categoriaId,
  };
}

export function montarReversao(p: Parcela, tipoLancamentoId: string, categoriaId: string | null): CompraInput | null {
  const info = lerCancelamento(p.nomeCompra);
  if (!info) return null;
  const vp = valorParcelaDe(p.valorTotal, p.numeroTotalParcela);
  return {
    nomeProduto: nomeSemMarcacao(p.nomeCompra),
    valorProduto: Math.round(vp * info.totalOriginal * 100) / 100,
    dataCompra: p.dataCompra,
    numeroParcelas: info.totalOriginal,
    nomePessoaCompra: p.nomePessoa,
    tipoLancamentoId,
    categoriaId,
  };
}
