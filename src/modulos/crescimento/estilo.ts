/** Fontes da tela Início (servidas pelo próprio app; a CSP não deixa usar o Google Fonts). */
import '@fontsource-variable/baloo-2';
import '@fontsource-variable/caveat';
import '@fontsource-variable/inter';

/**
 * Cores claras originais. Só para o cartão de compartilhar (imagem JPEG), que continua claro
 * para ficar bonito no WhatsApp e no álbum do celular.
 */
export const corClara = {
  rosa: '#f9a8c4',
  rosaClaro: '#fdeef4',
  rosaForte: '#d6457a',
  azul: '#93c5fd',
  azulClaro: '#eaf3ff',
  azulForte: '#2563eb',
  menta: '#86e1c3',
  mentaClaro: '#e8faf3',
  mentaForte: '#0f8a63',
  amarelo: '#fcd57a',
  amareloClaro: '#fff7e0',
  amareloForte: '#b7791f',
  lilas: '#c4b5fd',
  lilasClaro: '#f3f0ff',
  lilasForte: '#6d4ed8',
  creme: '#fffaf5',
  tinta: '#3b2f3f',
  tintaSuave: '#7a6b7d',
  borda: '#f0e6ea',
} as const;

/**
 * Cores do módulo no tema Grafite (escuro). Os tons médios (rosa, azul…) seguem pastel e servem de
 * destaque; o texto por cima deles usa `sobrePastel`. Os "claros" viram fundos escuros tingidos e os
 * "fortes" viram tons claros, para ler bem sobre o fundo escuro.
 */
export const cor = {
  rosa: '#f9a8c4',
  rosaClaro: '#3a2533',
  rosaForte: '#ff8fb8',
  azul: '#93c5fd',
  azulClaro: '#202a40',
  azulForte: '#8fb8ff',
  menta: '#86e1c3',
  mentaClaro: '#1c3330',
  mentaForte: '#6fe0bb',
  amarelo: '#fcd57a',
  amareloClaro: '#352e20',
  amareloForte: '#ffd27a',
  lilas: '#c4b5fd',
  lilasClaro: '#2f2a4a',
  lilasForte: '#b8a4ff',
  /** fundo levemente destacado */
  creme: '#2a2a33',
  /** cartões */
  papel: '#222229',
  tinta: '#f1eff7',
  tintaSuave: '#a5a2b5',
  /** texto sobre os tons médios (pastéis) */
  sobrePastel: '#2b2233',
  borda: '#35353f',
} as const;

/** Cor principal pelo sexo (só um acento; nada de "azul de menino" no app todo). */
export function acento(sexo: 'M' | 'F') {
  return sexo === 'F'
    ? { forte: cor.rosaForte, medio: cor.rosa, claro: cor.rosaClaro }
    : { forte: cor.azulForte, medio: cor.azul, claro: cor.azulClaro };
}

/** Famílias da tela Início. */
export const fonte = {
  /** títulos arredondados */
  titulo: '"Baloo 2 Variable", "Inter Variable", system-ui, sans-serif',
  /** legendas "escritas à mão" */
  mao: '"Caveat Variable", "Segoe Print", cursive',
} as const;

/** Sombra "de adesivo": uma base sólida curta e uma difusa. */
export const sombraFofa = '0 14px 30px -12px rgba(0,0,0,0.65)';
