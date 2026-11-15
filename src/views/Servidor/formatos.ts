import type { Tone } from '../../styles/tokens';

const UNIDADES = ['B', 'KB', 'MB', 'GB', 'TB'];

/** Bytes em base 1024 (como o df -h): 1536 → "1,5 KB". */
export function bytes(valor: number | null | undefined, casas = 1): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return '—';
  let v = Math.abs(valor);
  let i = 0;
  while (v >= 1024 && i < UNIDADES.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toLocaleString('pt-BR', { maximumFractionDigits: i === 0 ? 0 : casas })} ${UNIDADES[i]}`;
}

export const taxa = (bps: number | null | undefined) => (bps === null || bps === undefined ? '—' : `${bytes(bps)}/s`);

export function pct(valor: number | null | undefined, casas = 1): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return '—';
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;
}

export function graus(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return '—';
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} °C`;
}

export function numero(valor: number | null | undefined, casas = 2): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return '—';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

/** 156239 → "1d 19h 23min". */
export function duracao(segundos: number): string {
  const d = Math.floor(segundos / 86400);
  const h = Math.floor((segundos % 86400) / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}min`;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

/** Limites de alerta: percentual de uso (CPU, memória, disco) e temperatura. */
export const LIMITES = {
  uso: { aviso: 80, critico: 90 },
  temperatura: { aviso: 70, critico: 85 },
} as const;

export function tomUso(valor: number | null | undefined): Tone {
  if (valor === null || valor === undefined) return 'neutral';
  if (valor >= LIMITES.uso.critico) return 'error';
  if (valor >= LIMITES.uso.aviso) return 'warning';
  return 'success';
}

export function tomTemperatura(valor: number | null | undefined): Tone {
  if (valor === null || valor === undefined) return 'neutral';
  if (valor >= LIMITES.temperatura.critico) return 'error';
  if (valor >= LIMITES.temperatura.aviso) return 'warning';
  return 'success';
}

/** Carga relativa ao número de núcleos: acima de 1 por núcleo há fila de processos. */
export function tomCarga(carga: number | null | undefined, nucleos: number): Tone {
  if (carga === null || carga === undefined || nucleos <= 0) return 'neutral';
  const porNucleo = carga / nucleos;
  if (porNucleo >= 1.5) return 'error';
  if (porNucleo >= 1) return 'warning';
  return 'success';
}

export function isoLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function diasAtras(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoLocal(d);
}
