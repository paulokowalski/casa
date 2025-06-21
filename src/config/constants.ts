// Configurações de tempo
export const TIME_CONFIG = {
  REFETCH_INTERVAL: 300000, // 5 minutos
  LOADING_TIMEOUT: 15000,   // 15 segundos
} as const;

// Configurações de design
export const DESIGN_CONFIG = {
  CARD_HEIGHT: 260,
  COMPACT_CARD_HEIGHT: 150,
  BORDER_RADIUS: 4,
  SHADOW: 4,
} as const;

// Gradientes para os cards
export const GRADIENTS = {
  CEARA: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)',
  FIPE: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)',
  DOLLAR: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
  EURO: 'linear-gradient(135deg, #e3e0fa 0%, #c5cae9 100%)',
  LOADING: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)',
  ERROR: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
} as const;

// Cores dos ícones
export const ICON_COLORS = {
  DOLLAR: '#388e3c',
  EURO: '#1976d2',
} as const;

export const CATEGORIAS_DESPESA_PADRAO = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Educação',
  'Compras',
  'Serviços',
  'Impostos',
  'Viagem',
  'Outros',
]; 