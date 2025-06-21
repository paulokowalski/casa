// Interface para dados da FIPE
export interface FipeData {
  brand: string;
  model: string;
  modelYear: number;
  fuel: string;
  price: string;
  referenceMonth: string;
  codeFipe: string;
}

// Interface para dados de cotações
export interface CurrencyData {
  bid: string;
  ask: string;
  pctChange: string;
  high: string;
  low: string;
}

// Interface para dados do Ceará
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

// Interface para resposta da API do Ceará
export interface CearaApiResponse {
  table: CearaData[];
} 