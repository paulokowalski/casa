export interface ServidorDisco {
  nome: string;
  caminho: string;
  total: number;
  usado: number;
  pct: number;
}

export type SaudeContainer = 'saudavel' | 'doente' | 'iniciando' | null;

export interface ServidorContainer {
  nome: string;
  imagem: string;
  estado: string;
  status: string | null;
  saude: SaudeContainer;
  cpuPct: number | null;
  memUsada: number | null;
  memLimite: number | null;
  memPct: number | null;
  redeRecebidaBps: number | null;
  redeEnviadaBps: number | null;
  discoLeituraBps: number | null;
  discoEscritaBps: number | null;
  processos: number | null;
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
  containers: ServidorContainer[];
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

export interface ContainerDia {
  nome: string;
  imagem: string;
  estado: string;
  status: string | null;
  saude: SaudeContainer;
  minutos: number;
  minutosRodando: number;
  cpuMedia: number | null;
  cpuMax: number | null;
  memMedia: number | null;
  memMax: number | null;
  redeRecebidaBytes: number | null;
  redeEnviadaBytes: number | null;
  discoLidoBytes: number | null;
  discoEscritoBytes: number | null;
}

export interface SerieContainer {
  nome: string;
  pontos: { horario: string; cpu: number | null; memoria: number | null }[];
}

export interface ServidorDia {
  data: string;
  resumo: ServidorEstatisticas;
  serie: ServidorPonto[];
  discos: ServidorDisco[];
  containers: ContainerDia[];
  serieContainers: SerieContainer[];
}

export interface ServidorResumoDia {
  data: string;
  resumo: ServidorEstatisticas;
}
