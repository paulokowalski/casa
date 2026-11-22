export type TipoDisco = 'nvme' | 'ssd' | 'hdd';

export interface ServidorDisco {
  nome: string;
  caminho: string;
  total: number;
  usado: number;
  pct: number;
  modelo: string | null;
  tipo: TipoDisco | null;
  temperatura: number | null;
  /** ativo, repouso (disco parado, não foi acordado para ler) ou sem_dados; nulo sem SMART */
  estadoTemperatura: 'ativo' | 'repouso' | 'sem_dados' | null;
  /** só no histórico do dia */
  temperaturaMedia: number | null;
  temperaturaMax: number | null;
  /** só na leitura ao vivo; nula sem SMART (ex.: eMMC) */
  saude?: SaudeDisco | null;
}

export type SituacaoDisco = 'boa' | 'atencao' | 'critica';

export interface AlertaDisco {
  nivel: 'critico' | 'atencao' | 'info';
  mensagem: string;
}

/** Saúde pelo SMART, avaliada na API. */
export interface SaudeDisco {
  situacao: SituacaoDisco;
  alertas: AlertaDisco[];
  lidoEm: string | null;
  aprovado: boolean | null;
  horasLigado: number | null;
  vezesLigado: number | null;
  temperaturaMinVida: number | null;
  temperaturaMaxVida: number | null;
  /** máximo recomendado pelo fabricante */
  temperaturaLimite: number | null;
  temperaturaLimiteAbsoluto: number | null;
  vezesAcimaLimite: number | null;
  setoresRealocados: number | null;
  setoresPendentes: number | null;
  setoresIrrecuperaveis: number | null;
  errosNaoCorrigidos: number | null;
  errosComunicacao: number | null;
  ciclosCabeca: number | null;
  nvme: {
    desgaste: number | null;
    reservaDisponivel: number | null;
    reservaMinima: number | null;
    errosMidia: number | null;
    desligamentosInesperados: number | null;
    minutosAcimaAviso: number | null;
    minutosAcimaCritico: number | null;
    bytesEscritos: number | null;
    bytesLidos: number | null;
  } | null;
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
  /** % do tempo com tarefas esperando o recurso nos últimos 10 s (some: alguma; total/full: todas) */
  pressao: {
    cpu: number | null;
    memoria: number | null;
    memoriaTotal: number | null;
    io: number | null;
    ioTotal: number | null;
  };
  gpuPct: number | null;
  clusters: {
    nome: string;
    nucleos: number[];
    atualMhz: number | null;
    maxMhz: number | null;
    limiteMhz: number | null;
    limitePct: number | null;
  }[];
  /** abaixo de 100 o kernel está segurando a frequência (calor) */
  cpuLimitePct: number | null;
  discosAtividade: { disco: string; ocupacaoPct: number; latenciaMs: number | null }[];
  discoLatenciaMs: number | null;
  redeErros: number;
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
  discoTemperaturaMax: number | null;
  pressaoCpu: Faixa | null;
  pressaoMemoria: Faixa | null;
  pressaoIo: Faixa | null;
  gpu: Faixa | null;
  cpuLimiteMin: number | null;
  minutosCpuLimitada: number | null;
  discoLatencia: Faixa | null;
  discoOcupacaoMax: number | null;
  redeErros: number | null;
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
  pressaoCpu: number | null;
  pressaoMemoria: number | null;
  pressaoIo: number | null;
  gpu: number | null;
  cpuLimite: number | null;
  discoLatenciaMs: number | null;
  discoLatenciaMaxMs: number | null;
  discoOcupacaoPct: number | null;
  redeErros: number | null;
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
  serieDiscos: { nome: string; pontos: { horario: string; temperatura: number | null }[] }[];
  resumoHost: ResumoHost | null;
  serieHost: PontoHost[];
  eventos: EventoServidor[];
}

export interface ServidorResumoDia {
  data: string;
  resumo: ServidorEstatisticas;
  host: ResumoHost | null;
}

// ---- status do host (timer casa-monitor-host) ----

/** Aparelho da tailnet; handshake e bytes são só do tráfego com este servidor. */
export interface AparelhoTailscale {
  id: string;
  nome: string;
  so: string;
  ip: string;
  dono: string | null;
  online: boolean;
  ultimoVisto: string | null;
  ultimoHandshake: string | null;
  recebidos: number;
  enviados: number;
  criado: string | null;
}

export type NivelEvento = 'info' | 'sucesso' | 'atencao' | 'erro';

export interface EventoServidor {
  quando: string;
  tipo: string;
  nivel: NivelEvento;
  mensagem: string;
}

export interface ResumoHost {
  amostras: number;
  minutosSemInternet: number;
  internetLatencia: Faixa;
  gatewayLatenciaMedia: number | null;
  minutosDnsFalhando: number;
  dnsTempoMedio: number | null;
  minutosTailscaleOffline: number;
  npu: Faixa;
  alertasMax: number;
  minutosComAlerta: number;
  servicosFalhosMax: number;
  minutosDiscoDesmontado: number;
  backupIdadeMaxHoras: number | null;
  containersReinicios: number | null;
  aptPendentes: number | null;
  reinicioNecessario: boolean | null;
  eventos: number;
  eventosErro: number;
}

export interface PontoHost {
  horario: string;
  internetMs: number | null;
  internetMaxMs: number | null;
  gatewayMs: number | null;
  dnsMs: number | null;
  semInternetPct: number;
  npu: number | null;
}

export interface RepositorioBackup {
  nome: string;
  montado: boolean | null;
  ultimoSnapshot: string | null;
  idadeSegundos: number | null;
  snapshots: number | null;
}

export interface UnidadeHost {
  unidade: string;
  instalado: boolean;
  estado: string;
  subestado: string;
  resultado: string;
  ok: boolean;
  timerAtivo: boolean | null;
  ultimaExecucao: string | null;
  proximaExecucao: string | null;
  reinicios: number;
}

export interface ServidorHost {
  versao: number;
  lidoEm: string;
  desatualizado: boolean;
  backup: {
    repositorios: RepositorioBackup[];
    ultimaExecucao: {
      inicio: string | null;
      fim: string | null;
      rodandoAgora: boolean;
      sucesso: boolean;
      falhas: number | null;
    };
    proximaExecucao: string | null;
  };
  servicos: UnidadeHost[];
  unidadesFalhas: string[];
  montagens: {
    discos: { ponto: string; montado: boolean; dispositivo: string | null; somenteLeitura: boolean | null }[];
    ultimaRemontagemAutomatica: string | null;
  };
  alertas: { alertados: string[]; pendentes: string[]; verificadoEm: string | null };
  kernel: { eventos24h: number; ultimos: string[] };
  atualizacoes: {
    reinicioNecessario: boolean;
    reinicioPor: string[];
    pacotesPendentes: number;
    pacotesSeguranca: number;
    pacotes: { pacote: string; versao: string; seguranca: boolean }[];
    imagensNovas7d: string[];
  };
  rede: {
    internet: { online: boolean; latenciaMs: number | null };
    gateway: { ip: string; latenciaMs: number | null };
    dns: { ok: boolean; tempoMs: number };
    tailscale: {
      estado: string;
      online: boolean;
      ip: string;
      usuario?: string | null;
      pares: number;
      paresOnline: number;
      aparelhos?: AparelhoTailscale[];
    } | null;
  };
  loginsSsh: { quando: string; usuario: string; origem: string; metodo: string }[];
  npu?: { nucleosPct: number[] };
  docker?: {
    containers: { nome: string; reinicios: number; iniciadoEm: string; oomKilled: boolean }[];
    espaco: { tipo: string; total: number; ativos: number; tamanho: number; recuperavel: number }[];
  };
  inodes?: { ponto: string; total: number; usados: number; pct: number }[];
}

// ---- internet da casa (timers casa-monitor-internet e casa-monitor-velocidade) ----

export interface PingAlvo {
  id: 'roteador' | 'modem' | 'provedor' | 'cloudflare' | 'google' | 'cloudflare6' | string;
  nome: string;
  alvo: string;
  perdaPct: number;
  minMs: number | null;
  mediaMs: number | null;
  maxMs: number | null;
  jitterMs: number | null;
}

export interface DnsServidor {
  id: string;
  nome: string;
  servidor: string;
  ok: boolean;
  tempoMs: number | null;
}

export interface TesteVelocidade {
  testadoEm: string;
  ok: boolean;
  downloadMbps: number | null;
  uploadMbps: number | null;
  latenciaMs: number | null;
  jitterMs: number | null;
  /** latência durante o download: bem acima da sem carga = bufferbloat */
  latenciaCargaMs: number | null;
  bytes: number | null;
  erro: string | null;
}

export interface InternetAgora {
  lidoEm: string;
  desatualizado: boolean;
  online: boolean;
  interface: {
    nome: string;
    gateway: string | null;
    ipLocal: string | null;
    velocidadeMbps: number | null;
    duplex: string | null;
    estado: string | null;
    ipv6Global: boolean;
    recebidos: number | null;
    enviados: number | null;
    erros: number;
    descartados: number;
  } | null;
  ping: PingAlvo[];
  dns: DnsServidor[];
  publico: {
    ip: string | null;
    ipv6: string | null;
    provedor: string | null;
    asn: number | null;
    cidade: string | null;
    regiao: string | null;
    pais: string | null;
    servidorCloudflare: string | null;
    verificadoEm: string | null;
    erro: string | null;
  } | null;
  pihole: {
    ok: boolean;
    erro?: string;
    bloqueio?: string;
    consultas24h?: number;
    bloqueadas24h?: number;
    bloqueadasPct?: number;
    doCache24h?: number;
    encaminhadas24h?: number;
    consultasPorSegundo?: number;
    clientesAtivos?: number;
    dominiosNaLista?: number;
    upstreams?: { nome: string; ip: string; porta: number; consultas: number; tempoMs: number | null }[];
  } | null;
  /** último teste de velocidade */
  velocidade: TesteVelocidade | null;
}

export interface ResumoInternet {
  amostras: number;
  minutosOffline: number;
  ping: Faixa;
  jitterMedio: number | null;
  perdaMedia: number | null;
  minutosComPerda: number;
  roteadorMedio: number | null;
  modemMedio: number | null;
  googleMedio: number | null;
  dnsPiholeMedio: number | null;
  minutosDnsFalhando: number;
  dnsCloudflareMedio: number | null;
  ipsPublicos: number;
  testes: number;
  download: Faixa;
  upload: Faixa;
}

export interface PontoInternet {
  horario: string;
  roteadorMs: number | null;
  modemMs: number | null;
  cloudflareMs: number | null;
  cloudflareMaxMs: number | null;
  googleMs: number | null;
  jitterMs: number | null;
  perdaPct: number | null;
  offlinePct: number;
  dnsPiholeMs: number | null;
  dnsCloudflareMs: number | null;
  dnsGoogleMs: number | null;
}

export interface InternetDia {
  data: string;
  resumo: ResumoInternet;
  serie: PontoInternet[];
  testes: TesteVelocidade[];
}

// ---- ventilação do servidor (ventoinhas na tomada do Home Assistant) ----

export interface LimiteVentilacao {
  liga: number | null;
  desliga: number | null;
}

export interface LeituraVentilacao {
  /** on, off, unavailable (tomada fora do ar) ou unknown */
  tomada: string;
  precisa: boolean | null;
  automatica: boolean | null;
  soc: number | null;
  /** HD mais quente; 0 = todos em repouso */
  hds: number | null;
  nvme: number | null;
  limiteSoc: LimiteVentilacao | null;
  limiteHds: LimiteVentilacao | null;
  limiteNvme: LimiteVentilacao | null;
}

export interface VentilacaoAgora {
  recebidoEm: string;
  desatualizado: boolean;
  leitura: LeituraVentilacao;
  desde: string | null;
  minutosLigadaHoje: number;
  minutosComDadosHoje: number;
}

export interface VentilacaoResumoDia {
  data: string;
  minutosLigada: number;
  minutosComDados: number;
  vezesLigou: number;
  maxSoc: number | null;
  maxHds: number | null;
  maxNvme: number | null;
}

export interface VentilacaoDia {
  resumo: VentilacaoResumoDia;
  periodos: { inicio: string; fim: string; minutos: number }[];
  pontos: { horario: string; ligada: number | null; soc: number | null; hds: number | null; nvme: number | null }[];
}
