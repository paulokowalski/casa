/** Formatação e conversão de valores (pt-BR). */

const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brlNoCents = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

/** R$ 1.234,56 (ou R$ 1.235 com `noCents`) */
export function formatCurrency(value: number, noCents = false): string {
  const v = Number.isFinite(value) ? value : 0;
  return noCents ? brlNoCents.format(v) : brlFormatter.format(v);
}

/** 0.123 → "12%" (ou "12,3%" com casas decimais) */
export function formatPercent(fraction: number, decimals = 0): string {
  return `${(fraction * 100).toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
}

export function formatNumber(value: number, maxDecimals = 1): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: maxDecimals });
}

/**
 * "2026-11-05" → "05/11/2026".
 * Lê a data como texto para não sofrer com fuso horário
 * (new Date('2026-11-05') vira 04/11 no Brasil).
 */
export function formatDateBR(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : isoDate || '';
}

/** Data de hoje no fuso local, em yyyy-MM-dd */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Normaliza qualquer data (ISO ou Date) para yyyy-MM-dd */
export function toISODate(value: string): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Máscara de digitação de moeda: "123456" → "1.234,56" (aceita "-" no início) */
export function maskCurrencyInput(raw: string): string {
  const negative = raw.trim().startsWith('-');
  const digits = raw.replace(/\D/g, '');
  if (!digits) return negative ? '-' : '';
  const formatted = (parseInt(digits, 10) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return negative ? `-${formatted}` : formatted;
}

/** "-1.234,56" / "R$ 1.234,56" → -1234.56 */
export function parseCurrency(text: string): number {
  if (!text) return 0;
  const negative = text.trim().startsWith('-');
  const n = Number(text.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  return negative ? -n : n;
}

/** 1234.5 → "1.234,50" (para preencher campos com máscara) */
export function toCurrencyInput(value: number): string {
  return (
    (value < 0 ? '-' : '') +
    Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];
export const MONTHS_SHORT_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function capitalize(text: string): string {
  return (text || '').toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
}
