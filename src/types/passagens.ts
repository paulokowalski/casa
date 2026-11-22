/** Resposta de GET /v1/passagens: rotas do robô de passagens e o histórico de preços. */

export interface DataPassagem {
  ida: string;
  /** Nula = só ida. */
  volta: string | null;
}

export interface JanelaPassagem {
  inicio: string;
  fim: string;
  /** Testa uma ida a cada N dias. */
  passoDias?: number;
  /** [mín, máx] dias de viagem; sem isto é só ida. */
  duracao?: [number, number];
  /** 0 = segunda ... 6 = domingo. */
  diasSemana?: number[];
}

/** O que se envia para criar ou editar uma rota (datas fixas OU janela). */
export interface RotaPassagemInput {
  nome: string;
  ativa: boolean;
  origem: string[];
  destino: string[];
  datas: DataPassagem[] | null;
  janela: JanelaPassagem | null;
  precoAlvo: number | null;
  maxEscalas: number | null;
  quedaPct: number;
  adultos: number;
  /** 2 a 11 anos. */
  criancas: number;
  /** Até 2 anos, com assento próprio. */
  bebesAssento: number;
  /** Até 2 anos, no colo (no máximo um por adulto). */
  bebesColo: number;
}

export interface RotaPassagem extends RotaPassagemInput {
  id: number;
  datas: DataPassagem[];
  somenteIda: boolean;
}

export interface PontoPreco {
  /** Momento da busca (ISO, UTC). */
  em: string;
  preco: number;
  cias: string;
  escalas: number | null;
}

/** Preços de um trecho e datas ao longo do tempo. */
export interface SeriePreco {
  rota: string;
  origem: string;
  destino: string;
  ida: string;
  volta: string | null;
  url: string;
  /** Pontos do período pedido (um por busca, ou o menor preço de cada dia). */
  pontos: PontoPreco[];
  /** Último, menor, maior, média e buscas: de todo o histórico. */
  ultimo: PontoPreco;
  minimo: PontoPreco;
  maximo: number;
  media: number;
  buscas: number;
}

export interface AlertaPassagem {
  rota: string;
  origem: string;
  destino: string;
  ida: string;
  volta: string | null;
  preco: number;
  em: string;
}

export interface Passagens {
  geradoEm: string;
  intervaloHoras: number;
  moeda: string;
  desatualizado: boolean;
  /** Dias do período pedido (0 = tudo). */
  dias: number;
  agrupamento: 'busca' | 'dia';
  rotas: RotaPassagem[];
  historico: SeriePreco[];
  alertas: AlertaPassagem[];
}
