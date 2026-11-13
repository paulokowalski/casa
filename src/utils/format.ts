const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brlNoCents = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function formatCurrency(value: number, noCents = false): string {
  const v = Number.isFinite(value) ? value : 0;
  return noCents ? brlNoCents.format(v) : brlFormatter.format(v);
}

export function formatPercent(fraction: number, decimals = 0): string {
  return `${(fraction * 100).toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
}

export function formatNumber(value: number, maxDecimals = 1): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: maxDecimals });
}

export function formatDateBR(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : isoDate || '';
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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

export function parseCurrency(text: string): number {
  if (!text) return 0;
  const negative = text.trim().startsWith('-');
  const n = Number(text.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  return negative ? -n : n;
}

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
