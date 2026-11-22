const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_LONGOS = [
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

function partes(iso: string): [number, number, number] {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number);
  return [a, m, d];
}

/** 2026-05-01 → "1 mai 2026" (ou "1 mai" no ano corrente quando curta). */
export function dataCurta(iso: string | null | undefined, comAno = true): string {
  if (!iso) return '';
  const [a, m, d] = partes(iso);
  const ano = !comAno && a === new Date().getFullYear() ? '' : ` ${a}`;
  return `${d} ${MESES[m - 1]}${ano}`;
}

/** 2026-05-01 → "1 de maio de 2026". */
export function dataLonga(iso: string | null | undefined): string {
  if (!iso) return '';
  const [a, m, d] = partes(iso);
  return `${d} de ${MESES_LONGOS[m - 1]} de ${a}`;
}

export function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Dia local (AAAA-MM-DD) de um instante ISO vindo da API em UTC. */
export function dataLocalISO(instante: string): string {
  const d = new Date(instante);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function kg(valor: number | null | undefined): string {
  if (valor == null) return '–';
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: valor < 10 ? 3 : 2, maximumFractionDigits: 3 })} kg`;
}

export function cm(valor: number | null | undefined): string {
  if (valor == null) return '–';
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} cm`;
}

export function percentil(p: number | null | undefined): string {
  if (p == null) return '';
  if (p < 1) return 'P<1';
  if (p > 99) return 'P>99';
  return `P${Math.round(p)}`;
}

export function gramas(g: number | null | undefined): string {
  if (g == null) return '';
  const sinal = g > 0 ? '+' : g < 0 ? '−' : '';
  return `${sinal}${Math.abs(g).toLocaleString('pt-BR')} g`;
}

/** Dias até a data, em palavras. */
export function quando(dias: number): string {
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'amanhã';
  if (dias === -1) return 'ontem';
  if (dias > 0) return `em ${dias} dias`;
  return `há ${-dias} dias`;
}

export function mesDeVidaTexto(mes: number): string {
  if (mes === 0) return 'Primeiro mês';
  if (mes < 12) return `${mes} ${mes === 1 ? 'mês' : 'meses'}`;
  const anos = Math.floor(mes / 12);
  const resto = mes % 12;
  const a = `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
  return resto === 0 ? a : `${a} e ${resto} ${resto === 1 ? 'mês' : 'meses'}`;
}

/** "3,25" ou "3.25" → 3.25; vazio ou inválido → null (confira antes com `numeroInvalido`). */
export function numero(texto: string): number | null {
  const t = texto.trim().replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Campo preenchido com algo que não é número (ex.: "3,2kg", "1.234,5"): diferente de vazio. */
export function numeroInvalido(texto: string): boolean {
  return texto.trim() !== '' && numero(texto) === null;
}

/** Mensagem para o helperText de um campo numérico inválido. */
export const AVISO_NUMERO = 'Use só números, ex.: 3,25';

/** 3.25 → "3,25"; nulo → "" (o contrário de `numero`, para preencher os campos). */
export function numeroParaTexto(n: number | null | undefined): string {
  return n == null ? '' : String(n).replace('.', ',');
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}
