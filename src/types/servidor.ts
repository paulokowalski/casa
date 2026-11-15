export interface ServidorDisco {
  nome: string;
  caminho: string;
  total: number;
  usado: number;
  pct: number;
}

export interface ServidorAgora {
  lidoEm: string;
  host: string;
  modelo: string | null;
  kernel: string | null;
  uptimeSegundos: number;
  cpu: { usoPct: number; iowaitPct: number; nucleos: { nucleo: number; usoPct: number; mhz: number | null }[] };
  carga: { min1: number; min5: number; min15: number; processos: number };
  memoria: { total: number; usada: number; pct: number; swapTotal: number; swapUsada: number; swapPct: number };
  temperaturas: { sensor: string; celsius: number }[];
  temperaturaMax: number | null;
  discos: ServidorDisco[];
  rede: { interfaceRede: string; recebidaBps: number; enviadaBps: number }[];
  discoIo: { leituraBps: number; escritaBps: number };
}

export interface Faixa {
  min: number | null;
  media: number | null;
  max: number | null;
}

export interface ServidorEstatisticas {
  amostras: number;
  cpu: Faixa;
  memoria: Faixa;
  temperatura: Faixa;
  carga: Faixa;
  swapMax: number | null;
  iowaitMedia: number | null;
  redeRecebidaBytes: number | null;
  redeEnviadaBytes: number | null;
  discoLidoBytes: number | null;
  discoEscritoBytes: number | null;
}

export interface ServidorPonto {
  horario: string;
  cpu: number;
  cpuMax: number;
  memoria: number;
  swap: number;
  temperatura: number | null;
  temperaturaMax: number | null;
  carga: number;
  iowait: number;
  redeRecebidaBps: number;
  redeEnviadaBps: number;
  discoLeituraBps: number;
  discoEscritaBps: number;
}

export interface ServidorDia {
  data: string;
  resumo: ServidorEstatisticas;
  serie: ServidorPonto[];
  discos: ServidorDisco[];
}

export interface ServidorResumoDia {
  data: string;
  resumo: ServidorEstatisticas;
}
