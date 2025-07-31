export interface FipeData {
  brand: string;
  model: string;
  modelYear: number;
  fuel: string;
  price: string;
  referenceMonth: string;
  codeFipe: string;
}

export interface CurrencyData {
  bid: string;
  ask: string;
  pctChange: string;
  high: string;
  low: string;
}

export interface CearaData {
  strTeam: string;
  intRank: number;
  intPoints: number;
  intPlayed: number;
  intWin: number;
  intDraw: number;
  intLoss: number;
  strBadge?: string;
}

export interface CearaNovaApiResponse {
    nomeTime: string;
    imagem: string;
    posicao: number;
    pontos: number;
    vitorias: number;
    empates: number;
    derrotas: number;
    golsPro: number;
    golsContra: number;
    saldoGols: number;
}

export interface RodadaAtualApiResponse {
    rodada: number;
    dataJogo: string;
    timeCasa: string;
    imagemTimeCasa: string;
    golsTimeCasa: number;
    timeVisitante: string;
    imagemTimeVisitante: string;
    golsTimeVisitante: number;
} 